const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
    apptdate:{
        type: Date,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        require:true
    },
    hospital:{
        type:mongoose.Schema.ObjectId,
        ref: 'Hospital',
        require:true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Appointment',AppointmentSchema)