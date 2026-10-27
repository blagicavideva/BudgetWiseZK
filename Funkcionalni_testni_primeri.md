# Funkcionalno testiranje BudgetWise

## Namen in obseg

Dokument vsebuje tri ročno izvedljive funkcionalne testne primere za BudgetWise: prijavo in prikaz domače strani, dodajanje odhodka ter prikaz mesečnega poročila. Primeri so pripravljeni na podlagi funkcionalnosti, opisanih v projektnem README-ju.

- **Okolje:** Windows 10; spletna aplikacija Expo Web; lokalni backend in PostgreSQL; API `http://localhost:3000/api/v1`
- **Brskalnik:** spletni brskalnik na `http://localhost:8081` (različica ni bila zabeležena)
- **Datum izvedbe:** 27. 10. 2026

> Uporabljen je bil testni račun. Med zagonom backenda se je izpisalo opozorilo, da SendGrid API ključ nima pričakovane oblike `SG.`. To opozorilo ni preprečilo prijave, dodajanja transakcij ali prikaza poročila; pošiljanje e-pošte ni bilo del teh testov.

## Pregled dokumentacije in ključnih funkcionalnosti

Pregledana sta bila korenski `README.md` in `budgetwise-backend/README.md`. Korenski README opisuje mobilno aplikacijo, njene glavne funkcionalnosti ter frontend in backend. Backend README vsebuje tudi podrobnejši opis API-ja, podatkovne baze in endpointov.

Za funkcionalno testiranje so pomembne naslednje zmožnosti: uporabniška prijava, pregled financ na domači strani, dodajanje in prikaz prihodkov ter odhodkov, in mesečno poročilo s skupnimi prihodki, stroški ter porabo po kategorijah. Scenariji spodaj preverjajo te tri glavne tokove.

## Izbira in utemeljitev scenarijev

| ID | Naziv scenarija | Zakaj je izbran |
|---|---|---|
| FT-01 | Prijava in prikaz domače strani | Preveri avtentikacijo ter dostop do uporabniku prilagojenega finančnega pregleda. |
| FT-02 | Dodajanje in prikaz odhodka | Preveri vnos, shranjevanje in prikaz transakcije z zneskom, opisom, kategorijo in datumom. |
| FT-03 | Prikaz mesečnega poročila za znane transakcije | Preveri filtriranje po mesecu, seštevanje prihodkov in stroškov ter razvrstitev porabe po kategorijah. |

## Povzetek testnih scenarijev

| ID | Naziv scenarija | Status |
|---|---|---|
| FT-01 | Prijava in prikaz domače strani | Uspešno |
| FT-02 | Dodajanje in prikaz odhodka | Uspešno |
| FT-03 | Prikaz mesečnega poročila za znane transakcije | Uspešno z opombo |

---

## FT-01 — Prijava in prikaz domače strani

**Cilj:** Preveriti, da se obstoječi uporabnik lahko prijavi in po prijavi vidi domačo stran s svojim finančnim pregledom.

**Predpogoji:** Aplikacija in lokalni backend sta dosegljiva; testni račun je registriran.

**Testni podatki:** E-pošta: `neebitno57@gmail.com`; geslo: `[testno geslo ni vključeno v repozitorij]`.

| Korak | Dejanje | Pričakovani rezultat | Dejanski rezultat |
|---|---|---|---|
| 1 | Odpri spletno aplikacijo. | Prikaže se zaslon za prijavo oziroma aplikacija prikaže prijavno možnost. | Aplikacija se je odprla in prikazala možnosti za prijavo ter registracijo. |
| 2 | Vnesi e-pošto in geslo testnega računa. | Vnosna polja sprejmejo podatke; geslo je skrito. | Testni e-poštni naslov in geslo sta bila vnesena; prijavni obrazec ju je sprejel. |
| 3 | Izberi **Prijava**. | Prijava uspe; aplikacija odpre domačo stran. | Prijava je uspela brez napake. |
| 4 | Preglej domačo stran. | Prikaže se finančni pregled, na primer stanje, prihodki, odhodki ali nedavne transakcije, brez napake ali neskončnega nalaganja. | Odprla se je domača stran. Prikazala je prihodek `1.500,00 EUR`, stroške `20,00 EUR`, preostanek `1.480,00 EUR` in nedavne transakcije. |

