const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const { validationResult } = require('express-validator');
const User = require('../models/user');
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.API_KEY
  }
}));
exports.getLogin = (req, res, next) => {  
 /*  const isLoggedIn = req
  .get('Cookie')
  .split(';')[2]
  .trim()
  .split('=')[1]; */

  console.log(req.session);
 let message = req.flash('error');
  if(message.length > 0 ){
    message = message[0];
  }else{
    message = null;
  }

    res.render('auth/login',{
      docTitle: 'Login Page', 
      path: '/login',
      errorMessage: message,
      oldInput: { 
        email: '', 
        password: ''
      },
      validationErrors: []
     // isAuthenticated: false
    });
}; 

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  
  //console.log('ENTRA',errors.formatter);

  if(!errors.isEmpty()){

    return res.status(422).render('auth/login',{
      docTitle: 'Login', 
      path: '/login',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email, 
        password: password
      },
      validationErrors: errors.array()
      //isAuthenticated: false
    });
  }
  console.log(email);

  User.findOne({email: email})
   .then(user => {
     console.log('USER ',user);
    if(!user){
     // req.flash('error', 'Invalid email or password.');
     // return res.redirect('/login');
      return res.status(422).render('auth/login',{
        docTitle: 'Login', 
        path: '/login',
        errorMessage: 'Invalid email or password.',
        oldInput: { 
          email: email, 
          password: password
        },
        validationErrors: errors.array()
        //isAuthenticated: false
      });
    } 
    bcrypt
    .compare(password, user.password)
    .then(doMatch => {
      if(doMatch){
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err)=> {
          console.log(err);
         // req.flash('error', 'Invalid email or password.');
          res.redirect('/');
        });
      }

      return res.status(422).render('auth/login',{
        docTitle: 'Login', 
        path: '/login',
        errorMessage: 'Invalid email or password.',
        oldInput: { 
          email: email, 
          password: password
        },
        validationErrors: errors.array()
        //isAuthenticated: false
      });
      //req.flash('error', 'Invalid email or password.');
      // res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
      //req.flash('error', 'Invalid email or password.');
      res.redirect('/login');
    });
  
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });
  //req.isLoggedIn = true;

//  res.setHeader('Set-Cookie', 'isLoggedIn=true')

}; 
exports.getSignup = (req,res,next) => {
  let message = req.flash('error');
  const errors = validationResult(req);
  if(message.length > 0 ){
    message = message[0];
  }else{
    message = null;
  }
  res.render('auth/singup',{
    docTitle: 'Sinup', 
    path: '/singup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: errors.array()
    //isAuthenticated: false
  });
};

exports.postSignup = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;
 // const confirmPassword = req.body.passwordConf;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth/singup',{
      docTitle: 'Sinup', 
      path: '/singup',
      errorMessage: errors.array()[0].msg,
      oldInput: { 
        email: email, 
        password: password
      },
      validationErrors: errors.array()
      //isAuthenticated: false
    });
  }
     bcrypt.hash(password,12)
     .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save();
     })
     .then(result => {
      res.redirect('/login');
        transporter.sendMail({
         to: email,
         from: 'shop@comple-node.com',
         subject: 'Signup succeeded',
         html: '<h1> You succesfully signed up!</h1>'
       });
    })
    .catch(err => {
     // console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    })
};


exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req,res, next) => {
  let message = req.flash('error');
  if(message.length > 0 ){
    message = message[0];
  }else{
    message = null;
  }
  res.render('auth/reset',{
    docTitle: 'Reset password', 
    path: '/reset',
    errorMessage: message
    //isAuthenticated: false
  });
};

exports.postReset = (req,res, next) => {
  crypto.randomBytes(32,(err, buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email:req.body.email})
    .then(user => {
      if(!user){
        req.flash('error', 'No account with that email found.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'shop@comple-node.com',
        subject: 'Password reset',
        html: `
         <p> You requested a password rest </p>
         <p> Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>

         `
      });
    })
    .catch(err=> {
      //console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    });
  })
//  next();
};

exports.getNewPassword = (req, res, next) => {
 
  const token = req.params.token;
 
  User.findOne({
    resetToken: token, 
    resetTokenExpiration: { $gt: Date.now() }  
  })
  .then(user => {
    console.log(user);
    let message = req.flash('error');
    if(message.length > 0 ){
      message = message[0];
    }else{
      message = null;
    }
    res.render('auth/new-password',{
      docTitle: 'New Password', 
      path: '/new-password',
      errorMessage: message,
      userId:user._id.toString(),
      passwordToken: token
      //isAuthenticated: false
    });
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
  .then(user => {
    resetUser = user;
  //  console.log(user);
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
 
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err=> {
    //console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500; 
    return next(error);
  });
};