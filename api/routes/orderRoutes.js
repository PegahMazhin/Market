const express = require('express');
const { getOrders, createOrder, getOrderById } = require('../controllers/orderController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authenticateUser, getOrders);         
router.post('/', authenticateUser, createOrder);      
router.get('/:id', authenticateUser, getOrderById);   

module.exports = router;
