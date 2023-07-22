const Order = require('../models/orderSchema')
const User = require('../models/userSchema')
const Cart = require('../models/cartSchema')


const placeOrder = async (req, res) => {
    try {
      const { paymentmethod , address, sendTotal } = req.body;
      console.log(req.body)
      const loggedUserId = req.session.userId;
      const cart = await Cart.findOne({ userId: loggedUserId }).populate('products.productId');
      const user = await User.findById(loggedUserId);
      const selectedAddress = user.address.find((addr) => addr._id.toString() === address);
      
      const newOrder = new Order({
        userId:loggedUserId,
        products:cart.products,
        total:sendTotal,
        paymentMethod: paymentmethod,
        address:selectedAddress
      });
  
      await newOrder.save();
      await Cart.deleteMany({ userId: loggedUserId });
      res.redirect('/order-details')
    //  res.status(200).json({ message: 'Order placed successfully!' });
    } catch (error) {
      console.error('Failed to place order:', error);
      res.status(500).json({ error: 'Failed to place order' });
    }
  };
  
 
  
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
  }
  