const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({
    name:{
        type:String
    },
    discount:{
        type:Number
    },
    description:{
        type:String
    },
    applicable:{
        type:Number,
        required:true
    },
    dateReleased:{
        type:Date,
        default:Date.now()
    },
    dateExpiry:{
        type:Date
    }

})

const Coupon = mongoose.model('Coupon',couponSchema);

module.exports=Coupon;