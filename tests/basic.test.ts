import { api } from "./setup.js";

describe("Basic Route Check", () => {
  it("should return 404 for unknown route", async () => {
    const res = await api.get("/api/v1/unknown");
    expect(res.status).toBe(404);
  });

  it("should create account successfully", async () => {
    const res = await api.post("/api/v1/accounts").send({ currency: "USD" });
    expect(res.status).toBe(201);

    const accountId = res.body.data.id;

    // Test Deposit
    const resDep = await api
      .post(`/api/v1/accounts/${accountId}/deposit`)
      .send({ amount: 1000 });

    expect(resDep.status).toBe(201);

    // Check Balance
    const resBal = await api.get(`/api/v1/accounts/${accountId}/balance`);

    expect(resBal.status).toBe(200);
    expect(Number(resBal.body.data.balance)).toBe(1000);
  });
});
