import { vi } from "vitest";

// "server-only" throws when a bundler resolves it for a client build; under
// plain Node (how Vitest runs) nothing swaps in its no-op "browser" build,
// so it would throw here too unless neutralized.
vi.mock("server-only", () => ({}));
