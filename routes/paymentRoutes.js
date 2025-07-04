const express = require('express');
const router = express.Router({ mergeParams: true });
const paymentController = require('../controllers/paymentController');
const { isloggedin } = require("../utils/middlware.js"); // Ensure user is logged in

router.post('/create-order', isloggedin, paymentController.createOrder);
router.post('/verify-payment', isloggedin, paymentController.verifyPayment);

module.exports = router;