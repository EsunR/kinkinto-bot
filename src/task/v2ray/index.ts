import { mirai } from "@/instances/mirai"
import { myBot } from "@/instances/tgBot"
import { logger } from "@/utils/log"
import { getMessagePlantText, IMessageChain } from "mirai-http-sdk-ts"
import { scheduleJob } from "node-schedule"
import { getVnstatJsonData } from "./request"
import { transBitToGb } from "./utils"

const vnstatConfig = [
  {
    url: "http://hostyun-hk.zpangxie.top:8685/json.cgi",
    name: "ens3",
    hostName: "hostyun-hk",
    hourUpStream: 5,
  },
  {
    url: "http://vps-jp.zpangxie.top:8685/json.cgi",
    name: "eth0",
    hostName: "vps-jp",
    hourUpStream: 5,
  },
]

async function checkVnstat() {
  const results: {
    hostName: string
    currentHourGb: number
    currentDayGb: number
    currentMonthGb: number
  }[] = []

  try {
    await Promise.all(
      vnstatConfig.map(async (config) => {
        const res = await getVnstatJsonData(config.url)
        const vnstatResult = res.interfaces.find(
          (item) => item.name === config.name
        )
        if (!vnstatResult) {
          return
        }
        const currentHourData = vnstatResult.traffic.hour.pop()
        const currentDayData = vnstatResult.traffic.day.pop()
        const currentMonthData = vnstatResult.traffic.month.pop()
        if (!(currentHourData && currentDayData && currentMonthData)) {
          return
        }
        results.push({
          hostName: config.hostName,
          currentHourGb: parseFloat(
            transBitToGb(currentHourData.rx + currentHourData.tx).toFixed(2)
          ),
          currentDayGb: parseFloat(
            transBitToGb(currentDayData.rx + currentDayData.tx).toFixed(2)
          ),
          currentMonthGb: parseFloat(
            transBitToGb(currentMonthData.rx + currentMonthData.tx).toFixed(2)
          ),
        })
      })
    )
  } catch {
    logger.error("[V2ray] V2ray 流量检查失败")
  }

  // 检查是否超出阈值
  const needAlertHost = results.filter((item) => {
    const config = vnstatConfig.find((c) => c.hostName === item.hostName)
    if (config) {
      return item.currentHourGb > config.hourUpStream
    } else {
      return false
    }
  })
  const needAlertHostNames = needAlertHost.map((item) => item.hostName)

  logger.info(`[V2ray] ${JSON.stringify(results)}`)

  // 如果有就发出通知
  if (needAlertHost.length) {
    const statList: IMessageChain[] = results.map((item) => ({
      type: "Plain",
      text:
        `服务器：${item.hostName}\n` +
        `- 当前小时已用流量：${item.currentHourGb}GB${
          needAlertHostNames.includes(item.hostName) && "⚠️"
        }\n` +
        `- 当天已用流量：${item.currentDayGb}GB\n` +
        `- 当月已用流量：${item.currentMonthGb}GB\n` +
        "\n",
    }))
    const messageChain: IMessageChain[] = [
      {
        type: "Plain",
        text: "流量阈值预警\n\n",
      },
      ...statList,
      {
        type: "AtAll",
      },
      {
        type: "Plain",
        text: "请检查是否误将Clash设置为全局代理，或Steam下载正在使用代理节点",
      },
    ]
    await mirai.sendGroupMessage({
      target: 743551715,
      messageChain,
    })
    myBot.sendMessage(-1001533899884, getMessagePlantText(messageChain))
  }
}

export default function startV2rayTask() {
  scheduleJob("0 30,59 * * * *", checkVnstat)
}
