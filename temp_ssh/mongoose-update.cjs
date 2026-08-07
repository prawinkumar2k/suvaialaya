const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const innerNodeCmd = `
const mongoose = require('mongoose');
mongoose.connect('mongodb://sems-db:27017/suvaialaya?replicaSet=rs0').then(async () => {
  const SystemSettings = mongoose.model('SystemSettings', new mongoose.Schema({}, { strict: false }));
  const doc = await SystemSettings.findOne();
  if (!doc) {
    console.log('No document found');
    return mongoose.disconnect();
  }
  console.log('Updating document ID:', doc._id);
  await SystemSettings.updateOne({ _id: doc._id }, { 
    $set: { 
      'festival.venue': 'Bommasandra, Bengaluru', 
      'festival.dates': 'August 7, 8 & 9, 2026', 
      'contactPage.info.1.value': 'hello@suvaialaya.com' 
    } 
  });
  console.log('Updated!');
  mongoose.disconnect();
});
  `;
  const escapedCmd = innerNodeCmd.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  const cmd = `docker exec suvaialaya-application node -e "${escapedCmd}"`;
  
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
