"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  to: number;
  suffix?: string;
  durationMs?: number;
};

export function AnimatedCounter({
  to,
  suffix = "",
  durationMs = 1200,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          setValue(Math.round(progress * to));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, durationMs]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}
