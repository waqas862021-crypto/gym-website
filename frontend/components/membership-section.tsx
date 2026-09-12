import { Check } from "lucide-react";
import { Reveal } from "./reveal";

// No official pricing has been provided — every plan links to Contact Us
// rather than showing an invented price. See Phase 4 of the build plan for
// where real pricing gets added once supplied.
const plans = [
  {
    name: "Monthly Membership",
    tagline: "Flexible, month to month",
    features: ["Full gym access", "Group classes included", "No long-term commitment"],
    highlighted: false,
  },
  {
    name: "Quarterly Membership",
    tagline: "Commit for a season",
    features: ["Full gym access", "Group classes included", "Better value than monthly"],
    highlighted: true,
  },
  {
    name: "Annual Membership",
    tagline: "Our best value",
    features: ["Full gym access", "Group classes included", "Priority booking for sessions"],
    highlighted: false,
  },
];

export function MembershipSection() {
  return (
    <section id="membership" className="scroll-mt-20 bg-neutral-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-lime-400">
            Membership
          </p>
          <h2 className="mt-3 text-center text-4xl font-bold text-white sm:text-5xl">
            Find the plan that fits you
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-lime-400 bg-lime-400/[0.06]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {plan.highlighted && (
                  <span className="mb-4 inline-block w-fit rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-neutral-950">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-neutral-400">{plan.tagline}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-neutral-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-lime-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-105 ${
                    plan.highlighted
                      ? "bg-lime-400 text-neutral-950"
                      : "border border-white/20 text-white"
                  }`}
                >
                  Contact Us for Membership Details
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
