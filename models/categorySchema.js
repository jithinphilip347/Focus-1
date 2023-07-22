const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false
    }
})

const Category = mongoose.model('categories', categorySchema);


   module.exports = Category;