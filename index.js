//firebase admin 설정.
var admin = require("firebase-admin");
var serviceAccount = require("./channel-8e58c-firebase-adminsdk-umm8k-410d7f26c1.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://channel-8e58c.firebaseio.com"
});

//ref초기화
var db = admin.database();
var roomRef = db.ref('room');
var messageRef = db.ref('messages');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res)=>{
	res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Web Socket Domain.\n');
});

io.on('connection', (socket)=>{
  socket.on('register', (data)=>{
    var users = data;
    var roomInfoPromise = getRoomInfo();
    var roomInfo = roomInfoPromise.then(room => {
      var roomUid = '';  
      if(!room){
        roomUid = generateId(13);
        createNewRoom({userId: users.userId});
      }else{
        //자세한 매칭은 생략하고 첫번째 방에 연결시킨다.
        var keys = Object.keys(room);
        roomUid = keys[0];
        messageRef.child(roomUid).once('value').then(function(snapshot){
          socket.emit('load', snapshot.val());
        });
      }
      
      //생성된 방에 입장시키던지, 이미 있는 방에 입장시킨다.
      socket.join(roomUid, ()=>{
        let rooms = Object.keys(socket.rooms);
        io.sockets.in(roomUid).emit('message', {message:'새로운 손님이 입장했습니다.', sender:''});
      });

      socket.on('message', (data)=>{
        io.sockets.in(roomUid).emit('message', data);
        messageRef.child(roomUid).push().set({
          message: data.message,
          sender: data.sender
        });
      });
      socket.on('disconnect', ()=>{
        console.log('a user disconnected');
      });
    });
  });
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

function getRoomInfo(){
  //일단 무조건 첫번째 방을 가져온다
  return roomRef.once("value").then((snapshot)=>{
    return  snapshot.val();
  });
}

function createNewRoom({userId}){
  roomRef.push().set({userId : userId});
}


http.listen(8080, ()=>{
  console.log('listening on *:8080');
});
   
