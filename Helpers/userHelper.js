const Cart = require("../models/cartSchema");
// const Product =require("../models/productSchema")


const calculateTotalPrice = (products) => {
    let totalPrice =0;
    for (let product of products) {
      const productPrice = parseFloat(product.basePrice);
      if (!isNaN(productPrice)) {
        totalPrice += productPrice;
      }
    }
    return totalPrice;
  };
  
 const cartCount = async (userId) =>{
  try {
    const cart = await Cart.findOne({userId:userId})
    const products = cart.products;
    const count = products.length
    return count
  } catch (error) {
    console.log(error)
  }
  
 };

  module.exports = {
    calculateTotalPrice,
    cartCount,
    
  };
  