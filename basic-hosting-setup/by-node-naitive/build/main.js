"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routing_1 = require("./routing");
let port = 8080;
routing_1.routing.createHttpServer().listen(port, '0.0.0.0', () => {
    console.log('--------');
    console.log('server is listening on: ' + port);
    console.log('--------');
});
