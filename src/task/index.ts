import startMiraiTask from "./mirai"
import startV2rayTask from "./v2ray"
import startCleanTask from "./clean"

export default function startTask() {
  startMiraiTask()
  startV2rayTask()
  startCleanTask()
}
