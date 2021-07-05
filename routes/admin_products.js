var express=require('express');
var bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var router=express.Router();
var mkdirp=require('mkdirp');
var fs=require('fs-extra');
var resizeImg=require('resize-img');
var isImg = require('../tests/imageValidator');
var auth=require('../config/auth');
var isAdmin=auth.isAdmin;

//get product model
var Product=require('../models/product');

//get category model
var Category=require('../models/category');

//get products index
router.get("/",isAdmin,function(req,res){
    var count;
    Product.count(function(err,c){
      count=c;
    });

    Product.find(function(err,products){
      res.render('admin/products',{
        products: products,
        count: count
      });
    });
});

// get add products
router.get("/add-product",isAdmin,function(req,res){
    var title = "";
    var desc = "";
    var price = "";

    Category.find(function(err,categories)
    {
      res.render('admin/add_product',{
        title: title,
        desc: desc,
        categories: categories,
        price: price
      });
    });
});

//post add product
router.post('/add-product',[
    body('title', 'title must have a value').notEmpty(),
    body('desc', 'Description must have a value').notEmpty(),
    body('price', 'Price must have a decimal value').isDecimal(),
    body('image').custom( (val , {req}) => {
        if(!req.files){return true;}
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
        if (!isImg(val, imageFile)){
            throw new Error('You must include an Image');
        };
        return true;
    })

] ,(req, res)=>{

   var title = req.body.title;
   var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();
   var price = req.body.price;
   var desc = req.body.desc;
   var category = req.body.category;
   if(!req.files){ imageFile =""; }
   if(req.files){
   var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
   }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return  Category.find().then((categories) =>{
        res.render('admin/add_product', {
            errors: errors.array(),
            title: title,
            desc: desc,
            price: price,
            categories: categories
        });
      }).catch((err)=>{console.log(err)});
   }


   Product.findOne({slug: slug}).then((product)=>{
       if(product){
           req.flash('danger', 'product exsits, choose another name');
           Category.find().then((categories) =>{
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                price: price,
                categories: categories
            });
          });

       } else{
           var price2  = parseFloat(price).toFixed(2);

           var product = new Product({
            title: title,
            slug: slug,
            desc: desc,
            price: price2,
            category: category,
            image: imageFile
           })

           product.save((err)=>{
               if(err){console.log(err);}

               mkdirp('public/images/product_imgs/'+product._id)
               .then(()=>{
                    mkdirp('public/images/product_imgs/'+product._id+'/gallery')
               .then(()=>{
                        mkdirp('public/images/product_imgs/'+product._id+'/gallery/thumbs')
                .then(()=>{
                    if(imageFile != ""){
                        var productImage = req.files.image;
                        var path = 'public/images/product_imgs/'+product._id+'/'+imageFile;

                        productImage.mv(path, (err)=>{

                         if(err) return res.status(500).send(err);

                            req.flash('success', 'product added')
                            res.redirect('/admin/products');

                        });


                                     } else{

                                        req.flash('success', 'product added with Default Image')
                                        res.redirect('/admin/products');

                                     }

                        })
                    })
               })


           });
       }
   }).catch((err)=>{console.log(err)});
})



// get edit products


router.get('/edit-product/:id',isAdmin,(req, res)=>{

    var errors;
    if(req.session.errors){ errors = req.session.errors }
    req.session.errors = null;


    Category.find().then((cats) =>{
        Product.findById(req.params.id).then((p)=>{
            var galleryDir = __dirname+'/../public/images/product_imgs/'+p._id+'/gallery';
            var galleryImgs = null;
            fs.readdir(galleryDir).then((files)=>{
                galleryImgs= files;
                res.render('admin/edit_product', {
                    title: p.title,
                    desc: p.desc,
                    price: p.price,
                    categories: cats,
                    category: p.category.replace(/\s+/g,'-').toLowerCase(),
                    image: p.image,
                    galleryImages: galleryImgs,
                    errors: errors,
                    id: p._id
                });


            })
        })



  }).catch((err)=>{console.log(err)});

})

