import * as net from 'net'
import { mainState } from './main-state';

export let vmzLib = {
    vmzSocket: null as net.Socket | null,
    resolveFunc: null as any,
    //直接對vmz發送start訊息，vmz回傳的字串若非ng即表示成功，並將此回傳字串放於VmzReply之msg中，以便後續處裡
    reqVmzP(): Promise<VmzReply> {
        return new Promise((res: (str: string) => void, rej) => {
            //建立socket過且處於連線中才可調用此函數
            if (vmzLib.vmzSocket != null && vmzLib.vmzSocket.connecting) {
                vmzLib.vmzSocket.write('start')
                vmzLib.resolveFunc = res;
            }
            else rej('錯誤：尚未連線至vmz前不得調用reqVmzP')
        }).then((stringFromVmz: string) => {
            let vmzReply: VmzReply = {
                isSuccess: stringFromVmz !== 'ng', //不是ng就成功
                msg: stringFromVmz //可能是'finish'或者是waferId等
            };
            return vmzReply
        })
    }
}
interface VmzReply {
    isSuccess: boolean;
    msg: string | null
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
    mainState.vmzSocket = socket;


    //write
    socket.write('Hello, client.');

    //receive
    socket.on('data', function (data) {
        vmzLib.resolveFunc(data.toString());//送資料給reqVmz的promise回傳值
        console.log(`Data received from client: ${data.toString()}.`);
    });

    //end
    socket.on('end', function () {
        console.log('Closing connection with the client');
    });

    //error
    socket.on('error', function (err) {
        console.log(`Error: ${err}`);
    });
});