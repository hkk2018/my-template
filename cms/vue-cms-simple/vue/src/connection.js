var net = require('net');

//設定
port = 8001;    // Datalogger port
host = '192.168.29.130';    // Datalogger IP address
sendDelay = 300;

strStarter = 'SVON\r\n';
strStarter2 = 'HOM\r\n';

//指令
console.log('programme starts')
var socket = net.createConnection(port, host, () => {
    console.log('connected');
    //start roboarm service
    socket.write(strStarter, 'ascii', (res) => { console.log(res) });
    setTimeout(() => { socket.write(strStarter2, 'ascii', (res) => { console.log(res) }); }, sendDelay)
    //確認歸零成功 check if the 6th bit is 0
        //'STAT'
        //hex2bin(statReturn)[5] ===0


    //async commands
    //手冊: 65頁
    //三軸: (T,R,Z)
    //set target location: 'SPC A, 1000, 2000, 5000'(um)
    //set target depth: 'PITCH A, 1'(mm)
    //set target number: 'SSN A, 50'(max)
    //to location: 'MTCS A, 1' 1=put 2=get
    //get wafer
        //check ready = if the 9th bit is 0
            //'STAT': hex2bin(statReturn)[8] ===0
        //'GET A, 1'(wafer index from 1-50)
        //check done = if the 9th is 0
            //'STAT': hex2bin(statReturn)[8] ===0
    //put wafer
    //p1 - OCR (delay 8s) - VMZ(delay 8s) - P1

});

function hex2bin(hex){
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}