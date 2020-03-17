export let mainData: MainData = {
    // user: {accountName:'reer',password:'',auth:0},
    user: null,
    users: [],
    machineConfigs: [],
    dataLogs: [],
    errLogs: [],
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
    dataLogs: string[];
    errLogs: string[];
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
