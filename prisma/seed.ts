import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting XPO MICE Relational Database Seeding...");

  // 1. Clean existing records safely
  await prisma.aIReport.deleteMany();
  await prisma.eventPerk.deleteMany();
  await prisma.boothTenant.deleteMany();
  await prisma.agendaItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.ticketTier.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venueHall.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.region.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users (Roles: ATTENDEE, ORGANIZER, ADMIN)
  const organizerUser = await prisma.user.create({
    data: {
      email: "organizer@xpo.com",
      name: "PT Pamerindo MICE International",
      role: "ORGANIZER",
      organization: "Pamerindo Global Exhibitions",
      jobTitle: "Head of Operations & Exhibitions",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      interestsJson: JSON.stringify(["INDUSTRIAL_B2B", "TECH_DEV_SUMMIT", "MEGA_EXPO_PAVILION"]),
    },
  });

  const attendeeUser = await prisma.user.create({
    data: {
      email: "alex@xpo.com",
      name: "Alex Pratama",
      role: "ATTENDEE",
      organization: "Nusantara Tech Labs",
      jobTitle: "Senior Solutions Architect",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      interestsJson: JSON.stringify(["TECH_DEV_SUMMIT", "FINANCE_INVESTOR", "POP_CULTURE_GAMING"]),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@xpo.com",
      name: "Platform Governance Team",
      role: "ADMIN",
      organization: "XPO Governance Council",
      jobTitle: "Chief Governance Officer",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
  });

  console.log("✓ Users created: Organizer, Attendee, Admin");

  // 3. Seed Regions (id, jp, global)
  const regionId = await prisma.region.create({
    data: {
      id: "id",
      code: "ID",
      name: "Indonesia",
      currency: "IDR",
      description: "Center of Southeast Asian MICE trade, industrial conventions, and mega exhibitions.",
    },
  });

  const regionJp = await prisma.region.create({
    data: {
      id: "jp",
      code: "JP",
      name: "Japan",
      currency: "JPY",
      description: "Global epicenter for robotics, developer summits, anime expos, and clean technology.",
    },
  });

  const regionGlobal = await prisma.region.create({
    data: {
      id: "global",
      code: "GL",
      name: "Global Hubs",
      currency: "USD",
      description: "Flagship world-class convention centers across Singapore, Frankfurt, London, and Chicago.",
    },
  });

  console.log("✓ Regions created: Indonesia (/id), Japan (/jp), Global (/global)");

  // 4. Seed Indonesian Major Venues with Exact Halls & Transit
  // 4.1 JIExpo Kemayoran
  const venueJIExpo = await prisma.venue.create({
    data: {
      regionId: regionId.id,
      name: "JIExpo Kemayoran (Jakarta International Expo)",
      slug: "jiexpo-kemayoran",
      city: "Central Jakarta",
      address: "Gedung Pusat Niaga Lt. 1, Arena JIEXPO Kemayoran, RW.10, Pademangan Tim., Jakarta Pusat",
      latitude: -6.1466,
      longitude: 106.8454,
      transitInfo: "TransJakarta Corridor 2C (Monas - JIExpo) & 12M. KRL Stasiun Rajawali (7 mins walk) & Stasiun Kemayoran. Dedicated shuttle at Gate 2.",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
      halls: {
        create: [
          { name: "Hall A1-A3 (Heavy Machinery)", capacity: 12000, floorAreaSqm: 10500, description: "Reinforced flooring for industrial machinery and heavy automotive displays." },
          { name: "Hall B1-B3 (Consumer & Electronics)", capacity: 8500, floorAreaSqm: 8000, description: "Multi-level consumer trade show and electronics pavilion." },
          { name: "Hall C1-C3 (B2B Procurement)", capacity: 7000, floorAreaSqm: 6500, description: "Dedicated B2B sourcing booths and meeting cubicles." },
          { name: "Hall D1-D2 (Grand Exhibition Hall)", capacity: 15000, floorAreaSqm: 11000, description: "Column-free mega hall with 14m ceiling height." },
          { name: "Grand Ballroom", capacity: 3500, floorAreaSqm: 3000, description: "Luxury banquet and plenary keynote stage." },
          { name: "Open Space Arena", capacity: 45000, floorAreaSqm: 35000, description: "Massive open-air festival ground for Jakarta Fair & live music." },
        ],
      },
    },
  });

  // 4.2 ICE BSD City
  const venueICE = await prisma.venue.create({
    data: {
      regionId: regionId.id,
      name: "ICE BSD City (Indonesia Convention Exhibition)",
      slug: "ice-bsd-city",
      city: "Tangerang / BSD City",
      address: "Jl. BSD Grand Boulevard No.1, Pagedangan, Kec. Pagedangan, Kabupaten Tangerang, Banten",
      latitude: -6.3023,
      longitude: 106.6372,
      transitInfo: "BSD Link Free Shuttle from Intermoda BSD. KRL Commuter Line Stasiun Rawa Buntu & Cisauk. Toll Serbaraja Exit ICE BSD.",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
      halls: {
        create: [
          { name: "Hall 1 - 3 (Industrial & Tech)", capacity: 18000, floorAreaSqm: 15000, description: "Connected column-free halls for massive trade exhibitions." },
          { name: "Hall 5 - 7 (International Pavilions)", capacity: 18000, floorAreaSqm: 15000, description: "Global country booths and innovation showcases." },
          { name: "Hall 8 - 10 (Arena Stage)", capacity: 20000, floorAreaSqm: 15000, description: "Equipped for arena concerts and major esports tournaments." },
          { name: "Nusantara Hall 2", capacity: 4000, floorAreaSqm: 4000, description: "State-of-the-art acoustic convention hall for tech keynotes." },
          { name: "Convention Hall 1-3", capacity: 3000, floorAreaSqm: 3000, description: "Acoustic partitioned halls for medical symposia." },
        ],
      },
    },
  });

  // 4.3 JICC Senayan (Balai Sidang Jakarta)
  const venueJICC = await prisma.venue.create({
    data: {
      regionId: regionId.id,
      name: "JICC (Jakarta International Convention Center / Balai Sidang)",
      slug: "jcc-senayan",
      city: "Central Jakarta",
      address: "Jl. Gatot Subroto No.1, Gelora, Kecamatan Tanah Abang, Kota Jakarta Pusat",
      latitude: -6.2146,
      longitude: 106.8066,
      transitInfo: "MRT Jakarta Stasiun Istora Mandiri (5 mins walkway). TransJakarta Corridor 9 & 1 JCC Senayan.",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
      halls: {
        create: [
          { name: "Plenary Hall", capacity: 5000, floorAreaSqm: 4500, description: "Iconic auditorium for presidential keynotes and medical congresses." },
          { name: "Assembly Hall", capacity: 3000, floorAreaSqm: 3200, description: "Diplomatic delegations and formal gala assemblies." },
          { name: "Exhibition Hall A", capacity: 6000, floorAreaSqm: 5500, description: "Trade show floor connecting to Senayan hospitality suites." },
          { name: "Exhibition Hall B", capacity: 7000, floorAreaSqm: 6000, description: "Direct truck access for commercial expos." },
          { name: "Cendrawasih Room", capacity: 1800, floorAreaSqm: 2000, description: "Acoustic scientific paper presentation rooms." },
        ],
      },
    },
  });

  // 4.4 NICE PIK 2
  const venueNICE = await prisma.venue.create({
    data: {
      regionId: regionId.id,
      name: "NICE PIK 2 (Nusantara International Convention Exhibition)",
      slug: "nice-pik-2",
      city: "Tangerang / PIK 2",
      address: "Kawasan PIK 2 Waterfront City, Kosambi, Tangerang, Banten",
      latitude: -6.0792,
      longitude: 106.7265,
      transitInfo: "PIK 2 Express Shuttle from Pluit & Muara Karang. Direct Toll Interchange PIK 2.",
      imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200",
      halls: {
        create: [
          { name: "Exhibition Halls 1 - 8", capacity: 35000, floorAreaSqm: 30000, description: "Next-gen ultra-modern sustainable trade complex." },
          { name: "Grand Ballroom PIK 2", capacity: 5000, floorAreaSqm: 4500, description: "Luxury waterfront executive galas." },
          { name: "Atrium Central", capacity: 8000, floorAreaSqm: 6000, description: "Natural light architectural center atrium." },
        ],
      },
    },
  });

  // 4.5 GBK Sports Complex (Gelora Bung Karno)
  const venueGBK = await prisma.venue.create({
    data: {
      regionId: regionId.id,
      name: "GBK Sports Complex (Gelora Bung Karno)",
      slug: "gbk-sports-complex",
      city: "Central Jakarta",
      address: "Jl. Pintu Satu Senayan, Gelora, Kecamatan Tanah Abang, Kota Jakarta Pusat",
      latitude: -6.2186,
      longitude: 106.8026,
      transitInfo: "MRT Jakarta Stasiun Senayan & Istora Mandiri. TransJakarta Corridor 1 GBK. Gate 5 & Gate 10.",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
      halls: {
        create: [
          { name: "Istora Senayan", capacity: 10000, floorAreaSqm: 6000, description: "Historic arena for electrifying music concerts and esports finals." },
          { name: "Stadion Utama GBK", capacity: 78000, floorAreaSqm: 50000, description: "Mega stadium concerts and nation-scale gatherings." },
          { name: "Tennis Indoor Senayan", capacity: 4500, floorAreaSqm: 3500, description: "Intimate fan meetings and esports tournaments." },
          { name: "Parkir Timur GBK (Outdoor Expo)", capacity: 25000, floorAreaSqm: 20000, description: "Open-air automotive and culinary festival grounds." },
        ],
      },
    },
  });

  // 4.6 JIS (Jakarta International Stadium)
  const venueJIS = await prisma.venue.create({
    data: {
      regionId: regionId.id,
      name: "JIS (Jakarta International Stadium)",
      slug: "jis-jakarta",
      city: "North Jakarta",
      address: "Jl. Papanggo, RW.08, Papanggo, Tanjung Priok, Jakarta Utara",
      latitude: -6.1256,
      longitude: 106.8617,
      transitInfo: "TransJakarta Corridors 14 & 14A. KRL Commuter Line Stasiun Ancol / JIS. Concourse North and West Access.",
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200",
      halls: {
        create: [
          { name: "Main Arena Stadium (Retractable Roof)", capacity: 82000, floorAreaSqm: 55000, description: "Asia's premier retractable-roof stadium for world tours." },
          { name: "West VIP Lounge", capacity: 1500, floorAreaSqm: 2000, description: "Executive hospitality suites and private brand lounges." },
          { name: "Concourse Level 3", capacity: 15000, floorAreaSqm: 12000, description: "Panoramic fan zones and brand activation booths." },
        ],
      },
    },
  });

  // 5. Seed Japan & Global Venues
  // 5.1 Tokyo Big Sight
  const venueTokyo = await prisma.venue.create({
    data: {
      regionId: regionJp.id,
      name: "Tokyo Big Sight (Tokyo International Exhibition Center)",
      slug: "tokyo-big-sight",
      city: "Tokyo (Koto Ward)",
      address: "3-11-1 Ariake, Koto City, Tokyo 135-0063, Japan",
      latitude: 35.6298,
      longitude: 139.7942,
      transitInfo: "Yurikamome Line (Tokyo Big Sight Station, 3 mins). Rinkai Line (Kokusai-Tenjijo Station, 7 mins). Water Bus Ariake Terminal.",
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200",
      halls: {
        create: [
          { name: "East Exhibition Halls 1-8", capacity: 40000, floorAreaSqm: 38000, description: "Japan's largest exhibition hall complex." },
          { name: "West Exhibition Halls 1-4", capacity: 25000, floorAreaSqm: 22000, description: "Atrium-connected multi-tier tech halls." },
          { name: "South Exhibition Halls 1-4", capacity: 22000, floorAreaSqm: 20000, description: "Ultra-modern robotics and AI conference facilities." },
          { name: "Conference Tower (Inverted Pyramid)", capacity: 5000, floorAreaSqm: 6000, description: "International symposiums and executive committee rooms." },
        ],
      },
    },
  });

  // 5.2 Marina Bay Sands Expo (Singapore / Global)
  const venueMBS = await prisma.venue.create({
    data: {
      regionId: regionGlobal.id,
      name: "Marina Bay Sands Expo & Convention Centre",
      slug: "marina-bay-sands-expo",
      city: "Singapore",
      address: "10 Bayfront Ave, Singapore 018956",
      latitude: 1.2838,
      longitude: 103.8591,
      transitInfo: "MRT Bayfront Station (Circle & Downtown Lines direct basement exit).",
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200",
      halls: {
        create: [
          { name: "Sands Expo Halls A-F (Basement 2)", capacity: 20000, floorAreaSqm: 30000, description: "Integrated flexible trade hall." },
          { name: "Grand Ballroom Level 5 (Sands Grand)", capacity: 8000, floorAreaSqm: 8000, description: "Southeast Asia's largest ballroom." },
        ],
      },
    },
  });

  console.log("✓ Venues and exact halls created across Indonesia, Japan, and Global hubs");

  // 6. Seed Events Spanning All 9 Domain Archetypes
  // 6.1 Archetype 1: INDUSTRIAL_B2B
  const jiexpoHalls = await prisma.venueHall.findMany({ where: { venueId: venueJIExpo.id } });
  const hallA1 = jiexpoHalls.find((h) => h.name.includes("Hall A1")) || jiexpoHalls[0];

  const event1 = await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueJIExpo.id,
      venueHallId: hallA1.id,
      title: "Manufacturing Indonesia & Industrial Automation Expo 2026",
      slug: "manufacturing-indonesia-2026",
      tagline: "The 36th International Manufacturing, Machinery, Equipment & Materials Exhibition",
      description: "Southeast Asia's most prominent industrial gathering. Experience live demonstrations of CNC robotics, metallurgy, smart factory automation, and heavy machine tools with over 1,500 global exhibitors.",
      archetype: "INDUSTRIAL_B2B",
      startDate: new Date("2026-09-14T09:00:00Z"),
      endDate: new Date("2026-09-17T18:00:00Z"),
      isFeatured: true,
      scale: "LARGE",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200",
      brandingConfigJson: JSON.stringify({
        primaryColor: "#0284c7",
        accentColor: "#0369a1",
        heroBadge: "36th Edition • Verified B2B",
      }),
      ticketTiers: {
        create: [
          { name: "Trade Visitor Pass", price: 0, currency: "IDR", capacity: 15000, benefitsJson: JSON.stringify(["Full 4-day Exhibition Floor Access", "Digital Exhibitor Directory", "Standard B2B Matchmaking App"]) },
          { name: "VIP Procurement Buyer Pass", price: 450000, currency: "IDR", capacity: 1200, benefitsJson: JSON.stringify(["VIP Buyer Lounge with Barista", "Fast-track Gate 2 Priority Lane", "Machine Spec Sheet Pre-downloads", "Exclusive 1-on-1 Deal Room Booking"]) },
          { name: "Exhibitor Delegate Pass", price: 1200000, currency: "IDR", capacity: 3000, benefitsJson: JSON.stringify(["Booth Staff Credential", "Freight Loading Access", "Lead Retrieval Barcode Scanner App", "Gala Dinner Invitation"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Keynote: Smart Robotics & Industry 4.0 in Southeast Asia", speakerName: "Ir. Hendra Kusuma", speakerRole: "Chairman, Indonesian Automation Council", location: "Stage A - Hall A1", startTime: new Date("2026-09-14T10:00:00Z"), endTime: new Date("2026-09-14T11:30:00Z"), track: "Automation Keynote" },
          { title: "Precision Metallurgy & CNC High-Speed Milling Masterclass", speakerName: "Kenji Takahashi", speakerRole: "Chief Engineer, DMG Mori Japan", location: "Demo Zone - Hall A2", startTime: new Date("2026-09-14T14:00:00Z"), endTime: new Date("2026-09-14T15:30:00Z"), track: "Machinery Demo" },
          { title: "B2B Supply Chain Sourcing Matchmaking Session", speakerName: "Procurement Committee", speakerRole: "B2B Council", location: "B2B Deal Room - Hall C1", startTime: new Date("2026-09-15T11:00:00Z"), endTime: new Date("2026-09-15T13:00:00Z"), track: "Procurement" },
        ],
      },
      booths: {
        create: [
          { companyName: "DMG MORI Precision Tools", boothNumber: "Hall A1 - Booth 102", hallName: "Hall A1", industry: "CNC Machining", websiteUrl: "https://dmgmori.com" },
          { companyName: "Siemens Smart Factory Solutions", boothNumber: "Hall A1 - Booth 204", hallName: "Hall A1", industry: "Automation & Digital Twins", websiteUrl: "https://siemens.com" },
          { companyName: "Fanuc Robotics Indonesia", boothNumber: "Hall A2 - Booth 310", hallName: "Hall A2", industry: "Industrial Robotics", websiteUrl: "https://fanuc.co.jp" },
          { companyName: "Krakatau Steel Metallurgy", boothNumber: "Hall A3 - Booth 415", hallName: "Hall A3", industry: "Raw Metallurgy & Steel", websiteUrl: "https://krakatausteel.com" },
        ],
      },
      perks: {
        create: [
          { title: "VIP Buyer Lounge & Free Barista Coffee", description: "Complimentary single-origin espresso and quiet conference tables in Hall A2 Mezzanine.", tierRequired: "VIP", iconName: "Coffee" },
          { title: "Fast-Track Gate 2 Security Clearance", description: "Skip the main queue with digital biometric NFC badge entry.", tierRequired: "VIP", iconName: "Zap" },
          { title: "Offline Interactive Machinery Guidebook", description: "Download full machine technical datasheets directly to your phone pass.", iconName: "FileText" },
        ],
      },
    },
  });

  // 6.2 Archetype 2: TECH_DEV_SUMMIT
  const iceHalls = await prisma.venueHall.findMany({ where: { venueId: venueICE.id } });
  const nusantaraHall = iceHalls.find((h) => h.name.includes("Nusantara")) || iceHalls[0];

  const event2 = await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueICE.id,
      venueHallId: nusantaraHall.id,
      title: "Asia AI & Cloud Developer Summit 2026",
      slug: "asia-ai-summit-2026",
      tagline: "Building Autonomous Multi-Agent Systems, LLMs & Next-Gen Cloud Infrastructure",
      description: "Asia's premier technical gathering for software engineers, AI researchers, and cloud architects. Featuring deep-dive keynotes, live code teardowns, multi-model LLM workshops, and an overnight 24-hour hackathon.",
      archetype: "TECH_DEV_SUMMIT",
      startDate: new Date("2026-10-08T08:30:00Z"),
      endDate: new Date("2026-10-10T20:00:00Z"),
      isFeatured: true,
      scale: "LARGE",
      format: "HYBRID",
      heroImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
      brandingConfigJson: JSON.stringify({
        primaryColor: "#6366f1",
        accentColor: "#a855f7",
        heroBadge: "Developer Keynote • Hackathon",
      }),
      ticketTiers: {
        create: [
          { name: "Builder Pass", price: 250000, currency: "IDR", capacity: 4000, benefitsJson: JSON.stringify(["Access to all 4 Keynote Tracks", "Hackathon Entry Eligibility", "Official Dev Swag Bag & T-Shirt", "Cloud Sandbox Credits ($100)"]) },
          { name: "VIP Full Access & Speaker Dinner", price: 1250000, currency: "IDR", capacity: 500, benefitsJson: JSON.stringify(["VIP Speaker Lounge Access", "Reserved Front-Row Keynote Seating", "Speaker Gala Dinner at BSD Club", "1-on-1 VC Pitch Sessions"]) },
          { name: "Virtual Livestream Pass", price: 0, currency: "IDR", capacity: 20000, benefitsJson: JSON.stringify(["HD Livestream Access", "Discord Private Developer Channel", "Slide Deck Downloads"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Opening Keynote: The Frontier of Multi-Model Agent Orchestration", speakerName: "Dr. Maya Sastro", speakerRole: "VP of Artificial Intelligence, DeepMind Asia", location: "Nusantara Hall 2", startTime: new Date("2026-10-08T09:00:00Z"), endTime: new Date("2026-10-08T10:30:00Z"), track: "AI Keynote" },
          { title: "Deploying Edge LLMs on WebAssembly & React 19 Server Components", speakerName: "Tatsuya Mori", speakerRole: "Lead Runtime Engineer, Vercel", location: "Track 2 - Hall 1", startTime: new Date("2026-10-08T11:00:00Z"), endTime: new Date("2026-10-08T12:30:00Z"), track: "Web & Architecture" },
          { title: "24-Hour Autonomous Agent Hackathon Kickoff", speakerName: "Hackathon Council", speakerRole: "DevRel Lead", location: "Hacker Arena - Hall 3", startTime: new Date("2026-10-09T10:00:00Z"), endTime: new Date("2026-10-10T10:00:00Z"), track: "Hackathon" },
        ],
      },
      booths: {
        create: [
          { companyName: "Google Cloud & Antigravity Labs", boothNumber: "Tech Pavilion A1", hallName: "Hall 1", industry: "Cloud AI Infrastructure", websiteUrl: "https://cloud.google.com" },
          { companyName: "OpenRouter Multi-Model Gateway", boothNumber: "Tech Pavilion A2", hallName: "Hall 1", industry: "LLM Infrastructure & API", websiteUrl: "https://openrouter.ai" },
          { companyName: "Supabase & Postgres Ecosystem", boothNumber: "Tech Pavilion B4", hallName: "Hall 2", industry: "Database & Open Source", websiteUrl: "https://supabase.com" },
        ],
      },
      perks: {
        create: [
          { title: "VIP Speaker Lounge & High-Speed Fiber WiFi", description: "Dedicated quiet zone with 10Gbps dedicated fiber internet.", tierRequired: "VIP", iconName: "Wifi" },
          { title: "Exclusive Developer Swag Kit", description: "Includes mechanical keyboard keycaps, hoodie, and NFC developer pass badge.", iconName: "Gift" },
        ],
      },
    },
  });

  // 6.3 Archetype 7: MEGA_EXPO_PAVILION (Jakarta Fair Kemayoran)
  const event3 = await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueJIExpo.id,
      title: "Pekan Raya Jakarta (Jakarta Fair Kemayoran 2026)",
      slug: "pekan-raya-jakarta-2026",
      tagline: "The Largest & Longest-Running Consumer Mega Fair in Southeast Asia",
      description: "Celebrate Jakarta's anniversary with 33 consecutive days of mega consumer expositions, 500+ culinary tenants, massive automotive launches, nightly open-air music concerts, and grand midnight fireworks.",
      archetype: "MEGA_EXPO_PAVILION",
      startDate: new Date("2026-06-10T10:00:00Z"),
      endDate: new Date("2026-07-12T23:00:00Z"),
      isFeatured: true,
      scale: "GLOBAL_MEGA",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
      brandingConfigJson: JSON.stringify({
        primaryColor: "#dc2626",
        accentColor: "#f59e0b",
        heroBadge: "33-Day Mega Expo • Nightly Concerts",
      }),
      ticketTiers: {
        create: [
          { name: "General Fair Entry (Non-Concert)", price: 40000, currency: "IDR", capacity: 100000, benefitsJson: JSON.stringify(["Full Access to Halls A, B, C, D & Open Space", "Access to Culinary Pasar Malam Festival", "Nightly Fireworks Display Viewer"]) },
          { name: "Fair Entry + Main Concert Pass", price: 100000, currency: "IDR", capacity: 25000, benefitsJson: JSON.stringify(["Full Fair Access", "Open Space Concert Arena Entry", "Access to F&B Beverage Stalls inside Arena"]) },
          { name: "Season VIP Mega Pass (33 Days)", price: 650000, currency: "IDR", capacity: 2500, benefitsJson: JSON.stringify(["Unlimited 33-Day Entry", "VIP Fast Track Gate 1 & 7", "VIP Concert Front Section Access", "Special Tenant Coupon Voucher Pack (Rp 500,000)"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Grand Opening Ceremony & Pyro-Musical Fireworks Show", speakerName: "Governor of Jakarta & Organizing Committee", location: "Open Space Stage", startTime: new Date("2026-06-10T19:00:00Z"), endTime: new Date("2026-06-10T21:00:00Z"), track: "Ceremony" },
          { title: "Midnight Carnival & Lantern Parade", speakerName: "Carnival Performers", location: "Central Avenue Promenade", startTime: new Date("2026-06-20T21:00:00Z"), endTime: new Date("2026-06-20T22:30:00Z"), track: "Carnival" },
        ],
      },
      booths: {
        create: [
          { companyName: "Astra Honda Motor Mega Pavilion", boothNumber: "Hall A1 - Mega 01", hallName: "Hall A1", industry: "Automotive & Motorcycles", websiteUrl: "https://astra-honda.com" },
          { companyName: "Indofood Culinary Nusantara", boothNumber: "Open Space Food Zone 1", hallName: "Open Space", industry: "F&B & Gastronomy", websiteUrl: "https://indofood.com" },
          { companyName: "Electronic City Flash Sale Hub", boothNumber: "Hall D1 - Booth 10", hallName: "Hall D1", industry: "Consumer Electronics", websiteUrl: "https://electronic-city.com" },
        ],
      },
      perks: {
        create: [
          { title: "Grand Tenant Discount & Promo Radar", description: "Exclusive digital coupon book with discounts up to 70% across 500+ merchants.", iconName: "Tag" },
          { title: "Real-Time Parking & Gate Density Heatmap", description: "Check real-time parking lot availability at Gates 1, 2, 6, and 9.", iconName: "MapPin" },
        ],
      },
    },
  });

  // 6.4 Seed Booking for Attendee
  const tiersEvent1 = await prisma.ticketTier.findMany({ where: { eventId: event1.id } });
  const vipTierEvent1 = tiersEvent1.find((t) => t.name.includes("VIP")) || tiersEvent1[0];

  const booking1 = await prisma.booking.create({
    data: {
      userId: attendeeUser.id,
      eventId: event1.id,
      ticketTierId: vipTierEvent1.id,
      status: "CONFIRMED",
      qrCodeHash: "XPO-PASS-2026-MFG-VIP-994827103-AUTH-SECURE-HASH",
      attendeeName: attendeeUser.name,
      attendeeEmail: attendeeUser.email,
    },
  });

  // 6.5 Seed AI Report for Event 1
  await prisma.aIReport.create({
    data: {
      eventId: event1.id,
      authorId: organizerUser.id,
      modelUsed: "google/gemini-3.7-flash",
      reportType: "DAILY_DIGEST",
      contentJson: JSON.stringify({
        summary: "Manufacturing Indonesia 2026 registration velocity increased by 42% week-over-week. Heavy interest concentrated in Smart Robotics (Hall A1) and CNC Tooling.",
        totalRegistrations: 16200,
        revenueEstimateIdr: 540000000,
        topInterests: ["Industrial Automation", "Robotics", "Hydraulic Machinery"],
        recommendations: [
          "Expand crowd barriers around Fanuc Robotics live demo cage in Hall A2.",
          "Add 2 additional registration scanners at Gate 3 between 08:30 and 10:00.",
        ],
      }),
    },
  });

  console.log("✓ Seeded realistic events across archetypes: Industrial B2B, Tech Summit, Mega Fair");
  console.log("✓ Seeded sample Attendee booking with SVG QR Hash and Organizer AI Report");
  console.log("🎉 Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
