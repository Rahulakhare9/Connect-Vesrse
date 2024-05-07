// Declare variables
let localStream; // Local user's media stream
let username; // Local user's username
let remoteUser; // Remote user's username
// Get username and remoteUser from URL parameters
let url = new URL(window.location.href);
// username = url.searchParams.get("username");
// remoteUser = url.searchParams.get("remoteuser");

let peerConnection; // WebRTC peer connection object
let remoteStream; // Remote user's media stream
let sendChannel;
let reciveChannel;
var msgInput = document.querySelector("#m-input");
var msgSendBtn = document.querySelector("#m-send");
var chatTextArea = document.querySelector("#chat-text-area");
// localStorage.setItem("cnID", "12345678");
var cnID = localStorage.getItem("cnID");


if (cnID) {
  username = cnID;
  $.ajax({
    url: "/new-user-update/" + cnID + "",
    type: "PUT",
    success: function (response) {
      alert(response);
    },
  });
} else {
  var postData = "Demo Data";
  $.ajax({
    type: "POST",
    url: "/api/users",
    data: postData,
    success: function (response) {
      console.log(response);
      localStorage.setItem("cnID", response);
      username = response;
    },
    error: function (error) {
      console.log(error);
    },
  });
}



// Function to initialize the application
let init = async () => {
  try {
    // Get user's media stream (video and audio)
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Display local video stream in the user-1 video element
    document.getElementById("u-2").srcObject = localStream;

    $.post("http://localhost:3000/get-remote-users", { cnID: cnID })
      .done(function (data) {
        if (data[0]) {
          if (data[0]._id == remoteUser || data[0]._id == username) {

          } else {
            remoteUser = data[0]._id;
            createOffer( data[0]._id);
          };
        };
        // Start creating the offer for WebRTC connection
      })
      .fail(function (xhr, textStatus, errorThrown) {
        console.log(xhr.responseText);
      });

  } catch (error) {
    console.error("Error accessing user media:", error);
  }
};
init();

// Connect to the server using Socket.io
let socket = io.connect();

// Event listener for successful connection
socket.on("connect", () => {
  if (socket.connected) {
    // Emit a 'userconnect' event to the server with user's display name
    socket.emit("userconnect", {
      displayName: username,
    });
  }
});

// ICE servers configuration for WebRTC
let servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

// Function to create the peer connection
let createPeerConnection = async () => {
  peerConnection = new RTCPeerConnection(servers);

  // Create a new media stream object for remote video
  remoteStream = new MediaStream();

  // Display remote video stream in the user-2 video element
  document.getElementById("u-1").srcObject = remoteStream;

  // Add local tracks to the peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Event listener for incoming tracks from remote peer
  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // Event listener for when remote stream becomes inactive
  remoteStream.oninactive = () => {
    remoteStream.getTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    peerConnection.close();
  };

  // Event listener for ICE candidate events
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      // Send ICE candidate to the remote user
      socket.emit("candidateSentToUser", {
        username: username,
        remoteUser: remoteUser,
        iceCandidateData: event.candidate,
      });
    }
  };

  // Create data channel for sending messages
  sendChannel = peerConnection.createDataChannel("sentDataChannel");
  sendChannel.onopen = () => {
    console.log("Data channel is open and ready to use");
    onSendChannelStateChanges();
  };

  // Event listener for incoming data channel
  peerConnection.ondatachannel = reciveChannelCallback;
};

// Function to send data
function sendData() {
  const msgData = msgInput.value;
  appendMessage("me", msgData); // Append message with "me" prefix
  if (sendChannel && sendChannel.readyState === "open") {
    sendChannel.send(msgData);
    msgInput.value = "";
  } else if (reciveChannel && reciveChannel.readyState === "open") {
    reciveChannel.send(msgData);
    msgInput.value = "";
  } else {
    console.log("Data channel is not open.");
  }
}

// Function to append message to chat area
function appendMessage(sender, message) {
  const prefix = sender === "me" ? "<b>me:</b> " : "<b>Stranger:</b> ";
  const newMessage = document.createElement("div");
  newMessage.innerHTML = prefix + message;
  chatTextArea.appendChild(newMessage);
  chatTextArea.scrollTop = chatTextArea.scrollHeight; // Scroll to bottom
}

// Function to handle incoming data channel
function reciveChannelCallback(event) {
  console.log("Receive Channel Callback");
  reciveChannel = event.channel;
  reciveChannel.onmessage = onReceiveChannelMessageCallback;
  reciveChannel.onopen = onReceiveChannelStateChange;
  reciveChannel.onclose = onReceiveChannelStateChange;
}

