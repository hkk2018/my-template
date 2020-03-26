import * as net from 'net'
import { roboArmLib } from './arm-process'
import { ExecResult } from './data-tpye';

export let mainState = {
    isPause: false,
    isInit: false,
    execIndex: 0,
    taskPFuncArrBase: [
        () => roboArmLib.reqArmP(roboArmLib.strStarter),
        () => roboArmLib.reqArmP(roboArmLib.strStarter2),
        () => roboArmLib.reqArmP('STAT').then(result => {
            if (result.isSuccess && result.msg && hex2bin(result.msg)[5] === '0') return new ExecResult(true);
            else return new ExecResult(false, result.msg);
        }),
        
    ] as (() => Promise<any>)[],
    taskPFuncArr: [] as (() => Promise<any>)[],//因為small loop的步驟會動態增，所以每次要用時就用基底取代過來
}


function hex2bin(hex: string) {
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}