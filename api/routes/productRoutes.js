const express = require('express');
const { getProducts, getProductById } = require('../controllers/productController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getProducts);                    
router.get('/:id', authenticateUser, getProductById); 

module.exports = router;
