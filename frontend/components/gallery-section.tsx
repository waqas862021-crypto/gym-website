"use client";

import { useState } from "react";
import { Expand, X } from "lucide-react";
import { galleryCategories } from "@data/gym-info";
import { Reveal } from "./reveal";

// No real gym photography exists yet — these tiles are clearly-labeled
// placeholders (category + pattern), not fabricated photos of the facility.
// Swap each tile's content for a real <Image> once photos are supplied.
const tiles = galleryCategories.flatMap((category, i) =>
  [0, 1].map((j) => ({
    id: `${category}-${j}`,
    category,
    tall: (i + j) % 3 === 0,
  })),
);

const PATTERNS = [
  "bg-[repeating-linear-gradient(45deg,rgba(163,230,53,0.12)_0px,rgba(163,230,53,0.12)_2px,transparent_2px,transparent_12px)]",
  "bg-[radial-gradient(circle,rgba(163,230,53,0.18)_1px,transparent_1px)] bg-[length:14px_14px]",
];

export function GallerySection() {
  const [active, setActive] = useState<(typeof tiles)[number] | null>(null);

  return (
    <section id="gallery" className="scroll-mt-20 bg-neutral-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
            Gallery
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
            A look inside Goodlife
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {tiles.map((tile, i) => (
            <Reveal key={tile.id} delay={(i % 5) * 60}>
              <button
                type="button"
                onClick={() => setActive(tile)}
                className={`group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 text-center transition-transform hover:scale-[1.03] ${
                  tile.tall ? "h-72" : "h-40"
                } ${PATTERNS[i % PATTERNS.length]}`}
              >
                <Expand className="h-5 w-5 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="text-xs font-medium text-neutral-400">
                  {tile.category}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${active.category} image`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-6 top-6 text-white"
            onClick={() => setActive(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <div className="flex h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-neutral-900">
            <span className="text-lg font-semibold text-white">
              {active.category}
            </span>
            <span className="text-sm text-neutral-500">
              Photo coming soon
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
