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
var main_state_1 = require("./main-state");
var vmz_1 = require("./vmz");
var server = http.createServer(function (request, response) { });
var port = 8082;
// about 0.0.0.0:
// https://stackoverflow.com/questions/8325480/set-up-node-so-it-is-externally-visible
// https://stackoverflow.com/questions/14043926/node-js-connect-only-works-on-localhost
server.listen(port, '0.0.0.0', function () {
    console.log('--------');
    console.log('server is listening to CMS on: ' + port);
    console.log('--------');
});
exports.cmsLib = {
    cmsSocket: null,
    sendDataLog: function (msg) {
        if (exports.cmsLib.cmsSocket)
            exports.cmsLib.cmsSocket.emit('DATA_LOG', msg);
    },
    sendErrLog: function (msg) {
        if (exports.cmsLib.cmsSocket)
            exports.cmsLib.cmsSocket.emit('ERR_LOG', msg);
    },
    tellVmzConnectingState: function (isConnecting) {
        if (exports.cmsLib.cmsSocket)
            exports.cmsLib.cmsSocket.emit('VMZ_CONNECTION_STATE', isConnecting);
    },
};
// socket.io需要聽http.server
var serv_io = socket_io_1.default.listen(server);
serv_io.sockets.on('connection', function (socket) {
    console.log('cms is connected.');
    exports.cmsLib.cmsSocket = socket;
    // socket.on('SET_AS_DEFAULT_MACHINESEETING', function (data: FromFront.MachineSetting, reply: Function) {
    //     console.log(data);
    //     let replyData: ResponseObj = { status: 200, payload: null };
    //     reply(replyData);//回覆
    // })
    socket.on('INIT', function (data, reply) {
        console.log('INIT');
    });
    socket.on('AUTO', function (data, reply) {
        console.log('AUTO');
    });
    socket.on('STOP', function (data, reply) {
        console.log('STOP');
        main_state_1.mainState.isPause = true;
    });
    socket.on('VMZ_CONNECTION_STATE', function (data, reply) {
        console.log('VMZ Connection state checked by CMS');
        reply(Boolean(vmz_1.vmzLib.vmzSocket && vmz_1.vmzLib.vmzSocket.connecting));
    });
    // //傳訊息給客戶端
    // setInterval(() => {
    //     socketEmitP(socket, 'DATA_LOG', 'data test' + new Date().toLocaleTimeString()).then((data) => {
    //         console.log(data)
    //     });
    // }, 3000)
    // setInterval(() => {
    //     socketEmitP(socket, 'ERR_LOG', 'err test' + new Date().toLocaleTimeString());
    // }, 5000)
});
