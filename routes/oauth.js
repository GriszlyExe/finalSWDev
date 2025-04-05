const express = require('express');
const router = express.Router()
const dotenv = require('dotenv')
const {OAuth2Client} = require('google-auth-library');
const { sendTokenResponseForGoogle } = require('../controllers/utils');
const { register } = require('../controllers/auth');
const { google } = require('googleapis');

async function getUserData(access_token) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`, {
    });
    const data = await response.json();
    console.log({data});
    return data;
}

router.get('/oauth', async (req, res, next) => {
    const code = req.query.code;
    // console.log({code})
    try {
        const redirectUrl = `http://localhost:10000/api/v1/oauth`
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );

        
        const tokenResponse = await oauth2Client.getToken({
            code,
        });
        await oauth2Client.setCredentials(tokenResponse.tokens);
        console.log(tokenResponse.tokens);
        const user = oauth2Client.credentials;
        const data = await getUserData(tokenResponse.tokens.access_token);
        const payload = {
            id: data.sub,
            name: data.name,
            googleToken: user.id_token,
        }

        console.log({payload})

        sendTokenResponseForGoogle(payload, 200, res);
    }
    catch (err) {
        console.error('OAuth Error:', err.response?.data || err.message);
        return res.status(500).json({ success: 0, msg: 'OAuth error' });
    }
});

router.post('/request', async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('referer-Policy', 'no-referrer-when-downgrade');

    const redirectUrl = `http://localhost:10000/api/v1/oauth`

    const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUrl
    );
    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        prompt: 'consent',
    });

    res.json({
        url: authorizationUrl
    });
});


module.exports = router