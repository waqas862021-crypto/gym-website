"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, X } from "lucide-react";
import { Reveal } from "./reveal";

export function GallerySection({ images }: { images: string[] }) {
  const [active, setActive] = useState<string | null>(null);

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

        {images.length === 0 ? (
          <p className="mt-14 text-neutral-500">Photos coming soon.</p>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((src, i) => (
              <Reveal key={src} delay={(i % 8) * 60}>
                <button
                  type="button"
                  onClick={() => setActive(src)}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10"
                >
                  <Image
                    src={src}
                    alt="Goodlife Fitness Gym"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <Expand className="h-6 w-6 text-white" />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image"
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
          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active}
              alt="Goodlife Fitness Gym"
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
