const Order = require('../models/orderSchema')
const User = require('../models/userSchema')
const Product = require('../models/productSchema')
const moment = require('moment')



const fetchAllDeliveredOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            
            const successOrders = await Order.aggregate([
                {
                    $unwind: '$products'
                },
                {
                    $match: {
                        'products.orderStatus': 'delivered'
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
                },
             
            ]);

            console.log(successOrders,'successOrders');
            successOrders.forEach((order) => {
                order.createdAt = moment(order.createdAt).format('YYYY-MM-DD');
            });
            resolve(successOrders);
        } catch (error) {
            reject(error);
        }
    });
};

const fetchDailySaleReport = (date) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await Order.aggregate([
          {
            $unwind: '$products'
          },
          {
            $match: {
              'products.orderStatus': 'delivered'
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
        },
        ]);
  
        const TotalAmount = await Order.aggregate([
        {
            $match: {
              'products.orderStatus': 'delivered'
            }
          },
          {
            $group: {
              _id: null,
              Total: {
                $sum: '$total'
              }
            }
          }
        ]);
          
        console.log(result,'result -------------');
        // Format the createdAt date using moment
        result.forEach((report) => {
          report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
        });
  
        resolve({ dailyReports: result, TotalAmount });
        console.log(dailyReports,'dailyReports ---------');

      }
      catch (error) {
        console.log('aggregation error');
        reject(error);
      }
    });
  };
  

const fetchWeeklySaleReport = (months) => {
    return new Promise(async (resolve, reject) => {
        try {
            const [year, month] = months.split('-');
            console.log(year, month);

            // Convert month to number (1-based index)
            const numericMonth = parseInt(month);

            const startDate = new Date(year, numericMonth - 1, 1);
            const endDate = new Date(year, numericMonth, 0);

            console.log(startDate);
            console.log(endDate);

            const weeklyReports = await Order.aggregate([
                {
                    $unwind: '$products'
                  },
                  {
                    $match: {
                      'products.orderStatus': 'delivered'
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
                },
                
            ]);

            const TotalAmount = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lt: endDate
                        },
                        'orderStatus': 'delivered'
                    }
                },
                {
                    $group: {
                        _id: null,
                        Total: {
                            $sum: '$total'
                        }
                    }
                }
            ]);

            weeklyReports.forEach((report) => {
                report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
            });

            console.log('week', weeklyReports);
            console.log('total', TotalAmount);
            resolve({ weeklyReports, TotalAmount });
        } catch (err) {
            console.log(err);
            reject('aggregation error in weekly report');
        }
    });
};

const fetchYearlySaleReport = (year) => {
    return new Promise(async (resolve, reject) => {
        try {
            const yearlyReports = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${Number(year) + 1}-01-01`)
                        }
                    }
                },
                {
                    $unwind: '$Products'
                },
                {
                    $match: {
                        'Products.orderStatus': 'delivered'
                    }
                }
            ]);

            const TotalAmount = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${Number(year) + 1}-01-01`)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        Total: {
                            $sum: '$total'
                        }
                    }
                }
            ]);

            yearlyReports.forEach((report) => {
                report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
            });

            resolve({ yearlyReports, TotalAmount });
        } catch (err) {
            reject(err);
        }
    });
};
module.exports = {
    fetchDailySaleReport,
    fetchWeeklySaleReport,
    fetchYearlySaleReport,
    fetchAllDeliveredOrder
    
}