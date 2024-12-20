import { IMessageChain } from "mirai-http-sdk-ts"
import { RemindInstance } from "../model/Remind"

export function getAddSuccessQQMessageChain(taskName: string): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: `任务『${taskName}』创建成功啦`,
    },
  ]
}

export function getRemindListQQMessageChain(
  records: RemindInstance[]
): IMessageChain[] {
  if (records.length) {
    const remindMessageChainGroup = records.map((record) => {
      return [
        {
          type: "Plain",
          text: `任务ID：${record.id}\n`,
        },
        {
          type: "Plain",
          text: `名称：${record.taskName}\n`,
        },
        {
          type: "Plain",
          text: `规则：${record.loopRule}\n`,
        },
        {
          type: "Plain",
          text: "\n",
        },
      ] as IMessageChain[]
    })
    const result: IMessageChain[] = [
      {
        type: "Plain",
        text: "存在以下定时任务\n\n",
      },
    ]
    remindMessageChainGroup.forEach((chain) => {
      result.push(...chain)
    })
    result.push({
      type: "Plain",
      text: "输入 reminder del <id> 可以删除任务",
    })
    return result
  } else {
    return [
      {
        type: "Plain",
        text: "找不到任何定时任务",
      },
    ]
  }
}

export function getDelInfoQQMessageChain(success: boolean): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: success ? "删除成功" : "找不到对应的记录诶，删除失败了",
    },
  ]
}
