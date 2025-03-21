const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true 
  },
  password: {
    type: String,
    required: true 
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
      productId: {type: Schema.Types.ObjectId, ref:'Product',required: true },
       quantity: { type: Number, required: true }
    }
  ]
  }
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  }); 
 // product.quantity = 1;
 let newQuantity =1;
 const updateCartItems = [...this.cart.items];

 if(cartProductIndex >=0 ){
   newQuantity = this.cart.items[cartProductIndex].quantity +1;
   updateCartItems[cartProductIndex].quantity = newQuantity;
 }else{
   updateCartItems.push({
     productId: product._id, 
     quantity: newQuantity
    })
 }
  const updateCart = { 
    items: updateCartItems
  };
  this.cart = updateCart;
  return this.save();
}

userSchema.methods.deleteItemFromCart = function(productId){
  const updatedCartItems = this.cart.items.filter(item =>
    item.productId.toString() !== productId.toString()
  );

  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.clearCart = function () {
  this.cart = {items: []};
  return this.save();
}

module.exports = mongoose.model('User', userSchema);


/* const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;
class User {
  constructor(username, email, cart, id){
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id; // ? new mongodb.ObjectId(id): null;
  }

  save(){
    const db = getDb();
  
    return db.collection('users')
            .insertOne(this)
//.then(result => console.log(result))
//                .catch( err => console.log(err))
  }

  addOrder() {
    const db = getDb();
    return this.getCart().then(products=>{
      const order = {
        items: products,
        user: {
          _id: new ObjectId(this._id),
          name: this.name
        }
      };
      return db.collection('orders').insertOne(order)
    }) 
    .then(result => {
      this.cart = {items: []};
       return db
              .collection('users')
              .updateOne(
                { _id: new ObjectId(this._id) },
                { $set: {cart: {items: [] }}}
              );

    });
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders')
    .find({'user._id': new ObjectId(this._id)})
    .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) })
      .then(user => {
        console.log(user);
        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }

  addToCart(product){
     const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    }); 
   // product.quantity = 1;
   let newQuantity =1;
   const updateCartItems = [...this.cart.items];

   if(cartProductIndex >=0 ){
     newQuantity = this.cart.items[cartProductIndex].quantity +1;
     updateCartItems[cartProductIndex].quantity = newQuantity;
   }else{
     updateCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity})
   }
    const updateCart = { 
      items: updateCartItems
    };
    const db = getDb();
    return db
      .collection('users')
      .updateOne({_id: new  ObjectId(this._id)},{
      $set: {cart: updateCart }
    })

  }

  getCart(){
    const db = getDb();
    const productsIds = this.cart.items.map(i=>{
      return i.productId;
    });
    return db.collection('products').find({
      _id: {$in: productsIds}
    })
    .toArray()
    .then(products => {
      return products.map(p => {
        return {...p,quantity: this.cart.items.find(i=>{
          return i.productId.toString() === p._id.toString();
        }).quantity
      };
      });
    });
    //return this.cart;
  }

  deleteItemFromCart(productId){
    const updatedCartItems = this.cart.items.filter(item =>
      item.productId.toString() !== productId.toString()
    );
    const db = getDb();
    return db
          .collection('users')
          .updateOne(
            {_id: new ObjectId(this._id)},
            {$set: {cart: {items: updatedCartItems}}}
          );

  }
}

module.exports = User; */