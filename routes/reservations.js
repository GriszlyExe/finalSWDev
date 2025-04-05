const express = require('express');
const {getReservations,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservation,
} = require('../controllers/reservations');
const router = express.Router({mergeParams:true});

router.get('/', getReservations); // Get all reservations
router.post('/', addReservation); // Create a new reservation
router.put('/:id', updateReservation); // Update a reservation by ID
router.delete('/:id', deleteReservation); // Delete a reservation by ID
router.get('/:id', getReservation); // Get a reservation by ID

module.exports = router;