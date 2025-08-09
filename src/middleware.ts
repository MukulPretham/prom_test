import promClient from "prom-client" 

export const reqCounter = new promClient.Counter({
    name: "http_request_total",
    help: "total number of request",
    labelNames: ["method", "route", "status_code"]
})

// Gauge metric
export const activeRequest = new promClient.Gauge({
    name: "Active_request",
    help: "number of active requets",
    labelNames: ["endpoint"]
})

// Histogram metric
export const responseTimeHisto = new promClient.Histogram({
    name: "resposne_histogram",
    help: "hiogram for response time",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.5, 1, 2, 3, 5, 6, 8]
}
)

export const requestCountMiddleware = (req: any, res: any, next: any) => {
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

export const activeReqMiddleware = (req: any, res: any, next: any) => {
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