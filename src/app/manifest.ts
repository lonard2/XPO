import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XPO - MICE Digital Ecosystem",
    short_name: "XPO",
    description:
      "Multi-sided digital ecosystem for MICE events, venue mapping, cryptographic digital passes, and multi-model AI intelligence across Indonesia, Japan, and global hubs.",
    start_url: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0f1d",
    theme_color: "#2563eb",
    categories: ["business", "events", "productivity", "travel"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Explore MICE Events",
        short_name: "Events",
        description: "Discover upcoming international conventions, trade expos, and summits.",
        url: "/events",
      },
      {
        name: "My Digital Passes",
        short_name: "Passes",
        description: "Access your HMAC-signed cryptographic entry QR tickets and guidebook.",
        url: "/my-tickets",
      },
      {
        name: "Organizer Portal",
        short_name: "Organizer",
        description: "Manage MICE events, booth allocations, and real-time customizer.",
        url: "/dashboard",
      },
      {
        name: "Global Venue Directory",
        short_name: "Venues",
        description: "Browse exhibition complexes, halls, transit guides, and GPS maps.",
        url: "/venues",
      },
    ],
  };
}
