const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");

exports.getHospitals= async (req,res,next)=>{
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
        query = Hospital.find(JSON.parse(queryString)).populate('appointments')
        
        //select field
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ')
            console.log(fields)
            query = query.select(fields)
            
        }

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
        const total = await Hospital.countDocuments()

        query.skip(startIndex).limit(limit)

        const hospitals = await query
        // console.log(hospitals)
        
        if(!hospitals){
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

        res.status(200).json({success:1,data:hospitals,length:hospitals.length,pagination})
    } catch (error) {
        res.status(400).json({success:0})
    }
};

exports.getHospital= async (req,res,next)=>{
    try {
        const hospital = await Hospital.findById(req.params.id)
        
        if(!hospital){
            return res.status(400).json({success:0,msg:`Hospital not found with id ${req.params.id}`})
        }
        res.status(200).json({success:1,data:hospital})
    } catch (error) {
        res.status(400).json({success:0})
    }
};

exports.createHospital= async (req,res,next)=>{
    const hospital = await Hospital.create(req.body)
    res.status(201).json({success:1,data:hospital})
};

exports.updateHospital= async (req,res,next)=>{
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        
        if(!hospital){
            return res.status(400).json({success:0,msg:`Hospital not found with id ${req.params.id}`})
        }
        
        res.status(200).json({success:1,data:hospital})
    } catch (error) {
        res.status(400).json({success:0})
    }
};

exports.deleteHospital= async (req,res,next)=>{
    try {
        const hospital = await Hospital.findById(req.params.id,req.body)
        
        if(!hospital){
            return res.status(400).json({success:0,msg:`Hospital not found with id ${req.params.id}`})
        }
        await Appointment.deleteMany({hospital:req.params.id})
        await Hospital.deleteOne({_id:req.params.id})

        res.status(200).json({success:1,data:hospital})
    } catch (error) {
        res.status(400).json({success:0})
    }
};
