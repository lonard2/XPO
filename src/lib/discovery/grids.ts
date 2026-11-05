export function rowGridClass(count: number): string {
  // Column classes only: the row supplies `md:grid` itself, so the base
  // display stays `flex` for the mobile scroller. Never include a bare
  // `grid` here; twMerge would collapse the scroller into a grid.
  if (count <= 1) return "max-w-3xl mx-auto";
  if (count === 2) return "md:grid-cols-2";
  if (count === 3) return "md:grid-cols-2 lg:grid-cols-3";
  if (count === 4) return "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  return "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1800px]:grid-cols-5";
}
