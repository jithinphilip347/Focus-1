const mongoose = require('mongoose')

const wishlistSchema =new mongoose.Schema({
    userId: {
        type: String,
        required:true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    }]
})

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;