const express = require('express');
const router = express.Router()
const dotenv = require('dotenv')
const {OAuth2Client} = require('google-auth-library')

async function getUserData(access_token) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token${access_token}`, {
    });
    const data = await response.json();
    console.log(data);
    return data;
}

router.get('/oauth', async (req, res, next) => {
    const code = req.query.code;
    try {
        const redirectUrl = 'http://localhost:3000/oauth'
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );
        const res = await oauth2Client.getToken(code);
        await oauth2Client.setCredentials(res.tokens);
        console.log(res.tokens);
        const user = oauth2Client.credentials;
        await getUserData(user.access_token);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: 0,
            msg: 'Error while signing in with Google',
        });
    }
});

router.post('/request', async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('referer-Policy', 'no-referrer-when-downgrade');

    const redirectUrl = 'http://localhost:3000/oauth'

    const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUrl
    );
    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
        prompt: 'consent',
    });

    res.json({
        url: authorizationUrl
    });
});


module.exports = router