# Enterprise QA Sandbox - Unit Teszteset Mátrix (UNIT_TEST_CASES.md)

Alkalmazási Terület: Üzleti logika, pénzügyi számítások, állapotgép invariánsok, validátorok és formázók  
Összes unit teszteset száma: 40 db  
Módszertan: AAA (Arrange - Act - Assert) minta, böngészőfüggetlen, izolált végrehajtás  
Rendezési elv: Prioritás szerint szigorúan csökkenő sorrendben (P1 Critical -> P2 Major -> P3 Normal).

---

## Miért van értelme unit teszteknek és mennyi szükséges?

Egy enterprise szintű QA tesztautomatizálási keretrendszerben a webes E2E tesztek mellett kiemelten indokolt a keretrendszer saját doménlogikai és üzleti kalkulátor rétegét unit tesztekkel lefedni:
1. **Gyorsaság és azonnali visszajelzés:** A 40 db unit teszt kevesebb mint 100 ms alatt lefut, böngésző indítása nélkül.
2. **Költséghatékony hibadetektálás (Shift-Left):** A kerekítési hibák, adószámítási eltérések és érvénytelen állapotátmenetek azonnal kiderülnek, nem terhelik a lassú és instabil hálózati E2E futásokat.
3. **Optimális lefedettség:** Pontosan **40 db unit tesztnek van valós értéke**, amelyek a Sandbox alkalmazás 7 fő logikai területét (deviza, adó, kuponok, állapotgép, készlet, validáció, RBAC és formázás) fedik le redundancia nélkül.

---

## Prioritási Összesítő

* P1 (Critical): 18 teszt (Pénzügyi számítások, ÁFA kalkuláció, kupon levonás, állapotgép integritás, RBAC szabályok)
* P2 (Major): 16 teszt (EU VAT szintaxis, űrlap validációk, jelszó policy, PO formátum, készlet határértékek, fájl típusok)
* P3 (Normal): 6 teszt (Pénznem formázás, CSV escape, határérték kerekítések)
* Összesen: 40 teszteset

---

## Teljes Unit Teszteset Táblázat

