const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const innerCmd = `
const mongoose = require('mongoose');
mongoose.connect('mongodb://sems-db:27017/suvaialaya?replicaSet=rs0').then(async () => {
  console.log('Connected DB Host:', mongoose.connection.host);
  console.log('Connected DB Name:', mongoose.connection.name);
  
  const SystemSettings = mongoose.model('SystemSettings', new mongoose.Schema({}, { strict: false }));
  const doc = await SystemSettings.findOne();
  console.log('Document ID:', doc && doc._id);
  console.log('Festival:', doc && doc.festival);
  mongoose.disconnect();
});
  `.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  
  const cmd = `docker exec suvaialaya-application node -e "${innerCmd}"`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '187.127.217.225',
  port: 22,
  username: 'root',
  password: 'Shalini@20052006'
});
