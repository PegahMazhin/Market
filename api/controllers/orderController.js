const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      include: { items: true },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { date, note, productIds } = req.body;
  try {
    const order = await prisma.order.create({
      data: {
        date,
        note,
        customerId: userId,
        items: { connect: productIds.map((id) => ({ id })) },
      },
      include: { items: true },
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error creating order' });
  }
};

const getOrderById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });
    if (!order || order.customerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order' });
  }
};

module.exports = { getOrders, createOrder, getOrderById };
