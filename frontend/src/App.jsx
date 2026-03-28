import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { io } from "socket.io-client";
import "./videoCall.css";

// Backend URL (Render)
const socket = io("https://videocall-backend-fwz2.onrender.com");

const VideoCall = () => {

const myVideo = useRef(null);
const userVideo = useRef(null);
const peerRef = useRef(null);

const [stream, setStream] = useState(null);
const [myId, setMyId] = useState("");
const [userId, setUserId] = useState("");
const [receivingCall, setReceivingCall] = useState(false);
const [caller, setCaller] = useState("");
const [callerSignal, setCallerSignal] = useState(null);


// Get Camera + Socket Events
useEffect(() => {

navigator.mediaDevices
.getUserMedia({
video: true,
audio: true
})
.then((stream) => {

setStream(stream);

if (myVideo.current) {
myVideo.current.srcObject = stream;
}

});


// My Socket ID
socket.on("connect", () => {
setMyId(socket.id);
});


// Incoming Call
socket.on("incoming-call", (data) => {

setReceivingCall(true);
setCaller(data.from);
setCallerSignal(data.signal);

});


// Call Accepted
socket.on("call-accepted", (signal) => {

peerRef.current.signal(signal);

});


return () => {
socket.off("incoming-call");
socket.off("call-accepted");
};

}, []);


// Call User
const callUser = () => {

peerRef.current = new SimplePeer({
initiator: true,
trickle: false,
stream: stream,

config: {
iceServers: [
{
urls: "stun:stun.l.google.com:19302"
},
{
urls: "stun:global.stun.twilio.com:3478"
}
]
}

});


// Send Offer
peerRef.current.on("signal", (data) => {

socket.emit("call-user", {
userToCall: userId,
signal: data,
from: myId
});

});


// Receive Remote Video
peerRef.current.on("stream", (remoteStream) => {

if (userVideo.current) {
userVideo.current.srcObject = remoteStream;
}

});

};


// Accept Call
const acceptCall = () => {

setReceivingCall(false);

peerRef.current = new SimplePeer({
initiator: false,
trickle: false,
stream: stream,

config: {
iceServers: [
{
urls: "stun:stun.l.google.com:19302"
},
{
urls: "stun:global.stun.twilio.com:3478"
}
]
}

});


// Send Answer
peerRef.current.on("signal", (data) => {

socket.emit("accept-call", {
signal: data,
to: caller
});

});


// Receive Remote Video
peerRef.current.on("stream", (remoteStream) => {

if (userVideo.current) {
userVideo.current.srcObject = remoteStream;
}

});


// Connect Peers
peerRef.current.signal(callerSignal);

};


return (
<div className="videocall-container">

<div className="videocall-card">

<h2 className="title">Video Calling App</h2>

<div className="user-id">
Your ID: {myId}
</div>

<input
className="input-box"
placeholder="Enter User ID"
onChange={(e) => setUserId(e.target.value)}
/>

<button className="call-btn" onClick={callUser}>
Call User
</button>


{receivingCall && (
<div className="incoming-call">

<h3>Incoming Call...</h3>

<button
className="accept-btn"
onClick={acceptCall}
>
Accept Call
</button>

</div>
)}


<div className="video-container">

<div className="video-box">
<video
ref={myVideo}
autoPlay
muted
playsInline
className="video"
/>

<span className="video-label">My Video</span>
</div>


<div className="video-box">
<video
ref={userVideo}
autoPlay
playsInline
className="video"
/>

<span className="video-label">User Video</span>
</div>


</div>

</div>

</div>
);

};

export default VideoCall;
