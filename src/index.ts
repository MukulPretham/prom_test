import express, { NextFunction } from "express"
import { requestCountMiddleware, reqCounter, activeRequest, responseTimeHisto, activeReqMiddleware } from "./middleware"
import promClient from "prom-client"

const app = express()

app.use(express.json())

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