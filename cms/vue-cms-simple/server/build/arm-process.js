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
//設定
var port = 8001; // Datalogger port
// const host = '192.168.29.130';    // Datalogger IP address
var host = 'localhost';
//指令
console.log('program starts');
var socket;
exports.roboArmLib = {
    strStarter: 'SVON',
    strStarter2: 'HOM',
    roboArmSocket: null,
    resolveFunc: (function () { }),
    //直接對vmz發送start訊息，vmz回傳的字串若非ng即表示成功，並將此回傳字串放於VmzReply之msg中，以便後續處裡
    reqArmP: function (command) {
        return new Promise(function (res, rej) {
            //建立socket過且處於連線中才可調用此函數
            if (exports.roboArmLib.roboArmSocket != null) {
                exports.roboArmLib.roboArmSocket.write('STAT\r\n', 'ascii');
                // cmsLib.sendDataLog('STAT');
                exports.roboArmLib.resolveFunc = res;
            }
            else
                rej('未連線至機械手臂');
        }).then(function (stringFromArm) {
            if (stringFromArm === '?')
                return Promise.reject('Failed to chceck arm stat.');
            else {
                cms_1.cmsLib.sendDataLog('Arm stat before excuting: ' + stringFromArm); //show stat
                return new Promise(function (res1, rej1) {
                    var _a;
                    cms_1.cmsLib.sendDataLog('Execute(to arm): ' + command);
                    console.log(command);
                    command += '\r\n';
                    (_a = exports.roboArmLib.roboArmSocket) === null || _a === void 0 ? void 0 : _a.write(command, 'ascii'); //基本上已經非null了
                    exports.roboArmLib.resolveFunc = res1;
                });
            }
        }).then(function (stringFromArm) {
            if (stringFromArm === '?')
                return Promise.reject(stringFromArm);
            else
                return stringFromArm;
        });
    },
    connectToArm: function () {
        console.log('try to connect to arm');
        cms_1.cmsLib.sendDataLog('try to connect to arm');
        socket = net.createConnection(port, host, function () {
            var succMsg = 'Successfully connected to arm.';
            cms_1.cmsLib.sendDataLog(succMsg);
            console.log(succMsg);
            exports.roboArmLib.roboArmSocket = socket;
            //---listening
            socket.on('data', function (data) {
                //remove \r\n
                //action done: >
                //action fail: ?
                //sendToArm('STAT');
                var breakLineRemovedData = data.toString().replace('\r\n', '');
                exports.roboArmLib.resolveFunc(breakLineRemovedData); //送資料回Promise
                console.log(breakLineRemovedData);
                // socket.end();
            });
            //---
            /*
                //start roboarm service
                //initialize
                socket.write(strStarter, 'ascii', (res) => { console.log(res) });
                setTimeout(() => { socket.write(strStarter2, 'ascii', (res) => { console.log(res) }); }, sendDelay)
                //確認歸零成功 check if the 6th bit is 0
                sendToArm('STAT');
                //hex2bin(statReturn)[5] ===0
            
                //process start
                setTimeout(() => {
                    //log state before every action
                    //check ready = if the 9th bit is 0
                    //'STAT': hex2bin(statReturn)[8] ===0
                    //顯示not ready
                    sendToArm('STAT');
            
                    //get wafer size
                    ///'getstation'
                    ///'A4B6C0'
                    //set wafer size
                    sendToArm('SGRP A'); //A:4inch B:6inch
            
                    //move and scan a/b/c once
                    sendToArm('MAP a');
                    //get scanned data
                    //0=no wafer; 1=normal;
                    //array of n
                    //00000111110000234
                    //any 234 pause all
                    sendToArm('RSR');
            
                    //---small loop
                    //get A/B/C
                    sendToArm('GET A, 6');
            
                    //aligner, fixed index 1
                    sendToArm('PUT D, 1');
                    ///server write: 'start'
                    ///server receive: 'finish'
                    ///'ng'
                    sendToArm('GET D, 1');
            
            
                    //OCR move only
                    sendToArm('MTCS E')
            
                    //server write OCR
                    ///'start'
                    ///'waferID' (return)
                    ///'ng'
                    //input alert to key in number and continue
            
                    //vmz
                    sendToArm('PUT F, 1');
                    ///'start'
                    ///'finish'
                    ///'ng'
                    sendToArm('GET F, 1');
            
                    //put back
                    sendToArm('PUT A, 6');
            
                    //---small loop end
            
                    //any problem results in pause, restart will do the previous
                    //when loop finish log end
            
                    //pause(no redo)
                    //server on: 'dooropen'
                    //click pause
            
                    console.log('end')
                }, 10000)
            */
            //async commands
            //手冊: 65頁
            //三軸: (T,R,Z)
            //set target location: 'SPC A, 1000, 2000, 5000'(um)
            //set target depth: 'PITCH A, 1'(mm)
            //set target number: 'SSN A, 50'(max)
            //to location: 'MTCS A, 1' 1=put 2=get
            //get wafer
            //check ready = if the 9th bit is 0
            //'STAT': hex2bin(statReturn)[8] ===0
            //'GET A, 1'(wafer index from 1-50)
            //check done = if the 9th is 0
            //'STAT': hex2bin(statReturn)[8] ===0
            //put wafer
            //p1 - OCR (delay 8s) - VMZ(delay 8s) - P1
        });
    }
};
// 各種抓不到錯誤導致crash，但這個可以
// https://stackoverflow.com/questions/59463127/how-to-catch-the-throw-er-unhandled-error-event-in-other-peoples-apis-c
process.on('uncaughtException', function (err) {
    cms_1.cmsLib.sendErrLog('手臂連線錯誤: ' + JSON.stringify(err));
    console.log(err);
});
//--- unused legacy
//300ms delay at least
var strStarter = 'SVON\r\n'; //on
var strStarter2 = 'HOM\r\n'; //home
var delayIndex = 0;
var sendDelay = 6000;
function hex2bin_Dreprecatd(hex) {
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}
function sendToArm(message) {
    message += '\r\n';
    setTimeout(function () { socket.write(message, 'ascii', function (res) { }); }, sendDelay * delayIndex);
    delayIndex += 1;
}
