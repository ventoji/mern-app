const express = require('express');
const {body} = require('express-validator');
//const path = require('path');

// const rootDir = require('../util/path');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product',isAuth ,adminController.getAddProduct);
router.post('/add-product',
    [
        body('title')
          .isString()
          .isLength({ min: 3 })
          .trim(),
      //  body('imageUrl').isURL().trim(),
        body('price').isFloat(),
        body('description')
          .isLength({ min: 5, max: 400 })
          .trim()
      ],
    isAuth,
    adminController.postAddProduct
);


router.get('/products',isAuth ,adminController.getProducts);
router.get('/edit-product/:productId',isAuth ,adminController.getEditProduct);

router.post('/edit-product', 
[
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
   // body('imageUrl').isURL().trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
    isAuth ,
    adminController.postEditProduct
);

//router.post('/delete-product', isAuth ,adminController.deleteProduct);
router.delete('/product/:productId', isAuth ,adminController.deleteProduct);

module.exports = router;
//exports.routes = router;
//exports.products= products;