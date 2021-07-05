var express=require('express');
var router=express.Router();
var bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var auth=require('../config/auth');
var isAdmin=auth.isAdmin;

//get category model
var Category=require('../models/category');


//get category index
router.get("/",isAdmin,function(req,res){
    Category.find(function(err,categories){
      if(err)return console.log(err);
      res.render('admin/categories',{
        categories: categories
      });
    });
});

//get add categories
router.get("/add-category",isAdmin,function(req,res){
    var title = "";

    res.render('admin/add_category',{
      title: title
    });
});

//post add category
router.post("/add-category",urlencodedParser,[
      body('title', 'title must have a value')
      .notEmpty(),
    ],(req,res)=>{

    var title=req.body.title;
    var slug=title.replace(/\s+/g,'-').toLowerCase();

      var errors = validationResult(req);
      if(errors.isEmpty()){
            Category.findOne({slug: slug},function(err,category){
              if(category){
                req.flash('danger','page title exist, choose another one');
                res.render('admin/add_category',{
                  title: title
                });
              }else{
                var category=new Category({
                  title: title,
                  slug: slug
                });

                category.save(function(err){
                  if(err)
                  {
                    return console.log(err);
                  }
                  Category.find(function (err,categories){
                    if(err){
                      console.log(err);
                    }else{
                      req.app.locals.categories=categories;
                    }
                  });
                  req.flash('success','category added');
                  res.redirect('/admin/categories');
                });
              }
            });
          }
          else{
            res.render('admin/add_category',{
              errors: errors.array(),
              title: title
            });
          }
});

//get edit category
router.get("/edit-category/:id",function(req,res){
    Category.findById(req.params.id,function(err,category){
      if(err)
      {
        return console.log(err);
      }

      res.render('admin/edit_category',{
        title: category.title,
        id: category._id
      });
    });
});

//post edit category
router.post("/edit-category/:id",urlencodedParser,[
      body('title', 'title must have a value')
      .notEmpty(),
    ],(req,res)=>{

    var title=req.body.title;
    var slug=title.toLowerCase();
    var id=req.params.id.trim();

      var errors = validationResult(req);
      if(errors.isEmpty()){
            Category.findOne({slug: slug, _id:{'$ne':id}},function(err,category){
              if(category){
                req.flash('danger','category title exist, choose another one');
                res.render('admin/edit_category',{
                  title: title,
                  id: id
                });
              }else{
                Category.findById(id,function(err,category){
                  if(err)return console.log(err);

                  category.title=title;
                  category.slug=slug;

                  category.save(function(err){
                    if(err)
                    {
                      return console.log(err);
                    }
                    Category.find(function (err,categories){
                      if(err){
                        console.log(err);
                      }else{
                        req.app.locals.categories=categories;
                      }
                    });
                    req.flash('success','Category edited!');
                    res.redirect('/admin/categories/edit-category/'+id);
                  });
                });
              }
            });
          }
          else{
            res.render('admin/edit_category',{
              errors: errors.array(),
              title: title,
              id: id
            });
          }
});

//get delte category
router.get('/delete-category/:id',isAdmin,function(req,res){
    Category.findByIdAndRemove(req.params.id,function(err){
      if(err)return console.log(err);
      Category.find(function (err,categories){
        if(err){
          console.log(err);
        }else{
          req.app.locals.categories=categories;
        }
      });
        req.flash('success','Category deleted');
        res.redirect('/admin/categories/');
    });
});

//exports
module.exports=router;
