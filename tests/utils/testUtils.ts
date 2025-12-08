// tests/utils/testUtils.ts
import { api } from "../setup.ts";

export async function createAccount(currency = "USD") {
  const res = await api.post("/api/v1/accounts").send({ currency });
  return res.body.data ?? res.body; // supports both response formats
}

export async function deposit(accountId: string, amount: number) {
  return api.post(`/api/v1/accounts/${accountId}/deposit`).send({ amount });
}

export async function getBalance(accountId: string) {
  const res = await api.get(`/api/v1/accounts/${accountId}/balance`);
  return Number(res.body.data?.balance ?? res.body.balance);
}
