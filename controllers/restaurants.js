const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

exports.getRestaurants= async (req,res,next)=>{
    try {

        let query

        const reqQuery = {...req.query}

        //Only used field
        const removeFields = ['select','sort','page','limit']
        console.log(reqQuery)

        removeFields.forEach(param => delete reqQuery[param])
        console.log(reqQuery)
        
        let queryString = JSON.stringify(reqQuery)

        queryString = queryString.replace(/\b{gt|gte|lt|lte|in}\b/g,match => `$${match}`)
        query = Restaurant.find(JSON.parse(queryString)).populate('reservations')
        
        //select field
        // if(req.query.select){
        //     const fields = req.query.select.split(',').join(' ')
        //     console.log(fields)
        //     query = query.select(fields)
            
        // }

        query = query.select('name address phoneNumber hours')

        //sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            console.log(sortBy)
            query = query.sort(sortBy)
        }else{
            query = query.sort('-createAt')
        }

        //Count page
        const page = parseInt(req.query.page,10) || 1
        const limit = parseInt(req.query.limit,10) || 25
        const startIndex = (page-1)*limit
        const endIndex = page*limit
        const total = await Restaurant.countDocuments()

        query.skip(startIndex).limit(limit)

        const restaurants = await query
        // console.log(hospitals)
        
        if(!restaurants){
            return res.status(400).json({success:0})
        }

        //Pagination result
        const pagination = {};

        if (endIndex < total){
            pagination.next = {
                page:page+1,
                limit
            }
        }

        if (startIndex>0){
            pagination.prev ={
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:1,data:restaurants,length:restaurants.length,pagination})
    } catch (error) {
        res.status(400).json({success:0})
    }
};

exports.getRestaurant = async (req,res,next)=>{
    try {
        const restaurant = await Restaurant.findById(req.params.id)
        if(!restaurant){
            return res.status(400).json({success:0,msg:`Restaurant not found with id ${req.params.id}`})
        }
        res.status(200).json({success:1,data:restaurant})
    } catch (error) {
        res.status(400).json({success:0})
    }
};
exports.createRestaurant = async (req,res,next)=>{
    try {
        const restaurant = await Restaurant.create(req.body)
        res.status(201).json({success:1,data:restaurant})
    } catch (error) {
        res.status(400).json({success:0})
    }
};
exports.updateRestaurant = async (req,res,next)=>{
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        if(!restaurant){
            return res.status(400).json({success:0,msg:`Restaurant not found with id ${req.params.id}`})
        }
        
        res.status(200).json({success:1,data:restaurant})
    } catch (error) {
        res.status(400).json({success:0})
    }
};

exports.deleteRestaurant = async (req,res,next)=>{
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
        if(!restaurant){
            return res.status(400).json({success:0})
        }

        await Reservation.deleteMany({restaurant:req.params.id})
        await Restaurant.deleteOne({_id:req.params.id})
        res.status(200).json({success:1,data:{}})
    } catch (error) {
        res.status(400).json({success:0})
    }
};