import { routing } from "./routing";

let port = 8080;

routing.createHttpServer().listen(port, '0.0.0.0', () => {
    console.log('--------');
    console.log('server is listening on: ' + port);
    console.log('--------');
});