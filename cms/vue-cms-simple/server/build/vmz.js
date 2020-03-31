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
var main_state_1 = require("./main-state");
var setting_1 = require("./setting");
exports.vmzLib = {
    vmzSocket: null,
    isSocketAlive: false,
    resolveFunc: (function () { }),
    //直接對vmz發送start訊息，vmz回傳的字串若非ng即表示成功，並將此回傳字串放於ExecResult之msg中，以便後續處裡
    reqVmzP: function (command) {
        return new Promise(function (res, rej) {
            var _a;
            //建立socket過且處於連線中才可調用此函數
            if (exports.vmzLib.isSocketAlive) {
                cms_1.cmsLib.sendDataLog('Execute(to VMZ): ' + command);
                (_a = exports.vmzLib.vmzSocket) === null || _a === void 0 ? void 0 : _a.write(command); //基本上alive的情況就必有
                exports.vmzLib.resolveFunc = res;
                setTimeout(function () {
                    rej('vmz連線超時，請重新連線');
                }, setting_1.setting.connectionTimeout);
            }
            else
                rej('未連線至vmz');
        }).then(function (stringFromVmz) {
            if (stringFromVmz === 'ng')
                return Promise.reject(stringFromVmz);
            else
                return stringFromVmz;
        });
    }
};
//create server
var server = net.createServer();
//start server with a port to listen to
server.listen(8124, function () {
    console.log('TCP Server start. Waiting for Vmz.');
});
//main connection event, will return a connection i.e. socket
server.on('connection', function (socket) {
    var succMsg = 'A connection from VMZ has been established.';
    console.log(succMsg);
    cms_1.cmsLib.sendDataLog(succMsg);
    exports.vmzLib.vmzSocket = socket;
    exports.vmzLib.isSocketAlive = true;
    cms_1.cmsLib.tellVmzConnectingState(true);
    //write
    // socket.write('Hello, client.');
    //receive
    socket.on('data', function (data) {
        var dataStr = data.toString().replace('\r\n', '');
        ;
        if ('dooropen' === dataStr) {
            main_state_1.mainState.isPause = true; //不會繼續作下去
            //告知前端已經暫停，但實際上此步因為沒有在taskQueue中拋出錯誤，所以正在執行的動作還是會完成，
            //而進入下一個index，當前端按繼續，就是繼續此index的事情，流程上正確。
            cms_1.cmsLib.sendErrLog(dataStr);
        }
        else
            exports.vmzLib.resolveFunc(dataStr); //送資料給reqVmz的promise回傳值
        console.log("Data received from vmz client: " + dataStr + ".");
    });
    //end
    socket.on('end', function () {
        var msg = 'VMZ disconnected.';
        console.log(msg);
        cms_1.cmsLib.sendDataLog(msg);
        main_state_1.mainState.isPause = true;
        exports.vmzLib.isSocketAlive = false;
        cms_1.cmsLib.tellVmzConnectingState(false);
    });
    //error
    socket.on('error', function (err) {
        var msg = typeof err === 'string' ? err : '發生異常，vmz連線中斷';
        cms_1.cmsLib.sendErrLog(msg);
        cms_1.cmsLib.tellVmzConnectingState(false);
        main_state_1.mainState.isPause = true;
        exports.vmzLib.isSocketAlive = false;
        console.log("Error: " + err);
    });
});
