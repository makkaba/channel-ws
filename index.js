
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res)=>{
	res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Web Socket Domain.\n');

  //res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
  console.log('a user connected');

  socket.join('room 237', ()=>{
    let rooms = Object.keys(socket.rooms);
    console.log(rooms); // [ <socket.id>, 'room 237' ]
    io.sockets.in('room 237').emit('message', {message:'새로운 손님이 입장했습니다.', userName:''});
  });
  // socket.on('add user', function(userName){
  //   console.log('add user!!'+userName);
  //   socket.broadcast.emit('user joined', {
  //     userName: userName
  //   });
  // });

  socket.on('message', (data)=>{
    console.log("msg", data);
    io.sockets.in('room 237').emit('message', data);
  });
  socket.on('disconnect', ()=>{
    console.log('a user disconnected');
  });
});


http.listen(8080, ()=>{
  console.log('listening on *:8080');
});
    
/*
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8080, 'localhost');
console.log('Server running at http://localhost:8080/');
*/
