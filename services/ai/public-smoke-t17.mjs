const publicApiUrl = process.env.PUBLIC_API_URL;
const token1 = process.env.SMOKE_USER1_TOKEN;
const token2 = process.env.SMOKE_USER2_TOKEN;

if (!publicApiUrl) {
  throw new Error('Set PUBLIC_API_URL, for example https://budgetify-ai.back4app.io');
}

if (!token1 || !token2) {
  throw new Error('Set SMOKE_USER1_TOKEN and SMOKE_USER2_TOKEN');
}

const baseUrl = publicApiUrl.endsWith('/') ? publicApiUrl.slice(0, -1) : publicApiUrl;

async function call(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return { status: response.status, body };
}

async function callChat(token, message) {
  return call('/api/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
}

const health = await call('/health');
if (health.status !== 200 || health.body.status !== 'ok') {
  throw new Error(`Health check failed: ${JSON.stringify(health)}`);
}

const unauth = await call('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'summary' }),
});
if (unauth.status !== 401) {
  throw new Error(`Expected unauthenticated /api/chat 401, got ${JSON.stringify(unauth)}`);
}

const write = await callChat(token1, 'spent $17.22 on public smoke test');
if (
  write.status !== 200 ||
  write.body.toolCalled !== 'record_expense' ||
  !write.body.result?.success
) {
  throw new Error(`User1 write failed: ${JSON.stringify(write)}`);
}

const summary1 = await callChat(token1, 'summary');
if (
  summary1.status !== 200 ||
  summary1.body.toolCalled !== 'get_financial_summary' ||
  !summary1.body.result?.success
) {
  throw new Error(`User1 summary failed: ${JSON.stringify(summary1)}`);
}

const summary2 = await callChat(token2, 'summary');
if (
  summary2.status !== 200 ||
  summary2.body.toolCalled !== 'get_financial_summary' ||
  !summary2.body.result?.success
) {
  throw new Error(`User2 summary failed: ${JSON.stringify(summary2)}`);
}

const user1Expense = Number(summary1.body.result?.data?.total_expense ?? 0);
const user2Expense = Number(summary2.body.result?.data?.total_expense ?? 0);

if (user1Expense <= 0) {
  throw new Error(`Expected user1 total_expense > 0, got ${user1Expense}`);
}

if (user2Expense !== 0) {
  throw new Error(`Expected user2 total_expense 0 due to RLS isolation, got ${user2Expense}`);
}

console.log(
  JSON.stringify({
    ok: true,
    publicApiUrl: baseUrl,
    checks: {
      health200: true,
      unauth401: true,
      authenticatedWriteRead: true,
      crossUserRlsIsolation: true,
    },
    totals: {
      user1Expense,
      user2Expense,
    },
  }),
);
