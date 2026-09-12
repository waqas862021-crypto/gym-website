// Verified facts about Goodlife Fitness Gym only. Do not add anything here
// that hasn't actually been confirmed (pricing, hours, staff names, etc.) —
// this file is read by the public website and, later, the AI agent's
// knowledge base. Descriptive/marketing copy (short blurbs) is fine;
// invented *facts* are not.

export const gymInfo = {
  name: "Goodlife Fitness Gym",
  location: "Dhahran, Saudi Arabia",
  // From the gym's Google Business Profile.
  address: {
    streetAddress: "Abdullah Ibn Al Abbas St, Al Dawhah Al Janubiyah",
    addressLocality: "Dhahran",
    postalCode: "34451",
    addressCountry: "SA",
  },
  rating: 4.1,
  reviewCount: 45,
  phone: "013 891 2413",
  phoneHref: "tel:0138912413",
} as const;

export type Service = {
  slug: string;
  name: string;
  icon: "dumbbell" | "bike" | "flower" | "salad" | "waves" | "target" | "users";
  description: string;
};

export const services: Service[] = [
  {
    slug: "personal-training",
    name: "Personal Training",
    icon: "dumbbell",
    description:
      "One-on-one coaching built around your goals, from strength to fat loss to general fitness.",
  },
  {
    slug: "cycling",
    name: "Cycling",
    icon: "bike",
    description:
      "High-energy indoor cycling sessions that build endurance and torch calories.",
  },
  {
    slug: "aerobics",
    name: "Aerobics",
    icon: "flower",
    description:
      "Upbeat group classes combining cardio and movement for a full-body workout.",
  },
  {
    slug: "nutrition-consulting",
    name: "Nutrition Consulting",
    icon: "salad",
    description:
      "Practical nutrition guidance to support your training and everyday health.",
  },
  {
    slug: "swimming",
    name: "Swimming",
    icon: "waves",
    description:
      "Low-impact, full-body swim sessions for fitness, recovery, and technique.",
  },
  {
    slug: "private-lessons",
    name: "Private Lessons",
    icon: "target",
    description:
      "Focused, individual instruction across our activities for faster progress.",
  },
  {
    slug: "youth-fitness",
    name: "Youth Fitness Activities",
    icon: "users",
    description:
      "Fun, structured fitness activities designed for younger members.",
  },
];

export type Facility = {
  slug: string;
  name: string;
  description: string;
  photo?: string;
};

export const facilities: Facility[] = [
  {
    slug: "swimming-pool",
    name: "Swimming Pool",
    description: "A dedicated pool for laps, swim training, and recovery.",
    photo: "/facilities/swimming-pool.jpg",
  },
  {
    slug: "sauna",
    name: "Sauna",
    description: "Unwind and recover in our sauna after your session.",
  },
  {
    slug: "tennis-court",
    name: "Tennis Court",
    description: "An on-site court for casual play or focused practice.",
  },
];

export const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#facilities", label: "Facilities" },
  { href: "#training", label: "Training" },
  { href: "#membership", label: "Membership" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
] as const;

export const galleryCategories = [
  "Gym Equipment",
  "Training",
  "Swimming",
  "Facilities",
  "Fitness Lifestyle",
] as const;
