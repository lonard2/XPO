import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting XPO MICE Relational Database Seeding...");

  // 1. Clean existing tables in reverse dependency order
  await prisma.aIReport.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.eventPerk.deleteMany();
  await prisma.boothTenant.deleteMany();
  await prisma.agendaItem.deleteMany();
  await prisma.ticketTier.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venueHall.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.region.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Core Users (RBAC: ORGANIZER, ATTENDEE, ADMIN)
  const organizerUser = await prisma.user.create({
    data: {
      email: "organizer@xpo.com",
      name: "Sari Dewi",
      role: "ORGANIZER",
      organization: "Dyandra Promosindo & Global Expo Group",
    },
  });

  const attendeeUser = await prisma.user.create({
    data: {
      email: "alex@xpo.com",
      name: "Alex Pratama",
      role: "ATTENDEE",
      organization: "Nusantara Industrial Automation",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@xpo.com",
      name: "Admin Governance Council",
      role: "ADMIN",
      organization: "XPO MICE Secretariat",
    },
  });

  console.log("✓ Users created: Organizer, Attendee (alex@xpo.com), Admin");

  // 3. Seed Regional Country Editions
  const regionId = await prisma.region.create({
    data: {
      id: "id",
      code: "ID",
      name: "Indonesia",
      currency: "IDR",
      description: "Indonesia premier MICE ecosystem spanning Jakarta, Tangerang, and Bali convention corridors.",
    },
  });

  const regionJp = await prisma.region.create({
    data: {
      id: "jp",
      code: "JP",
      name: "Japan",
      currency: "JPY",
      description: "Japan flagship robotics, precision manufacturing, gaming, and tech convention epicenters.",
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

  // 4. Seed Indonesian Major Venues (6 Venues)
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
          { name: "Hall A", capacity: null, floorAreaSqm: 8295, description: "East wing exhibition hall, 144 x 57.6 m concrete slab." },
          { name: "Hall B", capacity: null, floorAreaSqm: 3994, description: "West wing exhibition hall, 78 x 51.2 m concrete slab." },
          { name: "Hall C", capacity: null, floorAreaSqm: 3888, description: "West wing exhibition hall, 72 x 54 m tiled floor." },
          { name: "Hall B3", capacity: null, floorAreaSqm: 5150, description: "West wing exhibition hall, 91 x 56.7 m concrete slab." },
          { name: "Hall C3", capacity: null, floorAreaSqm: 4800, description: "West wing exhibition hall, 76 x 62.6 m concrete slab." },
          { name: "Hall D1", capacity: null, floorAreaSqm: 4752, description: "East wing exhibition hall, 72 x 66 m tiled floor." },
          { name: "Hall D2", capacity: null, floorAreaSqm: 4608, description: "East wing exhibition hall, 64 x 72 m heavy-duty carpet tiles." },
          { name: "Gambir Expo", capacity: null, floorAreaSqm: 22610, description: "Six-area expo building totalling 22,610 sqm of ceramic-floor halls." },
          { name: "Open Space", capacity: null, floorAreaSqm: 40000, description: "Open-air festival ground in two zones for Jakarta Fair and live music." },
          { name: "Grand Ballroom", capacity: null, floorAreaSqm: null, description: "Convention centre ballroom for banquets and plenary keynotes." },
          { name: "Junior Ballroom", capacity: null, floorAreaSqm: null, description: "Convention centre junior ballroom for mid-size banquets." },
          { name: "JIExpo Theatre", capacity: 2500, floorAreaSqm: null, description: "2,500-seat international theatre and concert hall." },
          { kind: "MEETING_ROOM", name: "Meeting Room 501", capacity: 80, floorAreaSqm: 120, description: "Convention Centre Level 5 breakout, 13 x 9 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 502", capacity: 96, floorAreaSqm: 110, description: "Convention Centre Level 5 breakout, 12 x 9 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 503", capacity: 154, floorAreaSqm: 120, description: "Convention Centre Level 5 breakout, 16 x 8 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 504", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 5 breakout, 16 x 10 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 505", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 5 breakout, mirror of 504." },
          { kind: "MEETING_ROOM", name: "Meeting Room 506", capacity: 110, floorAreaSqm: 130, description: "Convention Centre Level 5 breakout, 16 x 8 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 507", capacity: 200, floorAreaSqm: 210, description: "Largest Level 5 breakout, 19 x 10 m." },
          { kind: "MEETING_ROOM", name: "Meeting Rooms 503-506 Combined", capacity: 690, floorAreaSqm: 570, description: "Combinable partition block on Level 5." },
          { kind: "MEETING_ROOM", name: "Meeting Room 601", capacity: 80, floorAreaSqm: 120, description: "Convention Centre Level 6 breakout, 13 x 9 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 602", capacity: 96, floorAreaSqm: 90, description: "Smallest Level 6 breakout, 12 x 7 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 603", capacity: 154, floorAreaSqm: 120, description: "Convention Centre Level 6 breakout, 16 x 8 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 604", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 6 breakout, 16 x 10 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 605", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 6 breakout, mirror of 604." },
          { kind: "MEETING_ROOM", name: "Meeting Room 606", capacity: 198, floorAreaSqm: 130, description: "Convention Centre Level 6 breakout, 16 x 8 m." },
          { kind: "MEETING_ROOM", name: "Meeting Room 607", capacity: 200, floorAreaSqm: 210, description: "Largest Level 6 breakout, 19 x 10 m." },
          { kind: "MEETING_ROOM", name: "Meeting Rooms 603-606 Combined", capacity: 748, floorAreaSqm: 570, description: "Combinable partition block on Level 6." },
          { kind: "MEETING_ROOM", name: "Semeru 1", capacity: 500, floorAreaSqm: 455, description: "Trade Mart ballroom half, 5.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Semeru 2", capacity: 500, floorAreaSqm: 455, description: "Trade Mart ballroom half, 5.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Lawu 1", capacity: 300, floorAreaSqm: 324, description: "Trade Mart ballroom half, 4.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Lawu 2", capacity: 300, floorAreaSqm: 324, description: "Trade Mart ballroom half, 4.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Bromo 1", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Bromo 2", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Bromo 3", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Bromo 4", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Kerinci 1", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Kerinci 2", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Kerinci 3", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Kerinci 4", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Rinjani 1", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting third, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Rinjani 2", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting third, 3.5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Rinjani 3", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting third, 3.5 m ceiling." },
          { name: "New Hall (Levels 1A and 1B)", capacity: null, floorAreaSqm: 20000, description: "New hall under construction, about 20,000 sqm, already selling late-2026 events." },
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
          { ceilingHeightM: 12, name: "Exhibition Hall 1", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 2", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 3", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 4", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 5", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 6", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 7", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 8", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 9", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { ceilingHeightM: 12, name: "Exhibition Hall 10", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Nusantara Hall", capacity: 3500, floorAreaSqm: 4000, description: "Divisible convention hall (1A, 1B, 2, 3) for plenaries, weddings and graduations." },
          { kind: "MEETING_ROOM", name: "Garuda 1", capacity: 48, floorAreaSqm: 120, description: "First-floor breakout, 12 x 10 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 2", capacity: 72, floorAreaSqm: 126, description: "First-floor breakout, 14 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 3", capacity: 72, floorAreaSqm: 126, description: "First-floor breakout, 14 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 5A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 5B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 6A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 6B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 7A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 7B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 8A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 8B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 9A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 9B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda 10", capacity: 120, floorAreaSqm: 180, description: "First-floor breakout, 18 x 10 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda Main Hall 1A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda Main Hall 1B", capacity: 168, floorAreaSqm: 306, description: "First-floor breakout, 18 x 17 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda Main Hall 2A", capacity: 168, floorAreaSqm: 306, description: "First-floor breakout, 18 x 17 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda Main Hall 2B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda Main Hall 1", capacity: 276, floorAreaSqm: 459, description: "First-floor main hall, 27 x 17 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Garuda Main Hall 2", capacity: 276, floorAreaSqm: 459, description: "First-floor main hall, 27 x 17 m, 5 m ceiling." },
          { kind: "MEETING_ROOM", name: "Cendana 1", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { kind: "MEETING_ROOM", name: "Cendana 2", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { kind: "MEETING_ROOM", name: "Cendana 3", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { kind: "MEETING_ROOM", name: "Cendana 5", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { kind: "MEETING_ROOM", name: "Cendana 6", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { kind: "MEETING_ROOM", name: "Cendana 7", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { kind: "MEETING_ROOM", name: "Kalimaya 1", capacity: 60, floorAreaSqm: 104, description: "Lower-ground breakout, 13 x 8 m, 4 m ceiling." },
          { kind: "MEETING_ROOM", name: "Kalimaya 2", capacity: 60, floorAreaSqm: 104, description: "Lower-ground breakout, 13 x 8 m, 4 m ceiling." },
          { kind: "MEETING_ROOM", name: "Kalimaya 3", capacity: 60, floorAreaSqm: 104, description: "Lower-ground breakout, 13 x 8 m, 4 m ceiling." },
          { name: "Outdoor Exhibition Space", capacity: null, floorAreaSqm: 35000, description: "Outdoor grounds for concerts, automotive showcases and sports." },
        ],
      },
    },
  });

  // 4.3 JICC (Jakarta International Convention Center)
  const venueJCC = await prisma.venue.create({
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
          { ceilingHeightM: 11.3, name: "Plenary Hall", capacity: 5000, floorAreaSqm: null, description: "Domed theatre for presidential keynotes and medical congresses." },
          { ceilingHeightM: 8.8, name: "Assembly Hall", capacity: 3900, floorAreaSqm: 3921, description: "Partitionable banquet hall, 89.1 x 44 m, seats up to 3,900." },
          { ceilingHeightM: 8, name: "Cendrawasih Room", capacity: 2000, floorAreaSqm: 2109, description: "Partitionable conference hall with interpretation booths." },
          { ceilingHeightM: 9, floorLoadKnM2: 12, name: "Exhibition Hall A", capacity: null, floorAreaSqm: 3060, description: "Exhibition-only floor, 68 x 45 m, 1,200 kg per sqm loading." },
          { ceilingHeightM: 9, floorLoadKnM2: 15, name: "Exhibition Hall B", capacity: null, floorAreaSqm: 6075, description: "Exhibition-only floor, 97.5 x 60 m, 1,500 kg per sqm loading." },
          { name: "Main Lobby", capacity: null, floorAreaSqm: 5500, description: "Registration, exhibition and pre-function lobby." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Merak Room", capacity: 850, floorAreaSqm: 886, description: "Divisible into Merak 1, 2 and 3 for board and breakout sessions." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Kasuari Lounge", capacity: 700, floorAreaSqm: 755, description: "Lower-lobby lounge for receptions and VIP holding." },
          { ceilingHeightM: 3.5, name: "Lower Lobby", capacity: 1000, floorAreaSqm: 1100, description: "Lower-level exhibition and registration space by the meeting rooms." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Merak Room 1", capacity: 270, floorAreaSqm: 294, description: "Lower-lobby boardroom third, 3.5 m ceiling." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Merak Room 2", capacity: 270, floorAreaSqm: 294, description: "Lower-lobby boardroom third, 3.5 m ceiling." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Merak Room 3", capacity: 270, floorAreaSqm: 294, description: "Lower-lobby boardroom third, 3.5 m ceiling." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Nuri Room 1", capacity: 140, floorAreaSqm: 182, description: "Lower-lobby meeting room, 14.8 x 12.3 m." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Nuri Room 2", capacity: 60, floorAreaSqm: 70, description: "Lower-lobby meeting room, 7.3 x 9.6 m." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Nuri Rooms 1 and 2 Combined", capacity: 220, floorAreaSqm: 252, description: "Combinable Nuri pair." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Maleo Room", capacity: 60, floorAreaSqm: 77, description: "Lower-lobby meeting room, 7.3 x 10.6 m." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Murai Room", capacity: 60, floorAreaSqm: 77, description: "Lower-lobby meeting room, 7.3 x 10.6 m." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Kenari Room", capacity: 60, floorAreaSqm: 77, description: "Lower-lobby meeting room, 7.3 x 10.6 m." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Kakatua Room", capacity: 140, floorAreaSqm: 156, description: "Lower-lobby meeting room, 14.8 x 10.6 m." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Summit Room", capacity: 150, floorAreaSqm: 210, description: "Lower-lobby boardroom, 22.5 x 15 m." },
          { ceilingHeightM: 3.5, kind: "MEETING_ROOM", name: "Summit Lounge", capacity: 200, floorAreaSqm: 276, description: "Lower-lobby VIP lounge, 13.56 x 20.38 m." },
          { name: "Outdoor Exhibition", capacity: null, floorAreaSqm: 2000, description: "Open-air exhibition area as listed in venue directories." },
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
          { name: "Exhibition Hall 1", capacity: 10080, floorAreaSqm: 5200, description: "Trade-show hall in Building A, 50 x 104 m." },
          { name: "Exhibition Hall 2", capacity: 10080, floorAreaSqm: 5200, description: "Trade-show hall in Building A, 50 x 104 m." },
          { name: "Exhibition Hall 3", capacity: 10080, floorAreaSqm: 5200, description: "Trade-show hall in Building A, 50 x 104 m." },
          { name: "Exhibition Hall 3A", capacity: 10080, floorAreaSqm: 5200, description: "East cap of Building A, 50 x 104 m." },
          { name: "Exhibition Hall 5", capacity: 10080, floorAreaSqm: 5200, description: "Trade-show hall in Building B, 50 x 104 m." },
          { name: "Exhibition Hall 6", capacity: 10080, floorAreaSqm: 5200, description: "Trade-show hall in Building B, 50 x 104 m." },
          { name: "Exhibition Hall 7", capacity: 10080, floorAreaSqm: 5200, description: "Trade-show hall in Building B, 50 x 104 m." },
          { name: "Exhibition Hall 8", capacity: 10080, floorAreaSqm: 5200, description: "Trade-show hall in Building B, 50 x 104 m." },
          { name: "Exhibition Hall 9", capacity: 8400, floorAreaSqm: 4500, description: "Trade-show hall in Building C, 60 x 75 m." },
          { name: "Exhibition Hall 10", capacity: 8400, floorAreaSqm: 4500, description: "Trade-show hall in Building C, 60 x 75 m." },
          { name: "Exhibition Hall 11", capacity: 8400, floorAreaSqm: 4500, description: "Trade-show hall in Building C, 60 x 75 m." },
          { name: "Sriwijaya Convention Hall", capacity: null, floorAreaSqm: null, description: "Flexible convention and plenary hall linked to pre-function areas." },
          { kind: "MEETING_ROOM", name: "Nakula 1", capacity: 69, floorAreaSqm: 202, description: "Convention-building meeting room, classroom 69." },
          { kind: "MEETING_ROOM", name: "Nakula 2", capacity: 33, floorAreaSqm: 118, description: "Convention-building meeting room, classroom 33." },
          { kind: "MEETING_ROOM", name: "Nakula 3", capacity: 32, floorAreaSqm: 118, description: "Convention-building meeting room, classroom 32." },
          { kind: "MEETING_ROOM", name: "Nakula 5A", capacity: 59, floorAreaSqm: 178, description: "Convention-building meeting room, classroom 59." },
          { kind: "MEETING_ROOM", name: "Nakula 5B", capacity: 59, floorAreaSqm: 178, description: "Convention-building meeting room, classroom 59." },
          { kind: "MEETING_ROOM", name: "Nakula 6", capacity: 41, floorAreaSqm: 137, description: "Convention-building meeting room, classroom 41." },
          { kind: "MEETING_ROOM", name: "Nakula 7", capacity: 42, floorAreaSqm: 138, description: "Convention-building meeting room, classroom 42." },
          { kind: "MEETING_ROOM", name: "Nakula 8", capacity: 30, floorAreaSqm: 111, description: "Convention-building meeting room, classroom 30." },
          { kind: "MEETING_ROOM", name: "Sadewa 1", capacity: 39, floorAreaSqm: 132, description: "Convention-building meeting room, classroom 39." },
          { kind: "MEETING_ROOM", name: "Sadewa 2", capacity: 45, floorAreaSqm: 146, description: "Convention-building meeting room, classroom 45." },
          { kind: "MEETING_ROOM", name: "Sadewa 3", capacity: 41, floorAreaSqm: 138, description: "Convention-building meeting room, classroom 41." },
          { kind: "MEETING_ROOM", name: "Sadewa 3A", capacity: 16, floorAreaSqm: 76, description: "Convention-building meeting room, classroom 16." },
          { kind: "MEETING_ROOM", name: "Sadewa 5", capacity: 59, floorAreaSqm: 178, description: "Convention-building meeting room, classroom 59." },
          { kind: "MEETING_ROOM", name: "Sadewa 6", capacity: 80, floorAreaSqm: 228, description: "Largest convention-building meeting room, classroom 80." },
          { name: "The Courtyard", capacity: null, floorAreaSqm: 7600, description: "Terrace and lower-deck outdoor space for performances between Buildings B and C." },
          { name: "Outdoor Event Plaza", capacity: null, floorAreaSqm: 30000, description: "Semi-outdoor exhibition area for fairs, concerts and festivals." },
        ],
      },
    },
  });

  // 4.5 GBK Complex
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
          { name: "Stadion Utama GBK", capacity: 77193, floorAreaSqm: null, description: "National football and concert stadium with single flip-up seats." },
          { name: "Indonesia Arena", capacity: 16300, floorAreaSqm: null, description: "Five-storey multifunction arena opened for FIBA World Cup 2023." },
          { name: "Istora Senayan", capacity: 7166, floorAreaSqm: 1250, description: "Badminton and concert palace on wood parquet, 50 x 25 m arena." },
          { name: "Stadion Madya", capacity: 9170, floorAreaSqm: null, description: "Athletics stadium with two tribunes, also hosts league football." },
          { name: "Aquatic Stadium", capacity: 8630, floorAreaSqm: null, description: "Semi-indoor swim venue with four pools for tournaments." },
          { name: "Tennis Indoor Stadium", capacity: 3750, floorAreaSqm: 1600, description: "Air-conditioned indoor hall, 40 x 40 m, for concerts and volleyball." },
          { name: "Tennis Outdoor Center Court", capacity: 3822, floorAreaSqm: 1988, description: "Two outdoor courts for Davis Cup ties and concerts." },
          { name: "Basketball Hall", capacity: 2496, floorAreaSqm: null, description: "15 m-high indoor hall for basketball and non-sport events." },
          { name: "Baseball Field", capacity: 1320, floorAreaSqm: null, description: "Tournament baseball diamond on zoysia grass." },
          { name: "Softball Field", capacity: 500, floorAreaSqm: null, description: "Slow-pitch and community field, expandable with temporary stands." },
          { name: "Hockey Field", capacity: 818, floorAreaSqm: null, description: "Field-hockey tournament pitch." },
          { name: "Archery Field", capacity: 97, floorAreaSqm: null, description: "Tournament archery range, otherwise a training ground." },
          { name: "Squash Stadium", capacity: 560, floorAreaSqm: null, description: "International-standard squash courts for ticketed tournaments." },
          { name: "Plazas and Festival Grounds", capacity: null, floorAreaSqm: null, description: "Plaza Timur, east parking plaza and ring-road grounds for festivals and fun-runs." },
          { name: "Gedung Serbaguna", capacity: null, floorAreaSqm: null, description: "Multifunction hall for weddings, seminars and graduations, with VIP room." },
          { name: "GBK Arena", capacity: null, floorAreaSqm: null, description: "Eight-storey multifunction building with event space plus courts." },
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
      imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
      halls: {
        create: [
          { name: "Main Stadium Bowl", capacity: 82000, floorAreaSqm: null, description: "Three-tier all-seater bowl on a 105 x 68 m hybrid-grass pitch, no running track." },
          { name: "Sky View Deck", capacity: 100, floorAreaSqm: null, description: "Level 9 observation and jogging loop, 950 m, safety-limited." },
          { name: "Training Fields", capacity: null, floorAreaSqm: null, description: "Two full-size hybrid-turf pitches with support blocks, publicly bookable." },
          { name: "VIP Tribune", capacity: null, floorAreaSqm: null, description: "Premium spectator tribune with 200 wheelchair seats and companions." },
          { name: "Outdoor Plaza and Pedestrian Ramp", capacity: null, floorAreaSqm: null, description: "Public plaza, prayer plaza and ramp links toward BMW Park." },
          { kind: "MEETING_ROOM", name: "Premium Rooms", capacity: null, floorAreaSqm: null, description: "Special VIP rooms for event hospitality." },
          { kind: "MEETING_ROOM", name: "VVIP West Lobby", capacity: null, floorAreaSqm: null, description: "West-side VVIP arrival lobby used for event hospitality." },
          { kind: "MEETING_ROOM", name: "VVIP Waiting Room and Royal Lounge", capacity: null, floorAreaSqm: null, description: "Mezzanine hospitality lounge for VVIP guests." },
          { kind: "MEETING_ROOM", name: "Press Conference and Media Room", capacity: null, floorAreaSqm: null, description: "Tiered press room with media workroom." },
          { kind: "MEETING_ROOM", name: "Corporate Box VIP Area", capacity: null, floorAreaSqm: null, description: "Suite-style corporate hospitality boxes." },
          { kind: "MEETING_ROOM", name: "Training-Field Multipurpose Rooms", capacity: null, floorAreaSqm: null, description: "Two multipurpose rooms in the training-field support block." },
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
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Tokyo_Big_Sight_Conference_Tower.jpg",
      halls: {
        create: [
          { name: "East Exhibition Hall 1", capacity: null, floorAreaSqm: 8670, description: "90 x 90 m block west of the Galleria with mobile roof." },
          { name: "East Exhibition Hall 2", capacity: null, floorAreaSqm: 8350, description: "Exhibition block west of the Galleria." },
          { name: "East Exhibition Hall 3", capacity: null, floorAreaSqm: 8670, description: "Exhibition block east of the Galleria." },
          { name: "East Exhibition Hall 4", capacity: null, floorAreaSqm: 8670, description: "Exhibition block east of the Galleria." },
          { name: "East Exhibition Hall 5", capacity: null, floorAreaSqm: 8350, description: "Exhibition block east of the Galleria." },
          { name: "East Exhibition Hall 6", capacity: null, floorAreaSqm: 8670, description: "Exhibition block east of the Galleria." },
          { name: "East Exhibition Hall 7", capacity: null, floorAreaSqm: 11680, description: "Largest single hall on site, New East block from 2016." },
          { name: "East Exhibition Hall 8", capacity: null, floorAreaSqm: 3080, description: "New East block hall with three connectable meeting rooms." },
          { name: "East Link Space", capacity: null, floorAreaSqm: 1120, description: "Multipurpose connector in the New East block." },
          { name: "West Exhibition Hall 1", capacity: null, floorAreaSqm: 8880, description: "Ground-floor hall combinable with Hall 2 and the Atrium." },
          { name: "West Exhibition Hall 2", capacity: null, floorAreaSqm: 8880, description: "Ground-floor hall combinable with Hall 1 and the Atrium." },
          { name: "West Exhibition Hall 3", capacity: null, floorAreaSqm: 4680, description: "Upper-floor hall in the West block." },
          { name: "West Exhibition Hall 4", capacity: null, floorAreaSqm: 6840, description: "Larger upper-floor hall in the West block." },
          { name: "West Atrium", capacity: null, floorAreaSqm: 2000, description: "Glass-roofed central court, usable exhibition portion." },
          { name: "West Rooftop Exhibition Area", capacity: null, floorAreaSqm: 6000, description: "Waterfront-view outdoor exhibition space above the West block." },
          { name: "West Outdoor Exhibition Area", capacity: null, floorAreaSqm: null, description: "Outdoor exhibition area adjoining the West block." },
          { name: "South Exhibition Hall 1", capacity: null, floorAreaSqm: 5000, description: "2019 South block hall with four meeting rooms and a show office." },
          { name: "South Exhibition Hall 2", capacity: null, floorAreaSqm: 5000, description: "2019 South block hall with six meeting rooms and a show office." },
          { name: "South Exhibition Hall 3", capacity: null, floorAreaSqm: 5000, description: "2019 South block hall with seven meeting rooms and a show office." },
          { name: "South Exhibition Hall 4", capacity: null, floorAreaSqm: 5000, description: "2019 South block hall with eight meeting rooms and a show office." },
          { name: "Reception Hall A and B", capacity: 1100, floorAreaSqm: 1700, description: "Divisible Conference Tower reception hall with interpretation." },
          { name: "International Conference Room", capacity: 1000, floorAreaSqm: 1030, description: "Fixed-theatre conference room with 250-inch projection." },
          { name: "Ariake GYM-EX Exhibition Hall", capacity: null, floorAreaSqm: 9400, description: "Operated satellite hall in the former Olympic gymnastics arena." },
          { kind: "MEETING_ROOM", name: "Reception Hall A", capacity: 500, floorAreaSqm: 700, description: "Conference Tower reception half with stage." },
          { kind: "MEETING_ROOM", name: "Reception Hall B", capacity: 500, floorAreaSqm: 700, description: "Conference Tower reception half with stage." },
          { kind: "MEETING_ROOM", name: "Conference Room 101", capacity: 144, floorAreaSqm: 180, description: "First-floor room opposite the Reception Hall." },
          { kind: "MEETING_ROOM", name: "Conference Room 102", capacity: 144, floorAreaSqm: 180, description: "First-floor room opposite the Reception Hall." },
          { kind: "MEETING_ROOM", name: "Conference Room 103", capacity: 18, floorAreaSqm: 35, description: "First-floor small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 104", capacity: 28, floorAreaSqm: 50, description: "First-floor small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 601", capacity: 40, floorAreaSqm: 80, description: "Sixth-floor meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 602", capacity: 20, floorAreaSqm: 55, description: "Sixth-floor small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 603", capacity: 20, floorAreaSqm: 55, description: "Sixth-floor small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 604", capacity: 40, floorAreaSqm: 80, description: "Sixth-floor meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 605", capacity: 144, floorAreaSqm: 190, description: "Sixth-floor core-block meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 606", capacity: 144, floorAreaSqm: 190, description: "Sixth-floor core-block meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 607", capacity: 144, floorAreaSqm: 190, description: "Sixth-floor core-block meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 608", capacity: 144, floorAreaSqm: 190, description: "Sixth-floor core-block meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 609", capacity: 100, floorAreaSqm: 135, description: "Sixth-floor meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 610", capacity: 100, floorAreaSqm: 135, description: "Sixth-floor meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 701", capacity: 50, floorAreaSqm: 80, description: "Seventh-floor sub-committee room." },
          { kind: "MEETING_ROOM", name: "Conference Room 702", capacity: 50, floorAreaSqm: 80, description: "Seventh-floor sub-committee room." },
          { kind: "MEETING_ROOM", name: "Conference Room 703", capacity: 120, floorAreaSqm: 150, description: "Seventh-floor meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 801", capacity: 56, floorAreaSqm: 75, description: "Eighth-floor meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 802", capacity: 60, floorAreaSqm: 100, description: "Eighth-floor meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 803", capacity: 10, floorAreaSqm: 35, description: "Eighth-floor fixed-seating hollow room." },
          { kind: "MEETING_ROOM", name: "Conference Room 804", capacity: 12, floorAreaSqm: 55, description: "Eighth-floor fixed-seating hollow room." },
          { kind: "MEETING_ROOM", name: "VIP Room 805", capacity: 8, floorAreaSqm: 85, description: "Eighth-floor fixed-seating VIP hollow room." },
        ],
      },
    },
  });

  // 5.2 Makuhari Messe (Japan)
  const venueMakuhari = await prisma.venue.create({
    data: {
      regionId: regionJp.id,
      name: "Makuhari Messe International Convention Complex",
      slug: "makuhari-messe",
      city: "Chiba / Tokyo Bay",
      address: "2-1 Nakase, Mihama Ward, Chiba, 261-8550, Japan",
      latitude: 35.6483,
      longitude: 140.0347,
      transitInfo: "JR Keiyo Line (Kaihimmakuhari Station, 5 mins walk). Direct Narita/Haneda Airport Limousine bus.",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
      halls: {
        create: [
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 1", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 2", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 3", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 4", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 5", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 6", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 7", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 15, floorLoadKnM2: 49, name: "Exhibition Hall 8", capacity: null, floorAreaSqm: 6750, description: "Column-free hall, 112.5 x 60 m, 5 t per sqm floor load." },
          { ceilingHeightM: 16, floorLoadKnM2: 49, name: "Exhibition Hall 9", capacity: null, floorAreaSqm: 9000, description: "Heavy-exhibit hall, 96 x 96 m, 5 t per sqm floor load." },
          { ceilingHeightM: 16, floorLoadKnM2: 29, name: "Exhibition Hall 10", capacity: null, floorAreaSqm: 4500, description: "Dividable hall, 96 x 48 m, 3 t per sqm floor load." },
          { ceilingHeightM: 16, floorLoadKnM2: 29, name: "Exhibition Hall 11", capacity: null, floorAreaSqm: 4500, description: "Dividable hall, 96 x 48 m, 3 t per sqm floor load." },
          { name: "Makuhari Event Hall", capacity: 9000, floorAreaSqm: 3098, description: "Arena for concerts and ceremonies, fixed plus movable and temporary seats." },
          { name: "Convention Hall", capacity: 1664, floorAreaSqm: 1390, description: "Flagship plenary in the International Conference Hall building." },
          { name: "International Conference Room", capacity: 688, floorAreaSqm: 635, description: "Sub-plenary in the International Conference Hall building." },
          { kind: "MEETING_ROOM", name: "Conference Room 101", capacity: 144, floorAreaSqm: 160, description: "Dividable medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 101A", capacity: 72, floorAreaSqm: 80, description: "Meeting room half." },
          { kind: "MEETING_ROOM", name: "Conference Room 101B", capacity: 72, floorAreaSqm: 80, description: "Meeting room half." },
          { kind: "MEETING_ROOM", name: "Conference Room 102", capacity: 160, floorAreaSqm: 139, description: "Medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 103", capacity: 170, floorAreaSqm: 156, description: "Medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 104", capacity: 170, floorAreaSqm: 156, description: "Medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 105", capacity: 170, floorAreaSqm: 156, description: "Medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 201", capacity: 304, floorAreaSqm: 330, description: "Dividable medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 202", capacity: 70, floorAreaSqm: 83, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 203", capacity: 56, floorAreaSqm: 72, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 204", capacity: 48, floorAreaSqm: 53, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 205", capacity: 48, floorAreaSqm: 53, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 213", capacity: 10, floorAreaSqm: 16, description: "Micro meeting room, hollow-square for 8 to 12." },
          { kind: "MEETING_ROOM", name: "Conference Room 214", capacity: 10, floorAreaSqm: 16, description: "Micro meeting room, hollow-square for 8 to 12." },
          { kind: "MEETING_ROOM", name: "Conference Room 215", capacity: 10, floorAreaSqm: 16, description: "Micro meeting room, hollow-square for 8 to 12." },
          { kind: "MEETING_ROOM", name: "Conference Room 216", capacity: 10, floorAreaSqm: 16, description: "Micro meeting room, hollow-square for 8 to 12." },
          { kind: "MEETING_ROOM", name: "Conference Room 301", capacity: 256, floorAreaSqm: 280, description: "Dividable medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 302", capacity: 196, floorAreaSqm: 194, description: "Medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 303", capacity: 196, floorAreaSqm: 194, description: "Medium meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 304", capacity: 172, floorAreaSqm: 190, description: "Medium meeting room." },
          { kind: "MEETING_ROOM", name: "VIP Reception Room 1", capacity: 8, floorAreaSqm: 65, description: "VIP reception with sofa set for 8." },
          { kind: "MEETING_ROOM", name: "VIP Reception Room 2", capacity: 6, floorAreaSqm: 30, description: "VIP reception with sofa set for 6." },
          { kind: "MEETING_ROOM", name: "Hall 9 Support Rooms", capacity: null, floorAreaSqm: null, description: "Organiser, multipurpose, conference and meeting rooms by Hall 9." },
          { kind: "MEETING_ROOM", name: "Hall 10 Support Rooms", capacity: null, floorAreaSqm: null, description: "Organiser, multipurpose, conference and meeting rooms by Hall 10." },
          { kind: "MEETING_ROOM", name: "Hall 11 Support Rooms", capacity: null, floorAreaSqm: null, description: "Organiser, multipurpose, conference and meeting rooms by Hall 11." },
        ],
      },
    },
  });

  // 5.3 Pacifico Yokohama (Japan)
  const venuePacifico = await prisma.venue.create({
    data: {
      regionId: regionJp.id,
      name: "Pacifico Yokohama Convention Center",
      slug: "pacifico-yokohama",
      city: "Yokohama (Minato Mirai)",
      address: "1-1-1 Minatomirai, Nishi Ward, Yokohama, Kanagawa 220-0012, Japan",
      latitude: 35.4593,
      longitude: 139.6366,
      transitInfo: "Minatomirai Line (Minatomirai Station, 5 mins walk). JR Sakuragicho Station (12 mins walk).",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
      halls: {
        create: [
          { name: "National Convention Hall of Yokohama", capacity: 5002, floorAreaSqm: null, description: "Fixed-theatre plenary with movable stage. Renovation closure May 2027 to Mar 2028." },
          { name: "Marine Lobby", capacity: null, floorAreaSqm: 1400, description: "Reception foyer serving the National Convention Hall." },
          { ceilingHeightM: 13, floorLoadKnM2: 25, name: "Exhibition Hall A", capacity: null, floorAreaSqm: 3300, description: "Column-free exhibition unit." },
          { ceilingHeightM: 13, floorLoadKnM2: 25, name: "Exhibition Hall B", capacity: null, floorAreaSqm: 6700, description: "Column-free exhibition unit." },
          { ceilingHeightM: 13, floorLoadKnM2: 25, name: "Exhibition Hall C", capacity: null, floorAreaSqm: 3300, description: "Column-free exhibition unit." },
          { ceilingHeightM: 13, floorLoadKnM2: 25, name: "Exhibition Hall D", capacity: null, floorAreaSqm: 6700, description: "Column-free exhibition unit." },
          { name: "Conference Center Main Hall", capacity: 1004, floorAreaSqm: 1323, description: "Fixed-seat hall on the Conference Center first floor." },
          { ceilingHeightM: 6.7, name: "Annex Hall F201-F206", capacity: 1312, floorAreaSqm: 1350, description: "Glass-walled divisible hall linked to the Exhibition Hall." },
          { name: "North G1-G8", capacity: 5984, floorAreaSqm: 6337, description: "Column-free multipurpose space in Pacifico Yokohama North." },
          { kind: "MEETING_ROOM", name: "Conference Room 301-304", capacity: 1392, floorAreaSqm: 1366, description: "Joined large meeting rooms, vertical or horizontal layout." },
          { kind: "MEETING_ROOM", name: "Conference Room 301 and 302", capacity: 672, floorAreaSqm: 670, description: "Joined meeting pair." },
          { kind: "MEETING_ROOM", name: "Conference Room 303 and 304", capacity: 575, floorAreaSqm: 588, description: "Joined meeting pair." },
          { kind: "MEETING_ROOM", name: "Conference Room 301", capacity: 285, floorAreaSqm: 335, description: "Large meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 302", capacity: 285, floorAreaSqm: 335, description: "Large meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 303", capacity: 250, floorAreaSqm: 294, description: "Large meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 304", capacity: 250, floorAreaSqm: 294, description: "Large meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 311 and 312", capacity: null, floorAreaSqm: 152, description: "Joined meeting pair." },
          { kind: "MEETING_ROOM", name: "Conference Room 313 and 314", capacity: null, floorAreaSqm: 152, description: "Joined meeting pair." },
          { kind: "MEETING_ROOM", name: "Conference Room 315", capacity: 168, floorAreaSqm: 319, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 316", capacity: 50, floorAreaSqm: 63, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 317", capacity: 50, floorAreaSqm: 63, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 318", capacity: 50, floorAreaSqm: 63, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 321", capacity: null, floorAreaSqm: 28, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 411", capacity: 72, floorAreaSqm: 75, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 412", capacity: 72, floorAreaSqm: 75, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 411 and 412", capacity: 144, floorAreaSqm: 150, description: "Joined meeting pair." },
          { kind: "MEETING_ROOM", name: "Conference Room 413", capacity: null, floorAreaSqm: 124, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 414", capacity: 72, floorAreaSqm: 77, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 415", capacity: 72, floorAreaSqm: 77, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 416", capacity: 72, floorAreaSqm: 77, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 417", capacity: 72, floorAreaSqm: 77, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 414 and 415", capacity: 154, floorAreaSqm: 154, description: "Joined meeting pair." },
          { kind: "MEETING_ROOM", name: "Conference Room 416 and 417", capacity: 154, floorAreaSqm: 154, description: "Joined meeting pair." },
          { kind: "MEETING_ROOM", name: "Conference Room 418", capacity: 140, floorAreaSqm: 172, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 419", capacity: 140, floorAreaSqm: 172, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 421", capacity: null, floorAreaSqm: 69, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 422", capacity: null, floorAreaSqm: 69, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 423", capacity: null, floorAreaSqm: 69, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 424", capacity: null, floorAreaSqm: 69, description: "Meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 425", capacity: null, floorAreaSqm: 31, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 501 and 502", capacity: 748, floorAreaSqm: 792, description: "Joined large meeting rooms." },
          { kind: "MEETING_ROOM", name: "Conference Room 501", capacity: 340, floorAreaSqm: 396, description: "Large meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 502", capacity: 340, floorAreaSqm: 396, description: "Large meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 503", capacity: 432, floorAreaSqm: 500, description: "Large meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 511", capacity: 55, floorAreaSqm: 71, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 512", capacity: 55, floorAreaSqm: 71, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 513", capacity: 48, floorAreaSqm: 59, description: "Small meeting room." },
          { kind: "MEETING_ROOM", name: "Conference Room 514", capacity: 48, floorAreaSqm: 59, description: "Small meeting room." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F201-F204", capacity: 768, floorAreaSqm: 900, description: "Annex subdivision." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F203-F206", capacity: 832, floorAreaSqm: 900, description: "Annex subdivision." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F201 and F202", capacity: 320, floorAreaSqm: 450, description: "Annex subdivision pair." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F203 and F204", capacity: 320, floorAreaSqm: 450, description: "Annex subdivision pair." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F205 and F206", capacity: 374, floorAreaSqm: 450, description: "Annex subdivision pair." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F201", capacity: 176, floorAreaSqm: 225, description: "Annex subdivision." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F202", capacity: 176, floorAreaSqm: 225, description: "Annex subdivision." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F203", capacity: 176, floorAreaSqm: 225, description: "Annex subdivision." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F204", capacity: 176, floorAreaSqm: 225, description: "Annex subdivision." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F205", capacity: 176, floorAreaSqm: 225, description: "Annex subdivision." },
          { ceilingHeightM: 6.7, kind: "MEETING_ROOM", name: "Annex Hall F206", capacity: 176, floorAreaSqm: 225, description: "Annex subdivision." },
          { kind: "MEETING_ROOM", name: "North G1-G6", capacity: 4608, floorAreaSqm: 4824, description: "North multipurpose subdivision." },
          { kind: "MEETING_ROOM", name: "North G3-G8", capacity: 5112, floorAreaSqm: 4824, description: "North multipurpose subdivision." },
          { kind: "MEETING_ROOM", name: "North G1-G4", capacity: 3024, floorAreaSqm: 2991, description: "North multipurpose subdivision." },
          { kind: "MEETING_ROOM", name: "North G5-G8", capacity: 3024, floorAreaSqm: 2991, description: "North multipurpose subdivision." },
          { kind: "MEETING_ROOM", name: "North G3-G6", capacity: 3312, floorAreaSqm: 3311, description: "North multipurpose subdivision." },
          { kind: "MEETING_ROOM", name: "North G1 and G2", capacity: 1244, floorAreaSqm: 1362, description: "North multipurpose pair." },
          { kind: "MEETING_ROOM", name: "North G7 and G8", capacity: 1296, floorAreaSqm: 1362, description: "North multipurpose pair." },
          { kind: "MEETING_ROOM", name: "North G3 and G4", capacity: 1296, floorAreaSqm: 1478, description: "North multipurpose pair." },
          { kind: "MEETING_ROOM", name: "North G5 and G6", capacity: 1440, floorAreaSqm: 1478, description: "North multipurpose pair." },
          { kind: "MEETING_ROOM", name: "North G1", capacity: 612, floorAreaSqm: 681, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G2", capacity: 612, floorAreaSqm: 681, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G7", capacity: 612, floorAreaSqm: 681, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G8", capacity: 612, floorAreaSqm: 681, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G3", capacity: 612, floorAreaSqm: 739, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G4", capacity: 612, floorAreaSqm: 739, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G5", capacity: 612, floorAreaSqm: 739, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G6", capacity: 612, floorAreaSqm: 739, description: "North multipurpose unit." },
          { kind: "MEETING_ROOM", name: "North G301 and G302", capacity: 396, floorAreaSqm: 541, description: "North upper-floor pair." },
          { kind: "MEETING_ROOM", name: "North G401 and G402", capacity: 442, floorAreaSqm: 541, description: "North upper-floor pair." },
          { kind: "MEETING_ROOM", name: "North G301", capacity: 192, floorAreaSqm: 267, description: "North upper-floor room." },
          { kind: "MEETING_ROOM", name: "North G401", capacity: 192, floorAreaSqm: 267, description: "North upper-floor room." },
          { kind: "MEETING_ROOM", name: "North G302", capacity: 192, floorAreaSqm: 274, description: "North upper-floor room." },
          { kind: "MEETING_ROOM", name: "North G402", capacity: 192, floorAreaSqm: 274, description: "North upper-floor room." },
          { kind: "MEETING_ROOM", name: "North G303 and G304", capacity: 448, floorAreaSqm: 589, description: "North upper-floor pair." },
          { kind: "MEETING_ROOM", name: "North G403 and G404", capacity: 480, floorAreaSqm: 589, description: "North upper-floor pair." },
          { kind: "MEETING_ROOM", name: "North G303", capacity: 240, floorAreaSqm: 296, description: "North upper-floor room." },
          { kind: "MEETING_ROOM", name: "North G403", capacity: 240, floorAreaSqm: 296, description: "North upper-floor room." },
          { kind: "MEETING_ROOM", name: "North G304", capacity: 240, floorAreaSqm: 293, description: "North upper-floor room." },
          { kind: "MEETING_ROOM", name: "North G404", capacity: 240, floorAreaSqm: 293, description: "North upper-floor room." },
        ],
      },
    },
  });

  // 5.4 Marina Bay Sands Expo (Singapore / Global)
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
          { ceilingHeightM: 9.45, floorLoadKnM2: 12, name: "Exhibition Hall A", capacity: null, floorAreaSqm: 4240, description: "Column-free expo hall on Level 1, subdividable by movable walls." },
          { ceilingHeightM: 9.45, floorLoadKnM2: 12, name: "Exhibition Hall B", capacity: null, floorAreaSqm: 4140, description: "Column-free expo hall on Level 1, subdividable by movable walls." },
          { ceilingHeightM: 9.45, floorLoadKnM2: 12, name: "Exhibition Hall C", capacity: null, floorAreaSqm: 4170, description: "Column-free expo hall on Level 1, subdividable by movable walls." },
          { ceilingHeightM: 9.45, floorLoadKnM2: 12, name: "Exhibition Hall D", capacity: null, floorAreaSqm: 3110, description: "Column-free expo hall on Basement 2, subdividable by movable walls." },
          { ceilingHeightM: 9.45, floorLoadKnM2: 12, name: "Exhibition Hall E", capacity: null, floorAreaSqm: 4840, description: "Column-free expo hall on Basement 2, subdividable by movable walls." },
          { ceilingHeightM: 9.45, floorLoadKnM2: 12, name: "Exhibition Hall F", capacity: null, floorAreaSqm: 6780, description: "Largest single expo hall, on Basement 2." },
          { name: "Sands Grand Ballroom", capacity: 7000, floorAreaSqm: 5820, description: "Flagship ballroom on Level 5, extendable with 2,160 sqm pre-function." },
          { name: "Melati Ballroom", capacity: 1056, floorAreaSqm: 928, description: "Level 4 ballroom subdividing down to 68 sqm sections." },
          { name: "Jasmine Ballroom", capacity: 1576, floorAreaSqm: 1366, description: "Level 3 ballroom subdividing down to 66 sqm sections." },
          { name: "Hibiscus Ballroom", capacity: 1576, floorAreaSqm: 1366, description: "Level 3 ballroom subdividing down to 68 sqm sections." },
          { name: "Heliconia Ballroom", capacity: 1576, floorAreaSqm: 1366, description: "Level 3 ballroom subdividing down to 68 sqm sections." },
          { name: "Cassia Ballroom", capacity: 1576, floorAreaSqm: 1366, description: "Level 3 ballroom subdividing down to 120 sqm sections." },
          { name: "Orchid Ballroom", capacity: 1576, floorAreaSqm: 1366, description: "Level 4 ballroom subdividing down to 68 sqm sections." },
          { name: "Peony Ballroom", capacity: 1576, floorAreaSqm: 1366, description: "Level 4 ballroom subdividing down to 68 sqm sections." },
          { name: "Roselle-Simpor Expanded Ballroom", capacity: null, floorAreaSqm: 3700, description: "Expanded Level 4 flagship, second-largest after the Grand Ballroom." },
          { name: "Roselle-Simpor Hall 4700", capacity: 1976, floorAreaSqm: 1778, description: "Single Level 4 hall, 32.8 x 54.2 m." },
          { name: "Sands Theatre", capacity: 2183, floorAreaSqm: null, description: "Theatre for plenaries and private events, 18 x 16 m stage." },
          { name: "Event Plaza D1", capacity: null, floorAreaSqm: 510, description: "Outdoor event plaza unit." },
          { name: "Event Plaza D2", capacity: null, floorAreaSqm: 580, description: "Outdoor event plaza unit." },
          { name: "Event Plaza D3", capacity: null, floorAreaSqm: 480, description: "Outdoor event plaza unit." },
          { name: "Event Plaza D4", capacity: null, floorAreaSqm: 480, description: "Outdoor event plaza unit." },
          { name: "Sands SkyPark Observation Deck", capacity: 500, floorAreaSqm: 865, description: "Standing-cocktail deck for up to 500 guests." },
          { name: "SkyPark South Garden", capacity: null, floorAreaSqm: 325, description: "SkyPark garden event space." },
          { kind: "MEETING_ROOM", name: "Sands A Junior Ballroom", capacity: 844, floorAreaSqm: 626, description: "Level 5 breakout beside the Grand Ballroom, 104 to 626 sqm." },
          { kind: "MEETING_ROOM", name: "Sands B Junior Ballroom", capacity: 544, floorAreaSqm: 442, description: "Level 5 breakout beside the Grand Ballroom, 108 to 442 sqm." },
          { kind: "MEETING_ROOM", name: "Jasmine Subdivisions", capacity: 1300, floorAreaSqm: 1124, description: "Largest Jasmine section combination, down to 66 sqm rooms." },
          { kind: "MEETING_ROOM", name: "Hibiscus Subdivisions", capacity: 1300, floorAreaSqm: 1100, description: "Largest Hibiscus section combination, down to 68 sqm rooms." },
          { kind: "MEETING_ROOM", name: "Heliconia Subdivisions", capacity: 1300, floorAreaSqm: 1100, description: "Largest Heliconia section combination, down to 68 sqm rooms." },
          { kind: "MEETING_ROOM", name: "Cassia Subdivisions", capacity: 1300, floorAreaSqm: 1100, description: "Largest Cassia section combination, down to 120 sqm rooms." },
          { kind: "MEETING_ROOM", name: "Begonia Junior Ballroom", capacity: 520, floorAreaSqm: 448, description: "Level 3 breakout, 124 to 448 sqm." },
          { kind: "MEETING_ROOM", name: "Angsana Meeting Room", capacity: 132, floorAreaSqm: 106, description: "Level 3 meeting room, 50 to 106 sqm." },
          { kind: "MEETING_ROOM", name: "Saraca Meeting Room", capacity: 240, floorAreaSqm: 217, description: "Level 3 meeting room, 73 to 217 sqm." },
          { kind: "MEETING_ROOM", name: "Orchid and Peony Subdivisions", capacity: 1300, floorAreaSqm: 1100, description: "Largest Orchid and Peony section combinations, down to 68 sqm rooms." },
          { kind: "MEETING_ROOM", name: "Melati Subdivisions", capacity: 788, floorAreaSqm: 672, description: "Largest Melati section combination, down to 68 sqm rooms." },
          { kind: "MEETING_ROOM", name: "Roselle-Simpor Sub-sections", capacity: 788, floorAreaSqm: 656, description: "Sub-sections from 55 sqm up to 656 sqm." },
          { kind: "MEETING_ROOM", name: "Roselle-Simpor Combined Halls", capacity: 2250, floorAreaSqm: 2455, description: "Combined 4601A-4700 and 4700-4806 configurations." },
          { kind: "MEETING_ROOM", name: "Lotus Meeting Rooms", capacity: 66, floorAreaSqm: 114, description: "Level 4 meeting rooms, 55 to 114 sqm." },
          { kind: "MEETING_ROOM", name: "Junior Ballrooms (Level 4)", capacity: null, floorAreaSqm: null, description: "Simpor Jr, Roselle Jr, Peony Jr, Orchid Jr, Melati Jr and Lotus Jr." },
        ],
      },
    },
  });

  // 5.5 Messe Frankfurt (Germany / Global)
  const venueFrankfurt = await prisma.venue.create({
    data: {
      regionId: regionGlobal.id,
      name: "Messe Frankfurt Exhibition Centre",
      slug: "messe-frankfurt",
      city: "Frankfurt am Main, Germany",
      address: "Ludwig-Erhard-Anlage 1, 60327 Frankfurt am Main, Germany",
      latitude: 50.1115,
      longitude: 8.6515,
      transitInfo: "S-Bahn lines S3, S4, S5, S6 (Frankfurt Messe Station direct access). Frankfurt Airport 15 mins.",
      imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      halls: {
        create: [
          { name: "Exhibition Hall 1", capacity: null, floorAreaSqm: 18000, description: "Two-level column-free hall with City Entrance and U-Bahn access." },
          { name: "Festhalle", capacity: 15000, floorAreaSqm: 5646, description: "Historic domed arena from 1909 for concerts and congresses." },
          { name: "Exhibition Hall 3", capacity: null, floorAreaSqm: 38000, description: "Two-level column-free hall with conference and office rooms." },
          { name: "Exhibition Hall 4", capacity: null, floorAreaSqm: 42500, description: "Three-level hall with the Europa conference hall." },
          { name: "Exhibition Hall 5", capacity: null, floorAreaSqm: 18110, description: "New two-level column-free hall opened 2023, linked to Harmonie." },
          { name: "Exhibition Hall 6", capacity: null, floorAreaSqm: 26000, description: "Three-level hall linked to Halls 4 and 5." },
          { name: "Exhibition Hall 8", capacity: null, floorAreaSqm: 30223, description: "Largest single ground-level floor, divisible five ways." },
          { name: "Galleria", capacity: null, floorAreaSqm: 3366, description: "100 m glass-arch entrance hall between Halls 8 and 9." },
          { name: "Exhibition Hall 9", capacity: null, floorAreaSqm: 56000, description: "Four-level hall with conference rooms and restaurants." },
          { name: "Exhibition Hall 10", capacity: null, floorAreaSqm: 57000, description: "Five-level hall with in-building parking." },
          { name: "Exhibition Hall 11", capacity: null, floorAreaSqm: 23960, description: "Two-level column-free hall with rooftop terrace." },
          { name: "Portalhaus", capacity: 2000, floorAreaSqm: 2400, description: "Hall 11 entrance foyer for standing receptions." },
          { name: "Exhibition Hall 12", capacity: null, floorAreaSqm: 33600, description: "Two-level divisible hall with photovoltaic roof." },
          { name: "Forum Saal Areal", capacity: 2000, floorAreaSqm: 2300, description: "Level 0 event space with direct Agora access." },
          { name: "Forum Saal Panorama", capacity: 2025, floorAreaSqm: 2300, description: "Level 1 event space divisible three ways." },
          { name: "Congress Center (CMF)", capacity: 3400, floorAreaSqm: null, description: "Whole congress building with Harmonie hall and breakouts." },
          { name: "CMF Harmonie Hall", capacity: 2207, floorAreaSqm: 1800, description: "Divisible auditorium with mobile floor, direct Hall 5 access." },
          { name: "Kap Europa", capacity: 2400, floorAreaSqm: 7700, description: "Whole congress building with 14 rooms, bookable whole or per level." },
          { name: "Kap Europa Horizont Hall", capacity: 1050, floorAreaSqm: 973, description: "Level 4 hall with 8.4 m ceiling and terrace." },
          { name: "Kap Europa Meridian Hall", capacity: 602, floorAreaSqm: null, description: "Divisible Level 2 hall with 7.3 m ceiling." },
          { name: "Kap Europa Plateau Hall", capacity: 310, floorAreaSqm: 336, description: "Divisible Level 1 workshop hall." },
          { name: "Agora Open-Air Grounds", capacity: 10000, floorAreaSqm: 12000, description: "Paved festival ground with 20 x 14 m stage for summer concerts." },
          { kind: "MEETING_ROOM", name: "CMF Breakout Rooms", capacity: 473, floorAreaSqm: null, description: "Spektrum, Conclusio, Fantasie and Illusion breakout rooms." },
        ],
      },
    },
  });

  // 5.6 ExCeL London (UK / Global)
  const venueExcel = await prisma.venue.create({
    data: {
      regionId: regionGlobal.id,
      name: "ExCeL London International Convention Centre",
      slug: "excel-london",
      city: "London, United Kingdom",
      address: "Royal Victoria Dock, 1 Western Gateway, London E16 1XL, UK",
      latitude: 51.5074,
      longitude: 0.0298,
      transitInfo: "Elizabeth Line & DLR Custom House for ExCeL station (12 mins from Central London).",
      imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
      halls: {
        create: [
          { ceilingHeightM: 10, name: "Event Halls North and South", capacity: 68750, floorAreaSqm: 87328, description: "Combined column-free halls with 10 m ceilings, movable walls." },
          { name: "Hall Module N1", capacity: null, floorAreaSqm: 1000, description: "Standard north end module." },
          { name: "Hall Module S1", capacity: null, floorAreaSqm: 1000, description: "Standard south end module." },
          { name: "Hall Module N23", capacity: null, floorAreaSqm: 664, description: "Smallest north end module." },
          { name: "Hall Module S23", capacity: null, floorAreaSqm: 664, description: "Smallest south end module." },
          { name: "ICC Auditorium", capacity: 4200, floorAreaSqm: 4603, description: "Flexible auditorium, bespoke configs up to 7,000 standing." },
          { name: "ICC Capital Hall", capacity: 3060, floorAreaSqm: 4518, description: "Reception-capacity hall for exhibitions, posters and banquets." },
          { name: "ICC Capital Suite", capacity: 1394, floorAreaSqm: null, description: "Seventeen meeting rooms above Capital Hall and the Auditorium." },
          { name: "Platinum Suite", capacity: 1100, floorAreaSqm: 1579, description: "Self-contained conference centre on the Central Boulevard." },
          { ceilingHeightM: 9.6, name: "ICC Maritime Hall 1", capacity: null, floorAreaSqm: 1672, description: "Phase 3 blank-canvas hall, 31.1 x 53.8 m." },
          { ceilingHeightM: 9.6, name: "ICC Maritime Hall 2", capacity: null, floorAreaSqm: 1693, description: "Phase 3 blank-canvas hall, 31.1 x 53.8 m." },
          { name: "ICC Maritime Hall 3", capacity: null, floorAreaSqm: 2044, description: "Phase 3 blank-canvas hall." },
          { name: "ICC Maritime Hall 4", capacity: null, floorAreaSqm: 2188, description: "Phase 3 blank-canvas hall." },
          { name: "ICC Maritime Hall 5", capacity: null, floorAreaSqm: 2051, description: "Phase 3 blank-canvas hall." },
          { name: "ICC Maritime Hall 6", capacity: null, floorAreaSqm: null, description: "Phase 3 blank-canvas hall." },
          { name: "ICC Maritime Suite", capacity: 7000, floorAreaSqm: null, description: "Thirty-seven conference and meeting rooms above the Maritime Halls." },
          { name: "Event Square", capacity: null, floorAreaSqm: null, description: "External event space beside the ICC Maritime Halls." },
          { name: "Immerse LDN", capacity: null, floorAreaSqm: 14900, description: "Waterfront immersive entertainment district for private hire." },
          { kind: "MEETING_ROOM", name: "ICC London Suite", capacity: 400, floorAreaSqm: null, description: "Breakout and office suite with Capital Hall access." },
          { kind: "MEETING_ROOM", name: "ICC Capital Lounge", capacity: 50, floorAreaSqm: null, description: "Six executive boardrooms with private entrance." },
          { kind: "MEETING_ROOM", name: "Gallery Meeting Rooms", capacity: 400, floorAreaSqm: null, description: "Over forty dockside rooms with balconies, 20 to 400 delegates each." },
          { kind: "MEETING_ROOM", name: "Prince Regent Rooms", capacity: 14, floorAreaSqm: null, description: "Five executive boardrooms at the East Entrance." },
          { kind: "MEETING_ROOM", name: "CentrEd at ExCeL", capacity: 400, floorAreaSqm: null, description: "Twenty-nine training rooms with waterfront restaurant." },
          { kind: "MEETING_ROOM", name: "Victoria Rooms", capacity: 2538, floorAreaSqm: null, description: "Eight Maritime Suite rooms, reception capacity." },
          { kind: "MEETING_ROOM", name: "George V Rooms", capacity: 2623, floorAreaSqm: null, description: "Four Maritime Suite rooms, reception capacity." },
          { kind: "MEETING_ROOM", name: "Connaught Rooms", capacity: 528, floorAreaSqm: null, description: "Four Maritime Suite rooms, reception capacity." },
          { kind: "MEETING_ROOM", name: "Greenwich Rooms", capacity: 83, floorAreaSqm: null, description: "Four Maritime Suite rooms, reception capacity." },
          { kind: "MEETING_ROOM", name: "Albert Rooms", capacity: 111, floorAreaSqm: null, description: "Five Maritime Suite rooms, reception capacity." },
          { kind: "MEETING_ROOM", name: "Trinity Rooms", capacity: 110, floorAreaSqm: null, description: "Six Maritime Suite rooms, reception capacity." },
          { kind: "MEETING_ROOM", name: "Thames Rooms", capacity: 46, floorAreaSqm: null, description: "Six Maritime Suite rooms, reception capacity." },
          { kind: "MEETING_ROOM", name: "Waterfront Street Kitchen and Bar", capacity: null, floorAreaSqm: null, description: "Food and hospitality venue for event hire." },
        ],
      },
    },
  });

  console.log("✓ Venues and exact halls created across Indonesia (6), Japan (3), and Global (3)");

  // =========================================================================
  // 6. Seed Events Spanning All Regions
  // =========================================================================

  // 6.1 INDONESIA EVENTS
  const jiexpoHalls = await prisma.venueHall.findMany({ where: { venueId: venueJIExpo.id } });
  const hallA1 = jiexpoHalls.find((h) => h.name === "Hall A") || jiexpoHalls[0];

  const event1 = await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueJIExpo.id,
      venueHallId: hallA1.id,
      title: "Manufacturing Indonesia & Industrial Automation Expo 2026",
      slug: "manufacturing-indonesia-2026",
      showcaseJson: JSON.stringify({"livestreamUrl": "", "livestreamLive": false, "programs": [{"kind": "demo", "title": "CNC Live Cutting Demonstrations", "detail": "Daily live machining demos at the exhibitor booths listed in the directory.", "sponsor": ""}, {"kind": "demo", "title": "Robotics Handling Showcase", "detail": "Pick-and-place automation running throughout show hours.", "sponsor": ""}], "alerts": [], "channels": [], "attested": true, "attestedBy": "seed", "attestedAt": "2026-10-01T00:00:00Z"}),
      tagline: "The 36th International Manufacturing, Machinery, Equipment & Materials Exhibition",
      description: "Southeast Asia most prominent industrial gathering. Experience live demonstrations of CNC robotics, metallurgy, smart factory automation, and heavy machine tools with over 1,500 global exhibitors.",
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
          { name: "Exhibitor Delegate Pass", price: 1200000, currency: "IDR", capacity: 3000, benefitsJson: JSON.stringify(["Full Access + Booth Staff Badges", "Loading Dock Clearance", "Lead Retrieval Barcode Scanner"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Opening Plenary: Industrial AI & Precision Tooling in Southeast Asia", speakerName: "Ir. Hendra Wijaya", speakerRole: "Chairman of Indonesian Machine Tool Association", location: "Plenary Stage - Hall A", startTime: new Date("2026-09-14T09:30:00Z"), endTime: new Date("2026-09-14T11:00:00Z"), track: "Plenary Keynote" },
          { title: "Smart Factory Automation & CNC Multi-Axis Live Demo", speakerName: "Klaus Schneider", speakerRole: "Chief Automation Architect, DMG MORI", location: "Live Arena - Hall A2", startTime: new Date("2026-09-14T13:30:00Z"), endTime: new Date("2026-09-14T15:00:00Z"), track: "Technical Workshop" },
        ],
      },
      booths: {
        create: [
          { companyName: "DMG MORI Precision Tools", boothNumber: "Hall A - Booth 102", hallName: "Hall A", industry: "CNC Machining", websiteUrl: "https://dmgmori.com" },
          { companyName: "Siemens Smart Factory Solutions", boothNumber: "Hall A - Booth 204", hallName: "Hall A", industry: "Automation & Digital Twins", websiteUrl: "https://siemens.com" },
          { companyName: "Fanuc Robotics Indonesia", boothNumber: "Hall A2 - Booth 310", hallName: "Hall A2", industry: "Industrial Robotics", websiteUrl: "https://fanuc.co.jp" },
        ],
      },
      perks: {
        create: [
          { title: "VIP Buyer Lounge & Artisan Barista Coffee Voucher", description: "Complimentary single-origin espresso and quiet conference tables in Hall A2 Mezzanine.", tierRequired: "VIP", iconName: "Coffee" },
          { title: "Priority Express Security Lane & Direct Badge Pick-up", description: "Skip general admission queues with dedicated VIP fast-track door clearance.", tierRequired: "VIP", iconName: "ShieldCheck" },
          { title: "Executive B2B Networking Dinner & Deal-Room Pass", description: "Exclusive evening dinner invitation at the Grand Ballroom with key manufacturing suppliers.", tierRequired: "VIP", iconName: "Award" },
        ],
      },
    },
  });

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
      showcaseJson: JSON.stringify({"livestreamUrl": "https://stream.xpo-mice.example/live/asia-ai-summit-2026", "livestreamLive": false, "programs": [{"kind": "bounty", "title": "Summit Build Challenge", "detail": "Overnight hackathon. Winners announced at closing plenary.", "sponsor": "Organizing Committee"}], "alerts": ["Badge pickup opens one hour before the opening keynote."], "channels": [], "attested": true, "attestedBy": "seed", "attestedAt": "2026-10-01T00:00:00Z"}),
      tagline: "Building Autonomous Multi-Agent Systems, LLMs & Next-Gen Cloud Infrastructure",
      description: "Asia premier technical gathering for software engineers, AI researchers, and cloud architects. Featuring deep-dive keynotes, live code teardowns, multi-model LLM workshops, and an overnight 24-hour hackathon.",
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
          { name: "Builder Pass", price: 250000, currency: "IDR", capacity: 4000, benefitsJson: JSON.stringify(["Access to all 4 Keynote Tracks", "Hackathon Entry Eligibility", "Official Dev Swag Bag & T-Shirt"]) },
          { name: "VIP Full Access & Speaker Dinner", price: 1250000, currency: "IDR", capacity: 500, benefitsJson: JSON.stringify(["VIP Speaker Lounge Access", "Reserved Front-Row Keynote Seating", "Speaker Gala Dinner"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Opening Keynote: Autonomous Multi-Agent Orchestration", speakerName: "Dr. Maya Sastro", speakerRole: "VP AI Research", location: "Nusantara Hall 2", startTime: new Date("2026-10-08T09:00:00Z"), endTime: new Date("2026-10-08T10:30:00Z"), track: "AI Keynote" },
        ],
      },
      booths: {
        create: [
          { companyName: "Google Cloud & Antigravity Labs", boothNumber: "Tech Pavilion A1", hallName: "Hall 1", industry: "Cloud AI Infrastructure", websiteUrl: "https://cloud.google.com" },
        ],
      },
      perks: {
        create: [
          { title: "VIP Speaker Lounge & High-Speed Fiber WiFi", description: "Dedicated quiet zone with 10Gbps dedicated fiber internet.", tierRequired: "VIP", iconName: "Wifi" },
        ],
      },
    },
  });

  const event3 = await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueJIExpo.id,
      title: "Pekan Raya Jakarta (Jakarta Fair Kemayoran 2026)",
      slug: "pekan-raya-jakarta-2026",
      tagline: "The Largest & Longest-Running Consumer Mega Fair in Southeast Asia",
      description: "Celebrate Jakarta anniversary with 33 consecutive days of mega consumer expositions, 500+ culinary tenants, massive automotive launches, nightly open-air music concerts, and grand midnight fireworks.",
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
        heroBadge: "33-Day Mega Fair",
      }),
      ticketTiers: {
        create: [
          { name: "General Fair Entry (Non-Concert)", price: 40000, currency: "IDR", capacity: 100000, benefitsJson: JSON.stringify(["Full Access to Halls A, B, C, D & Open Space"]) },
          { name: "Fair Entry + Main Concert Pass", price: 100000, currency: "IDR", capacity: 25000, benefitsJson: JSON.stringify(["Full Fair Access", "Open Space Concert Arena Entry"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Grand Opening Ceremony & Pyro-Musical Fireworks Show", speakerName: "Governor of Jakarta", location: "Open Space Stage", startTime: new Date("2026-06-10T19:00:00Z"), endTime: new Date("2026-06-10T21:00:00Z"), track: "Ceremony" },
        ],
      },
      booths: {
        create: [
          { companyName: "Astra Honda Motor Mega Pavilion", boothNumber: "Hall A - Mega 01", hallName: "Hall A", industry: "Automotive", websiteUrl: "https://astra-honda.com" },
        ],
      },
      perks: {
        create: [
          { title: "Grand Tenant Discount & Promo Radar", description: "Exclusive digital coupon book with discounts up to 70%.", iconName: "Tag" },
        ],
      },
    },
  });

  // 6.2 JAPAN EVENTS
  const tokyoHalls = await prisma.venueHall.findMany({ where: { venueId: venueTokyo.id } });
  const eastHalls = tokyoHalls.find((h) => h.name.includes("East")) || tokyoHalls[0];

  await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionJp.id,
      venueId: venueTokyo.id,
      venueHallId: eastHalls.id,
      title: "Tokyo International Robotics & Mechatronics Expo 2026",
      slug: "tokyo-robotics-expo-2026",
      tagline: "Humanoid Robotics, Autonomous Mobility & Industrial AI Automation",
      description: "The world foremost robotics exhibition held at Tokyo Big Sight East Halls. Discover breakthrough humanoid robots, collaborative arms, surgical mechatronics, and autonomous factory logistics.",
      archetype: "TECH_DEV_SUMMIT",
      startDate: new Date("2026-11-18T10:00:00Z"),
      endDate: new Date("2026-11-21T17:00:00Z"),
      isFeatured: true,
      scale: "LARGE",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
      brandingConfigJson: JSON.stringify({
        primaryColor: "#2563eb",
        accentColor: "#06b6d4",
        heroBadge: "Tokyo Big Sight • Robotics Keynote",
      }),
      ticketTiers: {
        create: [
          { name: "General Trade Pass", price: 3000, currency: "JPY", capacity: 30000, benefitsJson: JSON.stringify(["All East Halls Access", "Live Demonstration Arena", "Robotics Industry Guidebook"]) },
          { name: "Executive Delegate & Lab Tour", price: 15000, currency: "JPY", capacity: 2000, benefitsJson: JSON.stringify(["VIP Lounge Access", "Exclusive Lab Guided Tour", "Executive Reception Dinner"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Humanoid Robot Autonomy & Physical AI Keynote", speakerName: "Dr. Kenji Takahashi", speakerRole: "Director of Robotics Research, University of Tokyo", location: "East Hall 1 Stage", startTime: new Date("2026-11-18T10:30:00Z"), endTime: new Date("2026-11-18T12:00:00Z"), track: "Humanoid AI" },
        ],
      },
      booths: {
        create: [
          { companyName: "Fanuc Corporation Tokyo", boothNumber: "East Hall 2 - Booth 201", hallName: "East Hall 2", industry: "Robotics", websiteUrl: "https://fanuc.co.jp" },
          { companyName: "Yaskawa Electric Robotics", boothNumber: "East Hall 3 - Booth 310", hallName: "East Hall 3", industry: "Mechatronics", websiteUrl: "https://yaskawa.co.jp" },
        ],
      },
      perks: {
        create: [
          { title: "VIP Robot Lab Tour & Private Hospitality Lounge", description: "Exclusive tour of experimental humanoid robotics testbeds with engineering leads.", tierRequired: "VIP", iconName: "Cpu" },
        ],
      },
    },
  });

  const makuhariHalls = await prisma.venueHall.findMany({ where: { venueId: venueMakuhari.id } });
  await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionJp.id,
      venueId: venueMakuhari.id,
      venueHallId: makuhariHalls[0]?.id,
      title: "Tokyo Comic & Gaming Championship 2026",
      slug: "tokyo-gaming-championship-2026",
      showcaseJson: JSON.stringify({"livestreamUrl": "", "livestreamLive": false, "programs": [{"kind": "lineup", "title": "Championship Finals", "detail": "Top brackets on the main stage, Sunday afternoon.", "sponsor": ""}, {"kind": "lineup", "title": "Creator Meet & Greet", "detail": "Scheduled signing sessions. Slots released daily at 10:00.", "sponsor": ""}], "alerts": [], "channels": [], "attested": true, "attestedBy": "seed", "attestedAt": "2026-10-01T00:00:00Z"}),
      tagline: "Esports Championship Arena, Indie Creator Alley & Anime Premieres",
      description: "Japan premier digital entertainment festival at Makuhari Messe with world championship esports finals, voice actor panels, and massive merchandise booths.",
      archetype: "POP_CULTURE_GAMING",
      startDate: new Date("2026-09-24T09:30:00Z"),
      endDate: new Date("2026-09-27T18:30:00Z"),
      isFeatured: true,
      scale: "LARGE",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200",
      brandingConfigJson: JSON.stringify({
        primaryColor: "#e11d48",
        accentColor: "#ec4899",
        heroBadge: "Makuhari Messe • Esports Arena",
      }),
      ticketTiers: {
        create: [
          { name: "Standard Day Pass", price: 3500, currency: "JPY", capacity: 50000, benefitsJson: JSON.stringify(["Exhibition Halls 1-8 Access", "Cosplay Area", "Creator Alley"]) },
          { name: "VIP Fast-Pass & Creator Alley Meetup", price: 18000, currency: "JPY", capacity: 3000, benefitsJson: JSON.stringify(["Priority Gate 1 Entry", "Esports Reserved Seating", "Official Swag Pack"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Grand Esports Finals & Championship Trophy Ceremony", speakerName: "Esports League Council", location: "Makuhari Event Hall", startTime: new Date("2026-09-27T15:00:00Z"), endTime: new Date("2026-09-27T18:00:00Z"), track: "Esports Finals" },
        ],
      },
      booths: {
        create: [
          { companyName: "Bandai Namco Entertainment", boothNumber: "Hall 1 - Mega 01", hallName: "Hall 1", industry: "Gaming", websiteUrl: "https://bandainamcoent.co.jp" },
        ],
      },
      perks: {
        create: [
          { title: "Limited Edition Collector Merchandise Voucher", description: "Redeem commemorative artbook and character figures at Hall 5 Official Store.", iconName: "Gift" },
        ],
      },
    },
  });

  // 6.3 GLOBAL EVENTS
  const mbsHalls = await prisma.venueHall.findMany({ where: { venueId: venueMBS.id } });
  await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionGlobal.id,
      venueId: venueMBS.id,
      venueHallId: mbsHalls[0]?.id,
      title: "Global FinTech & Institutional Investment Summit 2026",
      slug: "singapore-fintech-summit-2026",
      showcaseJson: JSON.stringify({"livestreamUrl": "", "livestreamLive": false, "programs": [{"kind": "pitch", "title": "Startup Pitch Hour", "detail": "Five early-stage teams, ten minutes each, investor Q&A follows.", "sponsor": "Organizing Committee"}], "alerts": [], "channels": [], "attested": true, "attestedBy": "seed", "attestedAt": "2026-10-01T00:00:00Z"}),
      tagline: "Cross-Border Capital, Sovereign Wealth & AI-Driven Asset Management",
      description: "High-level financial assembly bringing together central bank governors, institutional investors, sovereign wealth funds, and leading fintech innovators at Marina Bay Sands.",
      archetype: "FINANCE_INVESTOR",
      startDate: new Date("2026-11-04T09:00:00Z"),
      endDate: new Date("2026-11-06T18:00:00Z"),
      isFeatured: true,
      scale: "LARGE",
      format: "HYBRID",
      heroImageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200",
      brandingConfigJson: JSON.stringify({
        primaryColor: "#059669",
        accentColor: "#d97706",
        heroBadge: "Marina Bay Sands • Sovereign Wealth",
      }),
      ticketTiers: {
        create: [
          { name: "Executive Delegate Pass", price: 495, currency: "USD", capacity: 2500, benefitsJson: JSON.stringify(["All Plenary Stages", "Networking App Access", "Financial Tech Report"]) },
          { name: "VIP Investor Deal-Room Pass", price: 1250, currency: "USD", capacity: 400, benefitsJson: JSON.stringify(["Sands Grand Ballroom VIP Table", "Private 1-on-1 VC Deal-Rooms", "Gala Networking Dinner"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "Sovereign Wealth Keynote: Cross-Border Liquidity in Asian Markets", speakerName: "Elena Rostova", speakerRole: "Managing Director, Global Capital Partners", location: "Sands Grand Ballroom Level 5", startTime: new Date("2026-11-04T09:30:00Z"), endTime: new Date("2026-11-04T11:00:00Z"), track: "Institutional Capital" },
        ],
      },
      booths: {
        create: [
          { companyName: "Temasek Digital Assets Hub", boothNumber: "Sands Pavilion A1", hallName: "Sands Expo Hall A", industry: "Investment & VC", websiteUrl: "https://temasek.com.sg" },
        ],
      },
      perks: {
        create: [
          { title: "VIP Private Deal-Room & Executive Lounge Access", description: "Private soundproof conference suite with concierge refreshments at Level 5.", tierRequired: "VIP", iconName: "Briefcase" },
        ],
      },
    },
  });

  const frankfurtHalls = await prisma.venueHall.findMany({ where: { venueId: venueFrankfurt.id } });
  await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionGlobal.id,
      venueId: venueFrankfurt.id,
      venueHallId: frankfurtHalls[0]?.id,
      title: "Frankfurt Smart Factory & Heavy Machinery Expo 2026",
      slug: "frankfurt-smart-factory-2026",
      tagline: "Industry 4.0, Additive Manufacturing & Precision Tooling at Messe Frankfurt",
      description: "Europe premier industrial trade fair at Messe Frankfurt showcasing automated assembly lines, digital twin simulations, and high-precision CNC tooling.",
      archetype: "INDUSTRIAL_B2B",
      startDate: new Date("2026-10-14T09:00:00Z"),
      endDate: new Date("2026-10-17T18:00:00Z"),
      isFeatured: true,
      scale: "LARGE",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200",
      brandingConfigJson: JSON.stringify({
        primaryColor: "#0284c7",
        accentColor: "#0369a1",
        heroBadge: "Messe Frankfurt • Industry 4.0",
      }),
      ticketTiers: {
        create: [
          { name: "Trade Visitor 3-Day Pass", price: 120, currency: "USD", capacity: 45000, benefitsJson: JSON.stringify(["Hall 12 & Hall 3 Floor Access", "Digital Machinery Catalogue"]) },
          { name: "VIP Buyer Executive Lounge", price: 650, currency: "USD", capacity: 2000, benefitsJson: JSON.stringify(["Fast-Track North Gate Entry", "Messe Club Lounge Access", "Supplier Matchmaking Concierge"]) },
        ],
      },
      agendaItems: {
        create: [
          { title: "European Industrial Digital Twins & Robotics Summit", speakerName: "Dr. Johann Weber", speakerRole: "Head of Advanced Manufacturing, Fraunhofer", location: "Hall 12 Main Forum", startTime: new Date("2026-10-14T10:00:00Z"), endTime: new Date("2026-10-14T11:30:00Z"), track: "Industry 4.0" },
        ],
      },
      booths: {
        create: [
          { companyName: "Bosch Rexroth Industrial Drive", boothNumber: "Hall 12 - Stand A15", hallName: "Hall 12", industry: "Automation", websiteUrl: "https://boschrexroth.com" },
        ],
      },
      perks: {
        create: [
          { title: "VIP Executive Buyer Lounge & Fast-Track Entry", description: "Priority check-in and complimentary refreshments in the Messe Club.", tierRequired: "VIP", iconName: "ShieldCheck" },
        ],
      },
    },
  });


  // 6.3b Showcase verification events (one per remaining wired view)
  await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueJCC.id,
      title: "Jakarta Fashion & Beauty Trade Expo 2026",
      slug: "jakarta-fashion-beauty-2026",
      tagline: "Runway premieres, cosmetics OEM and wholesale showrooms",
      description: "Indonesian fashion labels, beauty manufacturers, and wholesale buyers across three JCC halls.",
      archetype: "FASHION_RETAIL",
      startDate: new Date("2026-11-05T09:00:00Z"),
      endDate: new Date("2026-11-08T18:00:00Z"),
      scale: "MEDIUM",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200",
      showcaseJson: JSON.stringify({"livestreamUrl": "", "livestreamLive": false, "programs": [{"kind": "runway", "title": "Opening Runway Premiere", "detail": "Designer collections open the expo on day one.", "sponsor": ""}, {"kind": "runway", "title": "Beauty OEM Sourcing Hour", "detail": "Private-label manufacturers meet wholesale buyers.", "sponsor": ""}], "alerts": [], "channels": [], "attested": true, "attestedBy": "seed", "attestedAt": "2026-10-01T00:00:00Z"}),
      ticketTiers: {
        create: [
          { name: "Trade Visitor Pass", price: 0, currency: "IDR", capacity: 8000, benefitsJson: JSON.stringify(["Exhibition Floor Access"]) },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueGBK.id,
      title: "Jakarta Sports & Outdoor Adventure Expo 2026",
      slug: "jakarta-sports-outdoor-2026",
      tagline: "Marathon race expo, trail gear trials and sports clinics",
      description: "Running race packet pickup, outdoor gear testing zones, and sports medicine consultations at GBK.",
      archetype: "SPORTS_OUTDOOR",
      startDate: new Date("2026-11-12T09:00:00Z"),
      endDate: new Date("2026-11-15T18:00:00Z"),
      scale: "MEDIUM",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
      showcaseJson: JSON.stringify({"livestreamUrl": "", "livestreamLive": false, "programs": [{"kind": "demo", "title": "Trail Gear Trial Zone", "detail": "Test footwear and packs on the indoor obstacle circuit.", "sponsor": ""}], "alerts": [], "channels": [], "attested": true, "attestedBy": "seed", "attestedAt": "2026-10-01T00:00:00Z"}),
      ticketTiers: {
        create: [
          { name: "Visitor Pass", price: 0, currency: "IDR", capacity: 12000, benefitsJson: JSON.stringify(["Exhibition Floor Access"]) },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      organizerId: organizerUser.id,
      regionId: regionId.id,
      venueId: venueJCC.id,
      title: "Nusantara Faith & Community Congress 2026",
      slug: "nusantara-faith-congress-2026",
      tagline: "Pilgrimage services, halal standards and community assemblies",
      description: "Travel operators, halal certification bodies, and community organizations at JCC Senayan.",
      archetype: "FAITH_PILGRIMAGE_CONGRESS",
      startDate: new Date("2026-12-02T09:00:00Z"),
      endDate: new Date("2026-12-04T18:00:00Z"),
      scale: "MEDIUM",
      format: "IN_PERSON",
      heroImageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200",
      showcaseJson: JSON.stringify({"livestreamUrl": "", "livestreamLive": false, "programs": [], "alerts": [], "channels": [{"code": "CH 1", "lang": "Arabic", "note": "Original keynote audio"}, {"code": "CH 2", "lang": "Indonesian", "note": ""}], "attested": true, "attestedBy": "seed", "attestedAt": "2026-10-01T00:00:00Z"}),
      ticketTiers: {
        create: [
          { name: "Community Pass", price: 0, currency: "IDR", capacity: 5000, benefitsJson: JSON.stringify(["Plenary Access"]) },
        ],
      },
    },
  });

  // 6.4 Seed Booking for Attendee
  const tiersEvent1 = await prisma.ticketTier.findMany({ where: { eventId: event1.id } });
  const vipTierEvent1 = tiersEvent1.find((t) => t.name.includes("VIP")) || tiersEvent1[0];

  await prisma.booking.create({
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
        summary: "Manufacturing Indonesia 2026 registration velocity increased by 42% week-over-week. Heavy interest concentrated in Smart Robotics (Hall A) and CNC Tooling.",
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

  console.log("✓ Seeded realistic events across Indonesia, Japan, and Global hubs");
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
