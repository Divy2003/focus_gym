const axios = require("axios");

const MSG91_API_KEY = process.env.MSG91_API_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID; // e.g. "TXTIND"

// Send OTP via MSG91 Flow API
const sendOTPViaMSG91 = async (mobile, otp) => {
  try {
    if (!MSG91_API_KEY || !MSG91_TEMPLATE_ID || !MSG91_SENDER_ID) {
      throw new Error('Missing required MSG91 configuration. Please check your .env file');
    }

    console.log('Sending OTP via MSG91:', { mobile, otp });
    console.log('Using template ID:', MSG91_TEMPLATE_ID);
    
    const url = "https://api.msg91.com/api/v5/flow/"; // Updated endpoint

    // Clean mobile number - remove any non-digit characters and ensure proper format
    const cleanMobile = mobile.replace(/\D/g, ''); // Remove all non-digit characters
    
    const payload = {
      template_id: MSG91_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      short_url: "0",
      mobiles: `91${cleanMobile.slice(-10)}`, // Ensure 91 followed by last 10 digits
      otp: otp,
    };

    console.log('Sending payload to MSG91:', JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        authkey: MSG91_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log("MSG91 API Response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("MSG91 send error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendOTPViaMSG91 };
