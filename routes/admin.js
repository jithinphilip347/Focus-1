var express = require('express');
var router = express.Router();
var multer = require('multer')
var path = require('path');
const adminController = require('../controller/adminController');


const isAdminLoggedIn = (req, res, next) => {
  if (req.session.isAdminLoggedIn) {
    return next(); 
  }
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



  const bannerStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../public/images/banners'))
    },
    filename:(req,file,cb)=>{
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
  })
  
//   const upload = multer({storage:storage})
  const bannerUpload = multer({storage:bannerStorage})



/* GET users listing. */
router.get('/',adminController.getAdminlogin)
// router.get('/adminslogin',adminController.getAdminlogin)
router.post('/adminlogin',adminController.adminLogin)
// Add this route to your admin router file
router.get('/logout', adminController.adminLogout);
router.get('/dashboard',adminController.dashboardLoad)



router.get('/admin-categories', adminController.showCategories);
router.post('/addCategory', adminController.addCategory);
// router.post('/editcategory',adminController.editCategory)
router.get('/admin-users',adminController.userFind);



router.get('/addbanners',adminController.addBanner)
router.post('/addbanners',bannerUpload.single('image'),adminController.bannerImage)
router.get('/activatebanner/:id',adminController.activateBanner)
router.get('/removebanner/:id',adminController.removeBanner)


router.get('/removecategory/:id',adminController.removecategory)
router.get('/admin-products', adminController.showProducts);
router.get('/admin-addproducts',adminController.addproductForm)
router.post('/addProduct',upload.array('image',5),adminController.addProduct)
router.get('/edit-product',adminController.editProduct)
router.post('/edit-product',adminController.updateProduct)
router.get('/deleteProduct/:id',adminController.deleteProduct)


router.get('/userBlock', adminController.userBlock); 
router.get('/userUnblock', adminController.userUnblock);

router.get('/blocked-users', adminController.viewBlockedUsers);

router.get('/admin-orders',adminController.getOrders)
router.post('/update-status', adminController.updateOrderStatus);
router.get('/view-orders/:id',adminController.viewOrders);


// router.get('/return_details',adminController.returnDetails)
// router.post('/pickupstatus',adminController.pickupStatus)
// router.get('/returninfo/:id',adminController.returnInfo)


router.get('/admin-coupon',adminController.couponLoad)
router.post('/addcoupon',adminController.addCoupon)
router.post('/editcoupon',adminController.editCoupon)
router.get('/deletecoupon',adminController.deleteCoupon)


router.get('/sales_report',adminController.getSalesReportPage)

router.post('/sales_report',adminController.fetchingSalesReport)


module.exports = router;
