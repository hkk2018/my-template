"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var socket_io_1 = __importDefault(require("socket.io"));
var main_state_1 = require("./main-state");
var vmz_1 = require("./vmz");
var main_service_1 = require("./main-service");
var arm_process_1 = require("./arm-process");
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
        var _a;
        //optional chain
        (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('DATA_LOG', msg);
    },
    sendErrLog: function (msg) {
        var _a;
        (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('ERR_LOG', 'ERR: ' + msg);
    },
    sendUnfixableErrLog: function (msg) {
        var _a;
        (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('UNFIXABLE_ERR_LOG', msg);
    },
    tellVmzConnectingState: function (isConnecting) {
        var _a;
        (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('VMZ_CONNECTION_STATE', isConnecting);
    },
    tellIsProcessStarted: function (isStarted) {
        // cmsLib.cmsSocket?.emit('IS_PROCESS_STARTED', isStarted);
    },
    askKeyInNumberP: function () {
        return new Promise(function (res, rej) {
            var _a;
            (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('ASK_KEY_IN_NUMBER', null, onReplied);
            function onReplied(numberStr) {
                res(numberStr);
            }
        });
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
        main_state_1.mainState.isStarted = false;
        //不參與mainState的execIndex，自己在這邊作
        arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter).then(function () {
            return arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter2);
        }).then(function () {
            arm_process_1.roboArmLib.reqArmP('STAT').then(function (msg) {
                if (main_service_1.mainService.hex2bin(msg)[5] === '0') {
                    reply({ isErr: false, msg: msg });
                }
                else
                    reply({ isErr: true, msg: msg });
            });
        }).catch(function (err) {
            console.log(err); //怕字串化錯誤會crash，就傳個自訂字串
            reply({ isErr: true, msg: typeof err === 'string' ? err : '異常錯誤' });
        });
        console.log('INIT');
    });
    socket.on('AUTO', function (data, reply) {
        console.log('AUTO');
        if (main_state_1.mainState.isStarted)
            main_service_1.mainService.countinueProcess();
        else
            main_service_1.mainService.startProcess();
    });
    socket.on('STOP', function (data, reply) {
        console.log('STOP');
        new Promise(function (res, rej) {
            main_state_1.mainState.pauseInformCmsRes = res;
            main_state_1.mainState.isPause = true;
        }).then(function () {
            reply();
        });
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
