# Ekvilibrijum — Top 15 edition

Multiplayer party igra za 1–8 igrača. Frontend je HTML/CSS/JS, a sobe, potezi i bodovanje obrađuju se na Node.js + Socket.IO serveru.

## Šta je promijenjeno

- Sve kategorije su sada **Top 15**: svaka lista ima tačno 15 unosa i rangove od 1 do 15.
- Uklonjena je Top 100 tematika iz interfejsa i pravila.
- Dodane su nove zabavne kategorije: omiljeni filmovi, omiljene videoigre i popularna jela.
- Na početku domaćin bira broj rundi (1, 3, 5, 10 ili 15) i koliko puta ista lista smije biti izabrana (1, 2 ili 3 puta prije ponovnog miješanja dostupnih lista).
- Poboljšani su mobilni prikaz, kontrole, fokus tastature, animacije i podrška za `prefers-reduced-motion`.
- Server i dalje sam provjerava odgovore i dodjeljuje bodove; klijent ne može poslati vlastiti rezultat.

## Bodovanje i pravila

- 1–8 igrača po sobi; domaćin pokreće partiju i prelazi na sljedeću rundu.
- Svaki igrač ima jedan odgovor po rundi.
- Tačan odgovor dobija bodove jednake rangu: #1 = 1 bod, #15 = 15 bodova. Pogrešan odgovor = 0 bodova.
- Odgovor mora odgovarati imenu unosa iz liste. Odgovori se ne provjeravaju javno prije završetka kruga.
- Podešavanje ponavljanja određuje koliko puta pojedina kategorija može biti odabrana u jednoj partiji prije nego što se skup lista ponovo promiješa.

## Izvori i urednička napomena

Liste geografskih i naučnih činjenica zasnovane su na općim javnim referencama; zabavne kategorije su urednički odabiri. Nove kategorije za filmove i videoigre tematski su inspirisane fan-votiranim Ranker listama, uključujući [The Best Games of All Time](https://www.ranker.com/crowdranked-list/the-best-games-of-all-time) i njihove liste filmova. Rankerove liste su dinamične i glasane od publike; ovdje korišteni odgovori i redoslijed nisu predstavljeni kao zvanični Ranker poredak. Promjenjivi podaci (kino-zarada, tržišne vrijednosti i populacija) su približni i nisu live podaci.

## Lokalno pokretanje

1. Instaliraj Node.js 18 ili noviji.
2. U folderu projekta pokreni `npm install`.
3. Pokreni `npm start`.
4. Otvori `http://localhost:3000` u dva browsera ili na dva uređaja.

## GitHub + Render

1. Dodaj sve fajlove iz ZIP-a u GitHub repozitorij.
2. Na Renderu izaberi **New + → Web Service** i poveži repozitorij.
3. Build command: `npm install`
4. Start command: `npm start`
5. `render.yaml` je uključen; server koristi `PORT` koji dodjeljuje platforma.

## Napomena

Rangovi u zabavnim i promjenjivim kategorijama su urednički i mogu se razlikovati od drugih izvora. Za strogo takmičarsku upotrebu potrebno je unaprijed dogovoriti metodologiju i datum provjere za svaku listu.
