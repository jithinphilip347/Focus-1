const config = require('../config/config')
const Order = require('../models/orderSchema')
const User = require('../models/userSchema')
const Cart = require('../models/cartSchema')
const Product = require('../models/productSchema')
const Coupon =require('../models/couponSchema')
const mongoose = require('mongoose');
const Razorpay = require('razorpay')


//RAZOR PAY
var instance = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET, 
});
//RAZOR PAY

const placeOrder = async (req, res) => {
    try {
      const { payment , address, sendTotal } = req.body;
      console.log(req.body,'req.body',"jjj")
      const loggedUserId = req.session.userId;

      console.log(loggedUserId,'loggedUserId');
      const cart = await Cart.findOne({ userId: loggedUserId }).populate('products.productId');
      const userData = await User.findById(loggedUserId);
      const selectedAddress =  userData.address.find((addr) => addr._id.toString() === address);
        
      const newOrder = new Order({
        userId:loggedUserId,
        products:cart.products,
        total:sendTotal,
        paymentMethod: payment,
        address:selectedAddress
      });
      if(payment == "Wallet"){
        const userData = await User.findById(loggedUserId);
        let walletAmount = userData.wallet
        console.log(walletAmount,'jjjjjjjjjjjjjjjjjjjjjjjjj')
        if(sendTotal>walletAmount){
            console.log(sendTotal,'sendTotal')
            let balance = sendTotal-walletAmount
            const amount = balance * 100;
            const options = {
                amount: amount,
                currency: 'INR',
                receipt: config.PAY_MAIL,
            };
            instance.orders.create(options, async (err, order) => {
              if (!err) {
              res.status(200).send({
                  success: true,
                  msg: 'Order Created',
                  order_id: order.id,
                  amount: amount,
                  key_id: config.KEY_ID,
                  name: req.body.name,
                  email: req.body.email,
                  mobile: req.body.phone,
              });
              } else {
              res.status(400).send({ success: false, msg: 'Something went wrong' });
              }
          });
             
          }
          else{
            await User.findByIdAndUpdate(loggedUserId,{$inc:{wallet:-sendTotal}})

            var success=await newOrder.save()
        }
        }else{
          var success=await newOrder.save()
      }
  
      if (success){
        let cart = await Cart.findOne({userId:loggedUserId})
        // Update the stock count of products
       
        cart.products.forEach(async (product) => {
            const productId = product.productId;
            const quantity = product.quantity;
    
            // Find the product by ID
            const foundProduct = await Product.findById(productId);
        
            // Calculate the new stock count
            const newStock = parseInt(foundProduct.stock) - parseInt(quantity);
    
            // Update the stock count in the database
            await Product.findByIdAndUpdate(productId, { stock: newStock });
        })
        await Cart.findOneAndDelete({userId:loggedUserId})
        console.log('cart also deleted')
        res.redirect('/ordersuccess')
    }
} catch (error) {
    console.log(error.message);
}
}

const createOrder = async (req, res) => {
try {
  console.log(req.body.sendTotal);
  // Razorpay Starts
  const sendTotal=parseInt(req.body.sendTotal);
  const amount =sendTotal * 100;
  console.log(amount);
  const options = {
    amount: amount,
    currency: 'INR',
    receipt: config.PAY_MAIL,
  };

  console.log(options);
  console.log(config.RAZORPAY_KEY_ID,'kkkkkkkkkkkkk');
  instance.orders.create(options, async (err, order) => {
    if (!err) {
      res.status(200).send({
        success: true,
        msg: 'Order Created',
        order_id: order.id,
        amount: amount,
        key_id: config.RAZORPAY_KEY_ID,
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.phone,
      });
    } else {
      console.log("Razorpay Error:", err); // Log the Razorpay error
      res.status(400).send({ success: false, msg: 'Something went wrong' });
    }
  });
} catch (error) {
  console.log(error.message,"hiiiiiiiiiiiiiiiiiiiiii");
}
};

const orderSuccess=(req,res)=>{
try {
    res.render('users/order-success')
} catch (error) {
    console.log(error.message)
}
}

