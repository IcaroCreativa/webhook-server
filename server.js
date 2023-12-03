// Importations
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
require("dotenv").config();

// Déclaration des constantes
const allowedOrigin = process.env.MAIN_URL;
const port = process.env.PORT || 3000;

// Configuration CORS
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

// Création de l'application Express
const app = express();

// Configuration du serveur HTTP
const server = http.createServer(app);

// Configuration Socket.IO
const io = socketIO(server);

// Middleware CORS
app.use(cors(corsOptions));

// Middleware pour parser les requêtes JSON et URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Route GET pour la racine
app.get("/", (req, res) => {
  res.send("Welcome to the Socket server Server!");
});

// Route POST pour le point d'API socket
app.post("/api/socket", (req, res) => {
  console.log(req.body);
  res.status(200).send({ success: "Socket", body: req.body });
});

// Gestionnaire de connexion Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected");

  // Gestionnaire de déconnexion Socket.IO
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Gestionnaire d'événement "message" réception
  socket.on("message", (data) => {
    console.log(`Received message: ${data}`);

    // Émettre le message à tous les clients connectés
    io.emit("message", data);
  });
});

// Démarrer le serveur et écouter les connexions entrantes
server.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});

// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const allowedOrigin = process.env.MAIN_URL;
// console.log(allowedOrigin);

// const corsOptions = {
//   origin: allowedOrigin,
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// // Create an Express app and listen for incoming requests on port 3000
// const app = express();
// app.use(cors(corsOptions));
// const router = express.Router();
// const port = process.env.PORT || 3000;

// // Use middleware to parse incoming requests with JSON and URL-encoded payloads
// app.use(express.json());
// app.use(express.urlencoded());

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Internal Server Error");
// });

// // Handle GET requests to the root URL
// router.get("/", (req, res) => {
//   res.send("Welcome to the Webhook Server!");
// });

// // Handle POST requests to specific URLs i.e. webhook endpoints
// router.post("/api/socket", (req, res) => {
//   console.log(req.body);
//   res.status(200).send({ succes: "Socket", body: req.body });
// });

// // Mount the router middleware
// app.use(router);

// // Start the server and listen for incoming connections
// app.listen(port, () => {
//   console.log(`Server running at https://localhost:${port}/`);
// });
