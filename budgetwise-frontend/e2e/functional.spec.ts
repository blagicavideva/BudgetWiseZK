import { expect, Page, test } from '@playwright/test';

// Testna kategorija, ki jo aplikacija dobi v lažnem odgovoru API-ja.
const category = {
  id: 'category-entertainment',
  name: 'Entertainment',
  icon: '🎮',
  color: '#A0263A',
  type: 'EXPENSE',
};

// Vnaprej določeni oktobrski podatki, da je rezultat poročila ponovljiv.
// V oktobru je 1.500 € prihodkov in 20 € stroškov.
const octoberStatistics = {
  currentMonth: {
    income: 1500,
    expenses: 20,
    savings: 1480,
    savingsRate: 98.7,
    transactionCount: 3,
  },
  previousMonth: { income: 0, expenses: 0, savings: 0 },
  changes: { income: 100, expenses: 100, savings: 0 },
  topCategories: [
    {
      categoryId: 'category-entertainment',
      categoryName: 'Zabava',
      categoryIcon: '🎮',
      categoryColor: '#A0263A',
      total: 12.5,
      count: 1,
      percentage: 62.5,
      avgTransaction: 12.5,
    },
    {
      categoryId: 'category-transport',
      categoryName: 'Prevoz',
      categoryIcon: '🚗',
      categoryColor: '#4CC9B0',
      total: 7.5,
      count: 1,
      percentage: 37.5,
      avgTransaction: 7.5,
    },
  ],
  biggestExpense: {
    description: 'funkcionalni test odhodek',
    amount: 12.5,
    categoryName: 'Zabava',
    categoryIcon: '🎮',
    date: '2026-10-27',
  },
  weeklyAvgSpend: 4.52,
  dailyAvgSpend: 0.65,
  mostExpensiveDay: 'Torek',
};

// Lažni podatki za domači zaslon po prijavi.
const dashboard = {
  currentMonth: { balance: 1480, income: 1500, expenses: 20 },
  weeklySpending: [0, 20, 0, 0, 0, 0, 0],
  recentTransactions: [],
  categories: [category],
};

// Prestrezanje API klicev: testi ne kličejo pravega strežnika ali podatkovne baze.
// Tako uporabljajo vedno enake podatke in ne potrebujejo pravih računov ali ključev.
async function installApiMocks(page: Page) {
  // Sem shranimo odhodek, ki ga uporabnik ustvari med testom FT-02.
  const state: { createdTransaction?: Record<string, unknown> } = {};

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');

    // Lažen uspešen odgovor za prijavo; podatki so izmišljeni in namenjeni samo testu.
    if (path === '/auth/login' && request.method() === 'POST') {
      await route.fulfill({
        json: {
          success: true,
          data: {
            user: {
              id: 'e2e-user',
              email: 'test@example.com',
              firstName: 'Testni',
              lastName: 'Uporabnik',
              currency: 'EUR',
            },
            accessToken: 'playwright-access-token',
            refreshToken: 'playwright-refresh-token',
          },
        },
      });
      return;
    }

    // Domači zaslon in obrazec za odhodek potrebujeta pregled in seznam kategorij.
    if (path === '/transactions/dashboard' && request.method() === 'GET') {
      await route.fulfill({ json: { success: true, data: dashboard } });
      return;
    }

    if (path === '/categories' && request.method() === 'GET') {
      await route.fulfill({ json: { success: true, data: [category] } });
      return;
    }

    // Ob shranjevanju prestrežemo poslani odhodek in ga obdržimo v pomnilniku testa.
    if (path === '/transactions' && request.method() === 'POST') {
      const submitted = request.postDataJSON();
      state.createdTransaction = {
        id: 'created-expense',
        ...submitted,
        category,
      };
      await route.fulfill({
        status: 201,
        json: { success: true, data: state.createdTransaction },
      });
      return;
    }

    // Ko test odpre seznam transakcij, vrnemo prej shranjeni testni odhodek.
    if (path === '/transactions' && request.method() === 'GET') {
      await route.fulfill({
        json: {
          success: true,
          data: state.createdTransaction ? [state.createdTransaction] : [],
          meta: { page: 1, limit: 20, total: state.createdTransaction ? 1 : 0 },
        },
      });
      return;
    }

    // Grafi na poročilu dobijo pripravljene oktobrske vrednosti.
    if (path === '/reports/trends' && request.method() === 'GET') {
      await route.fulfill({
        json: {
          success: true,
          data: {
            points: [{ month: 10, year: 2026, label: 'Okt', income: 1500, expenses: 20, savings: 1480 }],
            averageIncome: 250,
            averageExpenses: 3.33,
            averageSavings: 246.67,
            trend: 'stable',
          },
        },
      });
      return;
    }

    // Za oktober vrnemo pripravljene statistike, za druge mesece pa prazne podatke.
    if (path === '/reports/statistics' && request.method() === 'GET') {
      const statistics = url.searchParams.get('month') === '10'
        ? octoberStatistics
        : {
            ...octoberStatistics,
            currentMonth: { income: 0, expenses: 0, savings: 0, savingsRate: 0, transactionCount: 0 },
            topCategories: [],
            biggestExpense: null,
          };
      await route.fulfill({ json: { success: true, data: statistics } });
      return;
    }

    // Nepričakovan API klic vrne 404, da manjkajočega mocka ne spregledamo tiho.
    await route.fulfill({
      status: 404,
      json: { success: false, message: `E2E mock ni definiran za ${request.method()} ${path}` },
    });
  });

  return state;
}

