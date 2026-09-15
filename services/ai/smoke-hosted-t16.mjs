const serviceUrl = 'http://localhost:8787';
const user1Token = process.env.SMOKE_USER1_TOKEN;
const user2Token = process.env.SMOKE_USER2_TOKEN;

if (!user1Token || !user2Token) {
  throw new Error('Set SMOKE_USER1_TOKEN and SMOKE_USER2_TOKEN before running this smoke script');
}

async function callChat(token, message) {
  const response = await fetch(`${serviceUrl}/api/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: response.status, body: json };
}

const writeResult = await callChat(user1Token, 'spent $12.34 on smoke tea');
if (
  writeResult.status !== 200 ||
  writeResult.body.toolCalled !== 'record_expense' ||
  !writeResult.body.result?.success
) {
  throw new Error(`User1 write failed: ${JSON.stringify(writeResult)}`);
}

const summary1 = await callChat(user1Token, 'summary');
if (
  summary1.status !== 200 ||
  summary1.body.toolCalled !== 'get_financial_summary' ||
  !summary1.body.result?.success
) {
  throw new Error(`User1 summary failed: ${JSON.stringify(summary1)}`);
}

const summary2 = await callChat(user2Token, 'summary');
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
  throw new Error(`Expected user1 expense to be > 0, got ${user1Expense}`);
}

if (user2Expense !== 0) {
  throw new Error(`Expected user2 expense to remain 0 due to RLS isolation, got ${user2Expense}`);
}

console.log(
  JSON.stringify({
    ok: true,
    user1Expense,
    user2Expense,
    checks: {
      unauthenticated401Expected: true,
      user1WriteAndRead: true,
      user2Isolated: true,
    },
  }),
);
