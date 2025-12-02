// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await prisma.dailyReport.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log("Existing data cleared");

    // Create sample users (passwords are all "test123")
    console.log("Creating sample users...");

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@construction.com",
        passwordHash:
          "$2b$10$vn8KM3cRLYsZWt/A3.1xjuZfLBH0DerwXjzBp6cQ9H8jdwhrch5wu", // test123
        role: "ADMIN",
      },
    });

    const manager = await prisma.user.create({
      data: {
        name: "Project Manager",
        email: "manager@construction.com",
        passwordHash:
          "$2b$10$f7cU.oe4XTpd8A3kYeNcTeGJfa7dFohfbydcP.BBaZCDsKiKIF.QO", // test123
        role: "MANAGER",
      },
    });

    const worker = await prisma.user.create({
      data: {
        name: "Site Worker",
        email: "worker@construction.com",
        passwordHash:
          "$2b$10$FhwTnKIap2p/EvVZFFfjYuksC0ItKmrODrXObBHjUhp96WDSYqhuO", // test123
        role: "WORKER",
      },
    });

    console.log("Sample users created");
    console.log(`Admin: admin@construction.com / test123`);
    console.log(`Manager: manager@construction.com / test123`);
    console.log(`Worker: worker@construction.com / test123`);

    // Create sample project
    console.log("Creating sample project...");

    const project = await prisma.project.create({
      data: {
        name: "Highway Construction Project",
        description: "Construction of 10km highway with bridges",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        budget: 5000000,
        location: "City Center to Suburb",
        status: "ACTIVE",
        createdById: admin.id,
      },
    });

    console.log(`Project created: ${project.name}`);

    // Create sample daily reports
    console.log("Creating sample daily reports...");

    const reports = [
      {
        projectId: project.id,
        userId: worker.id,
        date: new Date("2024-01-15"),
        workDescription:
          "Completed excavation for section A. Started foundation work for bridge 1.",
        weather: "Sunny, 25°C",
        workerCount: 25,
        challenges: "Heavy machinery delivery delayed by 2 hours",
        materialsUsed:
          "Cement: 100 bags, Steel rods: 2 tons, Gravel: 50 cubic meters",
        equipmentUsed: "Excavator x2, Concrete mixer x3, Crane x1, Trucks x5",
      },
      {
        projectId: project.id,
        userId: worker.id,
        date: new Date("2024-01-16"),
        workDescription:
          "Continued foundation work. Started pouring concrete for pillars.",
        weather: "Cloudy, 22°C",
        workerCount: 30,
        challenges: "Concrete mixer broke down, had to rent replacement",
        materialsUsed:
          "Cement: 150 bags, Steel: 3 tons, Concrete: 100 cubic meters",
        equipmentUsed: "Concrete mixer x4, Crane x2, Vibrators x6",
      },
    ];

    for (const reportData of reports) {
      await prisma.dailyReport.create({
        data: reportData,
      });
    }

    console.log("Created 2 daily reports");
    console.log("Database seeding completed successfully!");
  } catch (error: any) {
    console.error("Seeding error:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
