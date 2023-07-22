const config = require('../config/config')
var User = require('../models/userSchema')
var Product = require('../models/productSchema')
var Cart = require('../models/cartSchema')
var Coupon =require('../models/couponSchema');
var Wishlist=require('../models/wishlistSchema')
const bcrypt = require('bcrypt');
// var sharp = require('sharp');
var multer = require('multer');
var path =require('path');
const nodemailer = require('nodemailer')
// const Razorpay = require('razorpay')
const mongoose = require('mongoose');
const Category = require('../models/categorySchema');
const { calculateTotalPrice ,cartCount, } = require('../Helpers/userHelper');
// const customHelper = require('../Helpers/customHelper');
const Order = require('../models/orderSchema');
// const { default: products } = require('razorpay/dist/types/products');

const accountSid = "ACefc710093e75bd7593341d8cbdab60cc";
const authToken = "a982ab4876cbdde1efc7fcb751beb268";
const verifySid = "VA1547b1562053ad4da14595d405f1c742";
const client = require("twilio")(accountSid, authToken);




//RAZOR PAY
// var instance = new Razorpay({
//   key_id: config.RAZORPAY_KEY_ID,
//   key_secret: config.RAZORPAY_KEY_SECRET, 
// });
//RAZOR PAY

//Home page load

const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,path.join(__dirname,'../public/images/userimage'))
  },
  filename:(req,file,cb)=>{
      const name = Date.now()+'-'+file.originalname
      cb(null,name)
  }
})
const upload = multer({storage:storage})



const homeLoad = async (req, res) => {

  try {
    let count ;
    

    const product = await Product.find({}).lean();

    if(req.session.userId){
    count = await cartCount(req.session.userId);
    }
     
    res.render('users/index', { product, username: req.session.username,});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
  // res.render('users/index',{username:req.session.username})
}

// const sortProducts = async (req, res) => {
//   try {
//     let sort = req.query.sort;
//     console.log(sort); // Corrected variable name

//     const category = await Category.find({}).sort({ [sort]: 1 }).lean();
//     const product = await Product.find({}).sort({ price: sort }).lean();

//     res.render('users/shop-products', {
//       product,
//       category,
//       username: req.session.username,
//       productActive: true,
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };


// const categorywiseLoad=async(req,res)=>{
//   const category=await Category.find({}).lean()
//   let categoryName = req.query.category
//   let products=await Product.find({category:categoryName}).lean()
//   let username=req.session.username
//   let session=req.session.loggedIn
//   console.log(products)
//   res.render('users/shop-products',{products,category,session,username,productActive:true})
// }






//login pageload 


const loginLoad = (req, res) => {
  res.render('users/login', { error: req.session.loginErr })
  req.session.loginErr = ""
}

//login page check
const loginCheck = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        console.log(isPasswordMatch)
        req.session.username = user.name
        req.session.userId = user._id
        console.log(user.name)
        res.redirect('/')
      } else {
        req.session.loginErr = "Invalid Password"
        res.redirect('/login')
      }
    } else {
      req.session.loginErr = "Invalid Email"
      res.redirect('/login')
    }
  } catch (error) {
    console.error(error);
  }
};

//Logout function


const logout = (req, res) => {
  req.session.destroy()
  res.redirect('/login')
}

//load sign page

const loadSign = (req, res) => {
  res.render('users/signup')
}

//forget password 

const forgetPassword = (req, res) => {
  res.render('users/forget-password')
}

//otp sign page

const otpSign = (req, res) => {
  res.render('users/otp-varification')
}


//send otp

const sendOtp = async (req, res) => {
  try {
    req.session.usermob = req.body.mob;
    mobile = "+91" + req.body.mob;
    console.log(mobile, 'ffffffff');
    const user = await User.findOne({ mon: req.body.mob })
    console.log(user);
    if (user) {
      req.session.username = user.name;

      client.verify.v2
        .services(verifySid)
        .verifications.create({ to: mobile, channel: "sms" })
        .then((verification) => console.log(verification.status))
      res.render('users/varify-otp')
    }
    else {
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error);
  }
}

//resend otp 

const resendOtp = async (req, res) => {
  try {
    mobile = "+91" + req.session.usermob;
    console.log(mobile, 'ffffffff');
    const user = await User.findOne({ mon: req.session.usermob})
    console.log(user);
    if (user) {
      req.session.username = user.name;

      client.verify.v2
        .services(verifySid)
        .verifications.create({ to: mobile, channel: "sms" })
        .then((verification) => console.log(verification.status))
      res.render('users/varify-otp')
    }
    else {
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error);
  }
}



//otp verification

