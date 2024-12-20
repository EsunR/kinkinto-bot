const path = require("path")

module.exports = {
  apps: [
    {
      name: "kinkinto-bot",
      script:
        "node --experimental-specifier-resolution=node --loader ./loader.js ./dist/serve.js",
      env: {
        NODE_ENV: "production",
      },
      cwd: path.resolve(__dirname, "./"),
    },
  ],
}
