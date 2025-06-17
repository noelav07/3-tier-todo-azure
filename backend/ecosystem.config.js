module.exports = {
  apps: [
    {
      name: 'todo-backend',
      script: 'server.js',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'todo-frontend',
      script: 'python3',
      args: '-m http.server 8000',
      cwd: '../frontend',
      watch: true
    }
  ]
}; 