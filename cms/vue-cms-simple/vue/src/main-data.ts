export let mainData: MainData = {
    // user: {accountName:'reer',password:'',auth:0},
    user: null,
    users: [],
    machineConfigs: [],
}

export interface User {
    accountName: string;
    password: string;
    auth: AuthType
}

export enum AuthType {
    root,
    basic
}

interface MainData {
    user: User | null;
    users: User[];
    machineConfigs: MachineConfig[]
}

export class MachineConfig {
    constructor(public settingName: string = '', public armSpeed: number | null = null, public partConfigs: PartConfig[]) { }
    public isUsing = false;
}
export class PartConfig {
    constructor(public partName: string, public axisInfo: AxisInfo, public operationOrder: number) { }
}
export class AxisInfo {
    constructor(public x: number | null = null, public y: number | null = null, public z: number | null = null) { }
}
