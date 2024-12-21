import ResBody from "@/struct/ResBody"
import Router from "koa-router"

const router: Router = new Router()

router.post("/webhook", async (ctx) => {
  const reqBody = ctx.request.body

  console.log(reqBody);

  ctx.body = new ResBody({
    data: { time: new Date() },
  })
})

export default router
