const express = require('express');
// const path = require('path');
// const rootDir = require('../util/path');
// const adminData = require('./admin');

//const productController = require('../controllers/products');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
 
router.get('/',shopController.getIndex);
router.get('/products',shopController.getProducts);

router.get('/product/:productId',shopController.getProduct);
 
router.get('/cart',isAuth,shopController.getCart);

router.post('/cart',isAuth,shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders',isAuth, shopController.getOrders);

router.get('/checkout', isAuth, shopController.getCheckout);

//router.post('/create-order', isAuth, shopController.postOrder) 

router.get('/orders/:orderId', isAuth, shopController.getInvoice);
//router.get('/checkout',shopController.getCheckout);
module.exports = router;   