 var express = require('express');
 var fs = require('fs');
 var app = express();
 var multer = require('multer');
 var bodyParser = require('body-parser');
 var socket = require("socket.io")
 var request = require('request');
 var socket_record = require('socket.io-client')('http://192.168.137.1:8888/update');
 var router = express.Router();
 // var atomicBomb = express.Router();
 var server = app.listen(8001);
 var io = socket(server);
 var uploadName;
 var flush = true;
 var Console = [];
 var comments;
 var likes = 0;

 console.log("washroom running on 8001;")
 var imageBuffer = [];
 var imageScaleBuffer = [];



 //setup record
 request("http://192.168.137.1:8888/record", function(error, response, body) {
     if (!error && response.statusCode == 200) {
         var data = JSON.parse(body);
         consoleData = data;
         console.log(consoleData)
         setInterval(function() {
             socket_record.emit("update", consoleData)
         }, 1000);

     }
 })
 request("http://192.168.137.1:8888/comments", function(error, response, body) {
     if (!error && response.statusCode == 200) {
         var data = JSON.parse(body);
         comments = data;
         console.log("total comments:" + comments.comments.length+" last:"+comments.comments[comments.comments.length-1].comment)
     }
 })
 request("http://192.168.137.1:8888/weibo", function(error, response, body) {
     if (!error && response.statusCode == 200) {
         var data = JSON.parse(body);
         consoleData = data;
         console.log("weiboGet")
     }
 })


 var ServerLimit = 200000;

 app.use('', router);
 router.get('/', function(req, res) {
     res.sendFile(__dirname + "/public/home/index.html");
 })
 router.get('/toilet', function(req, res) {
     res.sendFile(__dirname + "/public/closestool/uploader.html");
 })
 router.get('/faucet', function(req, res) {
     res.sendFile(__dirname + "/public/faucet/index.html");
 })
 router.get('/dryer', function(req, res) {
     res.sendFile(__dirname + "/public/dryer/index.html");
 })
 router.get("/mirror", function(req, res) {
     res.sendFile(__dirname + "/public/mirror/index.html");
 });
 router.get("/mirrorClient", function(req, res) {
     res.sendFile(__dirname + "/public/mirror/client.html");
 });
 router.get("/me", function(req, res) {
     res.sendFile(__dirname + "/public/author/index.html");
 });


 //router
 app.get("/", function(req, res) {
     res.sendFile(__dirname + "/public/HomePage/index.html");
 });
 app.get("/mirrorClient", function(req, res) {
     res.redirect('../mirrorClient')
 });
 app.get("/author", function(req, res) {
     res.sendFile(__dirname + "/public/author/index.html");
 });
 app.get("/me", function(req, res) {
     res.sendFile(__dirname + "/public/author/index.html");
 });
 app.get("/toilet", function(req, res) {
     res.sendFile(__dirname + "/public/closestool/uploader.html");
 });
 app.get("/mirror", function(req, res) {
     res.sendFile(__dirname + "/public/mirror/index.html");
 });
 app.get("/mirrorScreen", function(req, res) {
     res.sendFile(__dirname + "/public/mirror/index.html");
 });
 app.get("/mirror", function(req, res) {
     res.sendFile(__dirname + "/public/mirror/client.html");
 });
 app.get("/graduateProject", function(req, res) {
     res.sendFile(__dirname + "/public/home/index.html");
 });
 app.get("/home", function(req, res) {
     res.sendFile(__dirname + "/public/home/index.html");
 });
 app.get("/dryer", function(req, res) {
     res.sendFile(__dirname + "/public/dryer/index.html");
 });
 app.get("/projector", function(req, res) {
     res.sendFile(__dirname + "/public/display/projector.html");
 });
 app.get("/display", function(req, res) {
     res.sendFile(__dirname + "/public/display/display.html");
 });
 app.get("/handDryer", function(req, res) {
     res.sendFile(__dirname + "/public/handDryer/index.html");
 });
 app.get("/faucet", function(req, res) {
     res.sendFile(__dirname + "/public/faucet/index.html");
 });
 app.get("/console", function(req, res) {
     res.sendFile(__dirname + "/public/console/console.html");
 });


 var urlencodedParser = bodyParser.urlencoded({
     extended: false
 })

 app.post("/comments", urlencodedParser, function(req, res) {
     var id = comments.comments.length
     var txt = req.body.text;
     comments.comments.push({
         id: id + 1,
         comment: txt
     });
     res.send(comments)
     socket_record.emit("commments", comments)
     console.log(txt)
 });

 app.get("/comments", urlencodedParser, function(req, res) {
     var id = comments.comments.length
     var txt = req.body.text;
     res.send(comments)
     console.log(txt)
 });

 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ //此项必须在 bodyParser.json 下面,为参数编码
     extended: false
 }));
 app.use(express.static(__dirname + '/public'))





 //Websocket
 var projectors = [];
 var user = [];
 var uploadNum = 0;
 io.of("/mirror").on('connection', function(socket) {
     socket.emit("initLikes", consoleData.likes);
     socket.on("disconnect", function() {
         io.of("/che  ckStatus").emit("restart")
     })
     socket.on("restart", function() {
         io.of('/checkStatus').emit('restart');
         console.log("restart by wrong window")
     })
 });
 //socket
 io.of("/faucet").on('connection', function(socket) {
     socket.on("test", function() {
         socket.emit("weiboData", weiboData);
     })
 });
 io.of("/mirrorClient").on('connection', function(socket) {
     socket.emit("initLikesClient", consoleData.likes)
     socket.on("sendLike", function(type) {

         consoleData.likes += 1;
         if (consoleData.likes % 100 == 0) {
             io.of('/mirror').emit('bonus');
             // setTimeout(function() {
             //     io.of('/mirror').emit('clearBonus');
             // }, 9000)

         }
         io.of("/mirrorClient").emit("likeNum", consoleData.likes)
         io.of("/mirror").emit("like", consoleData.likes);
     });
 });

 io.of("/dryer").on('connection', function(socket) {
     socket.emit("weiboData", weiboData);
 });
 io.of("/toilet").on('connection', function(socket) {
     socket.on('flushPressedFromButton', function() {
         consoleData.totalFlush += 1;
         // //console.log(i)
         consoleData.isFlushing = true;
         ServerLimit = 100000;
         //console.log(ServerLimit)
         io.of('/projector').emit('limitFromServer', ServerLimit);
         io.of('/projector').emit('isFlushing', consoleData.isFlushing);
         io.of('/projector').emit('flushPressedFromServer');
         setTimeout(function() {
             limit = 200000;
             consoleData.isFlushing = false;
             io.of('/projector').emit('isFlushing', consoleData.isFlushing);
         }, 6500) //新进来的Socket没有触发回调函数
     });

 });

 io.of("/uploaded").on('connection', function(socket) {
     consoleData.totalImage += 1;
     uploadNum += 1;
     //console.log("upload Success!  " + uploadNum + " imges have been upload");
     // io.of('/projector').emit('uploadName', uploadName);
 });
 io.of("/checkStatus").on("connection", function(socket) {

 })
 io.of("/serialPort").on('connection', function(socket) {
     //handDryer
     consoleData.status_faucet = 0;
     consoleData.status_toilet = 0;
     consoleData.status_dryer = 0;
     socket.on("switchOn", function(data) {
         io.of('/handDryer').emit('on');
         console.log("on");
     })
     socket.on("switchOff", function() {
         io.of('/handDryer').emit('off');
         console.log("off");
     })
     //faucet
     socket.on("faucetOn", function() {
         io.of("/faucet").emit('weiboData', weiboData);
     })
     socket.on("dryerStatus", function(status) {

         consoleData.status_dryer += 1;
     })
     socket.on("toiletStatus", function(status) {
         consoleData.status_toilet += 1
     })
     socket.on("faucetStatus", function(status) {
         consoleData.status_faucet += 1;
     })

     socket.on("flushPressedFrombutton", function() {
         // if (!consoleData.isFlushing) {
         consoleData.totalFlush += 1;
         // //console.log(i)
         consoleData.isFlushing = true;
         // ServerLimit = Math.round(imageBuffer.length / 3) >= 3 ? Math.round(imageBuffer.length / 3) : 3;
         ServerLimit = 200000;
         //console.log(ServerLimit)
         io.of('/projector').emit('limitFromServer', ServerLimit);
         io.of('/projector').emit('isFlushing', consoleData.isFlushing);
         io.of('/projector').emit('flushPressedFromServer');
         setTimeout(function() {
             limit = 200000;
             consoleData.isFlushing = false;
             io.of('/projector').emit('isFlushing', consoleData.isFlushing);
             io.of('/serialPort').emit('flushIsOver');
         }, 6500) //新进来的Socket没有触发回调函数
         console.log("flushPressedFrombutton");
         // }
     })
     // socket.on("")
     console.log("serialPort Connected")
 });
 io.of("/user").on('connection', function(socket) {
     user.push(socket.id);
     //console.log("New user connected" + ' ' + "Online User: " + user.length)
     consoleData.totalUser += 1;
     //  consoleData.onlineUser = user.length;

     socket.on('disconnect', function() {
         for (var i = 0; i < user.length; i++) {
             if (user[i] === socket.id) {
                 user.splice(i, 1);
                 consoleData.onlineUser = user.length;
                 consoleData.maxOnlineUser = consoleData.onlineUser > consoleData.maxOnlineUser ? consoleData.onlineUser : consoleData.maxOnlineUser;
                 //console.log("User disconnected" + "Online User: " + user.length)
             }
         }
     });
 });
 io.of("/console").on('connection', function(socket) {
     socket.emit("consoleData", consoleData)
     var id = socket.id
     var interval;
     Console.push({
         interval,
         id
     });
     socket.on("flushPressed", function() {
         io.of('/projector').emit('flushFromConsole')
     })
     socket.on("bonus", function() {
         io.of('/mirror').emit('bonus');
         console.log("bonus by console")
         // setTimeout(function() {
         //     io.of('/mirror').emit('clearBonus');
         // }, 9000)
     })
     socket.on("restart", function() {
         io.of('/checkStatus').emit('restart');
         console.log("restart by console")
     })
     socket.on("reopen", function() {
         io.of('/checkStatus').emit('reopen');
         console.log("reopen by console")
     })
     socket.on("reboot", function() {
         io.of('/checkStatus').emit('reboot');
         console.log("reboot by console")
     })
     for (var i = 0; i < Console.length; i++) {
         // console.log("I come from" + socket.id)
         // console.log(Console[i].id + " " + socket.id)
         if (Console[i].id === socket.id) {
             Console[i].interval = setInterval(function() {
                 socket.emit("consoleData", consoleData)
                 // console.log("I come from" + socket.id)
             }, 1000)
         }
     }
     socket.on('disconnect', function() {
         for (var i = 0; i < Console.length; i++) {
             //  console.log(Console[i].id + " " + socket.id)
             if (Console[i].id === socket.id) {
                 // console.log("disconnect" + socket.id)
                 clearInterval(Console[i].interval)
                 Console.splice(i, 1);
                 //            //console.log(socket.id + ' ' + projectors.length+" "+isFlushing)
             }
         }
     })

 });

 function reverse() {
     setTimeout(function() {
         var an = 0;
         a();

         function a() {
             an += 1;
             setTimeout(function() {
                 io.of('/projector').emit('return');
                 if (an < 20)
                     a();
             }, 50)
         }
     }, 5000)
 }
 var numOfFlushOver = 0;

 function flushAway() {
     // if (consoleData.currentImage > 20 || consoleData.currentImage == 0)
     // reverse();
     consoleData.totalFlush += 1;
     consoleData.isFlushing = true;
     ServerLimit = 200000;
     // ServerLimit = Math.round(imageBuffer.length / 3) >= 3 ? Math.round(imageBuffer.length / 3) : 3;
     //console.log(ServerLimit)
     io.of('/projector').emit('limitFromServer', ServerLimit);
     io.of('/projector').emit('isFlushing', consoleData.isFlushing);
     io.of('/projector').emit('flushPressedFromServer');
     setTimeout(function() {
         limit = 200000;
         consoleData.isFlushing = false;
         io.of('/projector').emit('isFlushing', consoleData.isFlushing);
         io.of('/serialPort').emit('flushIsOver');
     }, 6500) //新进来的Socket没有触发回调函数
 }
 io.of("/projector").on('connection', function(socket) {
     socket.emit('limitFromServer', ServerLimit);
     socket.emit('isFlushingSetup', consoleData.isFlushing);
     socket.emit('imageBuffer', imageBuffer);
     socket.emit('imageScaleBuffer', imageScaleBuffer);
     // io.of('/projector').emit('textBuffer', textBuffer);
     projectors.push(socket.id);
     consoleData.totalProjector += 1;
     consoleData.onlineProjector = projectors.length;
     consoleData.maxOnlineProjector = consoleData.onlineProjector > consoleData.maxOnlineProjector ? consoleData.onlineProjector : consoleData.maxOnlineProjector;
     //console.log(socket.id + ' ' + projectors.length)
     //projectorId.push(socket.id);
     socket.on("typed", function(key) {
         io.of('/projector').emit('newText', key);
         // textBuffer.push("a");
         // imageBuffer.push();
     });
     socket.on("Cfont", function(key) {
         io.of('/projector').emit('Cfont', key);
         // textBuffer.push("a");
         // imageBuffer.push();
     });


     socket.on('imgFlushed', function(i) {
         io.of('/projector').emit('imageBuffer', imageBuffer);
         io.of('/projector').emit('imageScaleBuffer', imageScaleBuffer);
         if (ServerLimit > 0) {
             //console.log(i)
             imageScaleBuffer.splice(i, 1);
             imageBuffer.splice(i, 1);
             io.of('/projector').emit('flushByOther');
             ServerLimit -= 1;
         }
         consoleData.currentImage = imageBuffer.length;
     });

     socket.on('requestNewLimit', function() {
         socket.emit('limitFromServer', ServerLimit)
     });
     socket.on('flushPressed', flushAway);
     socket.on('disconnect', function() {
         for (var i = 0; i < projectors.length; i++) {
             if (projectors[i] === socket.id) {
                 projectors.splice(i, 1);
                 //            //console.log(socket.id + ' ' + projectors.length+" "+isFlushing)
             }
         }
         consoleData.onlineProjector = projectors.length;

     });
 });


 io.of('/projectorStatus').on("connection", function(socket) {
     consoleData.show = true;
     socket.on("disconnect", function() {
         consoleData.show = false;
         io.of('/checkStatus').emit('restart');
     })
 })
 //new uploadMode
 io.of("/test").on('connection', function(socket) {
     user.push(socket.id);
     consoleData.totalUser += 1;
     consoleData.onlineUser = user.length;
     consoleData.maxOnlineUser = consoleData.onlineUser > consoleData.maxOnlineUser ? consoleData.onlineUser : consoleData.maxOnlineUser;

     socket.on('imgData', saveImage);
     socket.on('disconnect', function() {
         for (var i = 0; i < user.length; i++) {
             if (user[i] === socket.id) {
                 user.splice(i, 1);
                 consoleData.onlineUser = user.length;

                 //console.log("User disconnected" + "Online User: " + user.length)
             }
         }
     });

     function saveImage(data) {
         var dataUrl = data;
         // //console.log(dataUrl)
         if (dataUrl.includes(",")) { //bug
             var buffer = new Buffer(dataUrl.split(",")[1], 'base64');
         } else {
             var buffer = new Buffer('empty', 'base64'); //?????????????????????????????????????
         }
         var newUpload = 'img_' + Date.now() + ".png"
         fs.writeFile("public/Images/" + newUpload, buffer, (err) => {
             if (err) {
                 io.of('/').emit('error');
                 throw err;
             } else {
                 // io.of('/').emit('uploaded');
                 consoleData.totalImage += 1;
                 io.of('/projector').emit('uploadName', newUpload);
                 imageBuffer.push(newUpload);
                 imageScaleBuffer.push(1 + 0.5 * Math.random())
                 consoleData.currentImage = imageBuffer.length;
                 consoleData.maxImage = consoleData.currentImage > consoleData.maxImage ? consoleData.currentImage : consoleData.maxImage;
                 //console.log(socket.id)
                 socket.emit('uploaded');
             }
         });
         //console.log('get');
     }
 })
