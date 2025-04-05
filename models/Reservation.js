const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    numberOfGuests: {
        type: Number,
        required: true,
        min: 1
    },
    reservationDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});



module.exports = mongoose.model('Reservation', ReservationSchema);
