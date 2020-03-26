namespace FromFront {
    export interface MachineSetting {

    }
}

interface ResponseObj {
    status: number;
    payload: any //非200則為錯誤訊息
}

interface ExecResult {
    isSuccess: boolean;
    msg: string | null
}