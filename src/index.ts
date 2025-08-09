import express, { NextFunction } from "express"
import promClient from "prom-client"

const app = express()

app.use(express.json())

// counter metric
// Each metric is a object
const reqCounter = new promClient.Counter({
    name: "http_request_total",
    help: "total number of request",
    labelNames: ["method", "route", "status_code"]
})

// Gauge metric
const activeRequest = new promClient.Gauge({
    name: "Active_request",
    help: "number of active requets",
    labelNames: ["endpoint"]
})

// Histogram metric
const responseTimeHisto = new promClient.Histogram({
    name: "resposne_histogram",
    help: "hiogram for response time",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.5, 1, 2, 3, 5, 6, 8]
}
)

const requestCountMiddleware = (req: any, res: any, next: any) => {
    const startTime = Date.now();
    res.on("finish", () => {
        const endTime = Date.now();
        const obj = {
            method: req.method,
            route: req.url.split("/")[req.url.split("/").length - 1],
            status_code: res.statusCode
        }
        reqCounter.inc()
        reqCounter.inc(obj) //This is stored in our app memory, for now

        responseTimeHisto.observe({
            method: req.method,
            route: req.url.split("/")[req.url.split("/").length - 1],
            status_code: res.statusCode
        },endTime - startTime)

        console.log(obj)
        console.log(`request took ${endTime - startTime} ms`)
    });
    next();
}

const activeReqMiddleware = (req: any, res: any, next: any) => {
    activeRequest.inc()
    activeRequest.inc({
        endpoint: req.url.split("/")[req.url.split("/").length - 1]
    })
    res.on("finish", () => {
        activeRequest.dec({
            endpoint: req.url.split("/")[req.url.split("/").length - 1]
        })
        activeRequest.dec()
    })
    next();
}

app.get("/metrics", requestCountMiddleware, (req, res) => {

    res.status(200).json({
        message: req.url.split("/")[1]
    });

})

app.get("/metrics2", requestCountMiddleware, (req, res) => {

    res.status(200).json({
        message: req.url.split("/")[1]
    });

})

app.get("/counter", async (rrq, res) => {
    const data = await reqCounter.get()
    res.json(data)
})

app.get("/gauge", async (rrq, res) => {
    const data = await activeRequest.get()
    res.json(data)
})

app.get("/histo", async (rrq, res) => {
    const data = await responseTimeHisto.get()
    res.json(data)
})

app.get("/cpu", activeReqMiddleware, async (req, res) => {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("done");
        }, 10000)
    })
    res.json({})
})

app.listen(3000, () => {
    console.log(("server is runnig at prort 3000"))
})