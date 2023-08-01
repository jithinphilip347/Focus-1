var express = require('express');
var User = require('../models/userSchema') 

var router = express.Router();
const bcrypt = require('bcrypt');
const userController = require('../controller/userController');
const orderController = require('../controller/orderController');
// let user={}
var multer = require('multer');
var path = require('path');

function checkLoggedIn(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}


const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,path.join(__dirname,'../public/images/siteproducts'))
  },
  filename:(req,file,cb)=>{
      const name = Date.now()+'-'+file.originalname
      cb(null,name)
  }
})
const upload = multer({storage:storage})
/* GET home page. */

router.get('/',userController.homeLoad);

// router.get('/sortproducts',userController.sortProducts)

// router.get('/category',userController.categorywiseLoad)

router.get('/login',userController.loginLoad);
router.post('/login', userController.loginCheck);
router.get('/logout',userController.logout)
router.get('/user-profile',checkLoggedIn, userController.userProfile);
router.post('/edit-user', upload.single('image'), userController.editProfile);
router.post('/change-password', userController.changePassword);

router.get('/manage-address',checkLoggedIn,userController.manageAddress);
router.get('/deleteaddress/:id',userController.deleteAddress);
router.post('/edit-address',checkLoggedIn,userController.editAddress);

// router.post('/default-address/:id', userController.setDefaultAddress);



router.get('/signup',userController.loadSign);
router.post('/signup', userController.otpMailVerify);
router.post('/otpcheck',userController.otpCheck)


router.get('/forget-password',userController.resetpageLoad);
router.post('/emailcheck',userController.resetOtp);
router.post('/otpverify',userController.otpVerify)

router.get('/otp-varification',userController.otpSign);

router.post('/send-otp',userController.sendOtp)

router.post('/varify-otp',userController.otpVarify);

router.get('/resend-otp',userController.resendOtp)
router.post('/resend-otp',userController.resendotpVarify);


router.post('/reset-password',userController.resetPassword)


router.get('/productsearch',userController.searchProduct);
router.get('/sortproducts',userController.sortProducts);
router.get('/sortorders',userController.sortorders);

 router.get('/shop-products',userController.shoppingPage);

 router.get('/shoping-cart',checkLoggedIn,userController.shoppingCart);
 router.get('/removecart/:id', userController.removecart);

//  router.post('/apply-coupon',userController.applyCoupon)

 router.post('/changequantity',userController.changeQuantity)

 router.get('/product-details/:id', userController.getproductDetails);

 router.get('/checkout', checkLoggedIn, userController.checkOut);

//  router.post('/checkout/findAddress',checkLoggedIn,userController.checkOut);

router.get('/addtoCart/:id',userController.getaddtoCart);

router.post('/add-address',checkLoggedIn,userController.userAddress);
router.get('/order-details/',checkLoggedIn,orderController.orderDetails);



// router.get('/payment',orderController.orderPayment)
// router.post('/confirm_order',userController.confirmOrder)
router.post('/place-order',checkLoggedIn,orderController.placeOrder);
router.post('/createOrder',orderController.createOrder)
router.post('/payment_success',orderController.paymentSuccess)
router.get('/ordersuccess',orderController.orderSuccess)

//WishList
router.get('/wishlist',checkLoggedIn,userController.wishlistLoad)
router.get('/addwishlist/',checkLoggedIn,userController.addToWishlist)
router.get('/removeWishlist/',userController.removeWishlist)



router.post('/cancel-order', orderController.cancelOrder);
// router.get('/cancelorder/:orderId/:prodId',orderController.orderCancel)
// router.post('/return-order',orderController.returnOrder)



module.exports = router;



