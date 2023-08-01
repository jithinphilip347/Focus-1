const Order = require('../models/orderSchema')
const moment = require('moment')

const fetchAllDeliveredOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sucessOrders = await Order.aggregate([
                {
                    $unwind: '$products'
                },
                {
                    $match: {
                        'orderStatus': 'Delivered'
                    }
                },
                {
                    $lookup: {
                        from: 'products', // The name of the Product collection
                        localField: 'products.productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: '$productDetails' // Unwind the productDetails array
                },
                {
                    $addFields: {
                        'products.productname': '$productDetails.productname'
                    }
                },
                {
                    $project: {
                        productDetails: 0 // Exclude the productDetails field from the final result
                    }
                }
            ]);

            sucessOrders.forEach((order) => {
                order.createdAt = moment(order.createdAt).format('YYYY-MM-DD');
            });

            resolve(sucessOrders);
        } catch (error) {
            reject(error);
        }
    });
};



const fetchDailySaleReport = (date)=>{
    return new Promise(async(resolve,reject)=>{

        try{

        const dailyReports = await Order.aggregate([
        {
            $match:{
                createdAt:{

                    $gte: new Date(date),
                    $lt : new Date(date+ 'T23:59:59Z')
                },
                'orderStatus':'Delivered'
            }
        },
       
        {
            $unwind:'$Products'
        },
        {
            $match:{
                'orderStatus':'Delivered'
            }
        }
       
        ])
        const TotalAmount  = await Order.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte: new Date(date),
                        $lt : new Date(date+ 'T23:59:59Z')
                    },'orderStatus':'Delivered'
                }
            },
            {
                $group:{
                    _id:null,
                        Total:{
                            $sum:'$total'
                        }  
                }
            }
        ])
            // Format the createdAt date using moment
  dailyReports.forEach((report) => {
    report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
  });

        
        resolve({dailyReports,TotalAmount})
    }catch(error){
        console.log('agggreagation error');
        reject(error)
    }
       
    })
}
const fetchWeeklySaleReport = (months)=>{

    return new Promise(async(resolve,reject)=>{

        try{
        const[year,month] = months.split('-')
        console.log(year,month);

// Convert month to number (1-based index)
const numericMonth = parseInt(month);

const startDate = new Date(year,numericMonth-1,1);
const endDate = new Date(year,numericMonth,0);

console.log(startDate);
console.log(endDate);
const weeklyReports = await Order.aggregate([
    {
        $match:{
            createdAt:{

                $gte: startDate,
                $lt : endDate
            },'orderStatus':'Delivered'
        }
    }, {
            $unwind:'$Products'
        },
        {
            $match:{
                'orderStatus':'Delivered'
            }
        }
    
        ])

        const TotalAmount  = await Order.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte: startDate,
                        $lt :endDate
                    },'orderStatus':'Delivered'
                }
            },
            {
                $group:{
                    _id:null,
                        Total:{
                            $sum:'$total'
                        }  
                }
            }
        ])
        weeklyReports.forEach((report) => {
            report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
          });

        console.log('week',weeklyReports);
        console.log('total',TotalAmount);
        resolve({weeklyReports,TotalAmount})
    }catch(err){
        console.log(err);

        reject('aggregation error in weekly report')

    }
    })
}
const fetchYearlySaleReport = (year)=>{

    return new Promise(async(resolve,reject)=>{

        try{

            

        const yearlyReports = await Order.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${Number(year) + 1}-01-01`)
                    },
                    'orderStatus':'Delivered'
                }
            },
            {
                $unwind:'$Products'
            },
            {
                $match:{
                    'orderStatus':'Delivered'
                }
            }

        ])
        const TotalAmount  = await Order.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte: new Date(`${year}-01-01`),
                        $lt : new Date(`${Number(year + 1)}-01-01`)
                    },'orderStatus':'Delivered'
                }
            },
            {
                $group:{
                    _id:null,
                        Total:{
                            $sum:'$total'
                        }  
                }
            }
        ])
        yearlyReports.forEach((report) => {
            report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
          });
        
        resolve({yearlyReports,TotalAmount})
    }catch(err){
        reject(err)
    }

    })
     

    }

module.exports = {
    fetchDailySaleReport,
    fetchWeeklySaleReport,
    fetchYearlySaleReport,
    fetchAllDeliveredOrder
    
}