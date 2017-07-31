
var admin = require("firebase-admin");

var serviceAccount = require("./channel-8e58c-firebase-adminsdk-umm8k-410d7f26c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://channel-8e58c.firebaseio.com"
});

var db = admin.database();
var roomRef = db.ref('room');
roomRef.once("value", (snapshot)=>{
  console.log(snapshot.val());
});

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
  
  /*
  if(//디비에 room 정보가 없으면){
    //룸 정보를 생성한다
  }else{
    //있으면 존재하는 룸 중에 가장 최근 방으로 연결시킨다.

  }
  */
  var roomUID = generateId(13);

  socket.join(roomUID, ()=>{
    let rooms = Object.keys(socket.rooms);
    console.log("rooms:",rooms); // [ <socket.id>, 'room 237' ]
    io.sockets.in(roomUID).emit('message', {message:'새로운 손님이 입장했습니다.', userName:''});
  });
  // socket.on('add user', function(userName){
  //   console.log('add user!!'+userName);
  //   socket.broadcast.emit('user joined', {
  //     userName: userName
  //   });
  // });
  socket.on('register', (data)=>{

    /*
    db에 채널ID를 생성하여 넣고
    소켓ID를 넣고 
    유저 아이디를 넣는다.
    */
    console.log("socketID:"+socket.id+"\n roomID:"+ roomUID);

  });
  socket.on('message', (data)=>{
    console.log("msg", data);
    io.sockets.in(roomUID).emit('message', data);
  });
  socket.on('disconnect', ()=>{
    console.log('a user disconnected');
  });
});


http.listen(8080, ()=>{
  console.log('listening on *:8080');
});

function generateId(size){
  var result = "";
  var pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var length = pool.length + 1;
  for(var i = 0; i < size; i++) {
      result += pool.charAt(Math.floor(Math.random() * (length)));
  }
  return result;
}
    
/*
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8080, 'localhost');
console.log('Server running at http://localhost:8080/');
*/
