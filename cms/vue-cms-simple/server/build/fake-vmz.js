"use strict";
//斷線自己隨機關掉測試
//門固定會打開一次，時間隨機
//pNg的機率發生ng
//station改改看
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = __importStar(require("net"));
var station = 'C4B6A0';
var pNg = 0;
var isTestEndConnection = false;
//for reference only
var inputStr = ['getstation', 'startw', 'starto', 'startv']; //w=wheel, o=orc, v=vmz
var outputStr = ['A4B6C0', 'WaferID123', 'finish', 'ng', 'dooropen'];
var socket = net.createConnection(8124);
socket.on('connect', function () {
    setInterval(function () {
        socket.write('dooropen'); //dooropen
    }, 100000 * Math.random());
    socket.on('data', function (data) {
        var dataStr = data.toString();
        console.log(dataStr);
        if (dataStr == 'getstation')
            socket.write(output(station)); //station
        else if (dataStr == 'startw')
            socket.write(output('finish')); //finish wheel
        else if (dataStr == 'starto')
            socket.write(output('WaferID123')); //wafer id
        else if (dataStr == 'startv')
            socket.write(output('finish')); //finish
        else if (!isNaN(parseInt(data)))
            socket.write(output('finish')); //response to wafer ID input
        else
            socket.write('ng');
    });
    if (isTestEndConnection)
        setTimeout(function () {
            socket.end();
            console.log('終止連線');
        }, 15000);
});
function output(mes) {
    if (Math.random() > pNg)
        return mes;
    else
        return 'ng';
}
