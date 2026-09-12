import { gymInfo, navLinks } from "@data/gym-info";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-extrabold uppercase tracking-wide text-white">
            Goodlife<span className="text-lime-400">.</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-neutral-500">
            {gymInfo.location}
          </p>
          <a
            href={gymInfo.phoneHref}
            className="mt-1 block text-sm text-neutral-500 hover:text-lime-400"
          >
            {gymInfo.phone}
          </a>
        </div>

        <ul className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-neutral-500 hover:text-lime-400"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="mx-auto mt-10 max-w-7xl px-6 text-xs text-neutral-600">
        © {new Date().getFullYear()} {gymInfo.name}. All rights reserved.
      </p>
    </footer>
  );
}
