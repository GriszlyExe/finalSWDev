const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const cookiePaser = require('cookie-parser')
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const auth = require('./routes/auth')
const reservations = require('./routes/reservations')
const restaurants = require('./routes/restaurants')
const oauth = require('./routes/oauth')

dotenv.config({path:'./config/config.env'});
connectDB();

const app = express();
const cors = require('cors')

const limiter=rateLimit({
    windowsMs:10*60*1000,//10 mins
    max: 100
    });

    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'Library API',
                version: '1.0.0',
                description: 'A simple Express VacQ API'
            },
            servers: [
                {
                    url: 'http://localhost:10000/api/v1'
                }
            ]
        },
        apis: ['./routes/*.js'],
    };
    
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    
app.options('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', ['X-Requested-With', 'Content-Type', 'credentials']);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200)
    next()
});

app.use(cors());
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(express.json())
app.use(mongoSanitize());
app.use(helmet());
app.use(xss())
app.use(hpp());
app.use(limiter);

app.use(cookiePaser())

app.use('/api/v1/auth',auth)
app.use('/api/v1/reservations',reservations)
app.use('/api/v1/restaurants',restaurants)
app.use('/api/v1',oauth)

const PORT = process.env.PORT;

const server = app.listen(PORT,console.log('Server is running on Port ' + PORT + ' Mode: ' + process.env.NODE_ENV))
    

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`)
    server.close(()=>process.exit(1))
})