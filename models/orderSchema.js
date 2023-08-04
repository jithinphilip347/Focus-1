const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
      orderStatus:{
        type:String,
        enum: ['pending', 'shipped', 'confirmed', 'cancelled', 'delivered','returned'],
        default:"pending"
       },
      //  status: { 
      //   type: String,
      //   default: 'active'
    
    // },
    cancellationReason: {
      type: String,
      default: null,
    },
      return:[
      {
        status:{
            type:Boolean,
            default:false
        },
        reason:{
            type:String,
            required:false
        },
        pickup:{
            type:Boolean,
            default:false,
        },
    }
      ],  
  }],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
