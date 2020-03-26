"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arm_process_1 = require("./arm-process");
var cms_1 = require("./cms");
var vmz_1 = require("./vmz");
exports.mainState = {
    isPause: false,
    isStarted: false,
    execIndex: 0,
    pauseInformCmsRes: function () { },
    stationWaferInfo: '',
    taskPFuncArrBase: [
        function () { return arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter); },
        function () { return arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter2); },
        function () { return arm_process_1.roboArmLib.reqArmP('STAT').then(function (msg) {
            if (hex2bin(msg)[5] === '0')
                return;
            else
                return Promise.reject(msg);
        }); },
        function () { return arm_process_1.roboArmLib.reqArmP('STAT').then(function (msg) {
            if (hex2bin(msg)[8] === '0')
                return;
            else
                return Promise.reject(msg);
        }); },
        function () { return vmz_1.vmzLib.reqVmzP('getstation').then(function (msg) {
            exports.mainState.stationWaferInfo = msg; //'A4B6C0'
        }); },
        //從sendToArm('SGRP A')分成三部分，子迴圈的內容根據狀況動態增
        function () { return handleWaferSizeProcP(0); },
        function () { return handleWaferSizeProcP(1); },
        function () { return handleWaferSizeProcP(2); },
        function () { return Promise.resolve().then(function () {
            cms_1.cmsLib.sendDataLog('排程已全數執行完畢，可重新開始');
            exports.mainState.isStarted = false;
            return 'Process Done';
        }); }
    ],
    taskPFuncArr: [],
};
function hex2bin(hex) {
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}
function handleWaferSizeProcP(stationIndex) {
    var waferSize = exports.mainState.stationWaferInfo[stationIndex * 2 + 1];
    //waferSize等於0的站點跳過
    if (waferSize === '0')
        return Promise.resolve('This station is no wafer task');
    //非0者動態新增task至佇列中
    else {
        var sizeSymbol = waferSize === '4' ? 'A' : 'B';
        return arm_process_1.roboArmLib.reqArmP('SGRP ' + sizeSymbol).then(function (successMsg) {
            //成功設定wafer size之後才會新增move task(所以確保此步失敗可重來)
            var stationSymbolUpperCase = exports.mainState.stationWaferInfo[stationIndex * 2];
            var moveTaskPFunc = function () { return arm_process_1.roboArmLib.reqArmP('MAP ' + stationSymbolUpperCase.toLowerCase()).then(function (msgAfterMoving) {
                //成功才會新增scanTask
                var scanTaskPFunc = function () { return arm_process_1.roboArmLib.reqArmP('RSR').then(function (scannedDataStr) {
                    //掃的結果有問題會暫停，成功則新增small loop task
                    if (scannedDataStr.includes('2') || scannedDataStr.includes('3') || scannedDataStr.includes('4'))
                        return Promise.reject(scannedDataStr);
                    else {
                        var taskPFuncsToAdd = [];
                        var _loop_1 = function (i) {
                            if (scannedDataStr[i] === '1') {
                                taskPFuncsToAdd.push(function () { return arm_process_1.roboArmLib.reqArmP("GET " + stationSymbolUpperCase + ", " + (i + 1)); });
                                taskPFuncsToAdd.push(function () { return arm_process_1.roboArmLib.reqArmP("PUT D, 1"); });
                                taskPFuncsToAdd.push(function () { return vmz_1.vmzLib.reqVmzP(); });
                                taskPFuncsToAdd.push(function () { return arm_process_1.roboArmLib.reqArmP("GET D, 1"); });
                                taskPFuncsToAdd.push(function () { return arm_process_1.roboArmLib.reqArmP("MTCS E"); });
                                taskPFuncsToAdd.push(function () { return vmz_1.vmzLib.reqVmzP().then(function (waferId) {
                                    cms_1.cmsLib.sendDataLog('waferId: ' + waferId);
                                    return 'get and show waferId sucess';
                                }); });
                                //失敗的話會從輸入數字重來
                                taskPFuncsToAdd.push(function () { return cms_1.cmsLib.askKeyInNumberP().then(function (numberStr) {
                                    return vmz_1.vmzLib.reqVmzP(numberStr);
                                }); });
                                taskPFuncsToAdd.push(function () { return arm_process_1.roboArmLib.reqArmP('PUT F, 1'); });
                                taskPFuncsToAdd.push(function () { return vmz_1.vmzLib.reqVmzP(); });
                                taskPFuncsToAdd.push(function () { return arm_process_1.roboArmLib.reqArmP('GET F, 1'); });
                                taskPFuncsToAdd.push(function () { return arm_process_1.roboArmLib.reqArmP("PUT " + stationSymbolUpperCase + ", " + (i + 1)); });
                            }
                        };
                        for (var i = 0; i < scannedDataStr.length; i++) {
                            _loop_1(i);
                        }
                        //從最後面開始加，這樣順序才對，因為splice會把新資料放在該index，而原本的整個會往後推
                        for (var i = taskPFuncsToAdd.length - 1; i > -1; i--) {
                            exports.mainState.taskPFuncArr.splice(exports.mainState.execIndex + 1, 0, taskPFuncsToAdd[i]);
                        }
                        return 'RSR OK and now added small loop tasks into queue';
                    }
                }); };
                exports.mainState.taskPFuncArr.splice(exports.mainState.execIndex + 1, 0, scanTaskPFunc);
                return 'move task done and added scan task into queue';
            }); };
            exports.mainState.taskPFuncArr.splice(exports.mainState.execIndex + 1, 0, moveTaskPFunc);
            return 'success to set wafer size and added move task into queue';
        });
    }
}
