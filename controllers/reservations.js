const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({path:'./config/config.env'});

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//Get all reservations
exports.getReservations = async (req,res,next) =>{
        if (req.user.role !== 'admin'){
            query = Reservation.find({user:req.user.id}).populate({
                path:'restaurant',
            })
        }else{
            if(req.params.restaurantId){
                query = Reservation.find({restaurant:req.params.restaurantId}).populate({
                    path:'restaurant',
                })
            }else{
                query = Reservation.find().populate({
                    path:'restaurant',
                })
            }
            
        }

        try {
            const reservations = await query
    
            res.status(200).json({
                success:1,
                count:reservations.length,
                data:reservations   
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                success:0,
                msg:'Cannot find reservations'
            })
        }
}

exports.getReservation = async (req,res,next) =>{
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path:'restaurant',
        })

        if (!reservation){
            return res.status(404).json({
                success:0,
                msg:`No reservation found with id ${req.params.id}`
            })
        }

        res.status(200).json({
            success:1,
            data:reservation
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:0,
            msg:'Cannot find reservation'
        })
    }
}

exports.addReservation = async (req,res,next) =>{

    try {

        console.log(req.params)
        req.body.restaurant = req.params.restaurantId
        const restaurant = await Restaurant.findById(req.params.restaurantId)

        console.log(restaurant)

        if (!restaurant){
            return res.status(404).json({
                success:0,
                msg:`No restaurant found with id ${req.params.restaurantId}`
            })
        }

        console.log(req.user)
        req.body.user = req.user.id

        const existedReservations = await Reservation.find({
            user:req.user.id
        })

        console.log(existedReservations.length)
        
        //Can add only 3 resvs
        if(existedReservations.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({
                success:0,
                msg:`The user with id ${req.user.id} has already made  3 resvs`
            })
        }

        const reservation = await Reservation.create(req.body)

        res.status(200).json({
            success:1,
            data:reservation
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:0,
            msg:'Cannot create reservation'
        })
    }
}

exports.updateReservation = async (req,res,next) =>{
    try {

        let reservation = await Reservation.findById(req.params.id)
        if(!reservation){
            return res.status(404).json({
                success:0,
                msg: `No reservation with id ${req.params.id}`
            })
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })

        //Make sure user is appointment owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success:0,
                msg:`User ${req.user.id} is not authorized to update this reservation`
            })
        }

        res.status(200).json({
            success:1,
            data:reservation
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:0,
            msg:'Cannot update reservation'
        })
    }
}

exports.deleteReservation = async (req,res,next) =>{
    try {
        console.log(req.params)
        const reservation = await Reservation.findById(req.params.id)
        console.log({reservation})
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success:0,
                msg:`User ${req.user.id} is not authorized to update this reservation`
            })
        }

        if(!reservation){
            return res.status(404).json({
                success:0,
                msg: `No reservation with id ${req.params.id}`
            })
        }

        await reservation.deleteOne()

        res.status(200).json({
            success:0,
            data:{}
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:0,
            msg:'Cannot delete reservation'
        })
    }
}

exports.sendInvitation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.reservationId)
            // .populate('restaurant')
            // .populate('user', 'name email');
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation found with id ${req.params.reservationId}`
            });
        }

        // Check authorization
        if (reservation.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to invite users to this reservation'
            });
        }

        const { email } = req.body;

        if (!email || !email.includes('@gmail.com')) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid Gmail address'
            });
        }

        const restaurant = await Restaurant.findById(reservation.restaurant);
        const user = await User.findById(reservation.user);

        const mailOptions = {
            from: `${req.user.name} < ${process.env.EMAIL_USER} >`,
            to: email,
            subject: `Invitation to join reservation at ${restaurant.name}`,
            html: `
                <p>Hello,</p>
                <p>You have been invited by ${user.name} (${user.email}) to join their reservation:</p>
                <ul>
                    <li>Restaurant: ${restaurant.name}</li>
                    <li>Date: ${reservation.reservationDate.toLocaleString()}</li>
                    <li>Number of guests: ${reservation.numberOfGuests}</li>
                </ul>
                <p>Thank you!</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                to: email,
                reservationId: reservation._id
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Error sending invitation'
        });
    }
};

exports.blockReservation = async (req, res, next) => {

    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation found with id ${req.params.id}`
            });
        }

        reservation.isBlocked = true;
        await reservation.save();

        res.status(200).json({
            success: true,
            message: 'Reservation blocked successfully',
            data: reservation
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Error blocking reservation'
        });
    }
}