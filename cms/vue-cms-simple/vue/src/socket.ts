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
})

socket.on('DATA_LOG', function (log: string, reply: Function) {
    mainService.handleLogs(log, false)
    // let dataToReply: ResponseObj = { status: 200, payload: '客戶端也可以回覆喔' };
    // reply(dataToReply);

})
socket.on('ERR_LOG', function (log: string, reply: Function) {
    mainService.handleLogs(log, true);
    mainData.isSystemRunning = false;
})


export let socketLib = {
    emitEvent(eventName: EventName, data?: any) {
        if (socket.disconnected) mainService.alert('系統未連線，請重新啟動')
        else socket.emit(eventName, data);
    }

}

type EventName = 'INIT' | 'AUTO' | 'STOP'


