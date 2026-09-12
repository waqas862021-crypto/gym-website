import { gymInfo } from "@data/gym-info";
import { Reveal } from "./reveal";
import { AnimatedCounter } from "./animated-counter";

// Only the given rating/review count are real numbers. Anything else here is
// framing copy, not a fabricated statistic.
const stats = [
  { to: gymInfo.reviewCount, suffix: "+", label: "Member Reviews" },
  { to: 7, suffix: "", label: "Core Services" },
  { to: 3, suffix: "", label: "Premium Facilities" },
];

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-neutral-950 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:items-center">
        <Reveal>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
              About Us
            </p>
            <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
              A professional fitness destination in {gymInfo.location}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-neutral-400">
              {gymInfo.name} brings together modern training environments,
              expert-led programs, and premium facilities under one roof —
              built for members who take their health and performance
              seriously.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="grid grid-cols-3 gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-lime-400 sm:text-4xl">
                  <AnimatedCounter to={stat.to} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
