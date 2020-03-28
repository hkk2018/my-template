import * as http from 'http';
import * as fs from 'fs';
import * as child_process from 'child_process';


import io from 'socket.io';
import { mainState } from './main-state';
import { vmzLib } from './vmz';
import { mainService } from './main-service';
import { roboArmLib } from './arm-process';


let server = http.createServer(function (request, response) { });
let port = 8082;

// about 0.0.0.0:
// https://stackoverflow.com/questions/8325480/set-up-node-so-it-is-externally-visible
// https://stackoverflow.com/questions/14043926/node-js-connect-only-works-on-localhost
server.listen(port, '0.0.0.0', function () {
    console.log('--------');
    console.log('server is listening to CMS on: ' + port);
    console.log('--------');
});


export let cmsLib = {
    cmsSocket: null as null | io.Socket,
    sendDataLog(msg: string) {
        //optional chain
        cmsLib.cmsSocket?.emit('DATA_LOG', msg);
    },
    sendErrLog(msg: string) {
        cmsLib.cmsSocket?.emit('ERR_LOG', 'ERR: ' + msg);
    },
    sendUnfixableErrLog(msg: string) {
        // cmsLib.cmsSocket?.emit('UNFIXABLE_ERR_LOG', msg);
    },

    tellVmzConnectingState(isConnecting: boolean) {
        cmsLib.cmsSocket?.emit('VMZ_CONNECTION_STATE', isConnecting);
    },
    tellProcessStarted() {
        // cmsLib.cmsSocket?.emit('PROCESS_STARTED');
    },
    tellProcessDone() {
        cmsLib.cmsSocket?.emit('PROCESS_DONE');
    },
    askKeyInNumberP(askTest: string = '掃描失敗，請手動輸入Wafer Id：'): Promise<string> {
        return new Promise((res, rej) => {
            //稍微讓前面要傳給客戶端看的waferId先顯示出來，有時候會後來的訊息會快過先傳的
            //（這邊會使前端出現prompt而卡死前端js，所以如果Id後到則要等輸入框結束後才會出現）
            setTimeout(() => {
                cmsLib.cmsSocket?.emit('ASK_KEY_IN_NUMBER', askTest, onReplied);
            }, 500);
            function onReplied(numberStr: string) {
                res(numberStr);
            }
        })
    },
}

// socket.io需要聽http.server
let serv_io = io.listen(server);
serv_io.sockets.on('connection', function (socket) {
    console.log('cms is connected.');
    cmsLib.cmsSocket = socket;
    // socket.on('SET_AS_DEFAULT_MACHINESEETING', function (data: FromFront.MachineSetting, reply: Function) {
    //     console.log(data);
    //     let replyData: ResponseObj = { status: 200, payload: null };
    //     reply(replyData);//回覆
    // })


    socket.on('INIT', function (data: null, reply: Function) {
        console.log('INIT');
        mainState.isStarted = false;
        //不參與mainState的execIndex，自己在這邊作
        console.log(roboArmLib.strStarter);
        roboArmLib.reqArmP(roboArmLib.strStarter).then(() => {
            console.log(roboArmLib.strStarter2);
            return roboArmLib.reqArmP(roboArmLib.strStarter2);
        }).then(() => {
            roboArmLib.reqArmP('STAT' + '\r\n').then(msg => {
                console.log(msg)
                if (mainService.hex2bin(msg)[5] === '0') {
                    reply({ isErr: false, msg: msg } as RespObj);
                }
                else reply({ isErr: true, msg: msg } as RespObj);
            })
        }).catch(err => {
            console.log(err);//怕字串化錯誤會crash，就傳個自訂字串
            reply({ isErr: true, msg: typeof err === 'string' ? err : '機械手臂異常' } as RespObj);
        });


    })
    socket.on('AUTO', function (data: any, reply: Function) {
        console.log('AUTO');
        if (mainState.isStarted) mainService.countinueProcess();
        else mainService.startProcess();
        reply();
    })

    socket.on('STOP', function (data: null, reply: Function) {
        console.log('STOP')
        new Promise((res, rej) => {
            mainState.pauseInformCmsRes = res;
            mainState.isPause = true;
        }).then(() => {
            reply();
        })
    })
    socket.on('VMZ_CONNECTION_STATE', function (data: null, reply: Function) {
        console.log('VMZ connection state checked by CMS: isConnected===' + vmzLib.isSocketAlive);
        reply(vmzLib.isSocketAlive);
    })

    socket.on('WRITE_BACK_LOG', function (logBack: WriteLogBackFormat, reply: Function) {
        const path = `./logs/${logBack.dateFileName}.txt`;
        fs.appendFileSync(path, logBack.msg+'\r\n');
    });
    socket.on('OPEN_FOLDER', function (data: null, reply: Function) {
        child_process.exec('start "" "logs"');
    });


    // //傳訊息給客戶端
    // setInterval(() => {
    //     socketEmitP(socket, 'DATA_LOG', 'data test' + new Date().toLocaleTimeString()).then((data) => {
    //         console.log(data)
    //     });
    // }, 3000)

    // setInterval(() => {
    //     socketEmitP(socket, 'ERR_LOG', 'err test' + new Date().toLocaleTimeString());
    // }, 5000)
});


class WriteLogBackFormat {
    constructor(public msg: string, timeStr: string) {
        this.dateFileName = timeStr.split(' ')[0].replace(/\//g, '');
    }
    dateFileName: string;
}