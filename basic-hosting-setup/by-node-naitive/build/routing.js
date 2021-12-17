"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routing = void 0;
const http = __importStar(require("http"));
const file_service_js_1 = require("./file.service.js");
/** 與是否允許載入index.html相關的功能 */
exports.routing = {
    /**
     * 第一次登入localhost:xxxx時伺服器會回傳html string給瀏覽器，
     * 瀏覽器會自動解析html，並依照html上面的src向server發起requset（我猜內建使用xhr），
     * request的url例子：
     * GET http://localhost:8080/pixi.min.js net::ERR_ABORTED 404 (Not Found)
     * 實際上，此檔案從server端來看，是在./front/pixi.min.js
     * 這表示html檔及其相關之src都假設(以為)8080這裡是它們所在的根目錄。
     *
     * 伺服器可以依照request的url自己選擇拿什麼檔案回傳，
     * 回傳只要用res.end()回傳，再加上header的content-type有設定正確，資料到了前端會自動被讀對，
     * 比如說要求的是js檔就會無誤地開始跑、要求的是png圖片就是正確地顯示這樣，只要有回傳。（沒回傳伺服器會顯示等待回應中...）
     */
    createHttpServer() {
        let isSendFileConsoleLog = false;
        let server = http.createServer(function (request, response) {
            // 應該是不會undefined https://stackoverflow.com/questions/58377623/request-url-undefined-type-why
            if (!request.url)
                return;
            console.log('url:' + request.url);
            // console.log(request.method)
            //基本上只有載入的時候用get，此外任何資料取得都用post
            if (request.method === 'GET') {
                let filePath;
                // if (request.url.slice(0, 5) === '/opt?') {
                //     let parsedObj = routing.handleQueryString(request.url)
                // }
                //** 得到的url位址皆以/冠頭，表示根目錄之下 */
                filePath = request.url;
                // 網址列後不輸入任何值直接載入，預設是得到/。
                if (filePath === '/')
                    filePath = '/index.html';
                file_service_js_1.FileService.getDataObjToSendP(filePath).then(
                // 找到
                (dataObj) => {
                    let mimeType = file_service_js_1.FileService.getMimeTypeFromExt(dataObj.fileExt);
                    response.writeHead(200, { "content-type": mimeType });
                    if (isSendFileConsoleLog) {
                        console.log('GET-url:  ' + request.url);
                        console.log('sent file with content-type:' + mimeType);
                        console.log('--------'); // display neatly
                    }
                    //要end回去才會抓到資料，否則前端會一直在等待回應。
                    //然後以圖片為例，即使人家有特定的request，你要回傳什麼完全隨便你
                    response.end(dataObj.data);
                }, 
                // 沒找到
                () => {
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.end('Error 404: resource not found.');
                    console.log('--------'); // display neatly
                });
            }
        });
        return server;
    },
    /**　將url分解成所需資料。 */
    handleQueryString(url) {
        let parsedObj = {};
        if (url.indexOf('?') != -1) {
            //之後去分割字串把分割後的字串放進陣列中
            let ary1 = url.split('?');
            //此時ary1裡的內容為：
            //ary1[0] = '.../opt'，ary2[1] = 'cp=ag&gameType=lt'
            //下一步把後方傳遞的每組資料各自分割
            let keyValueStrs = ary1[1].split('&');
            //此時ary2裡的內容為：
            //ary2[0] = 'cp=ag'，ary2[1] = 'gameType=lt'
            for (let i in keyValueStrs) {
                let a = keyValueStrs[i].split('=');
                parsedObj[a[0]] = a[1];
            }
        }
        return parsedObj;
    },
};
