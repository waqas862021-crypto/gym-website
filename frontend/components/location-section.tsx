import { MapPin, Navigation, Phone } from "lucide-react";
import { gymInfo } from "@data/gym-info";
import { Reveal } from "./reveal";

// Only the city-level location is known — link to a Maps search by name
// rather than fabricating a precise address/embed.
const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${gymInfo.name} ${gymInfo.location}`,
)}`;

export function LocationSection() {
  return (
    <section className="bg-neutral-950 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2 md:items-center">
        <Reveal>
          <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(163,230,53,0.08),transparent)] text-neutral-500 md:h-96">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-10 w-10 text-lime-400" />
              <span className="text-sm">Map coming soon</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
              Location
            </p>
            <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
              {gymInfo.name}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-neutral-300">
              <MapPin className="h-5 w-5 text-lime-400" /> {gymInfo.location}
            </p>
            <p className="mt-2 flex items-center gap-2 text-neutral-300">
              <Phone className="h-5 w-5 text-lime-400" /> {gymInfo.phone}
            </p>

            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-semibold text-neutral-950 transition-transform hover:scale-105"
            >
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
