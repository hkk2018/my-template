"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_state_1 = require("./main-state");
var cms_1 = require("./cms");
var taskPArr = [];
var execIndex = 0;
function execStepP() {
    // log();
    // stat()
    return taskPArr[execIndex].then(function (result) {
        if (result.isSuccess) {
            if (!main_state_1.mainState.isPause) {
                if (taskPArr[execIndex + 1]) {
                    execIndex++;
                    return execStepP();
                }
                else
                    onComple();
            }
            else
                return;
        }
        else
            onErr(result.msg || '');
    }, function (specialErrMsg) {
        onErr(specialErrMsg); //與機器連線中斷
    });
}
function onErr(errMsg) {
    cms_1.cmsLib.SendErrLog(errMsg);
}
function onComple() { }
