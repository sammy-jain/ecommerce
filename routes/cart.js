var express=require('express');
var router=express.Router();

//get Product model
var Product=require('../models/product');

//get add product to cart
router.get("/add/:product",function(req,res){

  var slug=req.params.product;

  Product.findOne({slug:slug},function(err,p){
    if(err)console.log(err);

    if(typeof req.session.cart=="undefined"){
      req.session.cart=[];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(p.price).toFixed(2),
        image: '/images/product_imgs/'+p._id+'/'+p.image
      });
    }else{
      var cart=req.session.cart;
      var newItem=true;

      cart.map((item)=>{
                if(item.title == slug){
                    item.qty++;
                    newItem = false;
                    return;
                }

          });

      if(newItem){
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(p.price).toFixed(2),
          image: '/images/product_imgs/'+p._id+'/'+p.image
        });
      }
    }
    // console.log(req.session.cart);
    res.redirect('back');
  });
});

//get checkout page
router.get("/checkout",function(req,res){
  if(req.session.cart && req.session.cart.length==0)
  {
    delete req.session.cart;
    res.redirect('/cart/checkout');
  }else{
    res.render('checkout',{
      title: 'checkout',
      Cart: req.session.cart
    });
  }
});

//get update product
router.get("/update/:product",function(req,res){

  var slug=req.params.product;

  var cart=req.session.cart;
  var action=req.query.action;

  for(var i=0;i<cart.length;i++)
  {
    if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
  }

  res.redirect('/cart/checkout');
});

//get clear cart
router.get('/clear',function(req,res){
  delete req.session.cart;
  res.redirect('/cart/checkout');
});

//get buy now cart
router.get('/buynow',function(req,res){
  delete req.session.cart;
  res.sendStatus(200);
});

//exports
module.exports=router;
