const express = require('express');
const router = express.Router({mergeParams:true})
const { getAppointments ,getAppointment, addAppointment, updateAppointment, deleteAppointmet} = require('../controllers/appointments');

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect,getAppointments)

router.route('/:id').get(protect,getAppointment)
.put(protect,authorize('user','admin'),updateAppointment)
.delete(protect,authorize('user','admin'),deleteAppointmet)

router.route('/').post(protect,authorize('user','admin'),addAppointment)

module.exports = router;