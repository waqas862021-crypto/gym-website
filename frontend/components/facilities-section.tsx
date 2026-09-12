import { facilities } from "@data/gym-info";
import { Reveal } from "./reveal";

// Distinct gradient per facility card in place of real photography — clearly
// decorative, not a stand-in for an actual photo of the space.
const GRADIENTS = [
  "from-lime-500/30 via-neutral-900 to-neutral-950",
  "from-cyan-500/25 via-neutral-900 to-neutral-950",
  "from-amber-500/25 via-neutral-900 to-neutral-950",
];

export function FacilitiesSection() {
  return (
    <section id="facilities" className="scroll-mt-20 bg-neutral-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
            World-Class Facilities
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
            Built for serious training and real recovery
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {facilities.map((facility, i) => (
            <Reveal key={facility.slug} delay={i * 100}>
              <div
                className={`relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-7 transition-transform duration-300 hover:scale-[1.02] ${GRADIENTS[i % GRADIENTS.length]}`}
              >
                <h3 className="text-2xl font-bold text-white">
                  {facility.name}
                </h3>
                <p className="mt-2 text-sm text-neutral-300">
                  {facility.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-sm text-neutral-500">
          More facilities coming soon.
        </p>
      </div>
    </section>
  );
}
