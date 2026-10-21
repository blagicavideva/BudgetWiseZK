/*Preverja pravila za registracijo, prijavo in žeton za osvežitev:
veljaven e-poštni naslov, zahtevano obliko gesla,ime in priimek ter neprazno geslo oziroma žeton.
Preveri tudi, da parse za napačno geslo vrže izjemo.*/

import { loginSchema, refreshSchema, registerSchema } from '../auth.validator';

// Ti podatki predstavljajo veljavno registracijo in so osnova za negativne primere.
const validRegistration = {
  body: {
    email: 'test@example.com',
    password: 'Secure123',
    firstName: 'Ada',
    lastName: 'Lovelace',
  },
};

// Registracija zahteva veljaven e-poštni naslov, močno geslo in ustrezni imeni.
describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    // Veljavna registracija mora prestati validacijo.
    expect(registerSchema.parse(validRegistration)).toEqual(validRegistration);
  });

  it.each(['short1A', 'lowercase123', 'lowercase1', 'NoDigitsHere', ''])('rejects a password missing required rules: %s', (password) => {
    // Primeri pokrivajo prekratko geslo ter manjkajočo veliko črko ali številko.
    // "short1A" zazna prenizko minimalno dolžino; "lowercase1" zazna manjkajoče preverjanje velike črke.
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, password } }).success).toBe(false);
  });

  it('throws a validation exception when parse receives an invalid password', () => {
    // Za razliko od safeParse mora parse ob neveljavnem geslu vreči izjemo.
    expect(() => registerSchema.parse({
      body: { ...validRegistration.body, password: 'lowercase1' },
    })).toThrow();
  });

  it.each(['not-an-email', ''])('rejects an invalid email: %s', (email) => {
    // Napačen ali prazen e-poštni naslov mora biti zavrnjen.
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, email } }).success).toBe(false);
  });

  it('rejects blank names and names longer than 50 characters', () => {
    // Ime ne sme biti prazno, priimek pa ne sme preseči omejitve dolžine.
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, firstName: '' } }).success).toBe(false);
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, lastName: 'x'.repeat(51) } }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    // Prijava sprejme veljaven e-poštni naslov in neprazno geslo.
    expect(loginSchema.safeParse({ body: { email: 'user@example.com', password: 'anything' } }).success).toBe(true);
  });

  it('rejects invalid emails and empty passwords', () => {
    // Napačen e-poštni naslov in prazno geslo sta neveljavna.
    expect(loginSchema.safeParse({ body: { email: 'invalid', password: 'anything' } }).success).toBe(false);
    expect(loginSchema.safeParse({ body: { email: 'user@example.com', password: '' } }).success).toBe(false);
  });
});

describe('refreshSchema', () => {
  it('accepts a non-empty refresh token and rejects an empty token', () => {
    // Praznega žetona za osvežitev ne smemo sprejeti.
    expect(refreshSchema.safeParse({ body: { refreshToken: 'token-value' } }).success).toBe(true);
    expect(refreshSchema.safeParse({ body: { refreshToken: '' } }).success).toBe(false);
  });
});

// Za prikaz neuspeha CI začasno odstrani oznaki komentarja okoli tega testa.
// Po prikazu ga znova zakomentiraj, da redni testi ostanejo uspešni.
/*
it('prikazno preveri napačno geslo z napačno pričakovano vrednostjo', () => {
  // Geslo "lowercase1" nima velike črke, ki jo registracija zahteva, zato ga validator zavrne.
  // Test napačno pričakuje, da je to geslo veljavno; napačno pričakovanje povzroči neuspeh testa in CI.
  expect(registerSchema.safeParse({
    body: { ...validRegistration.body, password: 'lowercase1' },
  }).success).toBe(true);
});
*/

// Drugi prikazni primer: geslo, krajše od osmih znakov, ne izpolni pravil registracije.
/*
it('prikazno pričakuje napačno sprejetje prekratkega gesla', () => {
  // "short1A" ima 7 znakov, zato ga mora validator zavrniti.
  // Test napačno pričakuje, da je geslo veljavno, zato bi Jest prikazal neuspeh in CI bi postal rdeč.
  expect(registerSchema.safeParse({
    body: { ...validRegistration.body, password: 'short1A' },
  }).success).toBe(true);
});
*/

// Uporabljeni agent za pripravo in pregled testov: Codex (UI agent).
