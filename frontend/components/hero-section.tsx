import Image from "next/image";
import { Star } from "lucide-react";
import { gymInfo } from "@data/gym-info";
import { Reveal } from "./reveal";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-neutral-950"
    >
      {/* Real gym photo, if present at public/hero.jpg — the gradients below
          render on top regardless, so this degrades gracefully if missing. */}
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(163,230,53,0.12),transparent_40%),linear-gradient(180deg,rgba(10,10,10,0.55),rgba(10,10,10,0.75))]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,0,0,0.7)_100%)]"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-6 pt-28 md:pt-0">
        <Reveal>
          <div className="flex items-center gap-2 text-sm font-medium text-lime-400">
            <Star className="h-4 w-4 fill-lime-400" />
            {gymInfo.rating} rating · {gymInfo.reviewCount} reviews ·{" "}
            {gymInfo.location}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="max-w-3xl text-5xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Transform your body.{" "}
            <span className="text-lime-400">Elevate</span> your life.
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="max-w-xl text-lg text-neutral-300">
            {gymInfo.name} is Dhahran&apos;s premium fitness destination —
            world-class training, facilities, and coaching, built for real
            transformation.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex flex-col gap-4 pb-16 sm:flex-row">
            <a
              href="#facilities"
              className="rounded-full border border-white/20 px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:border-white/50"
            >
              Explore Our Facilities
            </a>
            <a
              href="#membership"
              className="rounded-full bg-lime-400 px-7 py-3.5 text-center text-sm font-semibold text-neutral-950 transition-transform hover:scale-105"
            >
              Join Goodlife
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
