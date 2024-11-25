const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seed = async () => {
  const products = Array.from({ length: 20 }, (_, i) => ({
    title: `Product ${i + 1}`,
    description: `Description for Product ${i + 1}`,
    price: (i + 1) * 10,
  }));

  try {
    await prisma.product.createMany({ data: products });
    console.log('Database seeded with products!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
