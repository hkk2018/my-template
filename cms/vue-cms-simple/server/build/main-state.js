"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arm_process_1 = require("./arm-process");
exports.mainState = {
    isPause: false,
    isInit: false,
    execIndex: 0,
    taskPFuncArrBase: [
        function () { return arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter); },
        function () { return arm_process_1.roboArmLib.reqArmP(arm_process_1.roboArmLib.strStarter2); },
    ],
    taskPFuncArr: [],
};
