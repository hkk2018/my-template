import io from 'socket.io-client';
import { mainService } from './main-service';

const port = 8082;
const url = 'http://localhost:' + port;//不輸入時會根據window.location連線
console.log('connected to ' + port);

// let dbOnLinux = 'http://52.231.202.252:443/';
// console.log(dbOnLinux);
export let socket = io(url);

socket.on('DATA_LOG', function (log: string, reply: Function) {
    mainService.handleLogs(log)
    let dataToReply: ResponseObj = { status: 200, payload: '客戶端也可以回覆喔' };
    reply(dataToReply);
})
socket.on('ERR_LOG', function (log: string, reply: Function) {
    mainService.handleLogs(log, true);
})
