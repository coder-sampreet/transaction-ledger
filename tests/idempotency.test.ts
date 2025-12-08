// tests/idempotency.test.ts
import { api } from "./setup.ts";
import { createAccount, deposit, getBalance } from "./utils/testUtils.ts";

describe("Idempotency - Transfer", () => {
  it("should not process a transfer twice when idempotency key matches", async () => {
    const accA = await createAccount();
    const accB = await createAccount();

    const A = accA.id;
    const B = accB.id;

    await deposit(A, 500);

    const key = "unique-idempotency-key-123";

    // First request
    const r1 = await api
      .post("/api/v1/transfers")
      .set("Idempotency-Key", key)
      .send({ fromAccountId: A, toAccountId: B, amount: 200 });

    if (r1.status !== 201) {
      throw new Error(
        `Request 1 failed: ${r1.status} - ${JSON.stringify(r1.body, null, 2)}`,
      );
    }
    expect(r1.status).toBe(201);

    // Second request — same key
    const r2 = await api
      .post("/api/v1/transfers")
      .set("Idempotency-Key", key)
      .send({ fromAccountId: A, toAccountId: B, amount: 200 });

    // Should return 200 and same transfer id
    expect(r2.status).toBe(200);
    expect(r1.body.data.id).toBe(r2.body.data.id);

    // Final balances must be exactly:
    const balanceA = await getBalance(A);
    const balanceB = await getBalance(B);

    expect(balanceA).toBe(300);
    expect(balanceB).toBe(200);

    // Ledger count must be 2 entries total
    const ledgerA = await api.get(`/api/v1/accounts/${A}/ledger`);
    const ledgerB = await api.get(`/api/v1/accounts/${B}/ledger`);

    expect(ledgerA.body.data.entries.length).toBe(2);
    expect(ledgerB.body.data.entries.length).toBe(1);
  }, 30000);
});
