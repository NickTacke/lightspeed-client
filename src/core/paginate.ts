export interface PaginateCursor {
  page?: number;
  since_id?: number;
}
export interface PaginateOpts<T> {
  limit?: number;
  mode?: "cursor" | "page"; // default "cursor"
  idOf?: (item: T) => number; // required for cursor mode; defaults to (item as {id}).id
  startPage?: number;
}

// generic walker. cursor mode: since_id = max id seen so far (deep-paging safe).
// page mode: page++ offset paging. both stop on a short (< limit) page.
export async function* paginate<T>(
  fetchPage: (cursor: PaginateCursor, limit: number) => Promise<T[]>,
  opts?: PaginateOpts<T>,
): AsyncGenerator<T, void, unknown> {
  const limit = Math.min(opts?.limit ?? 250, 250);
  const mode = opts?.mode ?? "cursor";
  const idOf = opts?.idOf ?? ((item: T) => (item as unknown as { id: number }).id);
  let page = opts?.startPage ?? 1;
  // cursor mode assumes numeric ascending ids (idOf default reads item.id)
  let since = 0;
  while (true) {
    const batch = await fetchPage(mode === "cursor" ? { since_id: since } : { page }, limit);
    for (const item of batch) {
      yield item;
      if (mode === "cursor") {
        const id = idOf(item);
        if (!Number.isFinite(id))
          throw new Error(
            "paginate: cursor mode requires a finite numeric id; pass a page-mode option or idOf",
          );
        since = Math.max(since, id);
      }
    }
    if (batch.length < limit) return;
    page++;
  }
}
