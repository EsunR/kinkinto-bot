import { execSync } from "child_process"

export function getGitLog() {
  return execSync("git --no-pager log --pretty=format:'%s' --graph -1")
    .toString()
    .trim()
    .replace(/^\*\s/, "")
}

export function getGitLogHash() {
  return execSync("git --no-pager log --pretty=format:'%H' --graph -1")
    .toString()
    .trim()
    .replace(/^\*\s/, "")
}
