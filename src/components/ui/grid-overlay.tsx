/** 12 column edges at 3% white. The only background ornament; large screens only. */
export function GridOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden lg:block">
      <div className="mx-auto grid h-full max-w-page grid-cols-12 px-gutter">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="border-l border-grid last:border-r" />
        ))}
      </div>
    </div>
  );
}
