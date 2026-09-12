import { Star } from "lucide-react";
import { gymInfo } from "@data/gym-info";
import { Reveal } from "./reveal";

export function ReviewsSection() {
  return (
    <section className="bg-neutral-900 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
            Customer Reviews
          </p>
          <div className="mt-6 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 ${
                  star <= Math.round(gymInfo.rating)
                    ? "fill-lime-400 text-lime-400"
                    : "text-neutral-700"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-4xl font-black text-white">
            {gymInfo.rating}{" "}
            <span className="text-lg font-medium text-neutral-400">/ 5</span>
          </p>
          <p className="mt-2 text-neutral-400">
            Based on {gymInfo.reviewCount} reviews
          </p>
          <p className="mt-8 text-sm text-neutral-500">
            Individual member reviews will appear here once connected.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
