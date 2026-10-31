import { useRef, useState } from "react";

type Props = {
  before: string;
  after: string;
  alt?: string;
};

/** Draggable before/after comparison slider. */
export function BeforeAfterSlider({ before, after, alt = "Product photo" }: Props) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  function moveTo(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative h-72 w-full select-none overflow-hidden rounded-xl bg-secondary"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX);
        }}
      >
        <img
          src={after}
          alt={`${alt} — enhanced`}
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <img
          src={before}
          alt={`${alt} — original`}
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-1 bg-background/90 shadow"
          style={{ left: `calc(${position}% - 2px)` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-lg font-semibold shadow">
            ⇄
          </span>
        </div>
        <span className="absolute bottom-3 left-3 rounded-full bg-foreground/70 px-3 py-1 text-xs font-semibold text-background">
          Before
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-foreground/70 px-3 py-1 text-xs font-semibold text-background">
          After
        </span>
      </div>
      <label className="sr-only" htmlFor="ba-range">
        Compare before and after
      </label>
      <input
        id="ba-range"
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
