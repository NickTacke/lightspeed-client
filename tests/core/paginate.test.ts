import { expect, test } from "bun:test";
import { paginate } from "../../src/core/paginate";

test("cursor mode walks via since_id of the max id, until a short page", async () => {
  const all = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
  const fetchPage = async (cur: { page?: number; since_id?: number }, limit: number) => {
    const after = cur.since_id ?? 0;
    return all.filter((x) => x.id > after).slice(0, limit);
  };
  const out: number[] = [];
  for await (const item of paginate(fetchPage, { limit: 2, idOf: (x) => x.id })) out.push(item.id);
  expect(out).toEqual([1, 2, 3, 4, 5]);
});

test("cursor mode throws when item has no finite numeric id", async () => {
  const fetchPage = async () => [{ name: "a" }];
  let threw = false;
  try {
    for await (const _ of paginate(fetchPage as never)) {
      // consume
    }
  } catch {
    threw = true;
  }
  expect(threw).toBe(true);
});

test("page mode increments page until a short page", async () => {
  const pages: Record<number, number[]> = { 1: [1, 2], 2: [3, 4], 3: [5] };
  const fetchPage = async (cur: { page?: number }, _limit: number) => pages[cur.page ?? 1] ?? [];
  const out: number[] = [];
  for await (const item of paginate(fetchPage, { limit: 2, mode: "page" })) out.push(item);
  expect(out).toEqual([1, 2, 3, 4, 5]);
});
