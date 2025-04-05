const mongoose = require('mongoose')

const HospitalSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add a name'],
        trim:true,
        maxlength:[50,'Limit exceed']
    },
    address:{
        type:String,
        required:[true,'Please add an adress'],
    },
    district:{
        type:String,
        required:[true,'Please add a district'],
    },
    province:{
        type:String,
        required:[true,'Please add a province'],
    },
    postalcode:{
        type:String,
        required:[true,'Please add a postalcode'],
        maxlength:[5,'Postalcode can not be more than 5 digits']
    },
},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
},)

//Reverse populate woth virtuals
HospitalSchema.virtual('appointments',{
    ref:'Appointment',
    localField: '_id',
    foreignField: 'hospital',
    justOne:false
})

module.exports = mongoose.model('Hospital',HospitalSchema)