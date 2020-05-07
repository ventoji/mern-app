const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);


const Product = require('../models/product');
// const Cart = require('../models/cart');
const Order = require('../models/order');
const ITEMS_PER_PAGE = 3;
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

    Product.find().countDocuments()
    .then(numberProducts => {
      totalItems = numberProducts;
      return  Product.find()
      .skip( (page - 1)*ITEMS_PER_PAGE )
      .limit(ITEMS_PER_PAGE)
    })
    .then((products)=> {
      res.render('shop/index',{ // views path
        prods: products, 
        docTitle: 'Shop', 
        path: '/',
        //totalProducts: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page -1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err=> {
      //console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    });
} 

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

    Product.find().countDocuments()
    .then(numberProducts => {
      totalItems = numberProducts;
      return  Product.find()
      .skip( (page - 1)*ITEMS_PER_PAGE )
      .limit(ITEMS_PER_PAGE)
    })
    .then((products)=> {
      res.render('shop/product-list',{ // views path
        prods: products, 
        docTitle: 'All Products', 
        path: '/products',
        //totalProducts: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page -1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err=> {
      //console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    });
 /*  Product.find()
  .then((products)=> {
      res.render('shop/product-list',{
        prods: products, 
        docTitle: 'All Products', 
        path: '/products',
     //   isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err=> {
      //console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    }); */
}
 
exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  console.log(productId);
  Product.findById(productId)
  .then((product) => {
   // console.log('detail',product);
    res.render('shop/product-detail',{
      product: product, 
      docTitle: product.title, 
      path: '/products',
   //   isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });

 // res.redirect('/');
}


exports.getCart = (req, res, next) => {
  //console.log(req.user.cart)
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
  //  console.log(user.cart.items);
    const products = user.cart.items;
    res.render('shop/cart', {
      path: '/cart',
      docTitle: 'Your Cart',
      products: products,
//      isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });

};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then((product) => {
    return req.user.addToCart(product);
  
  })
  .then(result => {
    //console.log(result);
    res.redirect('/cart');
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });

};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId; //productId; //productId

  req.user
  .deleteItemFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });

}

exports.getOrders = (req,res,next) => {
  Order.find({"user.userId": req.user._id})
  .then(orders => {
    res.render('shop/orders',{
      docTitle: 'Your Orders', 
      path: '/orders',
      orders: orders,
  //    isAuthenticated: req.session.isLoggedIn 
    })
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });
}

/*
exports.postOrder = (req,res,next) => {
 
  const token = req.body.stripeToken;
  let totalSum =0;
   
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    
    user.cart.items.forEach(p=> {
      totalSum += p.quantity * p.productId.price;
    });


    const products = user.cart.items;
    let total = 0;
    products.forEach(p => {
      total += p.quantity * p.productId.price;
    })
   res.render('shop/checkout',{
      docTitle: 'Checkout', 
      path: '/checkout',
      products: products,
      totalSum:  total,
     client_secret: paymentIntent.client_secret
    })
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });*/
 
exports.postOrder = (req,res,next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    const products = user.cart.items.map(i=>{
      return {quantity: i.quantity, product: {...i.productId._doc}}
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products
    });
    return order.save();
  })
  .then(result => {
       const paymentIntent = stripe.paymentIntents.create({
      amount: totalSum*100,
      currency: 'usd',
      description: 'Demo order',
      // Verify your integration in this guide by including this parameter
      metadata: { order_id: result._id.toString() },
      source: token
    })
      return req.user.clearCart();
     
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err=> {
      //console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    });
    //console.log(products);
}
 
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if(!order){
        return next(new Error('No order found.'));
      }
      if(order.user.userId.toString() !== req.user._id.toString()){
        return next(new Error('Unauthorized.'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);
/*       fs.readFile(invoicePath, (err,data) => {
        if(err){
          return next(err);
        }
        res.setHeader('Content-Type','application/pdf' );
        res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName +'"');
     // attachment
        res.send(data);
      }); */
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type','application/pdf' );
      res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName +'"');
    
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      //pdfDoc.text('Hello world');

      pdfDoc.fontSize(26).text('Invoice',{
        underline: true
      });
      pdfDoc.text('---------------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice +=  prod.quantity*prod.product.price;
        pdfDoc.fontSize(14).text(
            prod.product.title + 
            ' - ' + 
            prod.quantity + 
            ' x ' + ' $ ' + 
            prod.product.price
            );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total price: $' + totalPrice);
      pdfDoc.end();

      /* const file = fs.createReadStream(invoicePath);
      res.setHeader('Content-Type','application/pdf' );
      res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName +'"');
      file.pipe(res);   */
    })
    .catch(err=>next(err))

};

exports.getCheckout = (req,res,next) => {
  
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    
    const products = user.cart.items;
    let total = 0;
    products.forEach(p => {
      total += p.quantity * p.productId.price;
    })
   res.render('shop/checkout',{
      docTitle: 'Checkout', 
      path: '/checkout',
      products: products,
      totalSum:  total,
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

} 