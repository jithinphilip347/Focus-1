var Category = require('../models/categorySchema') 
var User   = require('../models/userSchema')
var Product =require('../models/productSchema')
var Admin = require('../models/adminSchema')
var Coupon =require('../models/couponSchema')
var Banner = require('../models/bannerSchema')
var sharp = require('sharp')
var multer = require('multer')
var path =require('path')
const bcrypt = require('bcrypt')
const { log } = require('console')
const mongoose = require('mongoose');
const { CLIENT_RENEG_LIMIT } = require('tls')
const Order = require('../models/orderSchema')
const {fetchDailySaleReport,fetchWeeklySaleReport,fetchYearlySaleReport,fetchAllDeliveredOrder} = require('../Helpers/adminHelper');



 
//get admin login

const getAdminlogin = (req, res) => {
 try {
  res.render('admin/adminlogin');
 } catch (error) {
  console.log(error.message);
 }
    
   
};

//admin login

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      console.log("Admin not found");
      return res.redirect('/admin'); 
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (isPasswordValid) {
      req.session.isAdminLoggedIn = true;
      return res.redirect('/admin/dashboard'); 
    } else {
      console.log("Wrong validation");
      return res.redirect('/admin'); 
    }
  } catch (error) {
    console.log(error);
  }
};

const adminLogout = (req, res) => {
  try {
    req.session.isAdminLoggedIn = false;
    res.redirect('/admin/adminlogin');
  } catch (error) {
    console.log(error);
  }
};


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



//show categories from admin

const showCategories = async (req, res) => {
    try {
      const category = await Category.find({deleted:false}).lean();
      console.log(category);
      res.render('admin/admin-categories',{category,error:req.session.categoryErr});
      req.session.categoryErr=""
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  };

// add new category
  
  const addCategory = async (req, res) => {
    try {
        const {category,offer} =req.body;

      // category = category.toUpperCase();
      
      console.log(category,offer,'--------------------------------------');

      const existingCategory = await Category.findOne({category:category});
      console.log(existingCategory,'ooooooooooooooooooooooooooooooooo');

      if (existingCategory) {
      const error = 'Category already exists';
       req.session.categoryErr = error
      }else{
        const newCategory = new Category({ category:category,offer:offer });
        console.log(newCategory,'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        await newCategory.save();
      }
      res.redirect('/admin/admin-categories');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create category'});
    }
  };


  const removecategory = async(req,res) =>{
    try {
      const categoryId = req.params.id
      console.log(categoryId);
      let categorydeleted =await Category.findByIdAndDelete(categoryId)
      if(categorydeleted){
        console.log('category deleted');
      }
      res.redirect('/admin/admin-categories')
    } catch (error) {
      console.log(error);
    }
  }

  const editCategory=async(req,res)=>{
    try {
        let {id,category,offer} = req.body
        let editCategory=await Category.findByIdAndUpdate(id,{$set:{category:category,offer:offer}})
        if(editCategory){
            console.log('Edited successfully')
        }
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message)
    }
}


// userfind page

  const userFind  = async (req, res) => {
    try {
      const users = await User.find({blocked:false}).lean();
      res.render('admin/admin-users', {users});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  };

//ADD BANNER

//Banner collection is required and only one banner is set active

const addBanner=async(req,res)=>{
  try {
      let bannerData=await Banner.find({}).lean()
      res.render('admin/banners',{bannerActive:true,bannerData})
  } catch (error) {
      
  }
}

const bannerImage=async(req,res)=>{
  try {
      let bannerData=req.body
      const banner=new Banner({
          name:bannerData.heading,
          image:req.file.filename
      })
      let success=await banner.save()
      if(success){
          console.log("Banner Added Successfully")
      }
      res.redirect('/admin/addbanners')
  } catch (error) {
      console.log(error.message)
  }
}

const activateBanner=async(req,res)=>{
  try {
      let id=req.params.id
      await Banner.updateMany({},{$set:{activate:false}})
      let activateBanner = await Banner.findByIdAndUpdate(id,{activate:true})
      if(activateBanner){
          console.log("Activated Succesfully")
      }
      res.redirect('/admin/addbanners')
  } catch (error) {
      console.log(error.message)
  }
}

const removeBanner=async(req,res)=>{
  try {
      let id = req.params.id
      let deleteBanner = await Banner.findByIdAndDelete(id)
      if(deleteBanner){
          console.log("Banner Deleted")
      }
      res.redirect('/admin/addbanners')
  } catch (error) {
      console.log(error.message)
  }
}

//dash board load

const dashboardLoad=async (req,res)=>{
  try {
      let productCount = await Product.aggregate([
          {
            $group: {
              _id: null,
              totalStock: { $sum: '$stock' }
            }
          }
        ])
      let userCount = await User.countDocuments({})
      let orderCount = await Order.countDocuments({})
      let statusCount = await Order.aggregate([
          {
            $unwind: '$products'
          },
          {
            $group: {
              _id: '$products.status',
              count: { $sum: 1 }
            }
          }
        ])
      console.log(productCount)
      let dashboardDetails = {
          products:productCount[0].totalStock,
          users:userCount,
          orders:orderCount
      }
    res.render('admin/admin-index',{homeActive:true,dashboardDetails,statusCount:JSON.stringify(statusCount)})
  } catch (error) {
      console.log(error.message)
  }
}


//show product from admin  

  const showProducts = async (req, res) => {
        try {
          const product = await Product.find({}).lean();
          console.log(product);
          res.render('admin/admin-products',{product});
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to fetch categories' });
        }
      };
        
// add product form      

  const addproductForm = async(req,res) => {
    try {

      const categories = await Category.find({}).lean();
     
    res.render('admin/admin-addproducts',{categories})
      
    } catch (error) {
      console.log(error);
    }
      }

// add product

  const addProduct=async(req,res)=>{
  try {

    console.log(req.body);
    
      const product=new Product({
          productname:req.body.productname,
          productbrand:req.body.productbrand,
          category:req.body.category,
          stock:req.body.stock,
          productprice:req.body.productprice,
          originalprice:req.body.originalprice,
          productdescription:req.body.productdescription,
         
      })
      const croppedImages = [];
          for (let file of req.files) {
          const croppedImage = `cropped_${file.filename}`;

          await sharp(file.path)
              .resize(500, 600, { fit: "cover" })
              .toFile(`./public/images/siteproducts/${croppedImage}`);

          croppedImages.push(croppedImage);
          }

          product.productimage=croppedImages
      const productData =await product.save()
      if(productData){
          res.redirect('/admin/admin-products')
      }else{  
          console.log("error upload")
      } 
  } catch (error) {
      console.log(error.message)
    }
}
//edit product

const editProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log(productId,'product id');
    const product = await Product.findById(productId).lean();
    const categories = await Category.find().lean();
    res.render('admin/edit-product', { product, categories });
  } catch (error) {
    console.log(error);
  }
};
// update the product from admin

