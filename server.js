const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./server/database/connection");
dotenv.config({path:".env"});
const PORT = process.env.PORT || 3000 ;


connectDB();
// Middleware to parse URL-encoded and JSON request bodies
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Serve static files from the dist folder
app.use(express.static(path.resolve(__dirname, "dist")));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set the views directory to 'dist' instead of 'views'

app.set('views', 'C:\\Users\\arahu\\OneDrive\\Desktop\\k\\dist');

// Serve static assets from the specified folders

app.use("/", express.static(path.resolve(__dirname, "dist")));
app.use("/img", express.static(path.resolve(__dirname, "dist/resorce")));

// Route requests using the router module
app.use("/", require("./server/routes/routes"));

// Start the server
var server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = require("socket.io")(server, {
  allowEIO3: true, //False by default
});

var userConnection = [];

// Socket.io connection event
io.on("connection", (socket) => {
  console.log("Socket id is: ", socket.id);

  // Event handler for user connect
  socket.on("userconnect", (data) => {
    console.log("Logged in username", data.displayName);
    // Add user to userConnection array
    userConnection.push({
      connectionId: socket.id,
      user_id: data.displayName,
    });

    var userCount = userConnection.length;
    console.log("UserCount", userCount);
  });

  // Event handler for sending offer to remote user
  socket.on("offerSentToRemote", (data) => {
    var offerReceiver = userConnection.find(
      (o) => o.user_id === data.remoteUser
    );
    if (offerReceiver) {
      console.log("OfferReceiver user is: ", offerReceiver.connectionId);
      socket.to(offerReceiver.connectionId).emit("ReceiveOffer", data);
    }
  });

  // Event handler for sending answer to user1
  socket.on("answerSentToUser1", (data) => {
    var answerReceiver = userConnection.find(
      (o) => o.user_id === data.receiver
    );
    if (answerReceiver) {
      console.log("answerReceiver user is: ", answerReceiver.connectionId);
      socket.to(answerReceiver.connectionId).emit("ReceiveAnswer", data);
    }
  });

  // Event handler for sending candidate to user
  socket.on("candidateSentToUser", (data) => {
    var candidateReceiver = userConnection.find(
      (o) => o.user_id === data.remoteUser
    );
    if (candidateReceiver) {
      console.log(
        "candidateReceiver user is: ",
        candidateReceiver.connectionId
      );
      socket.to(candidateReceiver.connectionId).emit("candidateReceiver", data);
    }
  });

  // Event handler for user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
    // var disUser = userConnection.find((p) => p.connectionId === socket.id);
    // if (disUser) {
      // Remove disconnected user from userConnection array
      userConnection = userConnection.filter(
        (p) => p.connectionId !== socket.id
      );
      console.log(
        "Rest users username are: ",
        userConnection.map(function (user) {
          return user.user_id;
        })
      );
    // }
  });
  socket.on("remoteUserClosed",(data)=> {
    var closeedUser = userConnection.find(
      (o) => o.user_id === data.remoteUser
    );
    if (closeedUser) {
      console.log(
        "closeedUser user is: ",
        closeedUser.connectionId
      );
      socket.to(closeedUser.connectionId).emit("closeedRemoteUser", data);
    }
  })
});
