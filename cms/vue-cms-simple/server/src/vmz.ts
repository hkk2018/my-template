import * as net from 'net';
import { cmsLib } from './cms';
import { mainState } from './main-state';

export let vmzLib = {
    vmzSocket: null as net.Socket | null,
    resolveFunc: null as any,
    //直接對vmz發送start訊息，vmz回傳的字串若非ng即表示成功，並將此回傳字串放於ExecResult之msg中，以便後續處裡
    reqVmzP(command: string = 'start'): Promise<string> {
        return new Promise((res: (str: string) => void, rej) => {
            //建立socket過且處於連線中才可調用此函數
            if (vmzLib.vmzSocket != null && vmzLib.vmzSocket.connecting) {
                cmsLib.sendDataLog(command);
                vmzLib.vmzSocket.write(command);
                vmzLib.resolveFunc = res;
            }
            else rej('未連線至vmz')
        }).then((stringFromVmz: string) => {
            if (stringFromVmz === 'ng') return Promise.reject(stringFromVmz);
            else return stringFromVmz;
        })
    }
}


//create server
let server = net.createServer();
//start server with a port to listen to
server.listen(8124, function () {
    console.log('TCP Server start')
});

//main connection event, will return a connection i.e. socket
server.on('connection', function (socket) {
    console.log('A new connection has been established.');
    vmzLib.vmzSocket = socket;
    cmsLib.tellVmzConnectingState(true);

    //write
    socket.write('Hello, client.');

    //receive
    socket.on('data', function (data) {
        let dataStr = data.toString();
        if ('dooropen' === dataStr) {
            mainState.isPause;//不會繼續作下去
            //告知前端已經暫停，但實際上此步因為沒有在taskQueue中拋出錯誤，所以正在執行的動作還是會完成，
            //而進入下一個index，當前端按繼續，就是繼續此index的事情，流程上正確。
            cmsLib.sendErrLog(dataStr);
        } else vmzLib.resolveFunc(dataStr);//送資料給reqVmz的promise回傳值
        console.log(`Data received from vmz client: ${dataStr}.`);

    });

    //end
    socket.on('end', function () {
        console.log('Closing connection with the client');
        cmsLib.tellVmzConnectingState(false);
    });

    //error
    socket.on('error', function (err) {
        cmsLib.sendErrLog(typeof err === 'string' ? err : 'vmz異常');
        mainState.isPause = true;
        console.log(`Error: ${err}`);
    });
});