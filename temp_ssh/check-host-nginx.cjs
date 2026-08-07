const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `cat /etc/nginx/sites-enabled/default || cat /etc/nginx/nginx.conf`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '187.127.217.225',
  port: 22,
  username: 'root',
  password: 'Shalini@20052006'
});
