const express = require('express');
const {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
} = require('../controllers/restaurants'); // Import all restaurant controllers
const router = express.Router();
const reservationRouter = require('./reservations'); // Import reservation routes
const {protect,authorize} = require('../middleware/auth'); // Import authentication middleware

router.use('/:restaurantId/reservations', reservationRouter); // Mount reservation routes under restaurant routes
router.get('/',protect,getRestaurants); // Get all restaurants
router.get('/:id',protect,getRestaurant); // Get a restaurant by ID
router.post('/',protect,createRestaurant); // Create a new restaurant
router.put('/:id',protect,updateRestaurant); // Update a restaurant by ID
router.delete('/:id',protect,deleteRestaurant); // Delete a restaurant by ID

module.exports = router;