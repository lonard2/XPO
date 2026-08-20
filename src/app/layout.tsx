import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XPO | MICE Digital Ecosystem",
  description: "Global MICE platform for Meetings, Incentives, Conferences, and Exhibitions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
