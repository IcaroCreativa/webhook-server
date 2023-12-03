// Importations
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
require("dotenv").config();

// Déclaration des constantes
const allowedOrigin = process.env.CLIENT_URL;
const port = process.env.PORT || 3000;
console.log(allowedOrigin);
// Configuration CORS
const corsOptions = {
  origin: allowedOrigin,
  optionsSuccessStatus: 200,
};

// Création de l'application Express
const app = express();

// Configuration du serveur HTTP
const server = http.createServer(app);

// Configuration Socket.IO
const io = socketIO(server, {
  cors: corsOptions,
});

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

// Gestionnaire de connexion Socket.IO
// Gestionnaire de connexion Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected");

  // Stocker l'information sur la salle à laquelle l'utilisateur est connecté
  let currentRoom = null;
  let currentUser = null;

  // Gestionnaire de déconnexion Socket.IO
  socket.on("disconnect", () => {
    console.log("User disconnected");

    // Émettre un message aux autres membres de la salle si l'utilisateur est connecté à une salle
    if (currentRoom) {
      console.log(
        "message",
        `the user ${currentUser} has been disconnected from the room ${currentRoom}`
      );
      io.to(currentRoom).emit(
        "message",
        `the user ${currentUser} has been disconnected from the room ${currentRoom}`
      );
    }
  });

  // Gestionnaire d'événement "leave" pour quitter une salle
  socket.on("leave", (data) => {
    // Quitter la salle actuelle s'il y en a une
    if (currentRoom) {
      socket.leave(currentRoom);

      // Émettre un message aux autres membres de la salle actuelle
      io.to(currentRoom).emit(
        "message",
        `${currentUser} has left the room ${currentRoom}`
      );
      // Mettre à jour l'information sur la salle courante
      currentRoom = null;

      console.log(`User left room: ${data.roomNumber}`);
    }
  });

  // Gestionnaire d'événement "join" pour rejoindre une salle
  socket.on("join", (data) => {
    // Quitter la salle actuelle
    if (currentRoom) {
      socket.leave(currentRoom);
    }

    // Rejoindre la salle spécifiée
    socket.join(data.roomNumber);

    // Mettre à jour l'information sur la salle courante
    currentRoom = data.roomNumber;
    currentUser = data.user;

    console.log(`${data.user} joined room: ${data.roomNumber}`);
    io.to(currentRoom).emit("message", {
      message: `${currentUser} joined the room`,
      user: "",
    });
  });

  // Gestionnaire d'événement "message" réception dans une salle spécifique
  socket.on("message", (data) => {
    console.log(`Received message: ${data}`);

    // Émettre le message à tous les clients connectés dans la même salle
    if (currentRoom) {
      io.to(currentRoom).emit("message", { message: data, user: currentUser });
    }
  });
});

// Gestionnaire de connexion Socket.IO
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   // Gestionnaire de déconnexion Socket.IO
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });

//   // Gestionnaire d'événement "message" réception
//   socket.on("message", (data) => {
//     console.log(`Received message: ${data}`);

//     // Émettre le message à tous les clients connectés
//     io.emit("message", data);
//   });
// });

// Démarrer le serveur et écouter les connexions entrantes
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
