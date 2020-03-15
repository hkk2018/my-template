import { mainData } from './main-data';

export let mainService = {
    alert(str: string) { alert(str) },
    GetFromLocalStorage(key: string): any | null {
        let item = (localStorage.getItem(key));
        return item === null ? item : JSON.parse(item);
    },
    reloadData(key: string) {
        (mainData as any)[key] = mainService.GetFromLocalStorage(key);
    }
}