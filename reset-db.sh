#!/bin/bash
# Drop and recreate the database, then seed

# Drop the database and reapply migrations without prompting for confirmation
npx prisma migrate reset --force

# Run the seed script
npx prisma db seed
