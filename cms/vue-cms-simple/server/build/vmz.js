"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = __importStar(require("net"));
var cms_1 = require("./cms");
exports.vmzLib = {
    vmzSocket: null,
    resolveFunc: null,
    //直接對vmz發送start訊息，vmz回傳的字串若非ng即表示成功，並將此回傳字串放於ExecResult之msg中，以便後續處裡
    reqVmzP: function (command) {
        if (command === void 0) { command = 'start'; }
        return new Promise(function (res, rej) {
            //建立socket過且處於連線中才可調用此函數
            if (exports.vmzLib.vmzSocket != null && exports.vmzLib.vmzSocket.connecting) {
                cms_1.cmsLib.SendDataLog(command);
                exports.vmzLib.vmzSocket.write(command);
                exports.vmzLib.resolveFunc = res;
            }
            else
                rej('未連線至vmz');
        }).then(function (stringFromVmz) {
            var ExecResult = {
                isSuccess: stringFromVmz !== 'ng',
                msg: stringFromVmz //可能是'finish'或者是waferId等
            };
            return ExecResult;
        });
    }
};
//create server
var server = net.createServer();
//start server with a port to listen to
server.listen(8124, function () {
    console.log('TCP Server start');
});
//main connection event, will return a connection i.e. socket
server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    exports.vmzLib.vmzSocket = socket;
    //write
    socket.write('Hello, client.');
    //receive
    socket.on('data', function (data) {
        exports.vmzLib.resolveFunc(data.toString()); //送資料給reqVmz的promise回傳值
        console.log("Data received from client: " + data.toString() + ".");
    });
    //end
    socket.on('end', function () {
        console.log('Closing connection with the client');
    });
    //error
    socket.on('error', function (err) {
        console.log("Error: " + err);
    });
});
