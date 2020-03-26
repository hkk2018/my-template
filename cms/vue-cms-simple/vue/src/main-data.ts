export let mainData: MainData = {
    // user: {accountName:'reer',password:'',auth:0},
    user: null,
    users: [],
    machineConfigs: [],
    logs: [],
    isSystemRunning: false,
    isVmzConnecting: false,
    isSystemProcessStarted: false,
}

export class User {
    constructor(public accountName: string, public password: string, public auth: AuthType = AuthType.basic) {
    }
    id: number = new Date().getTime();
    lastLognT: Date | null = null
}

export enum AuthType {
    root,
    basic
}

interface MainData {
    user: User | null;
    users: User[];
    machineConfigs: MachineConfig[];
    logs: LogObj[];
    isSystemRunning: boolean
    isVmzConnecting: boolean
    isSystemProcessStarted: boolean//是否作過第一步(第一步之後通通有兩個選擇的設計，才要用到此參數，但目前不是，單純留著)

}

export class MachineConfig {
    constructor(public settingName: string = '', public armSpeed: number | null = null, public partConfigs: PartConfig[]) { }
    public isUsing = false;
    public id = new Date().getTime();
}
export class PartConfig {
    constructor(public partName: string, public axisInfo: AxisInfo, public operationOrder: number) { }
}
export class AxisInfo {
    constructor(public x: number | null = null, public y: number | null = null, public z: number | null = null) { }
}



export class LogObj {
    constructor(public logMsg: string, public isErr: boolean) {
    }
    receivedT: string = getDateString(new Date());
}

function getDateString(d: Date) {
    var year = d.getFullYear();
    var month = pad(d.getMonth() + 1);
    var day = pad(d.getDate());
    var hour = pad(d.getHours());
    var min = pad(d.getMinutes());
    var sec = pad(d.getSeconds());
    // return year + month + day + hour + min + sec;
    return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;
    //YYYYMMDDhhmmss
    function pad(v: number) {
        return (v < 10) ? '0' + v : v
    }
}