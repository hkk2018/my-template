import { mainState } from "./main-state";
import { cmsLib } from "./cms";


export let mainService = {
    execStepP(): Promise<any> {
        return mainState.taskPFuncArr[mainState.execIndex]().then(
            (result: ExecResult) => {
                if (result.isSuccess) {
                    if (!mainState.isPause) {
                        if (mainState.taskPFuncArr[mainState.execIndex + 1]) {
                            mainState.execIndex++;
                            return mainService.execStepP();
                        }
                        else onComple();
                    }
                    else return;
                }
                else onErr(result.msg || '');
            },
            (specialErrMsg: string) => {
                onErr(specialErrMsg);//未與vmz或手臂連線、斷線
            })
    }
}


function onErr(errMsg: string) {
    cmsLib.sendErrLog(errMsg);//會觸發前端暫停
}

function onComple() { }