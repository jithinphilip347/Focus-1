const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        max: 20
    },
    email:{  
        type:String,
        required:true,
        trim: true,
        unique: true,
        lowercase: true
    },
    mon:{
    type:Number,
    required:true
    },
    image:{
      type:String,
      required:true
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
    password:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:String,
        default:null
    },
    blocked:{
        type:Boolean,
        default:false
    },
 
})

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};
   const User = mongoose.model('User', userSchema);


   module.exports = User;