/*
* POST Edit product
*/
router.post('/edit-product/:id',[
    body('title', 'title must have a value').notEmpty(),
    body('desc', 'Description must have a value').notEmpty(),
    body('price', 'Price must have a decimal value').isDecimal(),
    body('image').custom( (val , {req}) => {
        if(!req.files) { return true; }

        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
        if (!isImg(val, imageFile)){
            throw new Error('You must include an Image');
        };
        return true;
    })
] ,(req, res)=>{

    var title = req.body.title;
    var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();
    var price = req.body.price;
    var desc = req.body.desc;
    var category = req.body.category;
    var imageFile;
    if(!req.files){ imageFile =""; }
    else if(req.files.image){ imageFile = req.files.image.name }
    console.log('imageFile', imageFile);



    var id = req.params.id.trim();
 var pimage = req.body.pimage;




    const errors = validationResult(req);
    if (!errors.isEmpty()) {


        Categorey.find().then((cats) =>{
            Product.findById(req.params.id).then((p)=>{
                var galleryDir = __dirname+'/../public/images/product_imgs/'+p._id+'/gallery';
                var galleryImgs = null;
                fs.readdir(galleryDir).then((files)=>{
                    galleryImgs= files;
                   return  res.render('admin/edit_product', {
                        title: p.title,
                        desc: p.desc,
                        price: p.price,
                        categories: cats,
                        category: p.category.replace(/\s+/g,'-').toLowerCase(),
                        image: p.image,
                        galleryImages: galleryImgs,
                        errors: errors.errors,
                        id: p._id
                    });


                })
            })



      }).catch((err)=>{console.log(err)});


   }


   Product.findOne({slug: slug, _id:{ $ne: id }}).then((p)=>{
       if(p){
           req.flash('danger', 'product slug exsits, choose another Name');
           res.render('admin/edit_product', {
               title: p.title,
               desc: p.desc,
               price: p.price,
               categories: categories,
               category: p.category,
               image: p.image,
               galleryImgs: galleryImgs,
               errors: errors.array()
        });
       } else{
           Product.findById(id).then((p)=>{
               p.title = title;
               p.slug = title.replace(/\s+/g,'-').toLowerCase();
               p.desc = desc;
               p.price = parseFloat(price).toFixed(2);
               p.category = category;
               if(imageFile == "") {p.image = pimage;}
               else { p.image = imageFile; }



               p.save((err)=>{
                if(err){ return  console.log(err);}
                console.log('pimage', pimage);
                if(imageFile != ""){
                    if(pimage != "") {
                        fs.remove('public/images/product_imgs/'+id+'/'+pimage).then( () =>{
                        var productImage = req.files.image;
                        var path = 'public/images/product_imgs/'+id+'/'+imageFile;

                        productImage.mv(path, (err)=>{

                         if(err) return res.status(500).send(err);

                            req.flash('success', 'product Edited')
                            return res.redirect('/admin/products');

                        });

                        }
                        ).catch((err)=>{console.log(err)});
                    }
                        else{
                            var productImage = req.files.image;
                            var path = 'public/images/product_imgs/'+id+'/'+imageFile;

                            productImage.mv(path, (err)=>{

                             if(err) return res.status(500).send(err);

                                req.flash('success', 'product Edited, No previous image found')
                                return res.redirect('/admin/products');

                            });
                        }

                    } else {

                        req.flash('success', 'product Edited Without a new image')
                         res.redirect('/admin/products');




                }





            });
           })

       }
   }).catch((err)=>{console.log(err)});

})

//POST product gallery

router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/images/product_imgs/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/images/product_imgs/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});


 //  GET delete image

router.get('/delete-image/:image',isAdmin,function (req, res) {

    var originalImage = 'public/images/product_imgs/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/images/product_imgs/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});


 // GET delete product

router.get('/delete-product/:id',isAdmin,function (req, res) {

    var id = req.params.id;
    var path = 'public/images/product_imgs/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });

            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });

});

//export router
module.exports= router;
