const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const csvRoutes = require("./routes/csvRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api", csvRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.setTimeout(1800000);
server.keepAliveTimeout = 1800000;
server.headersTimeout = 1801000;
