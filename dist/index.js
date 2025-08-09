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
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/metrics", middleware_1.requestCountMiddleware, (req, res) => {
    res.status(200).json({
        message: req.url.split("/")[1]
    });
});
app.get("/metrics2", middleware_1.requestCountMiddleware, (req, res) => {
    res.status(200).json({
        message: req.url.split("/")[1]
    });
});
app.get("/counter", (rrq, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield middleware_1.reqCounter.get();
    res.json(data);
}));
app.get("/gauge", (rrq, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield middleware_1.activeRequest.get();
    res.json(data);
}));
app.get("/histo", (rrq, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield middleware_1.responseTimeHisto.get();
    res.json(data);
}));
app.get("/cpu", middleware_1.activeReqMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
