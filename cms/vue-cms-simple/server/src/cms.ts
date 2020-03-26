import io from 'socket.io';
import * as http from 'http'
import { mainState } from './main-state';
import { vmzLib } from './vmz';
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

interface ButtonToActivate {
    INIT: boolean;
    AUTO: boolean;
    STOP: boolean;
}

export let cmsLib = {
    cmsSocket: null as null | io.Socket,
    sendDataLog(msg: string) {
        //optional chain
        cmsLib.cmsSocket?.emit('DATA_LOG', msg);
    },
    sendErrLog(msg: string) {
        cmsLib.cmsSocket?.emit('ERR_LOG', msg);
    },
    sendUnfixableErrLog(msg: string) {
        cmsLib.cmsSocket?.emit('UNFIXABLE_ERR_LOG', msg);
    },
    tellVmzConnectingState(isConnecting: boolean) {
        cmsLib.cmsSocket?.emit('VMZ_CONNECTION_STATE', isConnecting);
    },
    tellIsProcessStarted(isStarted: boolean) {
        cmsLib.cmsSocket?.emit('IS_PROCESS_STARTED', isStarted);
    },
    askKeyInNumberP(): Promise<string> {
        return new Promise((res, rej) => {
            cmsLib.cmsSocket?.emit('AS_KEY_IN_NUMBER', null, onReplied);
            function onReplied(numberStr: string) {
                res(numberStr);
            }
        })
    },
}

// socket.io需要聽http.server
let serv_io = io.listen(server);
serv_io.sockets.on('connection', function (socket) {
    console.log('cms is connected.')
    cmsLib.cmsSocket = socket;
    // socket.on('SET_AS_DEFAULT_MACHINESEETING', function (data: FromFront.MachineSetting, reply: Function) {
    //     console.log(data);
    //     let replyData: ResponseObj = { status: 200, payload: null };
    //     reply(replyData);//回覆
    // })


    socket.on('INIT', function (data: null, reply: Function) {
        console.log('INIT');

    })
    socket.on('AUTO', function (data: any, reply: Function) {
        console.log('AUTO');
    })

    socket.on('STOP', function (data: null, reply: Function) {
        console.log('STOP')
        mainState.isPause = true;
    })
    socket.on('VMZ_CONNECTION_STATE', function (data: null, reply: Function) {
        console.log('VMZ Connection state checked by CMS');
        reply(Boolean(vmzLib.vmzSocket && vmzLib.vmzSocket.connecting));
    })


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


