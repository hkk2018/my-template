"use strict";
//斷線自己隨機關掉測試
//pErr的機率發生?
//pStatErr的機率發生stat出現9999
//所有傳輸都會在FakeArm的console上秀出Arm該做的事情，要用這個來假設確認手臂是否有做
//確認大小loop都有正常完成
//locations晶片架位置改改看
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = __importStar(require("net"));
var locations = '01011'; //wafer in which places
//let locations = '12011' //出現錯誤的狀況
var pErr = 0;
var pStatErr = 0;
//for reference only
var inputStr = [
    'SVON',
    'HOM',
    'STAT',
    'SGRP A',
    'MAP a',
    'RSR',
    'GET A, 6',
    'PUT D, 1',
    'GET D, 1',
    'MTCS E',
    'PUT F, 1',
    'GET F, 1',
    'PUT A, 6'
];
//create server
var server = net.createServer();
//start server with a port to listen to
server.listen(8001, function () {
    console.log('TCP Server start');
});
server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    //receive
    socket.on('data', function (data) {
        var dataStr = data.toString();
        var len = dataStr.length;
        console.log("Data received from client: " + dataStr);
        //check format
        if (!dataStr.includes('\r\n')) {
            console.log('not include line break');
            write('?');
            return;
        }
        dataStr = dataStr.replace(/\r\n/, "");
        if (dataStr.slice(0, 4) === 'SVON' || dataStr.slice(0, 3) === 'HOM') {
            "";
            write('>');
        }
        //stat
        else if (dataStr.slice(0, 4) == 'STAT') {
            if (Math.random() < pStatErr)
                write('FFFF');
            else
                write('0000');
        }
        //SGRP
        else if (dataStr.slice(0, 4) == 'SGRP') {
            if (dataStr.slice(-1) == 'A') {
                console.log('4inch');
                write('>');
            }
            else if (dataStr.slice(-1) == 'B') {
                console.log('6inch');
                write('>');
            }
            else
                write('?');
        }
        //MAP
        else if (dataStr.slice(0, 3) == 'MAP') {
            var t = dataStr.slice(-1);
            if (t == 'a' || t == 'b' || t == 'c') {
                console.log('mapped ' + t);
                write('>');
            }
            else
                write('?');
        }
        //RSR
        else if (dataStr.slice(0, 3) == 'RSR') {
            console.log('got mapping data');
            write(locations);
        }
        //MTCS
        else if (dataStr == 'MTCS E') {
            console.log('MTCS moved to E');
            write('>');
        }
        //GET and PUT
        else if (dataStr.slice(0, 3) == 'GET' || dataStr.slice(0, 3) == 'PUT') {
            if (dataStr[4] == 'A' || dataStr[4] == 'B' || dataStr[4] == 'C' || dataStr[4] == 'D' || dataStr[4] == 'F') {
                console.log('moved to ' + dataStr[4]);
                console.log(dataStr.slice(0, 3) + ' ' + dataStr[7]);
                write('>');
            }
            else
                write('?');
        }
    });
    //end
    socket.on('end', function () {
        console.log('Closing connection with the client');
    });
    //error
    socket.on('error', function (err) {
        console.log("Error: " + err);
    });
    function write(mes) {
        setTimeout(function () {
            if (Math.random() < pErr)
                mes = '?';
            socket.write(mes + '\r\n');
        }, 300);
    }
});
