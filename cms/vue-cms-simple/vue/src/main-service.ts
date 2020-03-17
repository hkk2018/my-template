import { mainData } from './main-data';
import { socket } from './socket';


export let mainService = {
    alert(str: string) { alert(str) },
    confirm(str: string): boolean { return confirm(str) },
    inform(str: string) {
        alert(str);
    },
    GetFromLocalStorage(key: DataName): any | null {
        let item = (localStorage.getItem(key));
        return item === null ? item : JSON.parse(item);
    },
    loadDataInFromLS(key: DataName) {
        let item = mainService.GetFromLocalStorage(key);
        (mainData as any)[key] = item === null ? (mainData as any)[key] : item;//從未有東西就返回預設值
        if (key === 'machineConfigs') mainData.machineConfigs.sort((a, b) => a.isUsing ? -1 : (b.id - a.id));
    },
    saveDataToLS(key: DataName, data: any) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    /**
     * 伺服器回應200就會直接Resolve(replied data)，否則將含狀態碼的ResponseObj整個回傳
     * @param eventName 
     * @param passingData 
     */
    socketEmitP(eventName: ServerEvent, passingData?: any): Promise<any | ResponseObj> {
        return new Promise((resolve, reject) => {
            //dataWithE如果是undefined在serverEnd好像會變成null
            socket.emit(eventName, passingData, onReplied);
            // socket.emit(eventName, callBack); 如果沒填passingData，io就會以為callBack是passingData，而導致acknowklegment不被啟用
            function onReplied(response: ResponseObj) {
                if (response.status === 200) resolve(response.payload);//then會接到data
                else reject(response);//catch會接到人寫的error obj
            }
        })
    },
    handleLogs(log: string, isErr: boolean = false) {
        let theLogs: string[] = isErr ? mainData.errLogs : mainData.dataLogs;
        let sizeLimit = 1000;
        theLogs.splice(0, 0, log);
        if (theLogs.length > sizeLimit) {
            theLogs.splice(theLogs.length - 1, 1)
        }
        mainService.saveDataToLS(isErr ? 'errLogs' : 'dataLogs', theLogs)
    }
}
