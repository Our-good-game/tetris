var express = require('express')
var app = express()
var session = require('express-session')
var server = require('http').createServer(app)
var {Server} = require('socket.io')
var io = new Server (server);
app.use(session({
  secret:'secret',
  username: '',
  saveUninitialized: false,
  resave: true,
  cookie : {maxAge : 1000 * 60 * 10},
}))
app.use(express.urlencoded({ extended: false }))


//http & socket 
app.get('/', function (req, res) {
  var username = req.session.username;
  if(username==undefined){res.redirect('/login');}
  else res.sendFile(__dirname +'/index.html');
})
app.get('/index.html', function (req, res) {res.redirect('/')})
app.get('/518929.jpg', function (req, res) {res.sendFile(__dirname +'/518929.jpg')})

app.get('/login', function (req, res) {
  res.sendFile(__dirname +'/login.html');
})
app.post('/login', function(req, res) {
  var user = req.body
  console.log(user)
  if (user.username !== '' ) {
    req.session.username = user.username;
    res.redirect('/');
  }else{
    res.send("name error")
  }
  
})


app.get('/1vs1.html', function (req, res) {
  res.sendFile(__dirname + '/1vs1.html');
  app.get('/classic-tetris.js', function (req, res) {res.sendFile(__dirname + '/classic-tetris.js');})
  app.get('/player-interface.js', function (req, res) {res.sendFile(__dirname + '/player-interface.js');})
  app.get('/timer.js', function (req, res) {res.sendFile(__dirname + '/timer.js');})
  app.get('/render.js', function (req, res) {res.sendFile(__dirname + '/render.js');})
  app.get('/pauseitem.png', function (req, res) {res.sendFile(__dirname + '/pauseitem.png');})
})
app.get('/background.js', function (req, res) {res.sendFile(__dirname + '/background.js');})
app.get('/talking.html', function (req, res) {
    res.sendFile(__dirname + '/talking.html');
})


//socket
var messages=[{name: "Who",message: "test message"}]
var typing = false
var timer = null
var ids=new Map();
var people = 0 
io.on('connection', function (socket) {
    people++;console.log(people+' user connected');socket.emit("allMessage",messages);
    
    
    socket.on("sendMessage", function (message){
        messages.push(message)
        io.emit("newMessage",message)
    })
    socket.on('sendTyping',function(){
        console.log('typing')
        typing = true
        io.emit("someoneIsTyping",typing)
        clearTimeout(timer)
        timer = setTimeout(() =>{
          typing =false
          io.emit("someoneIsTyping",typing)
        },3000)
    })
    socket.on('login',function(id){
      id.pid=Math.floor(Math.random()*1000)
      ids.set(id.pid,{socket:socket,name:id.player,status:id.status})
      socket.emit('login',id)
    })
    socket.on('find',function(id){
        ids.get(id.pid).status= 'find'
        var opponent={player:"unknow", pid:000, status: "nan"}
        ids.forEach(function(value,key){
          if(key!==id.pid && value.status === 'find'){
            opponent.pid=key
            opponent.player=value.name
            opponent.status=value.status
          }
        })
        if(opponent.status==='find'){
          ids.get(opponent.pid).socket.emit('find',id)
          ids.get(opponent.pid).status='game'
          socket.emit('find',opponent)
          ids.get(id.pid).status='game'
        }
    })
    socket.on('fight',function(p2){
        ids.get(p2.pid).socket.emit('fight',p2)
    })
    socket.on('gamming',function(data,p2){
      ids.get(p2.pid).socket.emit('gamming',data)
    })
    socket.on('change',function(id){
      ids.get(id.pid).socket.emit('change',id);
    })
    
    
    
    socket.on('disconnect',function(){
      people--;
      console.log(people+' user disconnected')
    })
})
server.listen(8000,function(){console.log("Server socket 8000")})