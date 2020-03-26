type DataName = 'users' | 'machineConfigs'|'logs';

type ServerEvent='SET_AS_DEFAULT_MACHINESEETING';

interface ResponseObj {
    status: number;
    payload: any //非200則為錯誤訊息
}

interface RespObj {
    isErr: boolean;
    msg: string
}