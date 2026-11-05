import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Playwright najde scenarije v tej mapi in jih izvaja zaporedno.
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  // Izpišemo rezultate v terminalu in ustvarimo HTML poročilo brez samodejnega odpiranja.
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    // Lokalni naslov Expo Web strežnika, ki ga Playwright zažene spodaj.
    baseURL: 'http://127.0.0.1:8081',
    // Ob napaki shranimo sled, ob uspehu pa ne ustvarjamo dodatnih posnetkov.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    // Samodejni zagon spletne različice; ročnega zagona Expo pred testi ne potrebujemo.
    command: 'npm run web -- --port 8081 --clear',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // API je nastavljen na lokalni naslov, vendar klice v testih prestrežejo mocki.
    env: {
      EXPO_PUBLIC_API_URL: 'http://127.0.0.1:3000/api/v1',
    },
  },
});