const otpVarify = (req, res) => {
  console.log(req.session.usermob);
  console.log(req.body.otp)
  otpCode = req.body.otp
  client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: "+91" + req.session.usermob, code: otpCode })
    .then((verification_check) => {
      if (verification_check.valid) {
        username = req.session.username
        res.redirect('/')
      } else {
        res.redirect('/login')
      }
    })
    .catch((e => { console.log(e) }))

}


//resend otp verification

const resendotpVarify = (req, res) => {
  console.log(req.session.usermob);
  console.log(req.body.otp)
  otpCode = req.body.otp
  client.verify.v2     
    .services(verifySid)
    .verificationChecks.create({ to: "+91" + req.session.usermob, code: otpCode })
    .then((verification_check) => {
      if (verification_check.valid) {
        username = req.session.username
        res.render('users/resend-otp')
      } else {
        res.redirect('/login')
      }
    })
    .catch((e => { console.log(e) }))

}


//sendotp link with mail

const sendOtpLink = (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "jithinphilip347@gmail.com",
        pass: "wbrevrpyetdhmdse"
      }
    })
    const mailOptions = {
      from: 'Focus',
      to: email,
      subject: 'Log in with OTP',
      html: '<p>Hi,<b>' + otp + '</b> is your OTP for verification</p>'
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log('email has been sent to:-', info.response)
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}

//otp mail verify

const otpMailVerify = async (req, res) => {
  try {
    let newotp = Math.floor(100000 + Math.random() * 900000);
    let { email, mon } = req.body
    let user = await User.findOne(
      { $or: [{ email: email }, { mon: mon }] }
    )
    if (user) {
      res.redirect('/signup')
    } else {
      let data = req.body
      console.log("OTP")
      sendOtpLink(email, newotp)
      res.render('users/otp-sign', { data, newotp })
    }

  } catch (error) {
    console.log(error.message)
  }
}


//otp check

const checkOtp = async (req, res) => {
  try {
    let enterOtp = req.body.otp
    let loginUser = await User.findOne({ _id: req.body.id })
    if (loginUser) {
      console.log(enterOtp)
      console.log(loginUser.otp)
      if (loginUser.otp === Number(enterOtp)) {
        req.session.loggedIn = true
        req.session.username = loginUser.name
        req.session.userId = loginUser._id
        res.redirect('/')
        await User.updateOne({ _id: loginUser._id }, { $set: { otp: null } })
      } else {
        res.render('user/otp-enter', { user_id: loginUser._id, message: "Otp incorrect,Please Re-enter" })
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}

//otp check 

const otpCheck = async (req, res) => {
  let { name, email, mon, password, otpCheck, otp } = req.body
  let data = req.body
  if (otp == otpCheck) {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    const user = new User({ name: name, email: email, mon: mon, password: hashedPassword });
    const savedUser = await user.save();
    if (savedUser) {
      console.log('User Created')
      req.session.username = user.name
      req.session.userId = user._id
      console.log(user.name)
      res.redirect('/')
    }
  } else {
    res.render('users/otp-sign', { data, newotp: req.body.otpCheck, message: "Wrong OTP" })
  }
}


//reset pageload

const resetpageLoad = (req, res) => {
  try {
    res.render('users/forget-password')
  } catch (error) {
    console.log(error.message)
  }
}

//reset password with otp

const resetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      let restotp = Math.floor(100000 + Math.random() * 900000);
      sendOtpLink(email, restotp)
      await User.updateOne({ email: email }, { otp: restotp })
      res.render('users/forget-otp', { email })
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: '' });
  }
};

//otp verification 

const otpVerify = async (req, res) => {
  const { email, otp } = req.body
  const user = await User.findOne({ email: email });
  console.log(user);
  if (user.otp == otp) {
    res.render('users/reset-password', { email })
  }
}

//reset the password 

const resetPassword = async (req, res) => {
  try {
    console.log(req.body);
    let { password, email } = req.body;
    let user = await User.findOne({ email: email })
    console.log(user);
    password = await bcrypt.hash(password, 10);
    user.password = password;
    console.log(user);
    await user.save();
    res.redirect('/login')


  } catch (e) {
    console.log(e);
  }

}



const userProfile = async (req, res) => {
  try {
    const loggedUserId = req.session.userId;
    const user = await User.findById(loggedUserId).populate('address').lean();
    const userData = await User.findById(req.session.userId).lean();

    const address = user.address[0];
    console.log("jdkjdf",address)

    // const user = await User.findById(req.session.userId).populate('address').lean();
    res.render('users/user-profile', {
       userData,
       username: req.session.username,
       address,
       

      });
  } catch (error) {
    console.error(error);
    res.redirect('/error');
  }
};



