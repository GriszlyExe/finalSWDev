const Appointment = require('../models/Appointment')
const Hospital = require('../models/Hospital')

exports.getAppointments = async (req,res,next) =>{
    if (req.user.role !== 'admin'){
        query = Appointment.find({user:req.user.id}).populate({
            path:'hospital',
            select:'name province tel'
        })
    }else{
        if(req.params.hospitalId){
            query = Appointment.find({hospital:req.params.hospitalId}).populate({
                path:'hospital',
                select:'name province tel'
            })
        }else{
            query = Appointment.find().populate({
                path:'hospital',
                select:'name province tel'
            })
        }
        
    }

    try {
        const appointments = await query

        res.status(200).json({
            success:1,
            count:appointments.length,
            data:appointments
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:0,
            msg:'Cannot find Appointment'
        })
    }
}

exports.getAppointment = async (req,res,next) =>{
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path:'hospital',
            select:'name description tel'
        })

        if (!appointment){
            return res.status(404).json({
                success:0,
                msg:`No appointment found with id ${req.params.id}`
            })
        }

        res.status(200).json({
            success:1,
            data:appointment
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:0,
            msg:'Cannot find Appointment'
        })
    }
}

exports.addAppointment = async (req,res,next) =>{

    try {

        console.log(req.params)
        req.body.hospital = req.params.hospitalId
        const hospital = await Hospital.findById(req.params.hospitalId)

        if (!hospital){
            return res.status(404).json({
                success:0,
                msg:`No hospital found with id ${req.params.hospitalId}`
            })
        }

        req.body.user = req.user.id

        const existedAppointments = await Appointment.find({
            user:req.user.id
        })

        console.log(existedAppointments.length)
        
        //Can add only 3 appts
        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({
                success:0,
                msg:`The user with id ${req.user.id} has already made  3 appts`
            })
        }

        const appointment = await Appointment.create(req.body)

        res.status(200).json({
            success:1,
            data:appointment
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:0,
            msg:'Cannot create Appointment'
        })
    }
}

exports.updateAppointment = async (req,res,next) =>{
    try {

        let appointment = await Appointment.findById(req.params.id)
        if(!appointment){
            return res.status(404).json({
                success:0,
                msg: `No appointment with id ${req.params.id}`
            })
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })

        //Make sure user is appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success:0,
                msg:`User ${req.user.id} is not authorized to update this appt`
            })
        }

        res.status(200).json({
            success:1,
            data:appointment
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:0,
            msg:'Cannot update Appointment'
        })
    }
}

exports.deleteAppointmet = async (req,res,next) =>{
    try {

        const appointment = await Appointment.findById(req.params.id)

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success:0,
                msg:`User ${req.user.id} is not authorized to update this appt`
            })
        }

        if(!appointment){
            return res.status(404).json({
                success:0,
                msg: `No appointment with id ${req.params.id}`
            })
        }

        await appointment.deleteOne()

        res.status(200).json({
            success:0,
            data:{}
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:0,
            msg:'Cannot delete Appointment'
        })
    }
}