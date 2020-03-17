type DataName = 'users' | 'machineConfigs'|'dataLogs'|'errLogs';

type ServerEvent='SET_AS_DEFAULT_MACHINESEETING';

interface ResponseObj {
    status: number;
    payload: any //非200則為錯誤訊息
}
