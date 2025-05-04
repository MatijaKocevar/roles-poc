# Role-Based Access Control System

A sophisticated Next.js application implementing hierarchical role-based access control (RBAC) for managing assets, permissions, and user access profiles.

## Features

- **Hierarchical Asset Management**
  - Portfolios
  - Regulation Groups
  - Regulation Units
  - Inherited permissions across asset hierarchy

- **Role-Based Access Control**
  - Fine-grained permission system
  - Custom access profiles
  - Module-level access control
  - Permission inheritance

- **User Management**
  - Multiple user roles (Super Admin, Company Manager, Portfolio Manager, etc.)
  - User asset assignment
  - Access profile management

- **Modern Tech Stack**
  - Next.js 15 with App Router and Turbopack
  - TypeScript for type safety
  - Prisma ORM for database management
  - Tailwind CSS for styling
  - ShadcnUI components

## Project Structure

```
├── actions/         # Server actions for data operations
├── app/            # Next.js app router pages
├── components/     # Reusable React components
├── data/          # Static data and configurations
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── prisma/        # Database schema and migrations
└── types/         # TypeScript type definitions
```

## Prerequisites

- Node.js 18 or higher
- PostgreSQL or SQLite database
- npm

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd roles-poc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   ./reset-db.sh
   ```

4. Start the development server:
   ```bash
   npm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Concepts

### Asset Hierarchy
- Portfolios can contain multiple Regulation Groups
- Regulation Groups can contain multiple Regulation Units
- Permissions cascade down the hierarchy

### User Roles
- SUPER_ADMIN: Full system access
- COMPANY_MANAGER: Company-wide access
- PORTFOLIO_MANAGER: Portfolio-level access
- REG_GROUP_MANAGER: Regulation Group access
- UNIT_MANAGER: Unit-level access

### Access Profiles
Custom permission sets that can be assigned to users for specific assets, defining their access levels for different modules.

## Module Structure

- Trading
  - Overview
  - History
  - Autobidder
- Models
  - Optimization
  - Activation
- Archive
  - Realtime
- Management
  - Users
  - Access Profiles
  - Companies
- Reports
  - Settlements
  - Logs
- Settings
  - Account
  - General

## License

MIT
