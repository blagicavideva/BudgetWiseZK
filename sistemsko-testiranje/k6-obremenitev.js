import http from 'k6/http';
import { check, sleep } from 'k6';

const apiUrl = (__ENV.BW_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const token = __ENV.BW_TOKEN;
const now = new Date();
const year = __ENV.BW_YEAR || String(now.getFullYear());
const month = __ENV.BW_MONTH || String(now.getMonth() + 1);

export const options = {
  stages: [
    { duration: '30s', target: 2 },
    { duration: '30s', target: 5 },
    { duration: '2m', target: 5 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.99'],
  },
};

function statisticsUrl() {
  return `${apiUrl}/reports/statistics?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
}

export function setup() {
  if (!token) {
    throw new Error('Manjka BW_TOKEN. Nastavi ga v okolju pred zagonom testa.');
  }

  // Pred večminutnim preizkusom preverimo, ali žeton deluje in ali API vrača statistiko.
  const response = http.get(statisticsUrl(), {
    headers: { Authorization: `Bearer ${token}` },
    tags: { endpoint: 'reports_statistics', phase: 'preflight' },
  });

  let body;
  try {
    body = response.json();
  } catch {
    body = null;
  }

  if (response.status !== 200 || body?.success !== true) {
    const reason = body?.code || body?.message || 'API ni vrnil uspešnega odgovora';
    throw new Error(`Predpreizkus ni uspel (HTTP ${response.status}): ${reason}. Test obremenitve ni bil izveden.`);
  }

  return { url: statisticsUrl() };
}

export default function (data) {
  const response = http.get(data.url, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { endpoint: 'reports_statistics', phase: 'load' },
  });

  let body;
  try {
    body = response.json();
  } catch {
    body = null;
  }

  check(response, {
    'statistika vrne HTTP 200': (r) => r.status === 200,
    'odgovor API-ja je uspešen': () => body?.success === true,
  });

  // Uporabnik med posameznimi pogledi na statistiko nekaj časa bere rezultat.
  sleep(12);
}
