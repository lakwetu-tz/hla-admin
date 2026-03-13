import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = ['super_admin', 'finance_manager', 'event_manager', 'exhibitor', 'buyer', 'visitor'];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  console.log('Roles seeded successfully.');

    // 2. Define Permissions
     const permissions = [
       'MANAGE_STAFF',
       'VIEW_AUDIT_LOGS',
       'MANAGE_APPLICATIONS',
       'MANAGE_HALLS',
       'MANAGE_INVOICES',
       'MANAGE_PAYMENTS',
       'VIEW_ANALYTICS'
     ];

  for (const permName of permissions) {
       await prisma.permission.upsert({
         where: { name: permName },
         update: {},
         create: { name: permName },
       });
     }

     console.log('Roles and Permissions seeded successfully.');

     // 3. Link All Permissions to Super Admin
     const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
     const allPermissions = await prisma.permission.findMany();

     if (superAdminRole) {
       for (const perm of allPermissions) {
         await prisma.rolePermission.upsert({
           where: {
             roleId_permissionId: {
               roleId: superAdminRole.id,
               permissionId: perm.id,
             },
           },
           update: {},
           create: {
             roleId: superAdminRole.id,
             permissionId: perm.id,
           },
         });
       }
     }

     // 4. Create initial SuperAdmin user
  const adminEmail = 'admin@hla.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Enock Samuel',
      password: hashedPassword,
      isVerified: true,
    },
  });


  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    });
  }

  console.log('Initial SuperAdmin created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
