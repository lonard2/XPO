/**
 * Grid classes that follow the number of items.
 *
 * A thin edition (Global has one attendable event) used to render one card beside
 * hundreds of pixels of empty columns, which reads as a failed load rather than a
 * curated page. Column count now matches inventory, and a lone card is centred.
 */
/**
 * Shared row grid: columns follow inventory, and five columns only appear
 * on very wide screens where the container (up to 1800px) fits them.
 */
export function rowGridClass(count: number): string {
  const base = "grid grid-cols-1 gap-6";
  if (count <= 1) return `${base} max-w-3xl mx-auto`;
  if (count === 2) return `${base} md:grid-cols-2`;
  if (count === 3) return `${base} md:grid-cols-2 lg:grid-cols-3`;
  if (count === 4) return `${base} md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
  return `${base} md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1800px]:grid-cols-5`;
}