// Function to handle received messages
function onReceiveChannelMessageCallback(event) {
  console.log("Received Message");
  appendMessage("Stranger", event.data); // Append message with "Stranger" prefix
}

// Function to handle data channel state change
function onReceiveChannelStateChange() {
  const readyState = reciveChannel.readyState;
  console.log("Receive channel state is: " + readyState);
  if (readyState === "open") {
    console.log("Receive channel ready state is open - onReceiveChannelStateChange");
  } else {
    console.log("Receive channel ready state is not open - onReceiveChannelStateChange");
  }
}

// Function to handle data channel state change for sending channel
function onSendChannelStateChanges() {
  const readystate = sendChannel.readyState;
  console.log("Send channel state is:" + readystate);
  if (readystate == "open") {
    console.log("Data channel ready state is open - onSendChannelstateChange");
  } else {
    console.log("Data channel ready state is not open - onSendChannelstateChange");
  };
};

function fetchNextUser(remoteUser) {
  $.post("http://localhost:3000/get-next-user",
    { cnID: cnID, remoteUser: remoteUser },
    function (data) {
      console.log("Next user id is:", data);
      if (data[0]) {
        if (data[0]._id == remoteUser || data[0]._id == username) {

        } else {
          remoteUser = data[0]._id;
          createOffer(data[0]._id);
        };
        
      };
    })
}
// Function to create and send offer to the remote user
let createOffer = async (remoteU) => {
  createPeerConnection();
  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offerSentToRemote", {
    username: username,
    remoteUser: remoteU,
    offer: peerConnection.localDescription,
  });
};

// Function to create and send answer to the remote user
let createAnswer = async (data) => {
  remoteUser = data.username;

  createPeerConnection();
  await peerConnection.setRemoteDescription(data.offer);
  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answerSentToUser1", {
    answer: answer,
    sender: data.remoteUser,
    receiver: data.username,
  });
  document.querySelector("#Next").style.pointerEvents = "auto";
  $.ajax({
    url: "/update-on-engagement/" + username + "",
    type: "PUT",
    success: function (response) {

    }
  })
};

// Event listener for receiving offer from the remote user
socket.on("ReceiveOffer", function (data) {
  createAnswer(data);
});

socket.on("closeedRemoteUser", function (data) {

  const remoteStream = peerConnection.getRemoteStreams()[0];
  remoteStream.getTracks().forEach((track) => track.stop());

  peerConnection.close();
  const remoteVid = document.getElementById("u-1");
  if (remoteVid.srcObject) {
    remoteVid.srcObject.getTracks().forEach((track) => track.stop());
    remoteVid.srcObject = null;
  };

  $ajax({
    url: "/upadte-on-next/" + username + "",
    type: "PUT",
    success: function (response) {
      fetchNextUser(remoteUser);

    },
  });
});



// Function to add answer received from the remote user
let addAnswer = async (data) => {
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(data.answer);
  }
  document.querySelector("#Next").style.pointerEvents = "auto";
  $.ajax({
    url: "/update-on-engagement/" + username + "",
    type: "PUT",
    success: function (response) {

    }
  })
};

// Event listener for receiving answer from the remote user
socket.on("ReceiveAnswer", function (data) {
  addAnswer(data);
});

// Event listener for receiving ICE candidates from the remote user
socket.on("candidateReceiver", function (data) {
  peerConnection.addIceCandidate(data.iceCandidateData);
});

// Event listener for sending message button click
msgSendBtn.addEventListener("click", function (event) {
  sendData();
});


window.addEventListener("unload", function (event) {
  $.ajax({

    url: "/leaving-user-update/" + username + "",
    type: "put",
    success: function (response) {
      alert(response);
    },
  });
  $.ajax({
    url: "/update-on-otheruser-closing/" + remoteUser + "",
    type: "put",
    success: function (response) {
      alert(response);
    },
  });
});

async function closeConnection() {
  const remoteStream = peerConnection.getRemoteStreams()[0];
  remoteStream.getTracks().forEach((track) => track.stop());

  await peerConnection.close();
  const remoteVid = document.getElementById("u-1");
  if (remoteVid.srcObject) {
    remoteVid.srcObject.getTracks().forEach((track) => track.stop());
    remoteVid.srcObject = null;
  }

  await socket.emit("remoteUserClosed", {
    username: username,
    remoteUser: remoteUser,
  });
  $ajax({
    url: "/upadte-on-next/" + username + "",
    type: "PUT",
    success: function (response) {
      fetchNextUser(remoteUser);

    },
  });

}

// document.querySelector("#Next").onclick = function() {
$(document).on("click", "#Next", function () {
  document.querySelector("#chat-text-area").innerHTML = "";
  console.log("From Next Chat button");
  closeConnection();
});
