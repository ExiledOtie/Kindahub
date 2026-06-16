const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();
require("./config/db");

const seedSuperAdmin = require("./seeders/superAdminSeeder");
const seedGroups = require("./seeders/groupSeeder");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const contributionRoutes = require("./routes/contributionRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const loanRoutes = require("./routes/loanRoutes");
const loanPaymentRoutes = require("./routes/loanPaymentsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const communicationRoutes = require("./routes/communicationRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Create HTTP Server
|--------------------------------------------------------------------------
*/
const server = http.createServer(app);

/*
|--------------------------------------------------------------------------
| Initialize Socket.IO
|--------------------------------------------------------------------------
*/
const io = new Server(server, {
  cors: {
    origin: "*", // change this in production
    methods: ["GET", "POST"],
  },
});

/*
|--------------------------------------------------------------------------
| Make io available in controllers
|--------------------------------------------------------------------------
*/
app.set("io", io);

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/
app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Seeders
|--------------------------------------------------------------------------
*/
seedSuperAdmin();
seedGroups();

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/loan-payments", loanPaymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/communications", communicationRoutes);

app.get("/", (req, res) => {
  res.send("Kindahub API Running");
});

/*
|--------------------------------------------------------------------------
| Socket.IO Events
|--------------------------------------------------------------------------
*/
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  /*
  |--------------------------------------------------------------------------
  | Join conversation room
  |--------------------------------------------------------------------------
  */
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);

    console.log(
      `${socket.id} joined conversation_${conversationId}`
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Leave conversation room
  |--------------------------------------------------------------------------
  */
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);

    console.log(
      `${socket.id} left conversation_${conversationId}`
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Typing indicators
  |--------------------------------------------------------------------------
  */
  socket.on("typing", (data) => {
    socket
      .to(`conversation_${data.conversationId}`)
      .emit("user_typing", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
  });

  socket.on("stop_typing", (data) => {
    socket
      .to(`conversation_${data.conversationId}`)
      .emit("user_stopped_typing", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
  });

  /*
  |--------------------------------------------------------------------------
  | Disconnect
  |--------------------------------------------------------------------------
  */
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});