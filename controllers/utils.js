exports.sendTokenResponse = (user,statuscode,res) =>{
    const token = user.getSignedJwtToken()
    const options = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRED*24*60*60*1000),
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res.status(statuscode)/*.cookie('token',token,options)*/.json({
	_id:user._id,
name: user.name,
email:user.email,
        success:1,
        token
    })
}

exports.sendTokenResponseForGoogle = (payload ,statuscode,res) =>{
    const options = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRED*24*60*60*1000),
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res.status(statuscode)/*.cookie('token',token,options)*/.json({
	_id:payload._id,
    name: payload.name,
    success:1,
    token:payload.googleToken,
    })
}
exports.sendTokenResponse = (user,statuscode,res) =>{
    const token = user.getSignedJwtToken()
    const options = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRED*24*60*60*1000),
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    res.status(statuscode)/*.cookie('token',token,options)*/.json({
	_id:user._id,
name: user.name,
email:user.email,
        success:1,
        token
    })
}
