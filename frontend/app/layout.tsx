import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goodlife Fitness Gym | Dhahran",
  description:
    "Goodlife Fitness Gym in Dhahran, Saudi Arabia — personal training, cycling, aerobics, swimming, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
