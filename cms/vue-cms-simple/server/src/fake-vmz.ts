//斷線自己隨機關掉測試
//門固定會打開一次，時間隨機
//pNg的機率發生ng
//station改改看

import * as net from 'net';

let station = 'C4B6A0';
let pNg = 0;
let isTestEndConnection = false;
//for reference only
let inputStr = ['getstation', 'startw', 'starto', 'startv']; //w=wheel, o=orc, v=vmz
let outputStr = ['A4B6C0', 'WaferID123', 'finish', 'ng', 'dooropen'];

var socket = net.createConnection(8124);
socket.on('connect', () => {
    setInterval(() => {
        socket.write('dooropen'); //dooropen
    }, 100000 * Math.random());
    socket.on('data', (data: any) => {
        let dataStr = data.toString();
        console.log(dataStr);
        if (dataStr == 'getstation') socket.write(output(station)); //station
        else if (dataStr == 'startw') socket.write(output('finish')); //finish wheel
        else if (dataStr == 'starto') socket.write(output('WaferID123')); //wafer id
        else if (dataStr == 'startv') socket.write(output('finish')); //finish
        else if (!isNaN(parseInt(data))) socket.write(output('finish')); //response to wafer ID input
        else socket.write('ng'); 
    });

    if (isTestEndConnection) setTimeout(() => {
        socket.end();
        console.log('終止連線');
    }, 15000);

})
function output(mes: string) {
    if (Math.random() > pNg) return mes;
    else return 'ng';
}