const changePassword = async (req, res) => {
  try {
    const { oldpassword, newpassword} = req.body;
    const userId = req.session.userId;
    console.log(req.body,'jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj');
    const user = await User.findById(userId);
    console.log(user.password)
    console.log(oldpassword)
    if (!(await bcrypt.compare(oldpassword,user.password))) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    user.password = await bcrypt.hash(newpassword,10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Failed to change password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};





const editProfile = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const loggedUserId = req.session.userId;
    const user = await User.findById(loggedUserId);
    const imageFile = user.image;
    
    let userData;
    
    if (req.file) {
      userData = await User.findByIdAndUpdate(
        loggedUserId,
        { name, email, mobile, image: req.file.filename },
        { new: true }
      ).lean();
    } else {
      userData = await User.findByIdAndUpdate(
        loggedUserId,
        { name, email, mobile, image: imageFile },
        { new: true }
      ).lean();
    }
    
    req.session.username = userData.name;
    const address = user.address[0];
    
    res.render('users/user-profile', {
      userData,
      username: req.session.username,
      address:address,
      

     });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};


const manageAddress = async (req, res) => {
  try {
    const loggedUserId = req.session.userId;
    const user = await User.findById(loggedUserId).populate('address').lean();

    res.render('users/manage-address', {
      addresses: user.address,
      defaultAddressSet: req.query.defaultAddressSet === 'true',
      username: req.session.username,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to load addresses' });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const loggedUserId = req.session.userId;
    const addressId = req.params.id; 
    
   
    const user = await User.findByIdAndUpdate(
      loggedUserId,
      { $pull: { address: { _id: addressId } } },
      { new: true }
    ).lean();
    
    res.redirect('/manage-address');
  } catch (error) {
    console.log(error);
  }
};

const editAddress = async (req, res) => {
  try {
    const { id, type, street, country, state, city, postalcode } = req.body;

    const updatedAddress = {
      type: type,
      street: street,
      country: country,
      state: state,
      city: city,
      postalcode: postalcode
    };

    const user = await User.findOneAndUpdate(
      { _id: req.session.userId, "address._id": id }, 
      { $set: { "address.$": updatedAddress } }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User or address not found' });
    }

    res.redirect('/manage-address');
  } catch (error) {
    console.error('Failed to edit address:', error);
    res.status(500).json({ error: 'Failed to edit address' });
  }
};

//

// const setDefaultAddress = async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const addressId = req.params.id;
    
    
//     await User.findByIdAndUpdate(userId, { defaultAddress: addressId });

//     res.redirect('/manage-address');
//   } catch (error) {
//     console.error('Failed to set default address:', error);
//     res.status(500).json({ error: 'Failed to set default address' });
//   }
// };



//view shopping page

const shoppingPage = async (req, res) => {
  try {
    console.log(parseInt(req.query.page, 10),'pagination');
    let product;
    let pageNum = parseInt(req.query.page,10) || 1;
    let perPage = 5;
    let count = await Product.countDocuments({}).lean();
    const pages = Math.ceil(count / perPage); 
    const loggedUserId = req.session.userId;
    if (req.query.category) {
      product = await Product.find({ category: req.query.category })
        .lean()
        .skip((pageNum - 1) * perPage)
        .limit(perPage);
    } else {
      product = await Product.find({})
        .lean()
        .skip((pageNum - 1) * perPage)
        .limit(perPage);
    }
    const categories = await Category.find({}).lean();
    res.render('users/shop-products', {
      product,
      categories,
      username: req.session.username,
      count,
      pageNum,
      perPage,
      pages,
    });
  } catch (error) {
    console.log(error);
  }
};

//user can search products in shop products page

const searchProduct=async(req,res)=>{
  try {
      const categories=await Category.find({}).lean()
      let search=req.query.search
      let searchRegex=new RegExp(search,'i')
      let searchedProduct=await Product.find({productbrand:{$regex:searchRegex}}).lean()
      let username=req.session.username
      let session=req.session.loggedIn
      res.render('users/shop-products',{product:searchedProduct,categories,session,username,productActive:true})
  } catch (error) {
      console.log(error.message)
  }
}

//sort products in shop product page

const sortProducts=async(req,res)=>{
  try {
      let sort = req.query.sort
      const categories=await Category.find({}).lean()
      const product=await Product.find({}).sort({productname:req.query.sort}).lean()
      let username=req.session.username
      let session=req.session.loggedIn
      console.log('sort starting');
      console.log(product)
      console.log('sort ending');
      res.render('users/shop-products',{product,categories,session,username,productActive:true})
  } catch (error) {
      console.log(error.message)
  }
}


//order sorting user order details

const sortorders=async(req,res)=>{
  try {
      const loggedUserId = req.session.userId;
      let sort = req.query.sort 
      const order=await Order.find({userId: loggedUserId }).populate('products.productId').sort({createdAt:req.query.sort}).lean()
      if (!order) {
        return res.render('users/order-details', { order: null });
      } else {
        console.log("ENTERED");
        let orderDetails = order.map(data=>{
            return({
                id:data._id,
                date: `${data.createdAt.getDate()}-${data.createdAt.getMonth() + 1}-${data.createdAt.getFullYear()}`,
                total:data.total,
                products:data.products.map(details=>{
                    return({
                        id:details._id,
                        image:details.productId.productimage,
                        name:details.productId.productname,
                        price:details.basePrice,
                        quantity:details.quantity,
                    })
                }),
                payment:data.paymentMethod,
                status:data.orderStatus
            })
        })
     
      res.render('users/order-details',{order,orderDetails,username: req.session.username,productActive:true})
    }
       } catch (error) {
      console.log(error.message)
  }
}

//view shopping cart

const shoppingCart = async (req, res) => {
  try {
    const loggedUserId = req.session.userId;
    console.log(loggedUserId,"CHECKING")
    const cart = await Cart.findOne({ userId: loggedUserId }).populate('products.productId');
    if (!cart) {
        return res.render('users/shoping-cart', { cartProducts: [] ,emptyCart: true,username: req.session.username}); 
    } else {
      const cartProducts = cart.products.map(item => {
        if (item.productId) {
          return {
            id: item._id,
            productname: item.productId.productname,
            productimage: item.productId.productimage,
            actualPrice:item.productId.productprice,
            productprice: item.basePrice,
            quantity: item.quantity
          };
          
        }
         else {
          return null;
        }
      }).filter(item => item !== null);
      
        res.render('users/shoping-cart', {error:req.session.couponErr, cartProducts, cartId:cart._id, totalPrice:cart.totalPrice,username: req.session.username,emptyCart: false });
    }
  } catch (error) {
    console.error('Error retrieving cart products:', error);
    res.status(500).send('Internal Server Error');
  }
};

// get products to cart

const getaddtoCart = async (req, res) => {
  try {
    const productId = req.params.id;

    console.log("This is the prodid" + productId)

    const loggedUserId = req.session.userId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    let cart = await Cart.findOne({ userId: loggedUserId });

    if (cart) {
      let cartItem = cart.products.find((item) => item.productId == productId)
      if (cartItem) {
        cartItem.quantity++;
      } else {
        cart.products.push({ productId: productId, quantity: 1,basePrice:parseInt(product.productprice.replace(/,/g,''),10) })
      }
    } else {
      cart = new Cart({
        userId: loggedUserId,
        products: [
          {
            productId: productId,
            quantity: 1
          }
        ]
      });
    }

    await cart.save();

    res.redirect('/product-details/' + productId);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Internal Server Error');
  }
}

const changeQuantity = async (req, res) => {
  try {
    const { productId, cartId, count } = req.body;
    // console.log(req.body);

    // console.log(productId, cartId, count);

    let findCart = await Cart.findById(cartId).populate('products.productId');
    if (findCart) {
      let updateProduct = findCart.products.find(item => item._id.toString() === productId);
      if (updateProduct) {
        if (count == -1 && updateProduct.quantity == 1) {
          console.log("minus")
          return res.send({ status: false });
        }
        console.log(findCart)
        console.log(updateProduct)
        updateProduct.quantity += Number(count);

        const basePrice = parseInt(updateProduct.productId.productprice.replace(/,/g,''),10);

         console.log(basePrice);

         updateProduct.basePrice = updateProduct.quantity*parseInt(updateProduct.productId.productprice.replace(/,/g,''),10);

         let totalPrice = calculateTotalPrice(findCart.products);

        findCart.totalPrice=totalPrice
        // console.log(updateProduct.productprice);

        findCart.save();
        // console.log(updateProduct);
        
        // Send the updated quantity to the client-side
        return res.send({ status: true, quantity: updateProduct.quantity ,productprice:updateProduct.basePrice ,totalPrice});
      }
    }
    return res.send({ status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const removecart = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(productId);
    let cart = await Cart.findOne({userId:req.session.userId});
    console.log(cart)
    if (cart) {
      let productToDelete = await Cart.updateOne(
        {userId:req.session.userId},
        {$pull:{ products: { _id: productId } }}
      )
      console.log('Product deleted');
    }
    res.redirect('/shoping-cart');
  } catch (error) {
    console.log(error);
  }
};


//view product details

const getproductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    // const validId = mongoose.Types.ObjectId(productId);
    const product = await Product.findById(productId).lean();
    console.log(product)
    res.render('users/product-details', { product,username: req.session.username });
  } catch (error) {
    console.log(error);
  }
}

const checkOut = async (req, res) => {
  try {
    const loggedUserId = req.session.userId;
    const user = await User.findById(loggedUserId).populate('address');
    const userData = await User.findById(req.session.userId).lean();
    const cartProducts = await Cart.findOne({ userId: loggedUserId })
    const couponDetails = await Coupon.find({}).lean()

    const userWithPlainObject = user.toObject();
    
    res.render('users/checkout', {
      userData,
      username: req.session.username,
      cartPrice: cartProducts.totalPrice,
      address: userWithPlainObject.address,
      coupons:encodeURIComponent(JSON.stringify(couponDetails)),
      couponDetails ,
    });
    req.session.message = ''
  
  } catch (error) {
    console.error(error);
    // res.redirect('/error');
  }
};


// Handle form submission
const userAddress = async (req, res) => {
  try {
    const { type, street, city, state, country, postalcode } = req.body;
    console.log(req.body);
    const loggedUserId = req.session.userId;
    const user = await User.findById(loggedUserId);
    const newAddress = {
      type:type,
      street:street,
      city:city,
      state:state,
      country:country,
      postalcode:postalcode,
    };
    user.address.push(newAddress);

    await user.save();

    return res.redirect(`/checkout`);
  } catch (error) {
    console.error(error);
  }
};



//WISHLIST



const wishlistLoad = async(req,res)=>{
try {
  let loggedUserId = req.session.userId
  let wishList = await Wishlist.findOne({userId:loggedUserId}).populate('products.productId').lean()
  console.log("CHECK")
  console.log(wishList,'wishlist is there');
  console.log('dddddddd');
  if (wishList) {
      if (wishList.products.length === 0) {
        res.render('users/wishlist', { message: "WISHLIST IS EMPTY", username:req.session.username, wishlistActive: true });
      } else {
        res.render('users/wishlist', { products: wishList.products, username:req.session.username, wishlistActive: true });
      }
    }else{
      res.render('users/wishlist', { message: "WISHLIST IS EMPTY", username:req.session.username, wishlistActive: true });
    }
    console.log(wishList.products,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
} catch (error) {
  console.log(error.message)
}
}

const addToWishlist = async(req,res)=>{
  try {
    let loggedUserId = req.session.userId
      let productId=req.query.id
      console.log("This is the prodid" + productId)
      let wishlist = await Wishlist.findOne({userId:loggedUserId})
      if(wishlist){
          let addItem = await Wishlist.findOneAndUpdate({userId:loggedUserId},{$push:{products:{productId:productId}}})
          if(addItem){
              console.log("Product added to wishlist")
          }
      }else{
          let newWishlist = new Wishlist({
            userId:loggedUserId,
            products:[{productId:productId}]
          })
          let newList = await newWishlist.save()
          if(newList){
              console.log("New list created")
          }
      }
      res.redirect('/productload?id='+productId)

  } catch (error) {
      console.log(error.message)
  }
}



const removeWishlist = async(req,res)=>{
try {
  let loggedUserId = req.session.userId
  let {id} = req.query
  let removeProduct = await Wishlist.updateOne({userId:loggedUserId},{$pull:{products:{_id:id}}})
  if(removeProduct){
      console.log("Product removed successfully")
  }
  res.redirect('/wishlist')
} catch (error) {
  console.log(error.message)
}
}









module.exports = {
  loginLoad,
  loadSign,
  logout,
  homeLoad,
  userProfile,
  forgetPassword,
  otpSign,
  loginCheck,
  otpMailVerify,
  checkOtp,
  otpCheck,
  resetOtp,
  resetpageLoad,
  otpVerify,
  shoppingPage,
  shoppingCart,
  getproductDetails,
  sendOtp,
  otpVarify,
  resendotpVarify,
  resetPassword,
  checkOut,
  getaddtoCart,
  removecart,
  changeQuantity,
  userAddress,
  resendOtp,
  editProfile,
  manageAddress,
  deleteAddress,
  editAddress,
  changePassword,
  searchProduct,
  sortProducts,
  sortorders,
  addToWishlist,
  wishlistLoad,
  removeWishlist,


  // applyCoupon,
  // sortProducts,
  // categorywiseLoad
   // setDefaultAddress,
  
 
};