const updateProduct = async(req,res)=>{
  upload.array('image',5)(req, res, async (err) => {
      if (err) {
          console.log(err);
          return next(err);
        }
      try{
          let id = req.query.id
         console.log(req.files.length);
          if(req.files.length > 0){
              const   product =await Product.findOneAndUpdate({_id:id},{$set:{
                      productname:req.body.productname,
                      productbrand:req.body.productbrand,
                      stock:req.body.stock,
                      category:req.body.category,
                      productprice:req.body.productprice,
                      productdescription:req.body.productdescription,
                  productimage: req.files.map(file => file.filename),
                  
                 
              }
        })
          }else{
              const product =await Product.findOneAndUpdate({_id:id},{$set:{
                    productname:req.body.productname,
                    productbrand:req.body.productbrand,
                    stock:req.body.stock,
                    category:req.body.category,
                    productprice:req.body.productprice,
                    productdescription:req.body.productdescription,
                    productimage:req.body.productimage,
            
                   }})
                  } 
                  res.redirect('/admin/edit-product')}
                  catch(error)
                  {
                     console.log(error) 
                  }
      })       
  }
//delete product

  const deleteProduct=async(req,res)=>{
    try {
        let productId=req.params.id
        console.log(productId);
        const productData=await Product.findByIdAndDelete({_id:productId})
        console.log(productData)
        res.redirect('/admin/admin-products')
    } catch (error) {
        console.log(error.message)
    }
}


// const editCategory = async(req,res)=>{
//   const {id,category}=req.body
//   let editDetails = {
//       name:category,
//   }
//   let editCategory = await Category.findByIdAndUpdate(id,{$set:editDetails})
//   if( editCategory){
//       console.log("Category Updated")
//   }
//   res.redirect('/admin/admin-categories')
// }


 


//block user 



const userBlock = async (req, res) => {
  try {
    const  userId  = req.query.id;
    console.log(userId);
    const user = await User.findByIdAndUpdate({_id:userId}, {$set:{blocked: true}  });
    res.redirect('/admin/admin-users');
  } catch (error) {
    console.log(error.message);
  }
};

//user unblock

const userUnblock = async (req, res) => {
  try {
    const userId  = req.query.id;
    console.log(userId);
    const user = await User.findByIdAndUpdate({_id:userId}, { $set:{blocked: false} });
    res.redirect('/admin/blocked-users');
  } catch (error) {
    console.log(error.message);
  }
};
//view blocked users

const viewBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await User.find({ blocked:true}).lean();
    console.log(blockedUsers);
    res.render('admin/blocked-users',{blockedUsers});
  } catch (error) {
    console.log(error);
  }
};