// Skupen prijavni korak. Vsak scenarij začne z enakim uporabnikom in stanjem aplikacije.
async function login(page: Page) {
  await page.goto('/welcome');
  // exact: true izbere točno besedilo gumba in ne elementa, ki bi vseboval podobno besedilo.
  await page.getByText('Že imam račun', { exact: true }).click();
  await page.getByPlaceholder('ime@primer.com').fill('test@example.com');
  // Polje nima enoličnega besedilnega namiga, zato ga poiščemo po vrsti HTML vhoda.
  await page.locator('input[type="password"]').fill('TestPassword123!');
  await page.getByText('Prijava', { exact: true }).click();
  await expect(page.getByText('Preostanek denarja')).toBeVisible();
}

// FT-01: preveri, da se uporabnik lahko prijavi in vidi domači finančni pregled.
test('FT-01: prijava odpre domačo stran s finančnim pregledom', async ({ page }) => {
  await installApiMocks(page);
  await login(page);

  // Preverimo vidna podatka, ki potrdita uspešno prijavo in pravilen prikaz stanja.
  await expect(page.getByText('Dober dan,')).toBeVisible();
  await expect(page.getByText('1480,00 €', { exact: true })).toBeVisible();
});

// FT-02: preveri vnos odhodka, njegovo pošiljanje API-ju in prikaz na seznamu.
test('FT-02: dodajanje odhodka ga shrani in prikaže na seznamu', async ({ page }) => {
  const apiState = await installApiMocks(page);
  await login(page);

  const description = 'Playwright funkcionalni odhodek';
  await page.getByText('Dodaj strošek', { exact: true }).click();
  await page.getByPlaceholder('0.00').fill('12.50');
  await page.getByPlaceholder('Trgovina, Kosilo, Bencin...').fill(description);
  // Izberemo kategorijo za strošek, nato shranimo obrazec.
  await page.getByText('Zabava', { exact: true }).click();
  await page.getByText('Shrani transakcijo', { exact: true }).click();
  // Ime zavihka se lahko pojavi tudi v vsebini; zadnji zadetek je spodnji navigacijski zavihek.
  await page.getByText('Transakcije', { exact: true }).last().click();

  // Preverimo, da se opis in izbrana kategorija prikažeta uporabniku.
  await expect(page.getByText(description, { exact: true })).toBeVisible();
  await expect(page.getByText('Zabava', { exact: true }).last()).toBeVisible();
  // Preverimo tudi znesek, vrsto in kategorijo, ki jih je poslal obrazec.
  expect(apiState.createdTransaction).toMatchObject({
    amount: 12.5,
    description,
    type: 'EXPENSE',
    categoryId: category.id,
  });
});

// FT-03: preveri, ali statistika za oktober kaže pričakovane zneske in kategorije.
test('FT-03: mesečno poročilo pokaže oktobrske vsote in kategorije', async ({ page }) => {
  await installApiMocks(page);
  await login(page);

  await page.getByText('Poročilo', { exact: true }).click();
  await expect(page.getByText('Statistika', { exact: true })).toBeVisible();
  // Premaknemo se iz trenutnega meseca na oktober, za katerega so pripravljeni testni podatki.
  await page.getByText('‹', { exact: true }).click();

  await expect(page.getByText('Oktober 2026', { exact: true })).toBeVisible();
  // Testni oznaki ciljata točno kartico, saj se enaki zneski lahko pojavijo še v grafih.
  const incomeCard = page.getByTestId('report-income-card');
  const expenseCard = page.getByTestId('report-expenses-card');
  await expect(incomeCard.getByText('€1500.00', { exact: true })).toBeVisible();
  // Pri namenski napaki kartica Stroški kaže prihodke (1.500 €), zato ta preverba pade.
  await expect(expenseCard.getByText('€20.00', { exact: true })).toBeVisible();
  await expect(page.getByText('Zabava', { exact: true })).toBeVisible();
  await expect(page.getByText('Prevoz', { exact: true })).toBeVisible();
});
