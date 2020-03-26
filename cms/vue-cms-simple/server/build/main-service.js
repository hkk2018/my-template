"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_state_1 = require("./main-state");
var cms_1 = require("./cms");
exports.mainService = {
    execStepP: function () {
        return main_state_1.mainState.taskPFuncArr[main_state_1.mainState.execIndex]().then(function (result) {
            if (result.isSuccess) {
                if (!main_state_1.mainState.isPause) {
                    if (main_state_1.mainState.taskPFuncArr[main_state_1.mainState.execIndex + 1]) {
                        main_state_1.mainState.execIndex++;
                        return exports.mainService.execStepP();
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
            onErr(specialErrMsg); //未與vmz或手臂連線、斷線
        });
    }
};
function onErr(errMsg) {
    cms_1.cmsLib.sendErrLog(errMsg); //會觸發前端暫停
}
function onComple() { }
