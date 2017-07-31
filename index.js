
var admin = require("firebase-admin");

var serviceAccount = require("./channel-8e58c-firebase-adminsdk-umm8k-410d7f26c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://channel-8e58c.firebaseio.com"
});

var db = admin.database();
var roomRef = db.ref('room');
var messageRef = db.ref('messages');




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
  

  // socket.on('add user', function(userName){
  //   console.log('add user!!'+userName);
  //   socket.broadcast.emit('user joined', {
  //     userName: userName
  //   });
  // });
  socket.on('register', (data)=>{
    var users = data;
    var roomInfoPromise = getRoomInfo();
    var roomInfo = roomInfoPromise.then(room => {
      var roomUid = '';  
      if(!room){
        //유저 아이디에 해당하는 방이 없으면 새로 생성한다
        
        roomUid = generateId(13);
        //db에 저장한다. 
        console.log(data);
        createNewRoom({roomUid: roomUid, userId: users.userId});
      }else{
        //자세한 매칭은 생략하고 첫번째 방에 연결시킨다.
        var keys = Object.keys(room);
        roomUid = keys[0];
        messageRef.child(roomUid).once('value').then(function(snapshot){
          socket.emit('load', snapshot.val());
        });


        console.log("ROOM!!", room);
      }
      
      //생성된 방에 입장시키던지, 이미 있는 방에 입장시킨다.
      socket.join(roomUid, ()=>{
        let rooms = Object.keys(socket.rooms);
        console.log("rooms:",rooms); // [ <socket.id>, 'room 237' ]
        io.sockets.in(roomUid).emit('past messages', )
        io.sockets.in(roomUid).emit('message', {message:'새로운 손님이 입장했습니다.', sender:''});
      });

      socket.on('message', (data)=>{
        console.log("msg", data);
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

    

    /*
    db에 채널ID를 생성하여 넣고
    소켓ID를 넣고 
    유저 아이디를 넣는다.
    */
    //console.log("socketID:"+socket.id+"\n roomID:"+ roomUid+"\n userId:"+data.userId);
    
  
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

function createNewRoom({roomId, userId}){
  roomRef.push().set({userId : userId});
}


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
