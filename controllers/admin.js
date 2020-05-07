const {validationResult} = require('express-validator');
const Product = require('../models/product');
// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {

    res.render('admin/edit-product', {
         docTitle: 'Add product', 
         path: '/admin/add-product',
         editing: false,
         hasError: false,
         errorMessage: null,
         validationErrors: []
    //     isAuthenticated: req.session.isLoggedIn
        });
      // next();
};

exports.postAddProduct = (req,res,next)=> {
  const title = req.body.title;
  const image = req.file; //req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  console.log(image);
  if(!image){
    return res.status(422).render('admin/edit-product',{
      docTitle: 'Add Product', 
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
          title: title,
         // imageUrl: imageUrl,
          price: price,
          description: description
      },
      errorMessage: 'Attached image is not an image',
      validationErrors: []
  //    isAuthenticated: req.session.isLoggedIn
    });
  }
  //console.log(imageUrl);
  const errors = validationResult(req);


  if(!errors.isEmpty()){
    console.log(errors);
    return res.status(422).render('admin/edit-product',{
      docTitle: 'Add Product', 
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
          title: title,
        imageUrl: imageUrl,
          price: price,
          description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
  //    isAuthenticated: req.session.isLoggedIn
    });
  }
  const imageUrl = image.path;

  console.log(imageUrl);

  const product = new Product({
    title:title, 
    price:price, 
    description:description, 
   imageUrl:imageUrl,
    userId:req.user._id
  });
  product
  .save()
  .then((result)=>{
    console.log('Created Product');
    res.redirect('/admin/products');
  })
  .catch(err=> {
    //res.redirect('/500');
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });
  
};

exports.getProducts = (req,res,next)=> {
  //Product.findAll()
  Product.find({userId: req.user._id})
  // .select('title price -_id')
  // .populate('userId', 'name')
  .then((products)=> {
    console.log(products);
       res.render('admin/products',{
          prods: products, 
          docTitle: 'Admin Products', 
          path: '/admin/products',
  //        isAuthenticated: req.session.isLoggedIn
        });
    })
    .catch(err=> {
      //console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    });
};

exports.getEditProduct = (req,res,next)=> {
  const editMode = req.query.edit;
   if(!editMode){
    return res.redirect('/');
  } 
  const prodId = req.params.productId;
  //  Product.findByPk(prodId)
  //req.user.getProducts({where: {id: prodId} })
  Product.findById(prodId)
  .then(product => {
    //const product = products[0];
    if(!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product',{
      product: product,
      docTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: editMode,
      hasError: false,
      errorMessage: null,
      validationErrors: []
  //    isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });

};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file; //req.body.imageUrl;
  const updatedDest = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
      //  imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDest,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() != req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if(image){
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = updatedDest;
      return product.save()
        .then(result => {
        console.log('UPDATE PRODUCT!!');
        res.redirect('/admin/products');
      });
    })
    .catch(err=> {
      //console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    });

    
};


exports.deleteProduct = (req, res, next) => {
  //const prodId = req.body.productId;
  const prodId = req.params.productId;
  //Product.findByIdAndRemove(prodId)
 Product.findById(prodId)
  .then(product => {
    if(!product){
      return next(new Error('Product not found'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return  Product.deleteOne({_id: prodId, userId: req.user._id});
  })
   .then( () => {
    console.log('DESTROYED PRODUCT');
   // res.redirect('/admin/products');
   res.status(200).json({
     message: "Sucesss!"
   });
  })
  .catch(err=> {
    //console.log(err);
   /*  const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error); */

    res.status(500).json({
      message: "Deleting product failed"
    });
  });
  
}; 



    // next();
