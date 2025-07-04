const Razorpay = require('razorpay');
const crypto = require('crypto');

console.log("Loading controllers/paymentController.js");
console.log("Imported modules:", { Razorpay: !!Razorpay, crypto: !!crypto });

const RAZORPAY_KEY_ID = 'rzp_test_wUuLGUYwRHwUGc';
const RAZORPAY_KEY_SECRET = '8w4HQcMBxUISrPywdNSH7k2G';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    console.log('createOrder - Request headers:', req.headers);
    console.log('createOrder - Raw body:', req.rawBody || JSON.stringify(req.body));
    console.log('createOrder - Parsed body:', req.body);
    const { amount } = req.body;

    console.log('createOrder - Received amount:', amount, typeof amount);

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error('createOrder - Invalid amount:', amount);
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    const options = {
      amount: Math.round(parsedAmount * 100), // Convert to paisa
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    console.log('createOrder - Creating order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('createOrder - Order created:', order);
    res.json(order);
  } catch (error) {
    console.error('createOrder - Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    console.log('verifyPayment - Request headers:', req.headers);
    console.log('verifyPayment - Raw body:', req.rawBody || JSON.stringify(req.body));
    console.log('verifyPayment - Parsed body:', req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const { id: listingId } = req.params;

    console.log('verifyPayment - Params:', { listingId });
    console.log('verifyPayment - Session before update:', req.session);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('verifyPayment - Missing payment details:', req.body);
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    console.log('verifyPayment - Signature body:', body);
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    console.log('verifyPayment - Expected signature:', expectedSignature);
    console.log('verifyPayment - Received signature:', razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      console.log('verifyPayment - Payment verified successfully:', { razorpay_payment_id });
      req.session.booked = req.session.booked || {};
      req.session.booked[listingId] = true;
      console.log('verifyPayment - Session after update:', req.session);
      req.flash('success', 'Booked successfully!');
      return res.json({ success: true });
    } else {
      console.error('verifyPayment - Signature mismatch:', { expectedSignature, razorpay_signature });
      return res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('verifyPayment - Error:', error.message, error.stack);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
};