import { mainData, MachineConfig, PartConfig, AxisInfo, LogObj } from './main-data';
import { socket, socketLib } from './socket';

interface ModalConfig {
    isShowModal: Boolean,
    isConfirm: Boolean,
    isConfirmCancel: Boolean,
    title: string,
    body: string,
    resFunc: Function,
    buttons: string[]
}
export enum CreateType {
    null,
    default
}

let modalP: Promise<any> = new Promise(res => {
    res();
});

export let mainService = {
    vm: null,
    callModal(body: string, buttons: string[], title: string): Promise<number> {
        modalP = modalP.then(() => new Promise(res => {
            let modalConfig: ModalConfig = (mainService.vm as any).$children[0].modalConfig;
            modalConfig.isShowModal = true;
            modalConfig.title = title;
            modalConfig.body = body;
            modalConfig.buttons = buttons;
            modalConfig.resFunc = res;
        }))
        return modalP
    },
    alert(body: string, buttons: string[] = ['確定'], title: string = '提示'): Promise<true> {
        return mainService.callModal(body, buttons, title).then(() => true);
    },
    confirm(body: string, buttons: string[] = ['確定', '取消'], title: string = '提示'): Promise<boolean> {
        //選0的時候是回傳true喔因為是選確定
        return mainService.callModal(body, buttons, title).then((bit: number) => bit === 0 ? true : false);
    },
    inform(str: string) {
        let inform: (str: string) => void = (mainService.vm as any).$children[0].inform;
        inform(str);
    },
    GetFromLocalStorage(key: DataName): any | null {
        let item = (localStorage.getItem(key));
        return item === null ? null : JSON.parse(item);
    },
    loadDataInFromLS(key: DataName) {
        let item = mainService.GetFromLocalStorage(key);
        (mainData as any)[key] = item === null ? (mainData as any)[key] : item;//從未有東西就返回預設值
        //含有使用中者往前排，否則照創建時間排
        if (key === 'machineConfigs') mainData.machineConfigs.sort((a, b) =>
            (a.isUsing || b.isUsing) ? (a.isUsing ? -1 : 1) : (b.id - a.id)
        );
    },
    saveDataToLS(key: DataName, data: any) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    createMachineConfig(createType: CreateType) {
        let partNames = ['VMZ', 'ORC', 'P1', 'P2', 'P3'];
        let pcArr = [];
        if (createType === CreateType.null) {
            for (let i = 0; i < partNames.length; i++) {
                pcArr.push(new PartConfig(partNames[i], new AxisInfo(), i + 1));
            };
            return new MachineConfig(undefined, undefined, pcArr)
        }
        // 預設的配置即為使用中的配置
        else if (createType === CreateType.default) {
            let xyzArrs = [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ]
            let settingName = '預設';
            let armSpeed = 1;
            for (let i = 0; i < partNames.length; i++) {
                pcArr.push(new PartConfig(partNames[i], new AxisInfo(xyzArrs[i][0], xyzArrs[i][1], xyzArrs[i][2]), i + 1));
            };
            let mc = new MachineConfig(settingName, armSpeed, pcArr);
            mc.isUsing = true;
            return mc;
        }

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
    handleLogs(logMsg: string, isErr: boolean = false) {

        let sizeLimit = 3000;
        let lo = new LogObj(logMsg, isErr);
        socketLib.emitEvent('WRITE_BACK_LOG', new WriteLogBackFormat(lo.receivedT + '  ' + lo.logMsg, lo.receivedT));
        mainData.logs.splice(0, 0, lo);
        if (mainData.logs.length > sizeLimit) {
            mainData.logs.splice(mainData.logs.length - 1, 1)
        }
        mainService.saveDataToLS('logs', mainData.logs)
    },
    download(text: string, filename = 'logs') {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}



class WriteLogBackFormat {
    constructor(public msg: string, timeStr: string) {
        this.dateFileName = timeStr.split(' ')[0].replace(/\//g, '');
    }
    dateFileName: string;
}