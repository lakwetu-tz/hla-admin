import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed: Starting database seeding...');

  // 1. Roles
  const roles = [
    { name: 'super_admin' },
    { name: 'event_manager' },
    { name: 'finance_manager' }
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: { name: roleData.name }
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  const eventManagerRole = await prisma.role.findUnique({ where: { name: 'event_manager' } });
  const financeManagerRole = await prisma.role.findUnique({ where: { name: 'finance_manager' } });

  // 2. Permissions
  const permissionNames = [
    'dashboard', 'applications', 'halls', 'invoices', 'payments',
    'users', 'reports', 'settings', 'placements', 'tickets', 'analytics'
  ];

  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // 3. Users
  const hashedPassword = await bcrypt.hash('logistica@2025', 10);
  
  // Super Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hortilogistica.africa' },
    update: {
      name: 'Enock Okonkwo',
      password: hashedPassword
    },
    create: {
      email: 'admin@hortilogistica.africa',
      name: 'John Okonkwo',
      password: hashedPassword,
      isVerified: true
    }
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: superAdminRole.id }
    });
  }

  // Event Manager
  const eventUser = await prisma.user.upsert({
    where: { email: 'events@hortilogistica.africa' },
    update: {
      name: 'Amara Diallo',
      password: hashedPassword
    },
    create: {
      email: 'events@hortilogistica.africa',
      name: 'Amara Diallo',
      password: hashedPassword,
      isVerified: true
    }
  });

  if (eventManagerRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: eventUser.id, roleId: eventManagerRole.id } },
      update: {},
      create: { userId: eventUser.id, roleId: eventManagerRole.id }
    });
  }

  // Finance Manager
  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@hortilogistica.africa' },
    update: {
      name: 'Kwame Asante',
      password: hashedPassword
    },
    create: {
      email: 'finance@hortilogistica.africa',
      name: 'Kwame Asante',
      password: hashedPassword,
      isVerified: true
    }
  });

  if (financeManagerRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: financeUser.id, roleId: financeManagerRole.id } },
      update: {},
      create: { userId: financeUser.id, roleId: financeManagerRole.id }
    });
  }

  console.log('Seed: Completed successfully.');
  console.log('--- Admin: admin@hortilogistica.africa / logistica@2025');
  console.log('--- Events: events@hortilogistica.africa / logistica@2025');
  console.log('--- Finance: finance@hortilogistica.africa / logistica@2025');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
