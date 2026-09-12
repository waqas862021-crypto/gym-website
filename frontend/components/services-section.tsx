import { services } from "@data/gym-info";
import { Reveal } from "./reveal";
import { ServiceIcon } from "./service-icon";

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-20 bg-neutral-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
            Services
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
            Everything you need to train, recover, and grow
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-white/[0.06]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400 transition-colors group-hover:bg-lime-400 group-hover:text-neutral-950">
                  <ServiceIcon icon={service.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {service.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
