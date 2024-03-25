const express = require("express")
const http = require("http")
const cors = require("cors")
const app = express()
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_URL; // URL du client (ex: localhost:3000);
const PORT= process.env.PORT || 5000;

const corsOptions = {
	origin: allowedOrigin,
	optionsSuccessStatus: 200,
	methods: [ "GET", "POST" ]
  };
const io = require("socket.io")(server, {
	cors: corsOptions
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
  res.send("Welcome to the Socket Server of AppSimStudio!");
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
})

server.listen(PORT, () => console.log(`server is running on port ${PORT}`))
