# Construction Field Management App

A comprehensive Construction Field Management System built with modern web technologies. This application helps construction companies manage projects, daily progress reports, team members, and site operations efficiently.

![Construction Management](https://img.shields.io/badge/Construction-Management-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-purple)
![NeonDB](https://img.shields.io/badge/NeonDB-PostgreSQL-green)
![Postman](https://img.shields.io/badge/API-Tested-orange)

## ✨ Features

- ** User Management**: Admin, Manager, Worker roles with role-based access control
- ** Project Management**: Create, read, update, and delete construction projects
- ** Daily Progress Reports (DPR)**: Track daily work, weather, materials, and challenges
- ** JWT Authentication**: Secure login and session management

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | Full-stack React framework | 15.0.0 |
| **TypeScript** | Type-safe JavaScript | 5.0.0 |
| **Prisma** | Database ORM | 5.10.0 |
| **NeonDB** | Serverless PostgreSQL | Latest |
| **JWT** | Authentication tokens | 9.0.0 |
| **bcryptjs** | Password hashing | 2.4.3 |
| **Postman** | API Testing & Documentation | - |

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- NeonDB account (free tier available)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/construction-field-management.git
cd construction-field-management
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
# Copy the example environment file
cp .env.example .env
```

4. **Configure your `.env` file**
```env
# Database Connection (NeonDB)
DATABASE_URL="postgresql://username:password@ep-your-neon-instance.neon.tech/dbname?sslmode=require"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database Setup

### Option 1: Using NeonDB (Recommended)

1. **Create a NeonDB account** at [neon.tech](https://neon.tech)
2. **Create a new project** and database
3. **Copy the connection string** from Neon Dashboard
4. **Update `.env`** with your connection string
5. **Run database migrations:**
```bash
npx prisma generate
npx prisma db push
```

6. **Seed the database with sample data:**
```bash
npx prisma db seed
```

### Option 2: Using Local PostgreSQL

```bash
# Install PostgreSQL locally
# Update DATABASE_URL in .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/construction_db"

# Run Prisma setup
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Database Studio
```bash
# Open Prisma Studio to view/edit database
npx prisma studio
```

## 📡 API Documentation

### Live API Testing
🔗 **[Postman Collection](https://sidd66.postman.co/workspace/Personal-Workspace~208509c3-6d5e-4e99-adff-8eaca3f79b0c/folder/38580206-674f320a-cb5f-4b82-90d6-7e95fe0d8c87?action=share&creator=38580206&ctx=documentation)**

### Base URL
```
http://localhost:3000/api
```

##  Testing

### Run API Tests
```bash
# Using the Postman collection
# Import the collection from the link above
```

### Manual Testing Flow
1. Login with admin credentials
2. Create a new project
3. Add daily progress reports
4. Test role-based permissions
5. Verify data persistence

##  Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
2. **Import project in Vercel**
3. **Add environment variables:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. **Deploy**

### Environment Variables for Production
```env
DATABASE_URL="your-neon-production-url"
JWT_SECRET="strong-production-secret"
NEXTAUTH_SECRET="production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

##  Database Schema

```prisma
model User {
  id            Int          @id @default(autoincrement())
  name          String
  email         String       @unique
  passwordHash  String
  phone         String?
  role          Role         @default(WORKER)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  createdProjects Project[]      @relation("ProjectCreator")
  dailyReports    DailyReport[]
}

model Project {
  id          Int           @id @default(autoincrement())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime?
  budget      Float?
  location    String?
  status      ProjectStatus @default(PLANNED)
  createdById Int
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  creator       User           @relation("ProjectCreator", fields: [createdById], references: [id])
  dailyReports  DailyReport[]
}

model DailyReport {
  id               Int      @id @default(autoincrement())
  projectId        Int
  userId           Int
  date             DateTime
  workDescription  String
  weather          String?
  workerCount      Int      @default(0)
  challenges       String?
  materialsUsed    String?
  equipmentUsed    String?
  safetyIncidents  String?
  nextDayPlan      String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  project Project @relation(fields: [projectId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
}
```

##  Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL in .env
   - Check NeonDB project is active
   - Ensure SSL is enabled (`?sslmode=require`)

2. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Confirm user exists in database

3. **Prisma Client Not Generated**
   ```bash
   npx prisma generate
   rm -rf node_modules/.prisma
   npm install
   ```

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

##  Acknowledgments

- [Next.js](https://nextjs.org) for the amazing framework
- [Prisma](https://prisma.io) for the excellent ORM
- [NeonDB](https://neon.tech) for serverless PostgreSQL

---
