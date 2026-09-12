import { UserRound } from "lucide-react";
import { Reveal } from "./reveal";

const benefits = [
  "Personalized training plan built around your goals",
  "Progress tracking, session after session",
  "Coaching from trainers across every discipline we offer",
];

// No real trainer profiles exist yet — these are structural placeholders,
// not claims about actual staff. Replace with real trainer data later
// (see Phase 9 of the build plan).
const trainerPlaceholders = [1, 2, 3];

export function TrainingSection() {
  return (
    <section id="training" className="scroll-mt-20 bg-neutral-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
                Personal Training
              </p>
              <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
                A personalized approach to real results
              </h2>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 text-neutral-300"
                  >
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-lime-400" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="mt-8 inline-block rounded-full bg-lime-400 px-7 py-3.5 text-sm font-semibold text-neutral-950 transition-transform hover:scale-105"
              >
                Start Training With Us
              </a>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="grid grid-cols-3 gap-4">
              {trainerPlaceholders.map((n) => (
                <div
                  key={n}
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-neutral-500"
                >
                  <UserRound className="h-10 w-10" />
                  <span className="text-xs">Trainer profile</span>
                  <span className="text-xs">coming soon</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
