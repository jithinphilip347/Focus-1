const config = require('../config/config')
const Order = require('../models/orderSchema')
const User = require('../models/userSchema')
const Cart = require('../models/cartSchema')
const Product = require('../models/productSchema')
const Coupon =require('../models/couponSchema')

const Razorpay = require('razorpay')
//RAZOR PAY
var instance = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET, 
});
//RAZOR PAY


// const orderPayment = async(req,res)=>{
//   try {
//     const loggedUserId = req.session.userId;
//       const orderDetails = await Cart.findOne({loggedUserId}).lean()
//       console.log(orderDetails.sendTotal)
//       const userData  = await User.findOne({_id:loggedUserId}).lean()
//       const couponDetails = await Coupon.find({}).lean()
//       // console.log(userDetails.address)
//       let selectedAddress=userData.address.map(data=>{
//           return({
//               id:data._id,
//               address:data.address
//           })
//       })
//       console.log(JSON.stringify(userAddress))
//       res.render('users/place-order', { coupon:encodeURIComponent(JSON.stringify(couponDetails)), couponDetails, userData, selectedAddress: encodeURIComponent(JSON.stringify(selectedAddress)), message:req.session.message , orderDetails, cartPrice: orderDetails.sendTotal,username: req.session.username});
//       req.session.message = ''
//   } catch (error) {
//       console.log(error.message)
//   }
// }

const placeOrder = async (req, res) => {
    try {
      const { payment , address, sendTotal } = req.body;
      console.log(req.body,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
      const loggedUserId = req.session.userId;
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
        if(total>walletAmount){
            console.log(sendTotal,'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
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
            await User.findByIdAndUpdate(loggedUserId,{$inc:{wallet:-total}})

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

      const { payment, selectedaddress } = req.body;
      console.log(req.body,'jjjjjjjjjjjjjjjjjjjjjjjjjjjj');
      let loggedUserId = req.body.userId;
      const sendTotal = parseInt(req.body.sendTotal);
      const userData = await User.findById(loggedUserId);
      let cart = await Cart.findOne({ userId: loggedUserId }).populate('products.productId');
      // const selectedaddress =  userData.address.find((addr) => addr._id.toString() === address);
      console.log(selectedaddress,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
    console.log(cart.products)
     console.log(userData);
    let newOrder = new Order({
      userId: loggedUserId,
      name:  userData.name,
     email:  userData.email,
      mobile:  userData.mon,
      address:selectedaddress,
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



  //     await newOrder.save();
  //     await Cart.deleteMany({ userId: loggedUserId });
  //     res.redirect('/order-details')
  //   //  res.status(200).json({ message: 'Order placed successfully!' });
  //   } catch (error) {
  //     console.error('Failed to place order:', error);
  //     res.status(500).json({ error: 'Failed to place order' });
  //   }
  // };
  
 
  
  const orderDetails = async (req, res) => {
    try {
      const loggedUserId = req.session.userId;
      const order = await Order.find({ userId: loggedUserId }).populate('products.productId').lean();
    //   console.log(order);
  
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

        console.log(orderDetails);
        // const orderdProducts = order.products.map(item => {
        //   if (item.productId) {
        //     return {
        //       id: item._id,
        //       productname: item.productId.productname,
        //       productimage: item.productId.productimage,
        //       productprice: item.basePrice,
        //       quantity: item.quantity
        //     };
        //   } else {
        //     return null;
        //   }
        // }).filter(item => item !== null);
  
        res.render('users/order-details', { order, orderDetails ,username: req.session.username });
      }
    } catch (error) {
      console.error(error);
      res.redirect('/error');
    }
  };


  const cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);
      if (!order) {
      return res.status(404).json({ error: 'Order not found' });
      }
      order.orderStatus = 'cancelled';
      await order.save();
      res.redirect('/order-details')
      // res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      res.status(500).json({ error: 'Failed to cancel order' });
    }
  };
  

  
  


  module.exports = {
    placeOrder,
    orderDetails,
    cancelOrder,
    createOrder,
    orderSuccess,
    paymentSuccess,
    // orderPayment,

  }
  