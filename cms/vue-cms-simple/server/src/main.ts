import { mainState } from "./main-state";
import { cmsLib } from "./cms";



let taskPArr: Promise<any>[] = [];
let execIndex = 0;


function execStepP():Promise<any> {
    // log();
    // stat()

    return taskPArr[execIndex].then(
        (result: ExecResult) => {
            if (result.isSuccess) {
                if (!mainState.isPause) {
                    if (taskPArr[execIndex + 1]) {
                        execIndex++;
                        return execStepP();
                    }
                    else onComple();
                }
                else return;
            }
            else onErr(result.msg || '');
        },
        (specialErrMsg: string) => {
            onErr(specialErrMsg);//與機器連線中斷
        })
}

function onErr(errMsg: string) {
    cmsLib.SendErrLog(errMsg);
}

function onComple() { }