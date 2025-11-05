// Server lifecycle is tested in integration tests
// This file focuses on testing the module exports
describe("server module", () => {
  it("exports start, stop, and app", async () => {
    const serverModule = await import("../../src/server.js");

    expect(serverModule.start).toBeDefined();
    expect(typeof serverModule.start).toBe("function");

    expect(serverModule.stop).toBeDefined();
    expect(typeof serverModule.stop).toBe("function");

    expect(serverModule.app).toBeDefined();
    expect(typeof serverModule.app).toBe("function");
  });
});
