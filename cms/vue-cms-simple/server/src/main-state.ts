import { roboArmLib } from './arm-process';
import { cmsLib } from './cms';
import { vmzLib } from './vmz';
import { mainService } from './main-service';

export let mainState = {
    isPause: false,
    isStarted: false,
    execIndex: 0,
    pauseInformCmsRes: () => { },
    stationWaferInfo: '',//'A4B6C0'
    taskPFuncArrBase: [
        () => roboArmLib.reqArmP(roboArmLib.strStarter),
        () => roboArmLib.reqArmP(roboArmLib.strStarter2),
        () => roboArmLib.reqArmP('STAT').then(msg => {
            if (mainService.hex2bin(msg)[5] === '0') return;
            else return Promise.reject(msg);
        }),
        () => roboArmLib.reqArmP('STAT').then(msg => {
            if (mainService.hex2bin(msg)[8] === '0') return;
            else return Promise.reject(msg);
        }),
        () => vmzLib.reqVmzP('getstation').then(msg => {
            mainState.stationWaferInfo = msg; //'A4B6C0'
            cmsLib.sendDataLog(msg);
        }),
        //從sendToArm('SGRP A')分成三部分，子迴圈的內容根據狀況動態增
        () => handleWaferSizeProcP(0),
        () => handleWaferSizeProcP(1),
        () => handleWaferSizeProcP(2),
        () => Promise.resolve().then(() => {
            cmsLib.sendDataLog('排程已全數執行完畢，可重新開始');
            mainState.isStarted = false;
            cmsLib.tellProcessDone();
            return 'Process Done';
        })
    ] as (() => Promise<string>)[],
    taskPFuncArr: [] as (() => Promise<string>)[],//因為small loop的步驟會動態增，所以每次要用時就用基底取代過來
}



function handleWaferSizeProcP(stationIndex: 0 | 1 | 2): Promise<string> {
    let waferSize = mainState.stationWaferInfo[stationIndex * 2 + 1];
    //waferSize等於0的站點跳過
    if (waferSize === '0') return Promise.resolve('This station is no wafer task');
    //非0者動態新增task至佇列中
    else {
        let sizeSymbol = waferSize === '4' ? 'A' : 'B';
        return roboArmLib.reqArmP('SGRP ' + sizeSymbol).then((successMsg) => {
            //成功設定wafer size之後才會新增move task(所以確保此步失敗可重來)
            let stationSymbolUpperCase = mainState.stationWaferInfo[stationIndex * 2];
            let moveTaskPFunc = () => roboArmLib.reqArmP('MAP ' + stationSymbolUpperCase.toLowerCase()).then(msgAfterMoving => {
                //成功才會新增scanTask
                let scanTaskPFunc = () => roboArmLib.reqArmP('RSR').then((scannedDataStr) => {
                    //掃的結果有問題會暫停，成功則新增small loop task
                    if (scannedDataStr.includes('2') || scannedDataStr.includes('3') || scannedDataStr.includes('4')) return Promise.reject(scannedDataStr);
                    else {
                        let taskPFuncsToAdd: (() => Promise<string>)[] = [];
                        for (let i = 0; i < scannedDataStr.length; i++) {
                            if (scannedDataStr[i] === '1') {
                                taskPFuncsToAdd.push(() => roboArmLib.reqArmP(`GET ${stationSymbolUpperCase}, ${i + 1}`));
                                taskPFuncsToAdd.push(() => roboArmLib.reqArmP(`PUT D, 1`));

                                taskPFuncsToAdd.push(() => vmzLib.reqVmzP('startw'));
                                taskPFuncsToAdd.push(() => roboArmLib.reqArmP(`GET D, 1`));
                                taskPFuncsToAdd.push(() => roboArmLib.reqArmP(`MTCS E`));

                                taskPFuncsToAdd.push(() => vmzLib.reqVmzP('starto').then(waferId => {
                                    cmsLib.sendDataLog('waferId: ' + waferId);
                                    return 'get and show waferId sucess';
                                }));
                                // // only ask for number
                                // taskPFuncsToAdd.push(() => cmsLib.askKeyInNumberP()),
                                //失敗的話會從輸入數字重來
                                taskPFuncsToAdd.push(() => cmsLib.askKeyInNumberP().then(numberStr => {
                                    console.log('number input from cms: ' + numberStr);
                                    return vmzLib.reqVmzP('waferid ' + numberStr as any);
                                }));
                                taskPFuncsToAdd.push(() => roboArmLib.reqArmP('PUT F, 1'));
                                taskPFuncsToAdd.push(() => vmzLib.reqVmzP('startv'));
                                taskPFuncsToAdd.push(() => roboArmLib.reqArmP('GET F, 1'));
                                taskPFuncsToAdd.push(() => roboArmLib.reqArmP(`PUT ${stationSymbolUpperCase}, ${i + 1}`));
                            }
                        }
                        //從最後面開始加，這樣順序才對，因為splice會把新資料放在該index，而原本的整個會往後推
                        for (let i = taskPFuncsToAdd.length - 1; i > -1; i--) {
                            mainState.taskPFuncArr.splice(mainState.execIndex + 1, 0, taskPFuncsToAdd[i])
                        }
                        return 'RSR OK and now added small loop tasks into queue';
                    }
                })
                mainState.taskPFuncArr.splice(mainState.execIndex + 1, 0, scanTaskPFunc);
                return 'move task done and added scan task into queue';
            })
            mainState.taskPFuncArr.splice(mainState.execIndex + 1, 0, moveTaskPFunc);
            return 'success to set wafer size and added move task into queue';
        });
    }
}