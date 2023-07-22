const mongoose = require("mongoose");
const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
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
    // count: {
    //   type: Number
    // },
    totalPrice: {
      type: Number,
    }
  });

const Cart = mongoose.model("Cart", CartSchema);

module.exports =Cart