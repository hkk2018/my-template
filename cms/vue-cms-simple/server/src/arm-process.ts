import * as net from 'net';
import { cmsLib } from './cms';
//設定
const port = 8001;    // Datalogger port
// const host = '192.168.29.130';    // Datalogger IP address
const host = 'localhost';

//指令
console.log('program starts');
let socket: net.Socket;


export let roboArmLib = {
	strStarter: 'SVON', //on
	strStarter2: 'HOM', //home
	roboArmSocket: null as net.Socket | null,
	isSocketAlive: false,
	reconnectionTryResolveFunc: () => { },
	resolveFunc: (() => { }) as any,
	//直接對vmz發送start訊息，vmz回傳的字串若非ng即表示成功，並將此回傳字串放於VmzReply之msg中，以便後續處裡
	reqArmP(command: string): Promise<string> {
		return new Promise((res, rej) => {
			//每次開工前先檢查，如果沒連線要幫連
			if (roboArmLib.isSocketAlive) res();
			else {
				cmsLib.sendDataLog('未連線至機械手臂，嘗試重新連線中...');
				roboArmLib.reconnectionTryResolveFunc = res;
				roboArmLib.connectToArm();
				setTimeout(() => {
					rej('機械手臂連線超時，請重新連線')
				}, 10000);
			}
		}).then(() => {
			return new Promise((res: (str: string) => void, rej) => {
				roboArmLib.roboArmSocket?.write('STAT\r\n', 'ascii');//基本上已經非null了
				// cmsLib.sendDataLog('STAT');
				roboArmLib.resolveFunc = res;
				setTimeout(() => {
					rej('機械手臂連線超時，請重新連線')
				}, 10000);
			})
		}).then((stringFromArm) => {
			if (stringFromArm === '?') return Promise.reject('Failed to chceck arm stat.')
			else {
				cmsLib.sendDataLog('Arm stat before excuting: ' + stringFromArm);//show stat
				return new Promise((res1: (str: string) => void, rej1) => {
					cmsLib.sendDataLog('Execute(to arm): ' + command);
					console.log(command);
					command += '\r\n';
					roboArmLib.roboArmSocket?.write(command, 'ascii');//基本上已經非null了
					roboArmLib.resolveFunc = res1;
					setTimeout(() => {
						rej1('機械手臂連線超時，請重新連線')
					}, 10000);
				})
			}
		}).then((stringFromArm: string) => {
			if (stringFromArm === '?') return Promise.reject(stringFromArm);
			else return stringFromArm;
		})
	},
	connectToArm() {
		console.log('try to connect to arm');
		cmsLib.sendDataLog('try to connect to arm');
		socket = net.createConnection(port, host, () => {
			let succMsg = 'Successfully connected to arm.';
			cmsLib.sendDataLog(succMsg);
			console.log(succMsg);
			roboArmLib.roboArmSocket = socket;
			roboArmLib.isSocketAlive = true;
			roboArmLib.reconnectionTryResolveFunc();
			//---listening
			socket.on('data', function (data) {
				//remove \r\n
				//action done: >
				//action fail: ?
				//sendToArm('STAT');
				let breakLineRemovedData = data.toString().replace('\r\n', '');
				roboArmLib.resolveFunc(breakLineRemovedData);//送資料回Promise
				console.log(breakLineRemovedData);

				// socket.end();
			});

			socket.on('close', () => {
				console.log('arm is disconnected from server');
				roboArmLib.isSocketAlive = false;

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
	}
}

// 各種抓不到錯誤導致crash，但這個可以
// https://stackoverflow.com/questions/59463127/how-to-catch-the-throw-er-unhandled-error-event-in-other-peoples-apis-c
process.on('uncaughtException', function (err) {
	cmsLib.sendErrLog('Exception: ' + JSON.stringify(err));
	console.log(err)
});


//--- unused legacy

//300ms delay at least
const strStarter = 'SVON\r\n'; //on
const strStarter2 = 'HOM\r\n'; //home

let delayIndex = 0;
let sendDelay = 6000;

function hex2bin_Dreprecatd(hex: string) {
	return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}
function sendToArm(message: string) {
	message += '\r\n';
	setTimeout(() => { socket.write(message, 'ascii', (res) => { }); }, sendDelay * delayIndex)
	delayIndex += 1;
}