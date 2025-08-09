"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeReqMiddleware = exports.requestCountMiddleware = exports.responseTimeHisto = exports.activeRequest = exports.reqCounter = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.reqCounter = new prom_client_1.default.Counter({
    name: "http_request_total",
    help: "total number of request",
    labelNames: ["method", "route", "status_code"]
});
// Gauge metric
exports.activeRequest = new prom_client_1.default.Gauge({
    name: "Active_request",
    help: "number of active requets",
    labelNames: ["endpoint"]
});
// Histogram metric
exports.responseTimeHisto = new prom_client_1.default.Histogram({
    name: "resposne_histogram",
    help: "hiogram for response time",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.5, 1, 2, 3, 5, 6, 8]
});
const requestCountMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on("finish", () => {
        const endTime = Date.now();
        const obj = {
            method: req.method,
            route: req.url.split("/")[req.url.split("/").length - 1],
            status_code: res.statusCode
        };
        exports.reqCounter.inc();
        exports.reqCounter.inc(obj); //This is stored in our app memory, for now
        exports.responseTimeHisto.observe({
            method: req.method,
            route: req.url.split("/")[req.url.split("/").length - 1],
            status_code: res.statusCode
        }, endTime - startTime);
        console.log(obj);
        console.log(`request took ${endTime - startTime} ms`);
    });
    next();
};
exports.requestCountMiddleware = requestCountMiddleware;
const activeReqMiddleware = (req, res, next) => {
    exports.activeRequest.inc();
    exports.activeRequest.inc({
        endpoint: req.url.split("/")[req.url.split("/").length - 1]
    });
    res.on("finish", () => {
        exports.activeRequest.dec({
            endpoint: req.url.split("/")[req.url.split("/").length - 1]
        });
        exports.activeRequest.dec();
    });
    next();
};
exports.activeReqMiddleware = activeReqMiddleware;
