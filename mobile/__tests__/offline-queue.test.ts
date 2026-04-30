/**
 * Unit test — offlineQueue.
 *
 * v6 §15 / §23. Validates enqueue/drain/size + idempotency keys.
 */

import { offlineQueue } from "@/lib/offline";

describe("offlineQueue", () => {
  beforeEach(async () => {
    await offlineQueue._reset();
  });

  it("enqueue + drain round-trips a payload", async () => {
    const key = await offlineQueue.enqueue("chat.sendMessage", {
      channelId: "c1",
      body: "hello",
    });
    expect(typeof key).toBe("string");

    const drained = await offlineQueue.drain();
    expect(drained).toHaveLength(1);
    expect(drained[0].kind).toBe("chat.sendMessage");
    expect(drained[0].payload.channelId).toBe("c1");
    expect(drained[0].idempotencyKey).toBe(key);
  });

  it("size returns count by kind", async () => {
    await offlineQueue.enqueue("chat.sendMessage", { a: 1 });
    await offlineQueue.enqueue("chat.sendMessage", { a: 2 });
    await offlineQueue.enqueue("ts.report", { a: 3 });

    expect(await offlineQueue.size()).toBe(3);
    expect(await offlineQueue.size("chat.sendMessage")).toBe(2);
    expect(await offlineQueue.size("ts.report")).toBe(1);
  });

  it("drain by kind only takes that kind", async () => {
    await offlineQueue.enqueue("chat.sendMessage", { a: 1 });
    await offlineQueue.enqueue("ts.report", { a: 2 });

    const chatOnly = await offlineQueue.drain("chat.sendMessage");
    expect(chatOnly).toHaveLength(1);
    expect(chatOnly[0].kind).toBe("chat.sendMessage");

    expect(await offlineQueue.size()).toBe(1);
    expect(await offlineQueue.size("ts.report")).toBe(1);
  });

  it("idempotency keys are unique per enqueue", async () => {
    const k1 = await offlineQueue.enqueue("a", {});
    const k2 = await offlineQueue.enqueue("a", {});
    expect(k1).not.toBe(k2);
  });
});
