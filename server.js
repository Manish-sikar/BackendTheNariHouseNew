const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const userRouter = require("./v1/routes/authRoutes");
const path = require("path"); // Import the path module
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const connectToDatabase = require("./database/mongoseConnection");
// Health Check API
const https = require("https");

const app = express();
const PORT = process.env.PORT || 4041;
const SOCKET_PORT = process.env.SOCKET_PORT || 4040;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.use('/api/admin/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/admin", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to admin page Node Backend");
});


app.get("/health", (req, res) => {
  console.log("Health API called:", new Date().toISOString());

  res.status(200).json({
    success: true,
    status: "UP",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});


// ======================================
// HEALTH CHECK FUNCTION
// ======================================

const startHealthCheck = () => {
  const healthURL =
    process.env.HEALTH_URL || `https://jagannathnode.onrender.com/health`;

  const hitHealthAPI = async () => {
    try {
      console.log("Calling health API...");

      const response = await fetch(healthURL);

      console.log(
        `Health check: ${response.status} - ${new Date().toISOString()}`
      );

      // Optional: read response
      const data = await response.json();

      console.log("Health response:", data);

    } catch (error) {
      console.error("Health check failed:", error.message);
    }
  };

  // Call immediately
  hitHealthAPI();

  // Call every 10 seconds
  setInterval(hitHealthAPI, 45000);
};



app.get('/api/admin/uploads/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filepath = path.join(__dirname, 'uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).send('File not found');
    }

    res.sendFile(filepath);
  } catch (err) {
    console.error('Error serving file:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

 
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });


// Start the server
app.listen(PORT, async () => {
  try {
    await connectToDatabase();
  
  } catch (error) {
    console.log(error);
  }
   startHealthCheck();
  console.log(`Server is running on port ${PORT}`);
});

