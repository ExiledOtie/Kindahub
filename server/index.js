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
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Allowed Origins
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://kindahub-chi.vercel.app",
];

/*
|--------------------------------------------------------------------------
| HTTP Server
|--------------------------------------------------------------------------
*/

const server = http.createServer(app);

/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Seed Database
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
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Kindahub API Running 🚀",
  });
});

/*
|--------------------------------------------------------------------------
| Socket Events
|--------------------------------------------------------------------------
*/

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);

    console.log(
      `${socket.id} joined conversation_${conversationId}`
    );
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);

    console.log(
      `${socket.id} left conversation_${conversationId}`
    );
  });

  socket.on("typing", (data) => {
    socket.to(`conversation_${data.conversationId}`).emit(
      "user_typing",
      {
        userId: data.userId,
        conversationId: data.conversationId,
      }
    );
  });

  socket.on("stop_typing", (data) => {
    socket.to(`conversation_${data.conversationId}`).emit(
      "user_stopped_typing",
      {
        userId: data.userId,
        conversationId: data.conversationId,
      }
    );
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});