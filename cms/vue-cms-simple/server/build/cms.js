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
var fs = __importStar(require("fs"));
var child_process = __importStar(require("child_process"));
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
        // cmsLib.cmsSocket?.emit('UNFIXABLE_ERR_LOG', msg);
    },
    tellVmzConnectingState: function (isConnecting) {
        var _a;
        (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('VMZ_CONNECTION_STATE', isConnecting);
    },
    tellProcessStarted: function () {
        // cmsLib.cmsSocket?.emit('PROCESS_STARTED');
    },
    tellProcessDone: function () {
        var _a;
        (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('PROCESS_DONE');
    },
    askKeyInNumberP: function (askTest) {
        if (askTest === void 0) { askTest = '掃描失敗，請手動輸入Wafer Id：'; }
        return new Promise(function (res, rej) {
            //稍微讓前面要傳給客戶端看的waferId先顯示出來，有時候會後來的訊息會快過先傳的
            //（這邊會使前端出現prompt而卡死前端js，所以如果Id後到則要等輸入框結束後才會出現）
            setTimeout(function () {
                var _a;
                (_a = exports.cmsLib.cmsSocket) === null || _a === void 0 ? void 0 : _a.emit('ASK_KEY_IN_NUMBER', askTest, onReplied);
            }, 500);
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
        console.log('INIT');
        main_state_1.mainState.isStarted = false;
        //不參與mainState的execIndex，自己在這邊作
        console.log(arm_process_1.roboArmLib.strStarter);
        arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter).then(function () {
            console.log(arm_process_1.roboArmLib.strStarter2);
            return arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter2);
        }).then(function () {
            arm_process_1.roboArmLib.reqArmP('STAT' + '\r\n').then(function (msg) {
                console.log(msg);
                if (main_service_1.mainService.hex2bin(msg)[5] === '0') {
                    reply({ isErr: false, msg: msg });
                }
                else
                    reply({ isErr: true, msg: msg });
            });
        }).catch(function (err) {
            console.log(err); //怕字串化錯誤會crash，就傳個自訂字串
            reply({ isErr: true, msg: typeof err === 'string' ? err : '機械手臂異常' });
        });
    });
    socket.on('AUTO', function (data, reply) {
        console.log('AUTO');
        if (main_state_1.mainState.isStarted)
            main_service_1.mainService.countinueProcess();
        else
            main_service_1.mainService.startProcess();
        reply();
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
    socket.on('INIT_VMZ', function (data, reply) {
        console.log('INIT_VMZ');
        vmz_1.vmzLib.reqVmzP('vmzinit').then(function () {
            reply();
        }).catch(function (errMsg) {
            exports.cmsLib.sendErrLog(errMsg);
            reply();
        });
    });
    socket.on('VMZ_CONNECTION_STATE', function (data, reply) {
        console.log('VMZ connection state checked by CMS: isConnected===' + vmz_1.vmzLib.isSocketAlive);
        reply(vmz_1.vmzLib.isSocketAlive);
    });
    socket.on('WRITE_BACK_LOG', function (logBack, reply) {
        var dir = './logs';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        var path = dir + ("/" + logBack.dateFileName + ".txt");
        fs.appendFileSync(path, logBack.msg + '\r\n');
    });
    socket.on('OPEN_FOLDER', function (data, reply) {
        var dir = './logs';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        child_process.exec('start "" "logs"');
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
var WriteLogBackFormat = /** @class */ (function () {
    function WriteLogBackFormat(msg, timeStr) {
        this.msg = msg;
        this.dateFileName = timeStr.split(' ')[0].replace(/\//g, '');
    }
    return WriteLogBackFormat;
}());
