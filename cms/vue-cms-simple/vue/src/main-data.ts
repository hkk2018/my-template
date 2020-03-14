export let mainData: MainData = {
    user: null,
    users: null,



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
    users: User[] | null;
}