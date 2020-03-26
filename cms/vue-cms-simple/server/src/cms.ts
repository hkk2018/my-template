import io from 'socket.io';
import * as http from 'http'
import { mainState } from './main-state';


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
    //同時控制後台按鈕跟聽傳來的指令
    // waitCommandFromCmsP(bta:ButtonToActivate) {
    //     return new Promise((res: (str: string) => void, rej) => {

    //         //建立socket過且處於連線中才可調用此函數
    //         if (vmzLib.vmzSocket != null && vmzLib.vmzSocket.connecting) {
    //             vmzLib.vmzSocket.write(command);
    //             vmzLib.resolveFunc = res;
    //         }
    //         else rej('未連線至vmz')
    //     }).then((stringFromVmz: string) => {
    //         let vmzReply: VmzReply = {
    //             isSuccess: stringFromVmz !== 'ng', //不是ng就成功
    //             msg: stringFromVmz //可能是'finish'或者是waferId等
    //         };
    //         return vmzReply
    //     })

    // }
    SendDataLog(msg: string) {
        if (cmsLib.cmsSocket) cmsLib.cmsSocket.emit('DATA_LOG', msg);
    },
    SendErrLog(msg: string) {
        if (cmsLib.cmsSocket) cmsLib.cmsSocket.emit('ERR_LOG', msg);
    }



}

// socket.io需要聽http.server
let serv_io = io.listen(server);
serv_io.sockets.on('connection', function (socket) {
    console.log('cms is connected.')
    //註冊事件

    // socket.on('SET_AS_DEFAULT_MACHINESEETING', function (data: FromFront.MachineSetting, reply: Function) {
    //     console.log(data);
    //     let replyData: ResponseObj = { status: 200, payload: null };
    //     reply(replyData);//回覆
    // })


    socket.on('INIT', function (data: null, reply: Function) {
        console.log('INIT')
    })
    socket.on('AUTO', function (data: any, reply: Function) {
        console.log('AUTO')
    })

    socket.on('STOP', function (data: null, reply: Function) {
        console.log('STOP')
        mainState.isPause = true;
    })



    //傳訊息給客戶端
    setInterval(() => {
        socketEmitP(socket, 'DATA_LOG', 'data test' + new Date().toLocaleTimeString()).then((data) => {
            console.log(data)
        });
    }, 3000)

    setInterval(() => {
        socketEmitP(socket, 'ERR_LOG', 'err test' + new Date().toLocaleTimeString());
    }, 5000)
});


/**
* 伺服器回應200就會直接Resolve(replied data)，否則將含狀態碼的ResponseObj整個回傳
* @param eventName 
* @param passingData 
*/
function socketEmitP(socket: io.Socket, eventName: ClientEvent, passingData?: any): Promise<any | ResponseObj> {
    return new Promise((resolve, reject) => {
        //dataWithE如果是undefined在serverEnd好像會變成null
        socket.emit(eventName, passingData, onReplied);
        // socket.emit(eventName, callBack); 如果沒填passingData，io就會以為callBack是passingData，而導致acknowklegment不被啟用
        function onReplied(response: ResponseObj) {
            if (response.status === 200) resolve(response.payload);//then會接到data
            else reject(response);//catch會接到人寫的error obj
        }
    })
}
type ClientEvent = 'DATA_LOG' | 'ERR_LOG';

interface ResponseObj {
    status: number;
    payload: any //非200則為錯誤訊息
}



