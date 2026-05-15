const express = require("express");
const cors = require("cors");
require("dotenv").config();

// DATABASE CONNECTION
require("./config/db");

// SEED SUPER ADMIN
const seedSuperAdmin = require("./seeders/superAdminSeeder");
seedSuperAdmin();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Kindahub API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});