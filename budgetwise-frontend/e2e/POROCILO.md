# Poročilo avtomatiziranega funkcionalnega testiranja

## Orodje in način izvajanja

Za avtomatizacijo je uporabljen Playwright Test. Primeren je za spletni uporabniški vmesnik, zgrajen z Expo in React Native Web. Testi se izvajajo brez grafičnega vmesnika v Chromiumu. Vse zahteve do API-ja prestrežejo testi in vrnejo vnaprej pripravljene odgovore, zato testiranje ne potrebuje delujoče podatkovne baze ali pravih uporabniških ključev. V cevovodu GitHub Actions se namestijo odvisnosti in Chromium, zažene Expo Web, nato pa testi. Neuspešen test povzroči neuspeh opravila; HTML poročilo se shrani kot artefakt.

## Izvedeni scenariji

| Oznaka | Scenarij | Pričakovani rezultat |
|---|---|---|
| FT-01 | Prijava in prikaz domačega finančnega pregleda | Uporabnik se prijavi, domača stran pokaže ime in stanje 1.480,00 €. |
| FT-02 | Dodajanje odhodka 12,50 € v kategoriji Zabava | Odhodek se pošlje API-ju s pravilnim zneskom, opisom, tipom in kategorijo ter se prikaže na seznamu. |
| FT-03 | Prikaz statistike za oktober 2026 | Poročilo pokaže prihodke 1.500 €, stroške 20 € ter kategoriji Zabava in Prevoz. |

## Rezultati

Pred vnosom demonstracijske napake so bili uspešni vsi trije scenariji (3/3). Nato je bila v kartici »Stroški« začasno, za prikaz na vajah, uporabljena vrednost prihodkov namesto stroškov. Test FT-03 je napako zaznal, ker je namesto pričakovanih 20,00 € prikazana vrednost 1.500,00 €. Scenarija FT-01 in FT-02 sta ostala uspešna. Napaka je namenoma ostala v kodi za demonstracijo; zato je pričakovano, da GitHub Actions pri trenutni različici označi opravilo kot neuspešno.

## Zagon lokalno

V mapi `budgetwise-frontend` zaženi:

```bash
npm ci
npx playwright install chromium
npm run test:e2e
```

Testi ustvarijo HTML poročilo v `playwright-report/`. Za prikaz poročila uporabi `npm run test:e2e:report`.
