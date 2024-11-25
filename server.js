const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const SECRET_KEY = "your-secret-key";

app.use(express.json());

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Forbidden');
    req.user = user;
    next();
  });
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    const token = jwt.sign({ id: user.id }, SECRET_KEY);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY);
  res.json({ token });
});

app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { orders: true },
  });

  if (!product) return res.status(404).send('Product not found');

  if (req.header('Authorization')) {
    authenticateToken(req, res, async () => {
      const userOrders = await prisma.order.findMany({
        where: { customerId: req.user.id, items: { some: { id: parseInt(id) } } },
      });
      res.json({ ...product, userOrders });
    });
  } else {
    res.json(product);
  }
});

app.get('/orders', authenticateToken, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user.id },
    include: { items: true },
  });
  res.json(orders);
});

app.post('/orders', authenticateToken, async (req, res) => {
  const { date, note, productIds } = req.body;

  const order = await prisma.order.create({
    data: {
      date,
      note,
      customerId: req.user.id,
      items: { connect: productIds.map((id) => ({ id })) },
    },
  });

  res.status(201).json(order);
});

app.get('/orders/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: true },
  });

  if (!order) return res.status(404).send('Order not found');
  if (order.customerId !== req.user.id) return res.status(403).send('Forbidden');

  res.json(order);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
