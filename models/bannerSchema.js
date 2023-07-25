const mongoose = require('mongoose')

const bannerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    activate:{
        type:Boolean,
        default:false
    }
})

const Banner = mongoose.model('Banner',bannerSchema)

module.exports = Banner;