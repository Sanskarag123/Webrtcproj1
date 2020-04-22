const express = require('express')
const app = express()
let http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
app.use(express.static('public'))
http.listen(port, '192.168.43.57',() => {
    console.log('Listening on port',port)
})
io.on('connection', socket => {
    console.log('user connected')
    socket.on('create or join', room => {
        console.log('create or join to room',room)
        const myRoom = io.sockets.adapter.rooms[room] || {length: 0}
        const numClients = myRoom.length
        console.log(room,'has' ,numClients,'clients')
        if(numClients ==0 ){
            socket.join(room)
            socket.emit('created',room)

        }
        else if(numClients ==1 ) {
            socket.join(room)
            socket.emit('joined',room)
        }
        else{
            socket.emit('full')
        }
    })
    socket.on('ready', room => {
        socket.broadcast.to(room).emit('ready')
    })
    socket.on('candidate',event => {
        socket.broadcast.to(event.room).emit('candidate',event)

    })
    socket.on('offer',event => {
        socket.broadcast.to(event.room).emit('offer',event.sdp)

    })
    socket.on('answer',event => {
        socket.broadcast.to(event.room).emit('answer',event.sdp)

    })
})