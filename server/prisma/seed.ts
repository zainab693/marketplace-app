import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.upsert({
    where: { id: 's1' },
    update: {},
    create: { id: 's1', name: 'Campus Store' }
  });

  await prisma.product.createMany({
    data: [
      { title: 'Notebook', description: 'A5 ruled', price: 5, currency: 'USD', category: 'Stationery', storeId: store.id, images: '[]' },
      { title: 'Gel Pen',  description: 'Blue ink', price: 2,  currency: 'USD', category: 'Stationery', storeId: store.id, images: '[]' },
      { title: 'Water Bottle', description: 'BPA-free', price: 3, currency: 'USD', category: 'Accessories', storeId: store.id, images: '[]' }
    ],
    skipDuplicates: true
  });

  await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: { name: 'Vera Vendor', email: 'vendor@example.com', password: 'vendor123', roles: 'vendor', storeId: store.id }
  });

  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: { name: 'Carl Customer', email: 'customer@example.com', password: 'customer123', roles: 'customer' }
  });
}

main().finally(() => prisma.$disconnect());