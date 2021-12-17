import * as fs from 'fs';

let templateDirectoryPath = 'front';
let maintenanceUrl = 'game-back-end/maintenancePage'
// 只有在 require() 时才使用相对路径(./, ../) 的写法，其他地方一律使用绝对路径，如下：
// https://github.com/jawil/blog/issues/18
export namespace FileService {
    // for not reading file by fs module again
    export let cache: { [key: string]: any } = {}; //key : 'asset/gold-icon.png'
    export interface dataObj {
        data: any;
        fileExt: fileExt;// extension
    }
    type fileExt = 'html' | 'js' | 'css' | 'png' | 'jpg' | 'jpeg' | 'json';

    /**
     * 取得檔案資料並暫存在server end cache中供重複存取。
     * @param filePath ex: index.html, lt/static-assets/lottery-mat/easter-egg/answers/5.png
     * @param gameType 決定要抓哪款遊戲的index.html
     * @param cpId 只有當filePath === 'index.html'的時候才會使用到這個參數（要該公司之該遊戲是否維護中），所以get其他檔案時此參數任意給都不影響功能
     */
    export function getDataObjToSendP(filePath: string): Promise<any | dataObj> {
        return new Promise((res, rej) => {


            let isMaintenance = false
            // 【TechPoint】最前面的./加不加都可以，前後端都一樣
            let absPath = templateDirectoryPath + filePath;

            console.log(absPath);
            if (filePath === 'index.html')
                if (isMaintenance) absPath = maintenanceUrl + filePath;//其他資源還是可以在舊址讀到

            // if it's read before, get it from cache 
            if (cache[absPath]) {
                res(cache[absPath]);
            }
            // load file
            else {
                fs.access(absPath, fs.constants.F_OK, err => {
                    // fs.exists(absPath, (isExist: boolean) => { // Deprecated: Use fs.stat() or fs.access() instead.
                    if (!err) fs.readFile(absPath, (err, dataRead) => {
                        // fails to read file
                        if (err) {
                            console.log('err occurs when reading file' + err);
                            rej();
                        }
                        // succeeds
                        else {
                            let dataObj: dataObj = {
                                data: dataRead,
                                fileExt: getFileExt(filePath)
                            }
                            cache[absPath] = dataObj; //save into cache
                            res(dataObj);
                        }
                    })
                    else {
                        console.log('no such file: ' + filePath);
                        rej();
                    }
                });
            };
        });
        function getFileExt(filePath: string) {
            let extStr: fileExt = filePath.slice(filePath.lastIndexOf('.') + 1) as fileExt;
            return extStr;// js, html etc...
        }
    };
    /** 從副檔名取得MimeType */
    export function getMimeTypeFromExt(fileExt: string) {
        let mimeType: string;
        if (fileExt === 'html') mimeType = 'text/html';
        else if (fileExt === 'js') mimeType = 'text/javascript';
        else if (fileExt === 'css') mimeType = ' text/css'
        else if (fileExt === 'jpeg' || fileExt === 'jpg') mimeType = 'image/jpeg';
        else if (fileExt === 'json') mimeType = 'application/json'//沒有此行好像也好好的
        else mimeType = 'image/png';
        return mimeType;
    }
}
