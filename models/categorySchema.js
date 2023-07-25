const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        default:0
    },
    
    deleted:{
        type:Boolean,
        default:false
    },

})

const Category = mongoose.model('categories', categorySchema);


   module.exports = Category;