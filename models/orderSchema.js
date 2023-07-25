const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: [{    
    type:{
        type:String,
        // required:true
    }, 
    street: 
          { 
        type: String, 
        // required: true 
          },
    city: 
          { 
        type: String, 
        // required: true 
          },
    state: 
          { 
        type: String, 
        // required: true 
          },
    country: 
          { 
        type: String, 
        // required: true 
          },
    postalcode: 
          { 
        type: String, 
        // required: true 
          }
}],
  products: [
    {
      productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
      },
      quantity: Number,
      basePrice: Number,
    }
  ],
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus:{
   type:String,
  
   default:"pending"
  },
  orderStatus:{
   type:String,
   enum: ['pending', 'shipped', 'confirmed', 'cancelled', 'delivered'],
   default:"pending"
  },
  status: {
    type: String,
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
