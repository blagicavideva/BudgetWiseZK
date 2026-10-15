import { loginSchema, refreshSchema, registerSchema } from '../auth.validator';

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
    expect(registerSchema.parse(validRegistration)).toEqual(validRegistration);
  });

  it.each(['short1A', 'lowercase123', 'lowercase1', 'NoDigitsHere', ''])('rejects a password missing required rules: %s', (password) => {
    // Primeri pokrivajo prekratko geslo ter manjkajočo veliko črko ali številko.
    // "short1A" zazna prenizko minimalno dolžino; "lowercase1" zazna manjkajoče preverjanje velike črke.
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, password } }).success).toBe(false);
  });

  it.each(['not-an-email', ''])('rejects an invalid email: %s', (email) => {
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, email } }).success).toBe(false);
  });

  it('rejects blank names and names longer than 50 characters', () => {
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, firstName: '' } }).success).toBe(false);
    expect(registerSchema.safeParse({ body: { ...validRegistration.body, lastName: 'x'.repeat(51) } }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    expect(loginSchema.safeParse({ body: { email: 'user@example.com', password: 'anything' } }).success).toBe(true);
  });

  it('rejects invalid emails and empty passwords', () => {
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
