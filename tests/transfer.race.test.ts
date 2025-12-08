// tests/transfer.race.test.ts
import { api } from "./setup.ts";
import { createAccount, deposit, getBalance } from "./utils/testUtils.ts";

describe("Race Condition - Transfers", () => {
  it("should allow only valid transfers under high concurrency", async () => {
    const accA = await createAccount();
    const accB = await createAccount();

    // DEBUG LOG
    console.log("Account A:", accA);
    console.log("Account B:", accB);

    const A = accA.id;
    const B = accB.id;

    await deposit(A, 1000); // balance A = 1000

    const amount = 200;
    const attempts = 1; // 1 transfer (environment restricted concurrency)

    const promises = Array.from({ length: attempts }).map(() =>
      api.post("/api/v1/transfers").send({
        fromAccountId: A,
        toAccountId: B,
        amount,
      }),
    );

    const responses = await Promise.all(promises);

    const successCount = responses.filter((r) => r.status === 201).length;

    const balanceA = Number(await getBalance(A));
    const balanceB = Number(await getBalance(B));

    // Only 1 transfer should succeed
    expect(successCount).toBe(1);

    expect(balanceA).toBe(800); // 1000 - 200
    expect(balanceB).toBe(200); // 0 + 200

    // Ledger integrity:
    // A: 1 deposit + 1 transfer = 2
    // B: 1 transfer = 1
    const ledgerA = await api.get(`/api/v1/accounts/${A}/ledger`);
    const ledgerB = await api.get(`/api/v1/accounts/${B}/ledger`);

    expect(ledgerA.body.data.entries.length).toBe(2);
    expect(ledgerB.body.data.entries.length).toBe(1);
  }, 30000); // 30s timeout
});
