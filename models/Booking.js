const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    listing: { type: mongoose.SchemaTypes.ObjectId, ref: 'Listing', required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;