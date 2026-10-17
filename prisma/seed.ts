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
          { name: "Meeting Room 501", capacity: 80, floorAreaSqm: 120, description: "Convention Centre Level 5 breakout, 13 x 9 m." },
          { name: "Meeting Room 502", capacity: 96, floorAreaSqm: 110, description: "Convention Centre Level 5 breakout, 12 x 9 m." },
          { name: "Meeting Room 503", capacity: 154, floorAreaSqm: 120, description: "Convention Centre Level 5 breakout, 16 x 8 m." },
          { name: "Meeting Room 504", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 5 breakout, 16 x 10 m." },
          { name: "Meeting Room 505", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 5 breakout, mirror of 504." },
          { name: "Meeting Room 506", capacity: 110, floorAreaSqm: 130, description: "Convention Centre Level 5 breakout, 16 x 8 m." },
          { name: "Meeting Room 507", capacity: 200, floorAreaSqm: 210, description: "Largest Level 5 breakout, 19 x 10 m." },
          { name: "Meeting Rooms 503-506 Combined", capacity: 690, floorAreaSqm: 570, description: "Combinable partition block on Level 5." },
          { name: "Meeting Room 601", capacity: 80, floorAreaSqm: 120, description: "Convention Centre Level 6 breakout, 13 x 9 m." },
          { name: "Meeting Room 602", capacity: 96, floorAreaSqm: 90, description: "Smallest Level 6 breakout, 12 x 7 m." },
          { name: "Meeting Room 603", capacity: 154, floorAreaSqm: 120, description: "Convention Centre Level 6 breakout, 16 x 8 m." },
          { name: "Meeting Room 604", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 6 breakout, 16 x 10 m." },
          { name: "Meeting Room 605", capacity: 198, floorAreaSqm: 160, description: "Convention Centre Level 6 breakout, mirror of 604." },
          { name: "Meeting Room 606", capacity: 198, floorAreaSqm: 130, description: "Convention Centre Level 6 breakout, 16 x 8 m." },
          { name: "Meeting Room 607", capacity: 200, floorAreaSqm: 210, description: "Largest Level 6 breakout, 19 x 10 m." },
          { name: "Meeting Rooms 603-606 Combined", capacity: 748, floorAreaSqm: 570, description: "Combinable partition block on Level 6." },
          { name: "Semeru 1", capacity: 500, floorAreaSqm: 455, description: "Trade Mart ballroom half, 5.5 m ceiling." },
          { name: "Semeru 2", capacity: 500, floorAreaSqm: 455, description: "Trade Mart ballroom half, 5.5 m ceiling." },
          { name: "Lawu 1", capacity: 300, floorAreaSqm: 324, description: "Trade Mart ballroom half, 4.5 m ceiling." },
          { name: "Lawu 2", capacity: 300, floorAreaSqm: 324, description: "Trade Mart ballroom half, 4.5 m ceiling." },
          { name: "Bromo 1", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Bromo 2", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Bromo 3", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Bromo 4", capacity: 60, floorAreaSqm: 108, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Kerinci 1", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Kerinci 2", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Kerinci 3", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Kerinci 4", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting quarter, 3.5 m ceiling." },
          { name: "Rinjani 1", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting third, 3.5 m ceiling." },
          { name: "Rinjani 2", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting third, 3.5 m ceiling." },
          { name: "Rinjani 3", capacity: 60, floorAreaSqm: 126, description: "Trade Mart meeting third, 3.5 m ceiling." },
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
          { name: "Exhibition Hall 1", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 2", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 3", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 4", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 5", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 6", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 7", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 8", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 9", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Exhibition Hall 10", capacity: 4750, floorAreaSqm: 4860, description: "Column-free hall, 54 x 90 m, for trade fairs, concerts and sports." },
          { name: "Nusantara Hall", capacity: 3500, floorAreaSqm: 4000, description: "Divisible convention hall (1A, 1B, 2, 3) for plenaries, weddings and graduations." },
          { name: "Garuda 1", capacity: 48, floorAreaSqm: 120, description: "First-floor breakout, 12 x 10 m, 5 m ceiling." },
          { name: "Garuda 2", capacity: 72, floorAreaSqm: 126, description: "First-floor breakout, 14 x 9 m, 5 m ceiling." },
          { name: "Garuda 3", capacity: 72, floorAreaSqm: 126, description: "First-floor breakout, 14 x 9 m, 5 m ceiling." },
          { name: "Garuda 5A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 5B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 6A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 6B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 7A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 7B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 8A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 8B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 9A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 9B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda 10", capacity: 120, floorAreaSqm: 180, description: "First-floor breakout, 18 x 10 m, 5 m ceiling." },
          { name: "Garuda Main Hall 1A", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda Main Hall 1B", capacity: 168, floorAreaSqm: 306, description: "First-floor breakout, 18 x 17 m, 5 m ceiling." },
          { name: "Garuda Main Hall 2A", capacity: 168, floorAreaSqm: 306, description: "First-floor breakout, 18 x 17 m, 5 m ceiling." },
          { name: "Garuda Main Hall 2B", capacity: 72, floorAreaSqm: 153, description: "First-floor breakout, 17 x 9 m, 5 m ceiling." },
          { name: "Garuda Main Hall 1", capacity: 276, floorAreaSqm: 459, description: "First-floor main hall, 27 x 17 m, 5 m ceiling." },
          { name: "Garuda Main Hall 2", capacity: 276, floorAreaSqm: 459, description: "First-floor main hall, 27 x 17 m, 5 m ceiling." },
          { name: "Cendana 1", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { name: "Cendana 2", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { name: "Cendana 3", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { name: "Cendana 5", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { name: "Cendana 6", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { name: "Cendana 7", capacity: 50, floorAreaSqm: 76, description: "Mezzanine breakout, 9 x 8.5 m, 6 m ceiling." },
          { name: "Kalimaya 1", capacity: 60, floorAreaSqm: 104, description: "Lower-ground breakout, 13 x 8 m, 4 m ceiling." },
          { name: "Kalimaya 2", capacity: 60, floorAreaSqm: 104, description: "Lower-ground breakout, 13 x 8 m, 4 m ceiling." },
          { name: "Kalimaya 3", capacity: 60, floorAreaSqm: 104, description: "Lower-ground breakout, 13 x 8 m, 4 m ceiling." },
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
          { name: "Plenary Hall", capacity: 5000, floorAreaSqm: null, description: "Domed theatre for presidential keynotes and medical congresses." },
          { name: "Assembly Hall", capacity: 3900, floorAreaSqm: 3921, description: "Partitionable banquet hall, 89.1 x 44 m, seats up to 3,900." },
          { name: "Cendrawasih Room", capacity: 2000, floorAreaSqm: 2109, description: "Partitionable conference hall with interpretation booths." },
          { name: "Exhibition Hall A", capacity: null, floorAreaSqm: 3060, description: "Exhibition-only floor, 68 x 45 m, 1,200 kg per sqm loading." },
          { name: "Exhibition Hall B", capacity: null, floorAreaSqm: 6075, description: "Exhibition-only floor, 97.5 x 60 m, 1,500 kg per sqm loading." },
          { name: "Main Lobby", capacity: null, floorAreaSqm: 5500, description: "Registration, exhibition and pre-function lobby." },
          { name: "Merak Room", capacity: 850, floorAreaSqm: 886, description: "Divisible into Merak 1, 2 and 3 for board and breakout sessions." },
          { name: "Kasuari Lounge", capacity: 700, floorAreaSqm: 755, description: "Lower-lobby lounge for receptions and VIP holding." },
          { name: "Lower Lobby", capacity: 1000, floorAreaSqm: 1100, description: "Lower-level exhibition and registration space by the meeting rooms." },
          { name: "Merak Room 1", capacity: 270, floorAreaSqm: 294, description: "Lower-lobby boardroom third, 3.5 m ceiling." },
          { name: "Merak Room 2", capacity: 270, floorAreaSqm: 294, description: "Lower-lobby boardroom third, 3.5 m ceiling." },
          { name: "Merak Room 3", capacity: 270, floorAreaSqm: 294, description: "Lower-lobby boardroom third, 3.5 m ceiling." },
          { name: "Nuri Room 1", capacity: 140, floorAreaSqm: 182, description: "Lower-lobby meeting room, 14.8 x 12.3 m." },
          { name: "Nuri Room 2", capacity: 60, floorAreaSqm: 70, description: "Lower-lobby meeting room, 7.3 x 9.6 m." },
          { name: "Nuri Rooms 1 and 2 Combined", capacity: 220, floorAreaSqm: 252, description: "Combinable Nuri pair." },
          { name: "Maleo Room", capacity: 60, floorAreaSqm: 77, description: "Lower-lobby meeting room, 7.3 x 10.6 m." },
          { name: "Murai Room", capacity: 60, floorAreaSqm: 77, description: "Lower-lobby meeting room, 7.3 x 10.6 m." },
          { name: "Kenari Room", capacity: 60, floorAreaSqm: 77, description: "Lower-lobby meeting room, 7.3 x 10.6 m." },
          { name: "Kakatua Room", capacity: 140, floorAreaSqm: 156, description: "Lower-lobby meeting room, 14.8 x 10.6 m." },
          { name: "Summit Room", capacity: 150, floorAreaSqm: 210, description: "Lower-lobby boardroom, 22.5 x 15 m." },
          { name: "Summit Lounge", capacity: 200, floorAreaSqm: 276, description: "Lower-lobby VIP lounge, 13.56 x 20.38 m." },
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
          { name: "Nakula 1", capacity: 69, floorAreaSqm: 202, description: "Convention-building meeting room, classroom 69." },
          { name: "Nakula 2", capacity: 33, floorAreaSqm: 118, description: "Convention-building meeting room, classroom 33." },
          { name: "Nakula 3", capacity: 32, floorAreaSqm: 118, description: "Convention-building meeting room, classroom 32." },
          { name: "Nakula 5A", capacity: 59, floorAreaSqm: 178, description: "Convention-building meeting room, classroom 59." },
          { name: "Nakula 5B", capacity: 59, floorAreaSqm: 178, description: "Convention-building meeting room, classroom 59." },
          { name: "Nakula 6", capacity: 41, floorAreaSqm: 137, description: "Convention-building meeting room, classroom 41." },
          { name: "Nakula 7", capacity: 42, floorAreaSqm: 138, description: "Convention-building meeting room, classroom 42." },
          { name: "Nakula 8", capacity: 30, floorAreaSqm: 111, description: "Convention-building meeting room, classroom 30." },
          { name: "Sadewa 1", capacity: 39, floorAreaSqm: 132, description: "Convention-building meeting room, classroom 39." },
          { name: "Sadewa 2", capacity: 45, floorAreaSqm: 146, description: "Convention-building meeting room, classroom 45." },
          { name: "Sadewa 3", capacity: 41, floorAreaSqm: 138, description: "Convention-building meeting room, classroom 41." },
          { name: "Sadewa 3A", capacity: 16, floorAreaSqm: 76, description: "Convention-building meeting room, classroom 16." },
          { name: "Sadewa 5", capacity: 59, floorAreaSqm: 178, description: "Convention-building meeting room, classroom 59." },
          { name: "Sadewa 6", capacity: 80, floorAreaSqm: 228, description: "Largest convention-building meeting room, classroom 80." },
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
          { name: "VIP Tribune and Premium Rooms", capacity: null, floorAreaSqm: null, description: "VIP tribune, special VIP rooms and 200 wheelchair seats with companions." },
          { name: "Outdoor Plaza and Pedestrian Ramp", capacity: null, floorAreaSqm: null, description: "Public plaza, prayer plaza and ramp links toward BMW Park." },
          { name: "VVIP West Lobby", capacity: null, floorAreaSqm: null, description: "West-side VVIP arrival lobby used for event hospitality." },
          { name: "VVIP Waiting Room and Royal Lounge", capacity: null, floorAreaSqm: null, description: "Mezzanine hospitality lounge for VVIP guests." },
          { name: "Press Conference and Media Room", capacity: null, floorAreaSqm: null, description: "Tiered press room with media workroom." },
          { name: "Corporate Box VIP Area", capacity: null, floorAreaSqm: null, description: "Suite-style corporate hospitality boxes." },
          { name: "Training-Field Multipurpose Rooms", capacity: null, floorAreaSqm: null, description: "Two multipurpose rooms in the training-field support block." },
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
          { name: "East Exhibition Halls 1-8", capacity: 40000, floorAreaSqm: 38000, description: "Japan largest exhibition hall complex." },
          { name: "West Exhibition Halls 1-4", capacity: 25000, floorAreaSqm: 22000, description: "Atrium-connected multi-tier tech halls." },
          { name: "South Exhibition Halls 1-4", capacity: 22000, floorAreaSqm: 20000, description: "Ultra-modern robotics and AI conference facilities." },
          { name: "Conference Tower (Inverted Pyramid)", capacity: 5000, floorAreaSqm: 6000, description: "International symposiums and executive committee rooms." },
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
          { name: "International Exhibition Halls 1-8", capacity: 38000, floorAreaSqm: 35000, description: "High-ceiling column-free halls for Tokyo Game Show." },
          { name: "Makuhari Event Hall (Arena)", capacity: 9000, floorAreaSqm: 7000, description: "Oval multipurpose arena for concerts and esports." },
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
          { name: "National Convention Hall of Yokohama", capacity: 5000, floorAreaSqm: 5000, description: "One of the largest international convention halls in Asia." },
          { name: "Exhibition Hall A-D", capacity: 20000, floorAreaSqm: 20000, description: "Spacious ocean-view exhibition floor." },
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
          { name: "Sands Expo Halls A-F (Basement 2)", capacity: 20000, floorAreaSqm: 30000, description: "Integrated flexible trade hall." },
          { name: "Grand Ballroom Level 5 (Sands Grand)", capacity: 8000, floorAreaSqm: 8000, description: "Southeast Asia largest ballroom." },
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
          { name: "Hall 12 (Ultra-Modern Pavilion)", capacity: 25000, floorAreaSqm: 33000, description: "State-of-the-art dual-level trade exhibition hall." },
          { name: "Hall 3 (Automotive Mega Stage)", capacity: 20000, floorAreaSqm: 28000, description: "Iconic multistory venue for international mobility expos." },
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
          { name: "ICC London Auditorium", capacity: 5000, floorAreaSqm: 6000, description: "UK premier plenary convention theatre." },
          { name: "Event Halls North & South", capacity: 35000, floorAreaSqm: 40000, description: "Continuous column-free international event space." },
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
