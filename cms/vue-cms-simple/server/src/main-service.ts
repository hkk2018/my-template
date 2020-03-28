import { cmsLib } from "./cms";
import { mainState } from "./main-state";


export let mainService = {
    //要繼續流程的錯誤全都在resolve的callback處理，要終止流程的錯誤直接進catch
    execStepP(): Promise<any> {
        return mainState.taskPFuncArr[mainState.execIndex]().then(
            successMsg => {
                mainState.execIndex++;
                // cmsLib.sendDataLog('完成');
                //一般成功訊息就是 <、finish等，預設不顯示，有特殊需求另外在task裡面增
                if (!mainState.isPause) {
                    if (mainState.taskPFuncArr[mainState.execIndex]) {//還有下一步的話
                        return mainService.execStepP();
                    }
                    else onComplete();
                }
                else {
                    mainState.pauseInformCmsRes();//告訴前端機器正在作的事情真的停了，前端可以繼續按別的按鈕
                    return;
                }
            },
            (errMsg: string) => {
                onExecStepErr(errMsg);//致使暫停
            }
        )
    },
    startProcess() {
        mainState.isStarted = true;
        mainState.isPause = false;//免得有什麼意外已經被暫停了導致程序跑不動
        //從0開始
        mainState.execIndex = 0;
        //避免refer到同個矩陣
        let taskFunPCopy = mainState.taskPFuncArrBase.map(x => x);
        mainState.taskPFuncArr = taskFunPCopy;
        mainService.execStepP();
    },
    countinueProcess() {
        mainState.isPause = false;
        mainService.execStepP();
    },
    hex2bin(hex: string) {
        let bin = (parseInt(hex, 16)).toString(2);
        bin = '0'.repeat((16 - bin.length));
        return bin;
    }
}


function onExecStepErr(errMsg: string) {
    console.log('Err: ' + errMsg);
    cmsLib.sendErrLog(errMsg);//會觸發前端暫停
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