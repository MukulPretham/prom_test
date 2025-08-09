"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prom_client_1 = __importDefault(require("prom-client"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// counter metric
// Each metric is a object
const reqCounter = new prom_client_1.default.Counter({
    name: "http_request_total",
    help: "total number of request",
    labelNames: ["method", "route", "status_code"]
});
const activeRequest = new prom_client_1.default.Gauge({
    name: "Active_request",
    help: "number of active requets",
    labelNames: ["endpoint"]
});
const responseTimeHisto = new prom_client_1.default.Histogram({
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
        reqCounter.inc();
        reqCounter.inc(obj); //This is stored in our app memory, for now
        responseTimeHisto.observe({
            method: req.method,
            route: req.url.split("/")[req.url.split("/").length - 1],
            status_code: res.statusCode
        }, endTime - startTime);
        console.log(obj);
        console.log(`request took ${endTime - startTime} ms`);
    });
    next();
};
const activeReqMiddleware = (req, res, next) => {
    activeRequest.inc();
    activeRequest.inc({
        endpoint: req.url.split("/")[req.url.split("/").length - 1]
    });
    res.on("finish", () => {
        activeRequest.dec({
            endpoint: req.url.split("/")[req.url.split("/").length - 1]
        });
        activeRequest.dec();
    });
    next();
};
app.get("/metrics", requestCountMiddleware, (req, res) => {
    res.status(200).json({
        message: req.url.split("/")[1]
    });
});
app.get("/metrics2", requestCountMiddleware, (req, res) => {
    res.status(200).json({
        message: req.url.split("/")[1]
    });
});
app.get("/counter", (rrq, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield reqCounter.get();
    res.json(data);
}));
app.get("/gauge", (rrq, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield activeRequest.get();
    res.json(data);
}));
app.get("/histo", (rrq, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield responseTimeHisto.get();
    res.json(data);
}));
app.get("/cpu", activeReqMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("done");
        }, 10000);
    });
    res.json({});
}));
app.listen(3000, () => {
    console.log(("server is runnig at prort 3000"));
});
