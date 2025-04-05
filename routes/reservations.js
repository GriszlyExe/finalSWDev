const express = require('express');
const {getReservations,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservation,
    sendInvitation
} = require('../controllers/reservations');
const router = express.Router({mergeParams:true});
const {protect, authorize} = require('../middleware/auth')


router.get('/',protect, getReservations); // Get all reservations
router.post('/',protect,authorize('user','admin'),addReservation); // Create a new reservation
router.put('/:id',protect,authorize('user','admin'),updateReservation); // Update a reservation by ID
router.delete('/:id',protect,authorize('user','admin'),deleteReservation); // Delete a reservation by ID
router.get('/:id',protect, getReservation); // Get a reservation by ID
router.post('/:reservationId/invite', protect, authorize('user', 'admin'), sendInvitation);

module.exports = router;