**Končni rezultat:** Uspešno
**Opombe ali dokaz:** Prijava in domača stran sta bili prikazani v spletni aplikaciji.

---

## FT-02 — Dodajanje in prikaz odhodka

**Cilj:** Preveriti, da uporabnik lahko doda odhodek in ga nato najde na seznamu transakcij.

**Predpogoji:** Uporabnik je prijavljen; uporablja se testni račun; izbrani datum je v mesecu, ki ga bo mogoče prepoznati na seznamu.

**Testni podatki:** Vrsta: odhodek; znesek: `12,50 EUR`; opis: `funkcionalni test odhodek`; kategorija: `Zabava`; datum: `2026-10-27`.

| Korak | Dejanje | Pričakovani rezultat | Dejanski rezultat |
|---|---|---|---|
| 1 | Odpri razdelek **Transakcije** in izberi dodajanje transakcije. | Prikaže se obrazec za novo transakcijo. | Obrazec za dodajanje transakcije je bil odprt. |
| 2 | Izberi odhodek in vnesi navedeni znesek, opis, kategorijo ter datum. | Obrazec prikaže vnesene vrednosti. | Vnesen je bil odhodek `12,50 EUR` z opisom `funkcionalni test odhodek`, kategorijo `Zabava` in datumom `2026-10-27`. |
| 3 | Shrani transakcijo. | Aplikacija potrdi shranjevanje oziroma zapre obrazec brez napake. | Transakcija se je shranila in prikazala na seznamu. |
| 4 | Poišči novo transakcijo na seznamu. | Odhodek je prikazan enkrat, z zneskom `12,50 EUR`, opisom `funkcionalni test odhodek`, kategorijo `Zabava` in datumom `2026-10-27`. | Odhodek je prikazan enkrat kot `-€12.50`; opis, kategorija `Zabava` in datum `2026-10-27` se ujemajo. |

**Končni rezultat:** Uspešno
**Opombe ali dokaz:** Posnetek zaslona prikazuje shranjen odhodek v seznamu transakcij.

---

## FT-03 — Mesečno poročilo za znane transakcije

**Cilj:** Preveriti, da mesečno poročilo prikaže pravilne vsote prihodkov, odhodkov, prihrankov in porabe po kategorijah.

**Predpogoji:** Uporabi testni račun. Na seznamu za oktober 2026 sta že prikazana prihodek `1.500,00 EUR` z opisom `placa oktober 2026` in odhodek `12,50 EUR` s kategorijo `Zabava`. V oktobru dodaj še odhodek `7,50 EUR` s kategorijo `Prevoz`. Testni račun je nov in za september nima primerljivih transakcij; zato odstotkov »vs. prejšnji mesec« ni mogoče vsebinsko ovrednotiti. Vse transakcije morajo biti v isti valuti.

**Testni podatki za izbrani mesec:**

| Vrsta | Znesek | Kategorija | Opis |
|---|---:|---|---|
| Prihodek | 1.500,00 EUR | Prihodek | placa oktober 2026 (že vnesen) |
| Odhodek | 12,50 EUR | Zabava | funkcionalni test odhodek (že vnesen) |
| Odhodek | 7,50 EUR | Prevoz | funkcionalni test prevoz (dodaj pred testom poročila) |

**Pričakovani rezultat:** prihodki `1.500,00 EUR`; odhodki `20,00 EUR`; poraba po kategorijah `Zabava 12,50 EUR` in `Prevoz 7,50 EUR`; število transakcij `3`. Domača stran prikazuje preostanek `1.480,00 EUR` (prihodki minus odhodki). Za september ni podatkov, zato primerjava »vs. prejšnji mesec« ni vsebinsko preverljiva in prikazani odstotki se ne razlagajo kot dejanska sprememba.

