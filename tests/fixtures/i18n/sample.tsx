export function Sample() {
  const hidden = "Hidden string";
  return (
    <div className="flex gap-2" aria-label="Close dialog">
      <span>Plain sentence here</span>
      <a href="https://example.com">Example site</a>
      <p>Split <strong>across</strong> nodes</p>
      <input placeholder="partner@fund.com" />
      <span>{hidden}</span>
    </div>
  );
}
