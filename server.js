
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const userRouter = require("./v1/routes/authRoutes");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const morgan = require("morgan");

const connectToDatabase = require("./database/mongoseConnection");

const app = express();
const PORT = process.env.PORT || 4041;

// ======================================
// MORGAN API REQUEST LOGGER
// ======================================

// Request start time
morgan.token("request-time", () => new Date().toISOString());

// Log each request with response time and status
app.use(
  morgan(
    ":request-time | :method :url | Status: :status | Time: :response-time ms | Size: :res[content-length] bytes"
  )
);

// Warn when an API takes more than 1000 ms
app.use((req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsedMs =
      Number(process.hrtime.bigint() - startTime) / 1e6;

    if (elapsedMs > 1000) {
      console.warn(
        `SLOW API: ${req.method} ${req.originalUrl} | ` +
        `Status: ${res.statusCode} | Time: ${elapsedMs.toFixed(2)} ms`
      );
    }
  });

  next();
});

// ======================================
// MIDDLEWARE
// ======================================

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/api/admin/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ======================================
// API ROUTES
// ======================================

app.use("/api/admin", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to admin page Node Backend");
});

// ======================================
// HEALTH CHECK API
// ======================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "UP",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// ======================================
// SERVE UPLOADS
// ======================================

app.get("/api/admin/uploads/:filename", (req, res) => {
  try {
    const filename = path.basename(
      decodeURIComponent(req.params.filename)
    );

    const filepath = path.join(__dirname, "uploads", filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).send("File not found");
    }

    res.sendFile(filepath);
  } catch (err) {
    console.error("Error serving file:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// ======================================
// SELF HEALTH CHECK
// ======================================

const startHealthCheck = () => {
  const healthURL =
    process.env.HEALTH_URL ||
    "https://jagannathnode.onrender.com/health";

  const hitHealthAPI = async () => {
    try {
      const start = Date.now();
      const response = await fetch(healthURL);

      console.log(
        `[HEALTH CHECK] ${response.status} | ` +
        `${Date.now() - start} ms | ${healthURL}`
      );

      await response.text();
    } catch (error) {
      console.error("[HEALTH CHECK FAILED]", error.message);
    }
  };

  hitHealthAPI();

  // Check every 45 seconds
  setInterval(hitHealthAPI, 45000);
};

// ======================================
// START SERVER
// ======================================

app.listen(PORT, async () => {
  try {
    await connectToDatabase();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }

  startHealthCheck();

  console.log(`Server is running on port ${PORT}`);
});
