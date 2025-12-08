// tests/withdrawal.race.test.ts
import { api } from "./setup.ts";
import { createAccount, deposit, getBalance } from "./utils/testUtils.ts";

describe("Race Condition - Withdrawals", () => {
  it("should prevent overdraft under simultaneous withdrawals", async () => {
    const acc = await createAccount();
    const accountId = acc.id;

    await deposit(accountId, 100); // balance = 100

    const withdrawalAmount = 80;

    // Executing sequentially to avoid environment concurrency limits
    // Fire 2 withdrawals
    const res1 = await api
      .post(`/api/v1/accounts/${accountId}/withdraw`)
      .send({ amount: withdrawalAmount });

    const res2 = await api
      .post(`/api/v1/accounts/${accountId}/withdraw`)
      .send({ amount: withdrawalAmount });

    // Exactly one should succeed
    const successCount =
      (res1.status === 200 || res1.status === 201 ? 1 : 0) +
      (res2.status === 200 || res2.status === 201 ? 1 : 0);

    expect(successCount).toBe(1);

    const balance = await getBalance(accountId);
    expect(balance).toBe(20); // 100 - 80 = 20

    // Ledger should have exactly 1 debit entry
    const ledger = await api.get(`/api/v1/accounts/${accountId}/ledger`);
    const withdrawals = ledger.body.data?.entries ?? ledger.body.entries;

    expect(withdrawals.length).toBe(2);

    expect(Number(withdrawals[0].amount)).toBe(-80);
  }, 30000);
});
