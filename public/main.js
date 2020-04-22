let divSelectRoom=document.getElementById('selectroom')
let RoomNumber=document.getElementById('roomnumber')
let consultingroom = document.getElementById('consultingRoom')
let localvideo = document.getElementById('localVideo')
let remotevideo = document.getElementById('remoteVideo')
let goroom = document.getElementById('goRoom')

let roomnumber,localstream,remotestream, rtcpeerconnection, iscaller
const  icsServers = {
     'iceServer': [
         {'urls':'stun:stun.services.mozillacom'},
         {'urls':'stun:stun.l.google.com:19302'}
     ]
}
const streamConstrains ={
    audo:true,
    video:true
}
const socket = io()
goroom.onclick = () => {
    if(RoomNumber.value == ''){
        alert('please type a room name')
    }
    else{
        roomnumber= RoomNumber.value
        socket.emit('create or join', roomnumber)
       
        divSelectRoom.style = "display : none"
        consultingroom.style = "display: block"
    }
}
socket.on('created',room => {
    navigator.mediaDevices.getUserMedia(streamConstrains)
    .then( stream => {
        localstream = stream,
        localvideo.srcObject = stream 
        iscaller=true
    })
    .catch(err => {
        console.log('An error occured')
    })
})
socket.on('joined',room => {
    navigator.mediaDevices.getUserMedia(streamConstrains)
    .then( stream => {
        localstream = stream,
        localvideo.srcObject = stream 
        socket.emit('ready',roomnumber)
    })
    .catch(err => {
        console.log(err)
    })
})
socket.on('ready', () => {
    if(iscaller){
        rtcpeerconnection = new RTCPeerConnection(icsServers)
        rtcpeerconnection.onicecandidate = onIcecandidate
        rtcpeerconnection.ontrack = onAddStream
        rtcpeerconnection.addTrack(localstream.getTracks()[0],localstream)
        rtcpeerconnection.addTrack(localstream.getTracks()[1],localstream)
        rtcpeerconnection.createOffer()
        .then(sessionDescription => {
            rtcpeerconnection.setLocalDescription(sessionDescription)
            socket.emit('offer',{
                type:'offer',
                sdp: sessionDescription,
                room: roomnumber
            })
        })
        .catch(err => {
            console.log(err)
        })

    }
})
socket.on('offer', (event) => {
    if(iscaller){
        rtcpeerconnection = new RTCPeerConnection(icsServers)
        rtcpeerconnection.onicecandidate = onIcecandidate
        rtcpeerconnection.ontrack = onAddStream
        rtcpeerconnection.addTrack(localstream.getTracks()[0],localstream)
        rtcpeerconnection.addTrack(localstream.getTracks[1],localstream)
        rtcpeerconnection.setRemoteDescription(new RTCPeerConnection(event))
        rtcpeerconnection.createOffer()
        .then(sessionDescription => {
            rtcpeerconnection.setLocalDescription(sessionDescription)
            socket.emit('answer',{
                type:'answer',
                sdp: sessionDescription,
                room: roomnumber
            })
        })
        .catch(err => {
            console.log(err)
        })

    }
})
socket.on('answer',event => {
    rtcpeerconnection.setRemoteDescription(new RTCPeerConnection(event))
})
socket.on('candidate', event => {
    const candidate = new RTCIceCandidate({
        sdpMLineIndex:event.label,
        candidate:event.candidate
    })
    rtcpeerconnection.addIceCandidate(candidate)


})
function onAddStream(event){
    remotevideo.srcObject = event.stream[0]
    remotestream = event.stream[0]
}
function onIcecandidate(event){
    if(event.candidate){
        console.log('candidate')
        socket.emit('candidate',{
            type:'camdidate',
            label: event.candidate.sdpMLineIndex,
            id:event.candidate.sdpMid,
            candidate:event.candidate.candidate,
            room:roomnumber

        })
    }
}
