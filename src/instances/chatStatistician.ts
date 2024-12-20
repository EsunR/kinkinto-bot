import ChatStatistician from "@/lib/botApps/chatStatistics"
import { mirai } from "./mirai"

const cachedInstances: ChatStatistician[] = []

export async function getChatStatisticians() {
  if (cachedInstances.length) {
    return cachedInstances
  }
  const groupIds = (await mirai.getGroupList()).data.data.map((item) => item.id)
  // 检查是否已经有当前群的实例
  groupIds.map(async (id) => {
    const hasInstance = !!cachedInstances.find(
      (instance) => instance.id.toString() === id.toString()
    )
    // 如果没有实例，就创建实例
    if (!hasInstance) {
      cachedInstances.push(
        new ChatStatistician({ id: id.toString(), miraiInstance: mirai })
      )
    }
  })
  return cachedInstances
}
