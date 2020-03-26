namespace FromFront {
    export interface MachineSetting {

    }
}

interface ResponseObj {
    status: number;
    payload: any //非200則為錯誤訊息
}

interface RespObj {
    isErr: boolean;
    msg: string
}

// export class ExecResult {
//     constructor(public isSuccess: boolean, public msg: string | null = null) {
//     }

// }