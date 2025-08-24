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
    
    const url = "https://api.msg91.com/api/v5/flow/";

    // Clean mobile number - remove any non-digit characters and ensure proper format
    const cleanMobile = mobile.replace(/\D/g, '');
    
    // Format mobile number properly for India
    let formattedMobile;
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      formattedMobile = cleanMobile; // Already has country code
    } else if (cleanMobile.length === 10) {
      formattedMobile = `91${cleanMobile}`; // Add country code
    } else if (cleanMobile.length === 11 && cleanMobile.startsWith('0')) {
      formattedMobile = `91${cleanMobile.substring(1)}`; // Remove leading 0 and add country code
    } else {
      formattedMobile = `91${cleanMobile.slice(-10)}`; // Take last 10 digits and add country code
    }
    
    const payload = {
      template_id: MSG91_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      short_url: "0",
      mobiles: formattedMobile,
      OTP: otp,
    };

    console.log('Sending payload to MSG91:', JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        authkey: MSG91_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log("MSG91 API Response:", JSON.stringify(response.data, null, 2));
    
    // Check if the response indicates success
    if (response.data.type === 'success') {
      console.log('OTP sent successfully via MSG91');
      return response.data;
    } else {
      throw new Error(`MSG91 API error: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error("MSG91 send error:", error.response?.data || error.message);
    
    // If MSG91 fails, you could implement a fallback SMS service here
    // For now, just rethrow the error
    throw error;
  }
};

// Alternative function using MSG91 SMS API (simpler approach)
const sendOTPViaSMS = async (mobile, otp) => {
  try {
    const url = "https://api.msg91.com/api/sendhttp.php";
    
    const cleanMobile = mobile.replace(/\D/g, '');
    const formattedMobile = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile.slice(-10)}`;
    
    const message = `Your OTP for login is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
    
    const params = {
      authkey: MSG91_API_KEY,
      mobiles: formattedMobile,
      message: message,
      sender: MSG91_SENDER_ID,
      route: "4", // Transactional route
      country: "91",
    };
    
    console.log('Sending SMS via MSG91 HTTP API:', params);
    
    const response = await axios.get(url, { params, timeout: 10000 });
    
    console.log("MSG91 SMS API Response:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("MSG91 SMS send error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { 
  sendOTPViaMSG91,
  sendOTPViaSMS // Export alternative method
};