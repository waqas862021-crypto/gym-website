import { Dumbbell, HeartPulse, Sparkles, Users2, UserRound, Waves } from "lucide-react";
import { Reveal } from "./reveal";

const experiences = [
  { name: "Strength Training", icon: Dumbbell },
  { name: "Cardio", icon: HeartPulse },
  { name: "Group Fitness", icon: Users2 },
  { name: "Personal Coaching", icon: UserRound },
  { name: "Swimming", icon: Waves },
  { name: "Wellness", icon: Sparkles },
];

export function ExperienceSection() {
  return (
    <section className="bg-neutral-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
            The Fitness Experience
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
            Train your way, every single visit
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {experiences.map((exp, i) => (
            <Reveal key={exp.name} delay={i * 60}>
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] py-8 text-center transition-colors hover:border-lime-400/40">
                <exp.icon className="h-7 w-7 text-lime-400" />
                <span className="text-sm font-medium text-neutral-300">
                  {exp.name}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
