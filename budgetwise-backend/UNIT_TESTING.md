# Enotsko testiranje zalednega sistema

## Izbrane enote in pričakovano delovanje

1. **Validacija transakcij** (`src/validators/transaction.validator.ts`): izbrana je zaradi pravil za številčne vrednosti, naštevalne tipe, datume, neobvezna polja in paginacijo. Sprejme veljavne prihodke in stroške; zavrne nepozitivne zneske, zneske nad dovoljeno mejo, nepodprte valute, neveljavne opise, napačno zapisane ali koledarsko neobstoječe datume ter nepravilne ID-je kategorij. Pri parametrih poizvedbe uporabi privzete vrednosti in zavrne neveljavno paginacijo ali razvrščanje. Posodobitve so lahko delne, vendar morajo biti podane vrednosti še vedno veljavne.
2. **Validacija avtentikacije** (`src/validators/auth.validator.ts`): izbrana je, ker registracija združuje več varnostnih pravil in pogojev glede dolžine polj. Registracija zahteva veljaven e-poštni naslov, geslo z najmanj osmimi znaki, veliko črko in številko ter ime in priimek dolžine od 1 do 50 znakov. Prijava zahteva veljaven e-poštni naslov in neprazno geslo. Žeton za osvežitev ne sme biti prazen.
3. **Izračuni poročil** (`src/lib/reportCalculations.ts`): izbrani so, ker so primerjave zneskov odvisne od zaokroževanja, obravnave ničelnih vrednosti in koledarskih meja. Odstotna sprememba je zaokrožena na eno decimalno mesto in pravilno obravnava prejšnjo vrednost nič. Mesečni razpon vključuje prvi dan in zadnjo milisekundo meseca. Povprečna dnevna poraba upošteva dejansko število dni v mesecu in je zaokrožena na cente.

## Navodila in dogovori za teste

Testi so shranjeni ob izvornih enotah v mapah `__tests__` in imajo končnico `.test.ts`. Imena opisujejo pričakovano vedenje, na primer `accepts...`, `rejects...`, `returns...`, `throws...` ali `propagates...`. Pričakovane vrednosti so izbrane neodvisno od trenutne implementacije. Validacije in pomožni izračuni so čiste funkcije, zato zanje ne potrebujemo mock objektov; test storitve mesečnega poročila pa uporablja mockirane metode Prisma, da deluje brez prave podatkovne baze.

Za zagon testov uporabi `npm test`. Za teste in poročilo o pokritosti uporabi `npm run test:coverage`. GitHub Actions zažene ukaz s pokritostjo ob potisku sprememb v zalednem sistemu in pri zahtevkih za združitev ter poročilo shrani kot artefakt izvajanja. Če test ne uspe, se opravilo cevovoda označi kot neuspešno.

## Navodilo za agenta UI

Spodaj je zapisano navodilo z zahtevami za ustvarjanje in pregled testov:

> Uporabi Jest in TypeScript. Ustvari enotske teste za `transaction.validator.ts`, `auth.validator.ts` in `reportCalculations.ts`; pokrij običajne primere, robne vrednosti, neveljavne vhode in pričakovane izjeme. Pri validacijskih shemah preveri tudi, da `parse` za neveljaven vhod vrže izjemo, pri storitvi poročil pa da se napaka podatkovne baze posreduje klicatelju. Za Prisma uporabi mock objekte, da testi ne potrebujejo prave podatkovne baze; čistih validacij in izračunov ne mockiraj. Teste poimenuj opisno, z `accepts...`, `rejects...`, `returns...`, `throws...` ali `propagates...`. Pričakovane vrednosti izberi na podlagi zahtev in ne prepisuj obnašanja implementacije.

Obravnava izjem je preverjena pri klicih Zod `parse` in pri napaki Prisma, ki jo sproži mock. Pomožne funkcije za izračune nimajo določene pogodbe za izjeme, zato njihovi testi preverjajo veljavne vhode, robne vrednosti in ničelne vrednosti.

## Preverjanje z namerno povzročenimi napakami

Za preverjanje, ali testi zaznajo napake, sta bili v vsako od treh izbranih enot začasno vneseni po dve napaki, nato pa odstranjeni. Pri transakcijah smo dovolili ničelni znesek in zvišali zgornjo mejo. Pri geslih smo znižali zahtevano najmanjšo dolžino in zamenjali preverjanje velike črke s preverjanjem male črke. Pri izračunih poročila smo odstranili absolutno vrednost imenovalca pri odstotni spremembi in mesečni razpon skrajšali za eno milisekundo. Ustrezni testi so pri vsaki spremembi neuspešno prestali preverjanje. Po obnovitvi pravilne kode je vseh 46 testov uspešnih.
