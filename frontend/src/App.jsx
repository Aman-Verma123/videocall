
import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

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


// Get Camera + Mic
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


socket.on("connect", () => {
setMyId(socket.id);
});


socket.on("incoming-call", (data) => {

setReceivingCall(true);
setCaller(data.from);
setCallerSignal(data.signal);

});


return () => {
socket.off("incoming-call");
};

}, []);


// Call User
const callUser = () => {

peerRef.current = new SimplePeer({
initiator: true,
trickle: false,
stream: stream,
});


// Generate Offer
peerRef.current.on("signal", (data) => {

socket.emit("call-user", {
userToCall: userId,
signal: data,
from: myId,
});

});


// Receive Video
peerRef.current.on("stream", (remoteStream) => {

if (userVideo.current) {
userVideo.current.srcObject = remoteStream;
}

});


// Call Accepted
socket.on("call-accepted", (signal) => {

peerRef.current.signal(signal);

});

};


// Accept Call
const acceptCall = () => {

setReceivingCall(false);

peerRef.current = new SimplePeer({
initiator: false,
trickle: false,
stream: stream,
});


// Send Answer
peerRef.current.on("signal", (data) => {

socket.emit("accept-call", {
signal: data,
to: caller,
});

});


// Receive Video
peerRef.current.on("stream", (remoteStream) => {

if (userVideo.current) {
userVideo.current.srcObject = remoteStream;
}

});


// Connect Peers
peerRef.current.signal(callerSignal);

};


return (
<div style={{ textAlign: "center" }}>

<h2>Your ID: {myId}</h2>

<input
placeholder="Enter User ID"
onChange={(e) => setUserId(e.target.value)}
style={{ padding: "10px", width: "250px" }}
/>

<br />
<br />

<button onClick={callUser} style={{ padding: "10px" }}>
Call
</button>


{receivingCall && (
<div>

<h3>Incoming Call...</h3>

<button
onClick={acceptCall}
style={{ padding: "10px", marginTop: "10px" }}
>
Accept Call
</button>

</div>
)}


<div style={{ marginTop: "30px" }}>

<video
ref={myVideo}
autoPlay
muted
playsInline
style={{ width: "300px", marginRight: "10px" }}
/>


<video
ref={userVideo}
autoPlay
playsInline
style={{ width: "300px" }}
/>

</div>

</div>
);
};

export default VideoCall;

