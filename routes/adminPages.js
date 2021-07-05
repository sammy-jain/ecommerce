var express=require('express');
var bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var router=express.Router();
var auth=require('../config/auth');
var isAdmin=auth.isAdmin;

//get page model
var Page=require('../models/page');

//get page index
router.get("/",isAdmin,function(req,res){
    Page.find({}).sort({sorting: 1}).exec(function (err,pages){
      res.render('admin/pages',{
        pages: pages
      });
    });
});

//add pages
router.get("/add-page",isAdmin,function(req,res){
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/addPage',{
      title: title,
      slug: slug,
      content: content
    });
});

//post add pages

router.post("/add-page",urlencodedParser,[
      body('title', 'title must have a value')
      .notEmpty(),
      body('content', 'content must have a value')
      .notEmpty(),
    ],(req,res)=>{

    var title=req.body.title;
    var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug=="")slug=title.replace(/\s+/g,'-').toLowerCase();
    var content=req.body.content;

      var errors = validationResult(req);
      if(errors.isEmpty()){
            Page.findOne({slug: slug},function(err,page){
              if(page){
                req.flash('danger','page slug exist, choose another one');
                res.render('admin/addPage',{
                  title: title,
                  slug: slug,
                  content: content
                });
              }else{
                var page=new Page({
                  title: title,
                  slug: slug,
                  content: content,
                  sorting: 100
                });

                page.save(function(err){
                  if(err)
                  {
                    return console.log(err);
                  }
                  Page.find({}).sort({sorting: 1}).exec(function (err,pages){
                    if(err){
                      console.log(err);
                    }else{
                      req.app.locals.pages=pages;
                    }
                  });
                  req.flash('success','page added');
                  res.redirect('/admin/pages');

                });
              }

            });
          }
          else{

            res.render('admin/addPage',{
              errors: errors.array(),
              title: title,
              slug: slug,
              content: content
            });

          }
});

//sort pages function
function sortPages(ids, callback){
  var count=0;
  for(var i=0;i<ids.length;i++)
  {
    var id=ids[i];
    count++;

    (function(count){
      Page.findById(id,function(err,page){
        page.sorting=count;
        page.save(function(err){
          if(err)
          {
            return console.log(err);
          }
          ++count;
          if(count>=ids.length){
            callback();
          }
        });
    });
  })(count);
  }
}

//post reorder pages
router.post('/reorder-pages',function(req,res){

    var ids=req.body['id[]'];

    sortPages(ids,function(){
      Page.find({}).sort({sorting: 1}).exec(function (err,pages){
        if(err){
          console.log(err);
        }else{
          req.app.locals.pages=pages;
        }
      });
    });
});

//get edit pages
router.get("/edit-page/:id",isAdmin,function(req,res){
    Page.findById(req.params.id,function(err,page){
      if(err)
      {
        return console.log(err);
      }

      res.render('admin/edit_page',{
        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id
      });
    });
});

//post edit pages
router.post("/edit-page/:id",urlencodedParser,[
      body('title', 'title must have a value')
      .notEmpty(),
      body('content', 'content must have a value')
      .notEmpty(),
    ],(req,res)=>{

    var title=req.body.title;
    var slug=req.body.slug;
    if(slug=="")slug=title;
    var content=req.body.content;
    var id=req.params.id;

      var errors = validationResult(req);
      if(errors.isEmpty()){
            Page.findOne({slug: slug, _id:{'$ne':id}},function(err,page){
              if(page){
                req.flash('danger','page slug exist, choose another one');
                res.render('admin/edit_page',{
                  title: title,
                  slug: slug,
                  content: content,
                  id: id
                });
              }else{
                
                Page.findById(id,function(err,page){
                  if(err)return console.log(err);

                  page.title=title;
                  page.slug=slug;
                  page.content=content;

                  page.save(function(err){
                    if(err)
                    {
                      return console.log(err);
                    }
                    Page.find({}).sort({sorting: 1}).exec(function (err,pages){
                      if(err){
                        console.log(err);
                      }else{
                        req.app.locals.pages=pages;
                      }
                    });
                    req.flash('success','page edited');
                    res.redirect('/admin/pages/edit-page/'+id);
                  });
                });
              }
            });
          }
          else{
            res.render('admin/edit_page',{
              errors: errors.array(),
              title: title,
              slug: slug,
              content: content,
              id: id
            });
          }
});

//get delte page
router.get('/delete-page/:id',isAdmin,function(req,res){
    // res.send('admin area');
    Page.findByIdAndRemove(req.params.id,function(err){
      if(err)return console.log(err);

      Page.find({}).sort({sorting: 1}).exec(function (err,pages){
        if(err){
          console.log(err);
        }else{
          req.app.locals.pages=pages;
        }
      });
        req.flash('success','page deleted');
        res.redirect('/admin/pages/');

    });
});

//exports
module.exports=router;
