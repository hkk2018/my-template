var net = require('net');

var socket = net.createConnection(8124);
socket.on('connect',()=>{
    socket.write('hi');
    socket.on('data',(data)=>{console.log(data.toString())});
    socket.end();
})