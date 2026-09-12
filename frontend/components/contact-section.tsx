import { Mail, MessageCircle, Phone } from "lucide-react";
import { gymInfo } from "@data/gym-info";
import { Reveal } from "./reveal";
import { ContactForm } from "./contact-form";

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 bg-neutral-900 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2">
        <Reveal>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
              Contact
            </p>
            <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
              Let&apos;s get you started
            </h2>
            <p className="mt-4 text-neutral-400">
              Have a question about membership, training, or our facilities?
              Reach out and we&apos;ll get back to you.
            </p>

            <ul className="mt-8 space-y-4">
              <li>
                <a
                  href={gymInfo.phoneHref}
                  className="flex items-center gap-3 text-neutral-200 transition-colors hover:text-lime-400"
                >
                  <Phone className="h-5 w-5 text-lime-400" /> {gymInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-neutral-500">
                <Mail className="h-5 w-5" /> Email coming soon
              </li>
              <li className="flex items-center gap-3 text-neutral-500">
                <MessageCircle className="h-5 w-5" /> WhatsApp coming soon
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
