import * as net from 'net';
import { cmsLib } from './cms';
import { ExecResult } from './data-tpye';
//設定
const port = 8001;    // Datalogger port
const host = '192.168.29.130';    // Datalogger IP address

//300ms delay at least
const strStarter = 'SVON\r\n'; //on
const strStarter2 = 'HOM\r\n'; //home


let delayIndex = 0;
let sendDelay = 6000;

export let roboArmLib = {
	strStarter: 'SVON', //on
	strStarter2: 'HOM', //home
	roboArmSocket: null as net.Socket | null,
	resolveFunc: null as any,
	//直接對vmz發送start訊息，vmz回傳的字串若非ng即表示成功，並將此回傳字串放於VmzReply之msg中，以便後續處裡
	reqArmP(command: string): Promise<string> {
		return new Promise((res: (str: string) => void, rej) => {
			//建立socket過且處於連線中才可調用此函數
			if (roboArmLib.roboArmSocket != null && roboArmLib.roboArmSocket.connecting) {
				cmsLib.sendDataLog(command);
				command += '\r\n';
				roboArmLib.roboArmSocket.write(command, 'ascii');
				roboArmLib.resolveFunc = res;
			}
			else rej('未連線至機械手臂')
		}).then((stringFromArm: string) => {
			if (stringFromArm === '?') return Promise.reject(stringFromArm);
			else return stringFromArm;
		})
	}
}



//指令
console.log('program starts')
let socket = net.createConnection(port, host, () => {
	console.log('connected');
	roboArmLib.roboArmSocket = socket;

	//---listening
	socket.on('data', function (data) {
		//remove \r\n
		//action done: >
		//action fail: ?
		//sendToArm('STAT');
		roboArmLib.resolveFunc(data.toString().replace('\r\n', ''));//送資料回Promise
		console.log(data.toString().replace('\r\n', ''));

		// socket.end();
	});
	//---
	/*
		//start roboarm service
		//initialize
		socket.write(strStarter, 'ascii', (res) => { console.log(res) });
		setTimeout(() => { socket.write(strStarter2, 'ascii', (res) => { console.log(res) }); }, sendDelay)
		//確認歸零成功 check if the 6th bit is 0
		sendToArm('STAT');
		//hex2bin(statReturn)[5] ===0
	
		//process start
		setTimeout(() => {
			//log state before every action
			//check ready = if the 9th bit is 0
			//'STAT': hex2bin(statReturn)[8] ===0
			//顯示not ready
			sendToArm('STAT');
	
			//get wafer size
			///'getstation'
			///'A4B6C0'
			//set wafer size
			sendToArm('SGRP A'); //A:4inch B:6inch
	
			//move and scan a/b/c once
			sendToArm('MAP a');
			//get scanned data
			//0=no wafer; 1=normal;
			//array of n
			//00000111110000234
			//any 234 pause all
			sendToArm('RSR');
	
			//---small loop
			//get A/B/C
			sendToArm('GET A, 6');
	
			//aligner, fixed index 1
			sendToArm('PUT D, 1');
			///server write: 'start'
			///server receive: 'finish'
			///'ng'
			sendToArm('GET D, 1');
	
	
			//OCR move only
			sendToArm('MTCS E')
	
			//server write OCR
			///'start'
			///'waferID' (return)
			///'ng'
			//input alert to key in number and continue
	
			//vmz
			sendToArm('PUT F, 1');
			///'start'
			///'finish'
			///'ng'
			sendToArm('GET F, 1');
	
			//put back
			sendToArm('PUT A, 6');
	
			//---small loop end
	
			//any problem results in pause, restart will do the previous
			//when loop finish log end
	
			//pause(no redo)
			//server on: 'dooropen'
			//click pause
	
			console.log('end')
		}, 10000)
	*/
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

function hex2bin(hex: string) {
	return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}
function sendToArm(message: string) {
	message += '\r\n';
	setTimeout(() => { socket.write(message, 'ascii', (res) => { }); }, sendDelay * delayIndex)
	delayIndex += 1;
}