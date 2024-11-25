const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedProducts = async () => {
  try {
    const products = Array.from({ length: 20 }, (_, i) => ({
      title: `Product ${i + 1}`,
      description: `This is the description for Product ${i + 1}`,
      price: (Math.random() * 100).toFixed(2), 
    }));

   
    await prisma.product.createMany({
      data: products,
    });

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedProducts();
