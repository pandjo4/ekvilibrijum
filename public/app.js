const socket=io();
const $=id=>document.getElementById(id);
let room=null, myId=null, renderedRoundKey="";
const sections=["landing","roomView","gameView","revealView","finishedView"];
function show(id){sections.forEach(s=>$(s).classList.toggle("hidden",s!==id));}
function name(){return $("playerName").value.trim()||"Igrač";}
function message(id,t){$(id).textContent=t||"";}
function emitAck(event,data){return new Promise(resolve=>socket.emit(event,data||{},resolve));}
$("createBtn").onclick=async()=>{message("entryMsg","");const r=await emitAck("room:create",{name:name(),maxRounds:5});if(r.ok){room=r.room;render();}else message("entryMsg",r.error);};
$("joinBtn").onclick=async()=>{message("entryMsg","");const c=$("roomCode").value.trim().toUpperCase();if(!c)return message("entryMsg","Unesi kod sobe.");const r=await emitAck("room:join",{code:c,name:name()});if(r.ok){room=r.room;render();}else message("entryMsg",r.error);};
$("roomCode").addEventListener("input",e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5));
$("copyCode").onclick=async()=>{try{await navigator.clipboard.writeText(room.code);$("copyCode").textContent="Kod kopiran ✓";}catch{$("copyCode").textContent=room.code;}};
$("startBtn").onclick=async()=>{const r=await emitAck("game:start",{});if(!r.ok)message("lobbyHint",r.error);};
$("nextBtn").onclick=async()=>{const r=await emitAck("game:next",{});if(!r.ok)message("nextHint",r.error);};
$("againBtn").onclick=()=>location.reload();
$("guessInput").addEventListener("input",()=>{
  // Free-form entry only. Suggestions would leak whether an answer is in the Top 100.
  $("submitGuess").disabled=!$("guessInput").value.trim() || $("guessInput").disabled;
});
$("submitGuess").onclick=async()=>{
  const guess=$("guessInput").value.trim();
  if(!guess)return;
  const r=await emitAck("game:guess",{guess});
  if(!r.ok)message("gameMsg",r.error);
  else{$("guessInput").disabled=true;$("submitGuess").disabled=true;message("gameMsg","Odgovor zaključan.");}
};
socket.on("room:update",r=>{room=r;render();});
socket.on("category:meta",meta=>{$("categoryDesc").textContent=meta.description||"";});
function renderPlayers(){ $("playersList").innerHTML="";$("scoreList").innerHTML="";$("playerCount").textContent=`${room.players.length} / 8`;
 const sorted=[...room.players].sort((a,b)=>b.score-a.score);
 room.players.forEach((p,i)=>{const el=document.createElement("div");el.className="player";el.innerHTML=`<div class="avatar">${escapeHtml(p.name[0].toUpperCase())}</div><div class="player-name">${escapeHtml(p.name)} ${p.id===room.hostId?'<span class="you">DOMAĆIN</span>':''}${p.id===socket.id?'<span class="you">TI</span>':''}</div><span class="player-score">${p.score} <small>PTS</small></span>`;$("playersList").appendChild(el);});
 sorted.forEach((p,i)=>{const el=document.createElement("div");el.className="player";el.innerHTML=`<div class="rank-num">0${i+1}</div><div class="player-name">${escapeHtml(p.name)} ${p.id===socket.id?'<span class="you">TI</span>':''}</div><span class="player-score">${p.score}</span>`;$("scoreList").appendChild(el);});
 $("startBtn").classList.toggle("hidden",room.hostId!==socket.id);$("lobbyHint").textContent=room.hostId===socket.id?"Kad su svi spremni, pokreni partiju.":"Čeka se da domaćin pokrene partiju.";
}
function render(){if(!room){show("landing");return;} $("roomCodeBig").textContent=room.code;renderPlayers();
 if(room.phase==="lobby"){show("roomView");return;}
 if(room.phase==="playing"){
  const roundKey=`${room.code}:${room.round}:${room.listId}`;
  if(roundKey!==renderedRoundKey){
    renderedRoundKey=roundKey;
    $("guessInput").value="";
    $("guessInput").disabled=false;
    $("submitGuess").disabled=true;
    $("suggestions").classList.add("hidden");
    message("gameMsg","");
  }
  show("gameView");$("roundNo").textContent=`${room.round} / ${room.maxRounds}`;$("categoryTitle").textContent=room.category||"Kategorija";const me=room.players.find(p=>p.id===socket.id),turn=room.players.find(p=>p.id===room.turnPlayerId);$("turnText").textContent=turn?(turn.id===socket.id?"Tvoj potez":`Na potezu: ${turn.name}`):"Čekanje";const active=room.turnPlayerId===socket.id&&!me?.guess;$("guessInput").disabled=!active;$("guessInput").placeholder=active?"Upiši svoj odgovor...":"Čekaj svoj potez";$("submitGuess").disabled=!active||!$("guessInput").value.trim();if(!active){$("suggestions").classList.add("hidden");}return;}
 if(room.phase==="reveal"){show("revealView");renderResults(false);$("nextBtn").classList.toggle("hidden",room.hostId!==socket.id);$("nextHint").textContent=room.hostId===socket.id?"Pokreni sljedeći krug kada ste spremni.":"Čeka se domaćin.";return;}
 if(room.phase==="finished"){show("finishedView");renderResults(true);return;}
}
function renderResults(final){const arr=final?[...room.players].sort((a,b)=>b.score-a.score):[...(room.lastResult||[])].sort((a,b)=>b.points-a.points);const el=$(final?"finalResults":"roundResults");el.innerHTML="";arr.forEach((p,i)=>{const row=document.createElement("div");row.className="result-row";const pts=final?p.score:p.points;row.innerHTML=`<div class="rank-num">${String(i+1).padStart(2,"0")}</div><div><div class="result-name">${escapeHtml(p.name)}</div><div class="result-sub">${p.guess?escapeHtml(p.guess)+(p.rank?` · rang #${p.rank}`:""):"Bez odgovora"}</div></div><div class="points">+${pts}<small>${final?"UKUPNO":"BODOVA"}</small></div>`;el.appendChild(row);});if(final)$("againBtn").textContent="Nova partija ↗";else $("nextBtn").textContent=room.round>=room.maxRounds?"Završi partiju →":"Sljedeća runda →";}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
