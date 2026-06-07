import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.member.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Database...');

  // Everyone gets the same default password for testing
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create the Workspace
  const org = await prisma.organization.create({
    data: {
      id: 'default-org',
      name: 'Workspace Global',
      joinCode: 'TEAM2026',
      tier: 'Pro',
    }
  });

  // 2. Define the INITIAL_DATA members
  const initialMembers = [
    { id: 'd1', name: 'Budi Santoso', email: 'budi@divisio.com', role: 'Pemimpin Tim', roleType: 'leader', division: 'Desain' },
    { id: 'd2', name: 'Ani Wijaya', email: 'ani@divisio.com', role: 'Pengembang Senior', roleType: 'member', division: 'Teknik' },
    { id: 'd3', name: 'Siti Aminah', email: 'siti@divisio.com', role: 'Ketua Pemasaran', roleType: 'member', division: 'Pemasaran' },
    { id: 'd4', name: 'Bambang Subiakto', email: 'bambang@divisio.com', role: 'Sekretaris', roleType: 'leader', division: 'Manajemen' },
  ];

  // 3. Insert Users and link them as Members
  for (const m of initialMembers) {
    const user = await prisma.user.create({
      data: {
        id: m.id, 
        name: m.name,
        email: m.email,
        password: hashedPassword,
      }
    });

    await prisma.member.create({
      data: {
        role: m.role,
        roleType: m.roleType,
        division: m.division,
        userId: user.id,
        orgId: org.id
      }
    });
  }

  console.log('✅ Database successfully seeded! 🌱');
  console.log('You can now log in with: budi@divisio.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });