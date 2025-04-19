module.exports = {
  apps: [
    {
      name: "ajiopay",
      script: "./build/server.js",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      ignore_watch: [
        ".git",
        "public",
        "src/public",
        "build/public",
        "uploads",
        "newrelic_agent.log",
        "tmp",
        "tmp/uploads",
      ],
      watch_options: {
        followSymlinks: false,
      },
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
        ENV: "production",
      },
    },
  ],
};
