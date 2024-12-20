import path from "path"
import testRouter from "@/routers/test"
import telegramRouter from "@/routers/telegram"
import miraiRouter from "@/routers/mirai"
import cors from "@koa/cors"
import Koa from "koa"
import KoaBody from "koa-body"
import KoaLogger from "koa-logger"
import Router from "koa-router"
import KoaStatic from "koa-static"
import { sysConfig } from "./config"
import errorHandler from "./middle/error_handler"
import startTask from "./task"
import { logger, osLogger } from "./utils/log"
import { fileURLToPath } from "url"

const app: Koa = new Koa()
const router: Router = new Router()

// log
app.use(KoaLogger())

// 错误处理
app.use(errorHandler())

// 静态文件服务
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(
  KoaStatic(path.join(__dirname, "../static"), {
    gzip: true,
  })
)

// CORS
app.use(cors())

// 解析 HTTP Body
app.use(
  KoaBody({
    multipart: true,
    formidable: {
      maxFieldsSize: 2000 * 1024 * 1024,
    },
  })
)

// Router
router.use("/api/test", testRouter.routes())
router.use("/api/telegram", telegramRouter.routes())
router.use("/api/mirai", miraiRouter.routes())
app.use(router.routes()).use(router.allowedMethods())

// Task
startTask()

// Listen
app.listen(sysConfig.port)
logger.info(`serve running on port ${sysConfig.port}`)
osLogger.info("========== serve start running ==========")
