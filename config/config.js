const myEnv = require('dotenv').config()
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const PAY_MAIL = process.env.PAY_MAIL


module.exports ={
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    PAY_MAIL
}