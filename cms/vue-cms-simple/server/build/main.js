"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var http = __importStar(require("http"));
var server = http.createServer(function (request, response) {

    response.writeHead(200, { "content-type": 'text/html' });
    response.end('1212121');
 });
var port = 8082;
// about 0.0.0.0:
// https://stackoverflow.com/questions/8325480/set-up-node-so-it-is-externally-visible
// https://stackoverflow.com/questions/14043926/node-js-connect-only-works-on-localhost
server.listen(port, '0.0.0.0', function () {
    console.log('--------');
    console.log('server is listening on: ' + port);
    console.log('--------');
});
// socket.io需要聽http.server
var serv_io = socket_io_1.default.listen(server);
serv_io.sockets.on('connection', function (socket) {
    //註冊事件
    socket.on('SET_AS_DEFAULT_MACHINESEETING', function (data, reply) {
        console.log(data);
        var replyData = { status: 200, payload: null };
        reply(replyData); //回覆
    });
    //傳訊息給客戶端
    setInterval(function () {
        socketEmitP(socket, 'DATA_LOG', 'data test' + new Date().toLocaleTimeString()).then(function (data) {
            console.log(data);
        });
    }, 3000);
    setInterval(function () {
        socketEmitP(socket, 'ERR_LOG', 'err test' + new Date().toLocaleTimeString());
    }, 5000);
});
/**
* 伺服器回應200就會直接Resolve(replied data)，否則將含狀態碼的ResponseObj整個回傳
* @param eventName
* @param passingData
*/
function socketEmitP(socket, eventName, passingData) {
    return new Promise(function (resolve, reject) {
        //dataWithE如果是undefined在serverEnd好像會變成null
        socket.emit(eventName, passingData, onReplied);
        // socket.emit(eventName, callBack); 如果沒填passingData，io就會以為callBack是passingData，而導致acknowklegment不被啟用
        function onReplied(response) {
            if (response.status === 200)
                resolve(response.payload); //then會接到data
            else
                reject(response); //catch會接到人寫的error obj
        }
    });
}