| Key | TC Azonosító | Teszteset Neve | Modul | Lefedett Követelmény / Specifikáció | Prioritás |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | UTC-FIN-01 | USD Bázis Deviza Számítás | Pénzügy & Deviza | USD deviza esetén az árfolyamszorzó pontosan 1.0x, nincs konverziós eltérés. | P1 (Critical) |
| 2 | UTC-FIN-02 | EUR Devizaváltás & Kerekítés | Pénzügy & Deviza | 0.92x szorzó alkalmazása, pontos két tizedesjegyre kerekítés (Math.round). | P1 (Critical) |
| 3 | UTC-FIN-03 | HUF Devizaváltás Egészre Kerekítve | Pénzügy & Deviza | 395x szorzó alkalmazása, tört érték nélkül, egész forintra kerekítve. | P1 (Critical) |
| 4 | UTC-FIN-04 | Lebegőpontos Összeadási Pontosság | Pénzügy & Deviza | IEEE 754 lebegőpontos hiba kiküszöbölése több tétel összeadásakor (0.1 + 0.2 pontosság). | P1 (Critical) |
| 5 | UTC-TAX-01 | US Adókulcs Számítás (0%) | Adózás & ÁFA | Egyesült Államok kiválasztásakor az adó pontosan 0%, a bruttó megegyezik a nettóval. | P1 (Critical) |
| 6 | UTC-TAX-02 | DE ÁFA Számítás (19%) | Adózás & ÁFA | Németország kiválasztásakor a nettó összegre pontosan 19% ÁFA kerül felszámításra. | P1 (Critical) |
| 7 | UTC-TAX-03 | HU ÁFA Számítás (27%) | Adózás & ÁFA | Magyarország kiválasztásakor a nettó összegre pontosan 27% ÁFA kerül felszámításra. | P1 (Critical) |
| 8 | UTC-TAX-04 | Bruttó Végösszeg Integritás | Adózás & ÁFA | Total = Netto + AFA keplet ellenorzese minden devizaban, kerekitett reszosszegekkel. | P1 (Critical) |
| 9 | UTC-CPN-01 | Százalékos Kupon (AIWS25) Kalkuláció | Kupon Kezelés | 25% levonása a nettó részösszegből az adószámítás előtt. | P1 (Critical) |
| 10 | UTC-CPN-02 | Fix Kupon (SAVE50) Limit Felett | Kupon Kezelés | $50 levonása, ha a kosár nettó értéke eléri vagy meghaladja a $200-os limitet. | P1 (Critical) |
| 11 | UTC-CPN-03 | Fix Kupon (SAVE50) Limit Alatt | Kupon Kezelés | 0 kedvezmény levonása, ha a kosár nettó értéke $200 alatt van (üzleti limit védelem). | P1 (Critical) |
| 12 | UTC-CPN-04 | Kupon és ÁFA Számítási Sorrend | Kupon Kezelés | Kedvezmény levonása megelőzi az ÁFA számítást (adóalap csökkentés). | P1 (Critical) |
| 13 | UTC-STM-01 | PENDING -> PAID Állapotátmenet | Állapotgép | Érvényes átmenet sikeres kártyafizetés vagy Pay akció esetén. | P1 (Critical) |
| 14 | UTC-STM-02 | PENDING -> CANCELLED Állapotátmenet | Állapotgép | Érvényes átmenet rendelés lemondása esetén. | P1 (Critical) |
| 15 | UTC-STM-03 | PAID -> PROVISIONING -> COMPLETED | Állapotgép | Szekvenciális érvényes életciklus átmenetek teljesülése. | P1 (Critical) |
| 16 | UTC-STM-04 | CANCELLED Illegális Fizetés Tiltása | Állapotgép | Lemondott rendelés nem válthat PAID státuszba, hibát/hamis értéket ad. | P1 (Critical) |
| 17 | UTC-STM-05 | REFUNDED Végállapot Zárolás | Állapotgép | Visszatérített rendelésből semmilyen további állapotátmenet nem engedélyezett. | P1 (Critical) |
| 18 | UTC-RBAC-01 | Szerepkör Jogosultsági Mátrix | Jogosultságkezelés | Admin mindenhez hozzáfér, Junior QA nem törölhet/téríthet vissza, Blocked zárolt. | P1 (Critical) |
| 19 | UTC-VAT-01 | Német EU VAT Szintaxis (DE) | EU Adószám | DE + 9 számjegy minta illeszkedése érvényes német B2B adószámra. | P2 (Major) |
| 20 | UTC-VAT-02 | Magyar EU VAT Szintaxis (HU) | EU Adószám | HU + 8 számjegy minta illeszkedése érvényes magyar B2B adószámra. | P2 (Major) |
| 21 | UTC-VAT-03 | Hibás EU VAT Formátum Elutasítás | EU Adószám | Kisbetűs kód, hiányzó országprefix vagy hibás hossz esetén érvénytelen minősítés. | P2 (Major) |
| 22 | UTC-VAT-04 | EU VAT Adómentesség (0%) Törvény | EU Adószám | Érvényes EU adószám esetén az ÁFA kulcs 0%-ra vált (Reverse Charge szabály). | P2 (Major) |
| 23 | UTC-CPN-05 | Lejárt Kupon Érvénytelenítés | Kupon Kezelés | EXPIRED2025 kupon érvényesség-vizsgálata elutasítással zárul. | P2 (Major) |
| 24 | UTC-CPN-06 | Ismeretlen Kuponkód Kezelés | Kupon Kezelés | Nem létező kód (pl. INVALID99) esetén a validátor elutasítja a kedvezményt. | P2 (Major) |
| 25 | UTC-VAL-01 | Szabványos E-mail Formátum | Validáció | RFC kompatibilis enterprise e-mail címek (név@domain.kiterjesztés) elfogadása. | P2 (Major) |
| 26 | UTC-VAL-02 | Hibás E-mail Formátum Elutasítás | Validáció | Hiányzó kukac, érvénytelen karakterek vagy üres érték elutasítása. | P2 (Major) |
| 27 | UTC-VAL-03 | Jelszó Házirend Komplexitás | Validáció | Minimum 8 karakter, kis- és nagybetű, szám és speciális karakter kötelező megléte. | P2 (Major) |
| 28 | UTC-VAL-04 | Egyszerű Jelszó Elutasítás | Validáció | 8 karakternél rövidebb vagy speciális karakter nélküli jelszó elutasítása. | P2 (Major) |
| 29 | UTC-VAL-05 | PO Szám Hossz & Szintaxis | Validáció | Legalább 5 karakteres vállalati megrendelésszám (PO-xxxxx) elfogadása. | P2 (Major) |
| 30 | UTC-VAL-06 | Üres vagy Rövid PO Szám Hiba | Validáció | 5 karakternél rövidebb vagy üres PO azonosító elutasítása. | P2 (Major) |
| 31 | UTC-INV-01 | Raktárkészlet Határvizsgálat | Készletkezelés | Rendelt mennyiség <= aktuális készlet esetén a validáció sikeres. | P2 (Major) |
| 32 | UTC-INV-02 | Készlethiány Detektálás | Készletkezelés | Rendelt mennyiség > aktuális készlet esetén Stock Error kiváltása. | P2 (Major) |
| 33 | UTC-INV-03 | Mennyiség Alsó és Felső Korlát | Készletkezelés | 0 vagy negatív mennyiség elutasítása, 1 és 99 közötti intervallum ellenőrzése. | P2 (Major) |
| 34 | UTC-UPL-01 | Engedélyezett Fájlkiterjesztések | Fájlfeltöltés | .pdf és .png MIME típusok sikeres elfogadása. | P2 (Major) |
| 35 | UTC-UPL-02 | Tiltott Fájlkiterjesztések | Fájlfeltöltés | .exe, .bat, .txt kiterjesztések biztonsági elutasítása. | P2 (Major) |
| 36 | UTC-UPL-03 | Fájl Mérethatár Korlát (2 MB) | Fájlfeltöltés | 2097152 bájt feletti fájl esetén mérethatár-túllépési hiba generálása. | P2 (Major) |
| 37 | UTC-FMT-01 | Pénznem Formázás - USD ($) | Formázók | Számérték átalakítása szabványos dollár szöveggé ($250.00). | P3 (Normal) |
| 38 | UTC-FMT-02 | Pénznem Formázás - EUR (€) | Formázók | Számérték átalakítása európai euró formátummá (230.00 €). | P3 (Normal) |
| 39 | UTC-FMT-03 | Pénznem Formázás - HUF (Ft) | Formázók | Számérték átalakítása ezres tagolású forint formátummá (98 750 Ft). | P3 (Normal) |
| 40 | UTC-CSV-01 | CSV Sor Generálás & Idézőjel Escape | Adat Export | Speciális karaktereket (vessző, sortörés, idézőjel) tartalmazó mezők szabályos escape-elése. | P3 (Normal) |
