var superchild = require('superchild');
var express = require('express');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);

var sockets = [];

app.get('/',function(req,res) {
res.sendFile(__dirname + '/index.html');
});

//io.on('connection',function(socket){
//  sockets.append(socket);
  //save current socket
//});


var process_map= {};

var create_child = function(cmd,child_name) {
  var child = superchild(cmd);
  child.on('stdout_line', function(line) {
    console.log('[stdout]: ', line);
    io.sockets.emit('stdout',line);
  });
  child.on('exit',function(code,signal){
    delete process_map[child_name];
  });
  process_map[child_name] = child;
}

var restart_child = function(cmd, child_name) {
  //close
  process_map[child_name].close(function(){
    //create
    create_child(cmd,child_name);
  });
}

app.get('/spawn', function(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  var result = '';
  console.log(req.query);
  if (req.query.name && req.query.command) {

    if (process_map[req.query.name]) {
      //close child and recreate it again
      restart_child(req.query.command,req.query.name);
      result = 'Process ' + req.query.name  +  ' restarted with command "'+req.query.command+'"';
    }
    else {
      //create child
      create_child(req.query.command,req.query.name);
      result = 'Process ' + req.query.name  +  ' created with command "'+req.query.command+'"';
    }

  }

  res.end(result);
});


















