const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL; // URL of the client (ex: localhost:3000);



const corsOptions = {
  origin: "http://localhost:3000", // replace with your frontend url
  methods: ["GET", "POST"],
  credentials: true,
};

const io = require("socket.io")(server, {
  cors: corsOptions,
});

// CORS Middleware
app.use(cors(corsOptions));

// Middleware to parse JSON and URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// GET route for the root
app.get("/", (req, res) => {
  res.send(`Welcome to the Socket Server of AppSimStudio! PORT: ${PORT} ALLOWED ORIGIN: ${allowedOrigin}`);
  
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  console.log("A user connected" + socket.id);

  socket.on("callClosed", (data) => {
    console.log("Callclosed event received");
    console.log("User who closed the call: ", data.me);
    console.log("User that needs to close his call: ", data.caller);
    socket.emit("callEnded", data);
});

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
    
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));