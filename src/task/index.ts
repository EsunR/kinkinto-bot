import startBotAppTask from "./botApp"
import startV2rayTask from "./v2ray"
import startCleanTask from "./clean"

export default function startTask() {
  startBotAppTask()
  startV2rayTask()
  startCleanTask()
}
