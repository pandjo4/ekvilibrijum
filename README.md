# Ekvilibrijum

Multiplayer web igra za 1 do 8 igrača. Frontend je statički HTML/CSS/JS, a sobe, potezi i bodovanje žive na Node.js + Socket.IO serveru.

## Važno o listama

Ovo je funkcionalan **MVP**, ali `lists.json` namjerno označava nekoliko demo rangiranja koja nisu potpuni ili potpuno provjereni Top 100. Ne bi bilo pošteno predstavljati ih kao 15 provjerenih Top 100 lista. Trenutno su uključene kategorije: države po površini, prodaja videoigara, zarada filmova, planinski vrhovi, populacija država, okeani i mora, životinje, jezici, rijeke, hemijski elementi, brendovi, fudbalski klubovi, knjige, gradovi i tehnološke kompanije.

Za produkcijsku verziju svaka kategorija treba imati 100 unosa i metapodatke `source`, `checkedAt`, `methodology` i `items`. Za rangiranja koja se mijenjaju (filmovi, populacija, kompanije) dodaj datum presjeka. Videoigre, knjige, klubovi i turističke atrakcije zahtijevaju jasno definisanu metodologiju. Ne miješati rangove iz različitih godina ili različitih izvora.

## Lokalno pokretanje

1. Instaliraj Node.js 18 ili noviji.
2. U folderu projekta pokreni `npm install`.
3. Pokreni `npm start`.
4. Otvori `http://localhost:3000` u dva browsera ili na dva uređaja.

## GitHub + Render

1. Napravi GitHub repozitorij i dodaj sve fajlove iz ZIP-a.
2. Na Renderu izaberi **New + → Web Service**, poveži repozitorij.
3. Build command: `npm install`
4. Start command: `npm start`
5. Render prepoznaje `render.yaml`; koristi Node runtime i `PORT` koji dodjeljuje platforma.
6. Nakon deploya, URL Render servisa služi i frontend i Socket.IO. Za Netlify frontend odvojen od servera, promijeni `io()` u `io("https://TVOJ-SERVIS.onrender.com")` i uključi odgovarajući CORS origin na serveru.

## Trenutna pravila

- 1 do 8 igrača po sobi, pet znakova koda.
- Domaćin pokreće igru i nastavlja krugove.
- Jedan odgovor po igraču u krugu.
- Bodovi su jednaki poziciji unosa na listi: rang 1 = 1 bod, rang 100 = 100 bodova.
- Odgovor mora tačno odgovarati imenu unosa iz liste; autocomplete nudi važeće odgovore.
- Server računa bodove i ne prihvata bodove koje šalje klijent.

## Poznate stavke prije javnog lansiranja

- Dodati testove za ponovni ulazak/disconnect, validaciju poteza i rematch.
- Dodati izbor kategorija, podešavanje broja rundi, timeout i zaštitu od zloupotrebe.
- Dodati eksplicitno dugme za napuštanje sobe i ponovni ulazak nakon refresh-a.
- Dodati punu, urednički provjerenu bazu od 100 unosa po kategoriji. Demo liste nisu konačni verifikovani Top 100 podaci.
