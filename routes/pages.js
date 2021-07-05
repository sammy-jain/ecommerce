var express=require('express');
var router=express.Router();

//get page model
var Page=require('../models/page');

//get home page
router.get("/",function(req,res){
  Page.findOne({slug:'home'},function(err,page){
    if(err)console.log(err);
      res.render('home',{
        title: page.title,
        content: page.content
      });

  });

});

//get a pages
router.get("/:slug",function(req,res){
  var slug=req.params.slug;
  Page.findOne({slug:slug},function(err,page){
    if(err)console.log(err);
    if(!page){
      res.redirect('/');
    }
    else if(slug=="contact"){
      res.render('contact',{
        title: page.title,
        content: page.content
      });
    }
    else if(slug=="about"){
      res.render('about',{
        title: page.title,
        content: page.content
      });
    }
    else{
      res.render('index',{
        title: page.title,
        content: page.content
      });
    }
  });

});


//exports
module.exports=router;
