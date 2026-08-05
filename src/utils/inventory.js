// Inventory entries are either a plain string (no quantity tracked — the
// original shape, still written when no count is given) or { name, qty }.
// Everything that reads an inventory goes through these so both forms render.

export function itemName(item) {
  return typeof item === 'string' ? item : item?.name || '';
}

// null when the entry doesn't track a count.
export function itemQty(item) {
  if (typeof item === 'string' || item == null) return null;
  return Number.isFinite(item.qty) ? item.qty : null;
}

export function itemLabel(item) {
  const qty = itemQty(item);
  return qty === null ? itemName(item) : `${itemName(item)} ×${qty}`;
}

// An empty/invalid count keeps the entry a plain string, so inventories that
// never use quantities stay exactly as they were.
export function makeItem(name, qtyInput) {
  const qty = parseInt(qtyInput, 10);
  return Number.isFinite(qty) && qty >= 1 ? { name, qty } : name;
}
