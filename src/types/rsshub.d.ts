declare module "rsshub" {
  const RSSHub: {
    init: (config?: any) => void
    request: (url: string) => Promise<any>
  }
  export default RSSHub
}
