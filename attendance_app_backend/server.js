const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const axios = require('axios')
const mongoose = require('mongoose')

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  // console.log("Middleware - Headers:", req.headers);
  // console.log("Middleware - Request Body:", req.query);
  next();
});

app.get("/", (req, res) => {
  console.log("Hello");
  return res.send("Hello");
});

app.post('/api/login', async (req, res) => {
  console.log("Request Body:", req.query);
  const { email, password, lat, lng } = req.query;
// console.log("123")
//   console.log(email + password)
  if (!email || !password) {
    return res.status(400).json({ message: 'Email or password is missing' });
  }

  
  try {
    // const res1 = await axios.get("https://ipinfo.io/json?token=857ad8826f3a2c");
    // const [lat, lng] = res1.data.loc.split(",")
    // console.log(lat + " "+ lng);
    const payload = { email, message: 'Login successful', lat, lng };
    console.log("Payload", payload);

    const qrCodeData = JSON.stringify(payload);
    const qrCodeImageUrl = await QRCode.toDataURL(qrCodeData);
    return res.status(200).json({
      message: 'Login successful',
      qrCodeImageUrl,
    });
  } catch (error) {
    console.error("QR Code Error:", error);
    return res.status(500).json({ message: 'QR Code generation failed' });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});