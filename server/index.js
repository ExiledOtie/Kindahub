const express = require("express");
const cors = require("cors");

require("dotenv").config();

require("./config/db");

const seedSuperAdmin = require("./seeders/superAdminSeeder");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const seedGroups = require("./seeders/groupSeeder");
const contributionRoutes = require("./routes/contributionRoutes");


const app = express();

app.use(cors());
app.use(express.json());

// SEEDER
seedSuperAdmin();
seedGroups();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/contributions", contributionRoutes);

app.get("/", (req, res) => {
  res.send("Kindahub API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});