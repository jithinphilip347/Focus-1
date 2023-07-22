var express = require('express');
var router = express.Router();
var multer = require('multer')
var path = require('path');

const adminController = require('../controller/adminController');

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

/* GET users listing. */
router.get('/',adminController.getAdminlogin)
// router.get('/adminslogin',adminController.getAdminlogin)
router.post('/adminlogin',adminController.adminLogin)


router.get('/admin-categories', adminController.showCategories);
router.post('/addCategory', adminController.addCategory);
// router.post('/editcategory',adminController.editCategory)
router.get('/admin-users',adminController.userFind);
 
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


router.get('/admin-coupon',adminController.couponLoad)
router.post('/addcoupon',adminController.addCoupon)
router.post('/editcoupon',adminController.editCoupon)
router.get('/deletecoupon',adminController.deleteCoupon)


module.exports = router;
