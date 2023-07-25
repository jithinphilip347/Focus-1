const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({


  productname:{
    type:String,
    required:true
  },
  productbrand:{
   type:String,
   required:true
  },
  category:{
    type:String,
    required:true
  },
  originalprice: {
    type:String,
    required: true,
  },
  productprice:{
    type:String,
    required:true
  },
  stock:{
    type:Number,
    required:true
  },
  productdescription:{
    type:String,
    required:true
  },
productimage:[{
    type:String,
    required:true
}],
createdAt: {
  type: Date,
  default: Date.now()
}



});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;