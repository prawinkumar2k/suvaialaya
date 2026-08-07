const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('docker ps', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '187.127.217.225',
  port: 22,
  username: 'root',
  password: 'Shalini@20052006'
});
