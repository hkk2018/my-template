import io from 'socket.io-client';
import { mainService } from './main-service';
import { mainData } from './main-data';

const port = 8082;
const url = 'http://localhost:' + port;//不輸入時會根據window.location連線
console.log('connected to ' + port);

// let dbOnLinux = 'http://52.231.202.252:443/';
// console.log(dbOnLinux);
export let socket = io(url);



socket.emit('VMZ_CONNECTION_STATE', null, (isConnecting: boolean) => {
    console.log('vmz connection: ' + isConnecting);
    mainData.isVmzConnecting = isConnecting;
});
socket.on('VMZ_CONNECTION_STATE', function (isConnecting: boolean, reply: Function) {
    console.log('vmz connection: ' + isConnecting);
    mainData.isVmzConnecting = isConnecting;
});

socket.on('DATA_LOG', function (log: string, reply: Function) {
    mainService.handleLogs(log, false)
    // let dataToReply: ResponseObj = { status: 200, payload: '客戶端也可以回覆喔' };
    // reply(dataToReply);

})
socket.on('ERR_LOG', function (log: string, reply: Function) {
    mainService.handleLogs(log, true);
    mainData.isSystemRunning = false;
    if (mainData.user) mainService.alert('動作中斷，請按AUTO繼續或INITIAL重置');
})

socket.on('PROCESS_DONE', function (log: string, reply: Function) {
    mainData.isSystemRunning = false;
})
// socket.on('PROCESS_STARTED', function (data: null, reply: Function) {
//     mainData.isSystemRunning = true;
// });

// socket.on('UNFIXABLE_ERR_LOG', function (log: string, reply: Function) {
//     mainService.handleLogs(log, true);
//     mainData.isSystemRunning = false;
//     mainData.isSystemProcessStarted = false;//重置
// })



socket.on('ASK_KEY_IN_NUMBER', function (askText: string, reply: Function) {
    reply(askNumber(askText));

    function askNumber(askText?: string) {
        let numberStr = prompt(askText ? askText : '格式錯誤，請重新輸入:'); //取消則為null
        if (numberStr === null || isNaN(parseInt(numberStr))) return askNumber();
        else return numberStr;
    }
});

export let socketLib = {
    socket: socket,
    emitEvent(eventName: EventName, data?: any, onReplied?: Function) {
        if (socket.disconnected) mainService.alert('系統未連線，請重新啟動')
        else socket.emit(eventName, data, onReplied);
    }
}

type EventName = 'INIT' | 'AUTO' | 'STOP'|'WRITE_BACK_LOG'|'OPEN_FOLDER';