const paymentSuccess=async (req,res)=>{
try {
      console.log("payment success");
      console.log(req.body);
      console.log(req.body.sendTotal);
      let loggedUserId = req.body.userId;
      
      console.log(loggedUserId,'loggedUserId')
      const sendTotal = parseInt(req.body.sendTotal);
      const { address,payment, name, email, mobile } = req.body;

       // Find the user by ID and populate the 'address' field
    const user = await User.findById(loggedUserId).populate('address');

    // Check if the user is found and has an address
    if (!user || !user.address) {
      throw new Error('User not found or invalid user data');
    }

    // Find the selected address object using the address ID from the user's address array
    const selectedAddress = user.address.find(
      (addressObj) => addressObj._id.toString() === address
    );

     // Assuming the 'address' field in the user schema has properties like 'street', 'city', etc.
     const { type, street, city, state, country, postalcode } = selectedAddress;


      console.log(req.body,'jjjjjjjjjjjjjjjjjjjjjjjjjjjj');
      let cart = await Cart.findOne({ userId:loggedUserId }).populate('products.productId');
      console.log(cart.products)
    let newOrder = new Order({
      userId: loggedUserId,
      name:name,
      email:email,
      mobile:mobile,
      address:{
        type: type,
        street: street,
        city: city,
        state: state,
        country: country,
        postalcode: postalcode,
      },
      total: sendTotal,
      paymentMethod: payment,
      products: cart.products,
       
    })
    if(payment=='Wallet'){
        await User.findByIdAndUpdate(loggedUserId,{$set:{wallet:0}})
    }
    let Datasuccess=await newOrder.save()
    if (Datasuccess){
        let cart = await Cart.findOne({userId:loggedUserId})
        // Update the stock count of products
        cart.products.forEach(async (product) => {
            const productId = product.productId;
            const quantity = product.quantity;
            // Find the product by ID
            const foundProduct = await Product.findById(productId);
            // Calculate the new stock count
            const newStock = parseInt(foundProduct.stock) - parseInt(quantity);
    
            // Update the stock count in the database
            await Product.findByIdAndUpdate(productId, { stock: newStock });
        })
        await Cart.findOneAndDelete({userId:loggedUserId})
        console.log('cart also deleted')
    }

    console.log(newOrder.products)

    res.redirect('/ordersuccess')

} catch (error) {
    console.log(error.message)
}

}
 
  const orderDetails = async (req, res) => {
    try {
      const orderId = req.params.id;
      const loggedUserId = req.session.userId;
      const order = await Order.find({ userId: loggedUserId }).populate('products.productId').lean();
  
      if (!order) {
        return res.render('users/order-details', { order: null });
      } else {
        
        let orderDetails = order.map(data=>{
            return({
                id:data._id,
                date: `${data.createdAt.getDate()}-${data.createdAt.getMonth() + 1}-${data.createdAt.getFullYear()}`,
                total:data.total,
                products:data.products.map(details=>{
                    return({
                        orderId : data._id,
                        productId:details.productId._id,
                        image:details.productId.productimage,
                        name:details.productId.productname,
                        price:details.basePrice,
                        quantity:details.quantity,
                        status:details.orderStatus,
                        returnStatus:details.return[0]?.status, 
                        reason:details.return[0]?.reason
                    })
                }),
                
                payment:data.paymentMethod,
               
            })
        
            
        })

  
        res.render('users/order-details', { order, orderDetails ,username: req.session.username });
      }
    } catch (error) {
      console.error(error);
      res.redirect('/error');
    }
  };

  const cancelOrder = async (req, res) => {
    console.log("im here");
    try {
      let userId =req.session.userId; 
      let reason = req.body.reason; 
      let orderId = req.body.orderId ;
      let productId = req.body.productId;

      console.log(req.body)
      const user =await User.findById(userId)
      const order = await Order.findById(orderId);
      console.log(orderId);
      console.log(productId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      await Order.updateOne({_id:orderId,"products":{$elemMatch:{'productId':productId}}},
      {
        $set:{
          'products.$.orderStatus':"cancelled"
        }
      })
        if(order.paymentMethod !== "Cash on Delivery"){
        const order = await Order.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(orderId),
              "products.productId":new mongoose.Types.ObjectId(productId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $match: {
              "products.productId":new  mongoose.Types.ObjectId(productId),
            },
          },
          {
            $project: {
              "products.productId": 1,
              "products.quantity": 1,
              "products.basePrice": 1,
              "products.orderStatus": 1,
              "products.status": 1,
              "products.cancellationReason": 1,
            },
          },
        ]);    
        console.log("iiiiiiiiiiiiiiiiiiiii");
        console.log(order[0].products.basePrice);
        console.log("iiiiiiiiiiiiiiiiiiiii");

        await User.updateOne({_id:userId},{
          $inc:{
            wallet:order[0].products.basePrice
          }
        })
        // user.wallet = product.productprice
        // await user.save()
        }
     res.status(200).json({status:true, message: 'Order successfully canceled' });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      res.status(500).json({ error: 'Failed to cancel order' });
    }
  };
  
  const returnOrder = async (req, res) => {
    try {
      console.log(req.body);
      let orderId = req.body.orderId;
      let prodId = req.body.productId;
      let reason = req.body.reason;
  
      // Find the order by ID
      const order = await Order.findById(orderId);
  
      // Check if the order exists
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      let currentDate = Date.now();
      let timeDiff = currentDate - order.createdAt;
      let sevenDays = 7 * 24 * 60 * 60 * 1000;
      let withinSevenDays = timeDiff <= sevenDays;
  
      if (withinSevenDays) {
        let check = await Order.findOneAndUpdate(
          { _id: orderId, 'products.productId': prodId },
          { $set: { 'products.$.return': { status: true, reason: reason },
          'products.$.orderStatus': 'return request'
             } 
          }
        );

        console.log(check,'check')
        // Update the order status to "returned"
        // await Order.findByIdAndUpdate(orderId, { status: 'returned' });
       return res.status(200).json({status:true, message: 'Order successfully returnd' });
      } else {
        req.session.returnErr = 'You cannot return as the number of days exceeded';
      }
      res.redirect('/order-details');
    } catch (error) {
      console.error('Failed to process return order:', error);
      res.status(500).json({ error: 'Failed to process return order' });
    }
  };
  
  

  module.exports = {
    placeOrder,
    orderDetails,
    createOrder,
    orderSuccess,
    paymentSuccess,
     cancelOrder,
    returnOrder,
    
  }
  