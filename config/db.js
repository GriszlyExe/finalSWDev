const mongoose = require('mongoose')

const connectDB = async () =>{
    mongoose.set('strictQuery',true)
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    console.log(`Connect complete: ${conn.connection.host}`)
}

module.exports = connectDB;