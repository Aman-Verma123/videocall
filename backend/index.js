const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server,{
 cors:{ origin:"*" }
})

io.on("connection",(socket)=>{

console.log("User Connected",socket.id)

// User A calling
socket.on("call-user",({userToCall,signal,from})=>{

io.to(userToCall).emit("incoming-call",{
 signal,
 from
})

})

// User B accept call
socket.on("accept-call",({signal,to})=>{

io.to(to).emit("call-accepted",signal)

})

})

server.listen(5000,()=>{
console.log("Server Running")
}) 