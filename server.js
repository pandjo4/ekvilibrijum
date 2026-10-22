const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_, res) => res.json({ ok: true, game: "Ekvilibrijum" }));

// A room is authoritative on the server. Client-submitted scores are never trusted.
const rooms = new Map();
const WORDS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const code = () => Array.from({length:5},()=>WORDS[Math.floor(Math.random()*WORDS.length)]).join("");
const cleanName = (v) => String(v || "Igrač").trim().replace(/[<>]/g,"").slice(0,18) || "Igrač";
const publicRoom = r => ({
  code:r.code, hostId:r.hostId, phase:r.phase, round:r.round, maxRounds:r.maxRounds,
  listId:r.listId, category:r.category, turnIndex:r.turnIndex, turnPlayerId:r.players[r.turnIndex]?.id || null,
  players:r.players.map(p=>({id:p.id,name:p.name,score:p.score,connected:p.connected,answers:p.answers})),
  usedLists:r.usedLists, lastResult:r.lastResult, settings:r.settings
});
function sendRoom(r){
  io.to(r.code).emit("room:update", publicRoom(r));
  if(r.phase==="playing" && r.players[r.turnIndex]) {
    const target=r.players[r.turnIndex];
    io.to(target.id).emit("list:options", DATA[r.listId].items);
    io.to(r.code).emit("category:meta", {description:DATA[r.listId].description||""});
  }
}
function currentList(r){ return DATA[r.listId]; }
function finishRound(r){
  r.phase="reveal";
  r.lastResult = r.players.map(p => ({id:p.id,name:p.name,guess:p.guess||null,rank:p.rank||null,points:p.lastPoints||0}));
  sendRoom(r);
}
const DATA = require("./lists.json");
io.on("connection", socket => {
  socket.on("room:create", ({name, maxRounds=5}={}, cb=()=>{}) => {
    let c; do { c=code(); } while(rooms.has(c));
    const player={id:socket.id,name:cleanName(name),score:0,connected:true,answers:0,guess:null,rank:null,lastPoints:0};
    const r={code:c,hostId:socket.id,players:[player],phase:"lobby",round:0,maxRounds:Math.max(1,Math.min(20,Number(maxRounds)||5)),listId:null,category:null,turnIndex:0,usedLists:[],lastResult:null,settings:{maxPlayers:8}};
    rooms.set(c,r); socket.join(c); cb({ok:true,code:c,room:publicRoom(r)}); sendRoom(r);
  });
  socket.on("room:join", ({code:c,name}={}, cb=()=>{}) => {
    const r=rooms.get(String(c||"").toUpperCase());
    if(!r) return cb({ok:false,error:"Soba ne postoji. Provjeri kod."});
    if(r.phase!=="lobby") return cb({ok:false,error:"Partija je već počela."});
    if(r.players.length>=8) return cb({ok:false,error:"Soba je puna (maksimalno 8 igrača)."});
    if(r.players.some(p=>p.id===socket.id)) return cb({ok:true,room:publicRoom(r)});
    r.players.push({id:socket.id,name:cleanName(name),score:0,connected:true,answers:0,guess:null,rank:null,lastPoints:0});
    socket.join(r.code); cb({ok:true,room:publicRoom(r)}); sendRoom(r);
  });
  socket.on("game:start", (_, cb=()=>{}) => {
    const r=[...rooms.values()].find(x=>x.players.some(p=>p.id===socket.id));
    if(!r) return cb({ok:false,error:"Prvo uđi u sobu."});
    if(r.hostId!==socket.id) return cb({ok:false,error:"Samo domaćin može pokrenuti igru."});
    if(r.phase!=="lobby"||r.players.length<1) return cb({ok:false,error:"Igru nije moguće pokrenuti."});
    r.phase="playing"; r.round=1; r.turnIndex=0; chooseList(r); r.players.forEach(p=>{p.guess=null;p.rank=null;p.lastPoints=0;});
    sendRoom(r); cb({ok:true});
  });
  function chooseList(r){
    let available=Object.keys(DATA).filter(k=>!r.usedLists.includes(k));
    if(!available.length){r.usedLists=[];available=Object.keys(DATA);}
    r.listId=available[Math.floor(Math.random()*available.length)];
    r.usedLists.push(r.listId); r.category=DATA[r.listId].title;
  }
  socket.on("game:guess", ({guess}={}, cb=()=>{}) => {
    const r=[...rooms.values()].find(x=>x.players.some(p=>p.id===socket.id));
    if(!r||r.phase!=="playing") return cb({ok:false,error:"Trenutno nema aktivnog kruga."});
    const p=r.players[r.turnIndex];
    if(!p||p.id!==socket.id) return cb({ok:false,error:"Sada je red na drugog igrača."});
    if(p.guess) return cb({ok:false,error:"Već si odgovorio u ovom krugu."});
    const text=String(guess||"").trim().slice(0,100);
    if(!text) return cb({ok:false,error:"Upiši odgovor."});
    const item=DATA[r.listId].items.find(x=>x.name.toLocaleLowerCase()===text.toLocaleLowerCase());
    if(!item) return cb({ok:false,error:"Odgovor nije pronađen u listi. Izaberi prijedlog iz liste."});
    p.guess=item.name; p.rank=item.rank; p.lastPoints=item.rank; p.score+=item.rank; p.answers++;
    const result={player:p.name,guess:item.name,rank:item.rank,points:item.rank};
    if(r.turnIndex+1<r.players.length){r.turnIndex++;}
    else {finishRound(r); return cb({ok:true,result});}
    sendRoom(r); cb({ok:true,result});
  });
  socket.on("game:next", (_, cb=()=>{}) => {
    const r=[...rooms.values()].find(x=>x.players.some(p=>p.id===socket.id));
    if(!r) return cb({ok:false,error:"Soba nije pronađena."});
    if(r.hostId!==socket.id) return cb({ok:false,error:"Samo domaćin može nastaviti."});
    if(r.phase!=="reveal") return cb({ok:false,error:"Krug još nije završen."});
    if(r.round>=r.maxRounds){r.phase="finished";sendRoom(r);return cb({ok:true});}
    r.round++;r.turnIndex=0;r.phase="playing";r.lastResult=null;chooseList(r);
    r.players.forEach(p=>{p.guess=null;p.rank=null;p.lastPoints=0;});
    sendRoom(r);cb({ok:true});
  });
  socket.on("disconnect",()=>{
    for(const r of rooms.values()){
      const p=r.players.find(p=>p.id===socket.id);
      if(p){p.connected=false;sendRoom(r);if(r.players.every(x=>!x.connected))setTimeout(()=>{if(r.players.every(x=>!x.connected))rooms.delete(r.code);},60000);}
    }
  });
});
server.listen(PORT,()=>console.log(`Ekvilibrijum sluša na ${PORT}`));
