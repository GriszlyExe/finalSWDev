const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
    },
    phone: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    hours: [
        {
            day: { type: String, required: true }, // e.g., "Monday"
            open: { type: String, required: true }, // e.g., "09:00 AM"
            close: { type: String, required: true }, // e.g., "10:00 PM"
        }
    ],
    
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true},
});

RestaurantSchema.virtual('reservations',{
    ref:'Reservation',
    localField: '_id',
    foreignField: 'restaurant',
    justOne:false
})

module.exports = mongoose.model('Restaurant', RestaurantSchema);