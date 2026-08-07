const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = `db.events.updateMany({}, { \\$set: { basePrice: 1199 } });`;
  const query2 = `db.events.find({}, { basePrice: 1 }).toArray();`;
  const cmd = `docker exec suvaialaya-db mongosh suvaialaya --quiet --eval "${query} ${query2}"`;
  conn.exec(cmd, (err, stream) => {
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
