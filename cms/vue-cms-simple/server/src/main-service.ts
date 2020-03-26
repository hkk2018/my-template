import { mainState } from "./main-state";
import { cmsLib } from "./cms";
import { ExecResult } from "./data-tpye";


export let mainService = {
    //要繼續流程的錯誤全都在resolve的callback處理，要終止流程的錯誤直接進catch
    execStepP(): Promise<any> {
        cmsLib.tellIsProcessStarted(mainState.execIndex > 2);
        return mainState.taskPFuncArr[mainState.execIndex]().then(
            successMsg => {
                if (!mainState.isPause) {
                    if (mainState.taskPFuncArr[mainState.execIndex + 1]) {
                        mainState.execIndex++;
                        return mainService.execStepP();
                    }
                    else onComplete();
                }
                else return;
            },
            (errMsg: string) => {
                onErr(errMsg);//致使前端暫停
            }
        )
    }
}

// onUnfixableErr(specialErrMsg);//未與vmz或手臂連線、斷線，或其他不知名錯誤（程序無法handle者）
function onErr(errMsg: string) {
    cmsLib.sendErrLog(errMsg);//會觸發前端暫停
}
function onUnfixableErr(errMsg: string) {
    cmsLib.sendUnfixableErrLog(errMsg);
}

function onComplete() {
    mainState.execIndex = 0;
    cmsLib.tellIsProcessStarted(false);
}