| Korak | Dejanje | Pričakovani rezultat | Dejanski rezultat |
|---|---|---|---|
| 1 | Dodaj odhodek `7,50 EUR`, opis `funkcionalni test prevoz`, kategorija `Prevoz`, datum `2026-10-27`. | Nova transakcija se shrani; na seznamu so navedeni prihodek `1.500,00 EUR` ter odhodka `12,50 EUR` in `7,50 EUR`. | Odhodek `7,50 EUR` je prikazan enkrat pod kategorijo `Prevoz`; skupaj sta odhodka `20,00 EUR`, prihodek pa `1.500,00 EUR`. Domača stran prikazuje preostanek `1.480,00 EUR`. |
| 2 | Odpri razdelek **Poročilo**. | Prikaže se poročilo oziroma izbor obdobja. | Prikazala se je stran **Statistika**. |
| 3 | Izberi mesec, v katerega so bile vnesene transakcije. | Poročilo prikaže podatke za izbrani mesec. | Prikazano je bilo obdobje **Oktober 2026** s 3 transakcijami. |
| 4 | Primerjaj prikazane vsote s pričakovanim rezultatom in zabeleži primerjavo s prejšnjim mesecem. | Prihodki `1.500,00 EUR`, odhodki `20,00 EUR`, kategoriji `Zabava 12,50 EUR` in `Prevoz 7,50 EUR`; za september ni primerjalnih podatkov, zato odstotki spremembe niso vsebinsko ocenljivi. | Prihodki `1.500,00 EUR`, stroški `20,00 EUR`, prihranki `0,00 EUR`, stopnja varčevanja `0,0 %`; kategoriji Zabava `12,50 EUR` in Prevoz `7,50 EUR`; največji strošek `12,50 EUR`. UI prikaže `+100 %` pri prihodkih in stroških ter `+0 %` pri prihrankih glede na prejšnji mesec, vendar september nima podatkov, zato ti odstotki niso dejanska primerjava. |

**Končni rezultat:** Uspešno z opombo
**Opombe ali dokaz:** Poročilo za oktober 2026 prikazuje tri transakcije in pričakovane vsote. Domača stran ločeno prikazuje preostanek `1.480,00 EUR`. Primerjava s septembrom ni preverljiva, ker za september ni podatkov; prikazane odstotke spremembe je treba razumeti kot prikaz aplikacije pri prazni osnovi, ne kot dejansko spremembo.

---

## Poročilo o izvedbi

| ID testa | Datum | Rezultat | Napaka ali opombe |
|---|---|---|---|
| FT-01 | 27. 10. 2026 | Uspešno | Prijava je uspela in domača stran je prikazala finančni pregled. |
| FT-02 | 27. 10. 2026 | Uspešno | Odhodek `12,50 EUR` je shranjen in prikazan enkrat s kategorijo `Zabava`. |
| FT-03 | 27. 10. 2026 | Uspešno z opombo | Oktober prikazuje prihodke `1.500,00 EUR`, stroške `20,00 EUR` in kategoriji Zabava `12,50 EUR`, Prevoz `7,50 EUR`. Za september ni podatkov, zato odstotna primerjava ni vsebinsko preverljiva. |

### Sklep izvedbe

Vsi trije funkcionalni scenariji so bili izvedeni. Prijava je uspela, odhodek `12,50 EUR` se je shranil in prikazal s pravilnimi podatki, mesečno poročilo za oktober pa je prikazalo prihodke `1.500,00 EUR`, stroške `20,00 EUR` in porabo po kategorijah Zabava `12,50 EUR` ter Prevoz `7,50 EUR`. Domača stran je prikazala preostanek `1.480,00 EUR`. FT-03 ima opombo: ker testni račun nima podatkov za september, odstotne primerjave s prejšnjim mesecem niso vsebinsko preverljive. Med zagonom backenda se je pojavilo opozorilo o neveljavnem SendGrid ključu; funkcije pošiljanja e-pošte niso bile predmet teh testov.
