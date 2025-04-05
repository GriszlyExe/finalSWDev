const User = require('../models/User')
const {sendTokenResponse} = require('./utils')
exports.register = async (req,res,next) => {
    try {
        const {name,email,password,role,phoneNumber} = req.body
        
        console.log(req.body)

        const user = await User.create({
            name,
            email,
            password,
            role,
            phoneNumber
        })

        

        // const token = user.getSignedJwtToken()
        // res.status(200).json({success:1,token:token})

        sendTokenResponse(user,200,res)
        
    } catch (error) {
        res.status(400).json({success:0})
        console.log(error.stack)
    }
}

exports.login = async (req,res,next) => {

    try {
        const {email,password} = req.body

    if(!email || !password){
        return res.status(400).json({success:0,msg:"Please enter email or password"})
    }

    const user = await User.findOne({email}).select('+password')

    if(!user){
        return res.status(400).json({success:0,msg:"Invalid credential"})
    }

    console.log(user)
    
    const isMatch = await user.matchPassword(password)    

    if(!isMatch){
        return res.status(401).json({success:0,msg:"Invalid credential"})
    }

    // const token= user.getSignedJwtToken()
    // res.status(200).json({success:1,token})

    sendTokenResponse(user,200,res)
    } catch (error) {
        return res.status(401).json({
            success:0,
            msg:'Invalid Credential'
        })
    }
}

//@desc Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout=async(req,res,next)=>{
    res.cookie('token','none',{
    expires: new Date(Date.now()+ 10*1000),
    httpOnly:true
    });
    res.status(200).json({
    success:true,
    data:{}
    });
    };


// const sendTokenResponse = (user,statuscode,res) =>{
//     const token = user.getSignedJwtToken()

//     const options = {
//         expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRED*24*60*60*1000),
//         httpOnly:true
//     }

//     if(process.env.NODE_ENV === 'production'){
//         options.secure = true
//     }

//     res.status(statuscode)/*.cookie('token',token,options)*/.json({
// 	_id:user._id,
// name: user.name,
// email:user.email,
//         success:1,
//         token
//     })
// }

exports.getMe = async (req,res,next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success:1,
        data:user
    })
}
