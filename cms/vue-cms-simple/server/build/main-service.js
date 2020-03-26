"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cms_1 = require("./cms");
var main_state_1 = require("./main-state");
exports.mainService = {
    //要繼續流程的錯誤全都在resolve的callback處理，要終止流程的錯誤直接進catch
    execStepP: function () {
        return main_state_1.mainState.taskPFuncArr[main_state_1.mainState.execIndex]().then(function (successMsg) {
            main_state_1.mainState.execIndex++;
            //一般成功訊息就是 <、finish等，預設不顯示，有特殊需求另外在task裡面增
            if (!main_state_1.mainState.isPause) {
                if (main_state_1.mainState.taskPFuncArr[main_state_1.mainState.execIndex]) { //還有下一步的話
                    return exports.mainService.execStepP();
                }
                else
                    onComplete();
            }
            else {
                main_state_1.mainState.pauseInformCmsRes(); //告訴前端機器正在作的事情真的停了，前端可以繼續按別的按鈕
                return;
            }
        }, function (errMsg) {
            onErr(errMsg); //致使暫停
        });
    },
    startProcess: function () {
        main_state_1.mainState.isStarted = true;
        main_state_1.mainState.isPause = false; //免得有什麼意外已經被暫停了導致程序跑不動
        //從0開始
        main_state_1.mainState.execIndex = 0;
        //避免refer到同個矩陣
        var taskFunPCopy = main_state_1.mainState.taskPFuncArrBase.map(function (x) { return x; });
        main_state_1.mainState.taskPFuncArr = taskFunPCopy;
        exports.mainService.execStepP();
    },
    countinueProcess: function () {
        main_state_1.mainState.isPause = false;
        exports.mainService.execStepP();
    },
    hex2bin: function (hex) {
        return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
    }
};
function onErr(errMsg) {
    console.log('err: ' + errMsg);
    cms_1.cmsLib.sendErrLog(errMsg); //會觸發前端暫停
}
// onUnfixableErr(specialErrMsg);//未與vmz或手臂連線、斷線，或其他不知名錯誤（程序無法handle者）
// function onUnfixableErr(errMsg: string) {
//     cmsLib.sendUnfixableErrLog(errMsg);
// }
//在mainState的task陣列的最末項處理了，所以現在不用
function onComplete() {
    // mainState.execIndex = 0;
    // cmsLib.tellIsProcessStarted(false);
}
