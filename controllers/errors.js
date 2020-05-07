exports.get404 = (req,res,next)=>{
     //  res.status(404).send('<h1> Page not found </h1>');
     //  res.status(404).sendFile(path.join(__dirname,'views','page404.html'));
      res.render('404', {
      docTitle: 'Not Found',
      path:'/404',
      isAuthenticated: req.session.isLoggedIn
    });
     
}

exports.get500 = (req,res,next)=>{
  //  res.status(404).send('<h1> Page not found </h1>');
  //  res.status(404).sendFile(path.join(__dirname,'views','page404.html'));
   res.render('500', {
   docTitle: 'Error!',
   path:'/500',
   isAuthenticated: req.session.isLoggedIn
 });
  
}