const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name mon email')
      .populate('address')
      .lean();
      console.log(orders,"pppppppppppppppp");
    const orderStatusOptions = ['pending', 'shipped', 'confirmed', 'cancelled', 'delivered'];
    console.log(orderStatusOptions,'fffffffffffffffffff');

    orders.forEach(order => {
      order.formattedDateTime = new Date(order.createdAt).toLocaleString();
    });

    res.render('admin/admin-orders', { orders,orderStatusOptions});
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).render('admin/error', { error: 'Failed to fetch orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus, productId } = req.body;
    const loggedUserId = req.session.userId
    const user = await User.findById(loggedUserId)
    console.log(req.body, 'ggggggggggg');
    
    // Check if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, error: 'Invalid orderId' });
    }

    // Update the order status in the database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
     
    // Find the product with the given productId in the order's products array
    const productStatus = order.products.find((product) => product._id.toString() === productId);
    if (!productStatus) {
      return res.status(404).json({ success: false, error: 'Product not found in the order' });
    }

    productStatus.orderStatus = newStatus;
    // user.wallet += productStatus.basePrice;

    await order.save();

    res.redirect('/admin/admin-orders');
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};

const viewOrders =async (req,res) => {
try {
  console.log("HI");
  const orderId = req.params.id;
  const order = await Order.findById(orderId).populate('products.productId').lean();
  order.products[0].orderId = orderId
  console.log(order.products[0]);
  
  res.render('admin/admin-view-orders',{order:order.products,orderId:orderId})
} catch (error) {
  console.log(error);
}
}



const couponLoad = async(req,res)=>{
  try {
      let couponDetails = await Coupon.find({}).lean()
      res.render('admin/admin-coupon',{couponsActive:true,couponDetails})
  } catch (error) {
      console.eror(error.message)
  }
}

const addCoupon = async(req,res)=>{
  let {couponname,amount,description,minamount,date}=req.body
  let newCoupon = new Coupon({
      name:couponname,
      discount:amount,
      description:description,
      applicable:minamount,
      dateExpiry:date
  })
  let saveCoupon = await newCoupon.save()
  if(saveCoupon){
      console.log("Coupon saved successfully")
  }
  res.redirect('/admin/admin-coupon')
}

const editCoupon = async(req,res)=>{
  let {id,couponname,amount,description,minamount,date}=req.body
  let editDetails = {
      name:couponname,
      discount:amount,
      description:description,
      applicable:minamount,
      dateExpiry:date
  }
  let editCoupon = await Coupon.findByIdAndUpdate(id,{$set:editDetails})
  if(editCoupon){
      console.log("Coupon Updated")
  }
  res.redirect('/admin/admin-coupon')
}

const deleteCoupon = async(req,res)=>{
  try {
      let id=req.query.id
      let deleteCoupon = await Coupon.findByIdAndDelete(id)
      if(deleteCoupon){
          console.log("Deleted Successfully")
      }
      res.redirect('/admin/admin-coupon')
  } catch (error) {
      console.log(error.message)
  }
}



const getSalesReportPage = async (req, res) => {
  try {
      const allSuccessOrders = await fetchAllDeliveredOrder();
      console.log(allSuccessOrders,'gggggggggggggggggggggggggggggggggggggg');
      res.render('admin/sales-report', { admin: true, allSuccessOrders });
  } catch (error) {
      console.log(error);
  }
};

const fetchingSalesReport = (req,res)=>{

  if(req.body.btn==='daily'){

    const{Date} = req.body 
    fetchDailySaleReport(Date).then((response)=>{
      const{dailyReports,TotalAmount} =response
      console.log(dailyReports,'jjjjjjjjjjjjjjjjjjjjjjjjjjjjj');
      console.log("Total",TotalAmount[0]);
      const Total =TotalAmount[0]
      res.status(200).json({message:'success',dailyReports,Total})
     
    }).catch((err)=>{
      res.status(400).json({error:err})
    })
  }else if(req.body.btn==='weekly'){

    const{Date} = req.body
    fetchWeeklySaleReport(Date).then((response)=>{
      const{weeklyReports,TotalAmount} =response
      const Total= TotalAmount[0]
      res.status(200).json({message:'success',weeklyReports,Total})

    }).catch((err)=>{
      res.status(400).json({error:err})

    })

  }
  else if(req.body.btn ==='yearly'){
    const{Year} = req.body
    fetchYearlySaleReport(Year).then((response)=>{
      const{yearlyReports,TotalAmount} = response
      const Total = TotalAmount[0]
      res.status(200).json({message:'success',yearlyReports,Total})

    }).catch((err)=>{
      res.status(400).json({error:err})

    })
    }

  }

module.exports = {
    
    getAdminlogin,
    adminLogin,
    adminLogout,
    showCategories,
    addCategory,
    userFind,
    showProducts,
    addProduct,
    addproductForm,
    removecategory,
    userBlock,
    userUnblock,
    viewBlockedUsers,
    editProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    viewOrders,
    couponLoad,
    addCoupon,
    editCoupon,
    deleteCoupon,
    updateOrderStatus,
    addBanner,
    bannerImage,
    removeBanner,
    activateBanner,
    dashboardLoad,
    editCategory,
    getSalesReportPage,
    fetchingSalesReport,
    // orderInfo,
    // updateStatus,
    // returnDetails,
    // pickupStatus,
    // returnInfo
}
