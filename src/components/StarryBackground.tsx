import { useMemo } from "react";

// Static deep-space background — pure CSS, no animation, no JS work after mount.
// Generates a few hundred fixed star positions baked into a single layer.
type Star = { x: number; y: number; size: number; opacity: number };

function generate(count: number, seed: number): Star[] {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: rand() < 0.92 ? 1 : 1.6,
    opacity: 0.25 + rand() * 0.55,
  }));
}

export function StarryBackground() {
  const stars = useMemo(() => generate(120, 17), []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 deep-space">
      <div className="absolute inset-0">
        {stars.map((st, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${st.size}px`,
              height: `${st.size}px`,
              opacity: st.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
