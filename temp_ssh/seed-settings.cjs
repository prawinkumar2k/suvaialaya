const { Client } = require('ssh2');

const payload = JSON.stringify({
  festival: {
    name: "Suvaialaya Grand Event",
    restaurantName: "SUVAIALAYA",
    venue: "Bommasandra, Bengaluru",
    dates: "August 7, 8 & 9, 2026",
    hours: "11 AM - 11 PM"
  },
  contactPage: {
    heroEyebrow: "Get In Touch",
    heroTitle: "We'd love to hear from you.",
    heroDescription: "Have questions about the event, your booking, or the menu? Our team is ready to help.",
    info: [
      { iconName: "Phone", label: "Phone", value: "+91 90350 05335", sub: "Mon-Sun, 11 AM - 11 PM" },
      { iconName: "Mail", label: "Email", value: "suvaialaya@gmail.com", sub: "We reply within 24 hours" },
      { iconName: "MapPin", label: "Venue", value: "Bommasandra, Bengaluru", sub: "N, 256/B, near Narayana Hrudayalaya Hospital, Karnataka 560099" },
      { iconName: "Clock", label: "Event Hours", value: "11 AM - 11 PM", sub: "All 3 days of the event" }
    ]
  },
  contactPhone: "90350 05335"
});

// Write payload to a temp file on server, then curl it
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected');
  // Step 1: write the JSON to a file
  const writeCmd = `echo '${payload.replace(/'/g, "'\\''")}' > /tmp/settings_payload.json`;
  conn.exec(writeCmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', () => {
      // Step 2: curl using the file
      const curlCmd = `docker exec suvaialaya-application wget -qO- --post-file=/tmp/settings_payload.json --header="Content-Type: application/json" http://localhost:3000/api/settings 2>&1 || curl -s -X PUT http://localhost:3000/api/settings -H "Content-Type: application/json" -d @/tmp/settings_payload.json`;
      // Actually let's use node inside the container
      const nodeCmd = `docker exec suvaialaya-application node -e "
const http = require('http');
const fs = require('fs');
const data = fs.readFileSync('/tmp/settings_payload.json', 'utf8');
const req = http.request({ hostname:'localhost', port:3000, path:'/api/settings', method:'PUT', headers:{'Content-Type':'application/json','Content-Length':data.length}}, res => {
  let body='';
  res.on('data',d=>body+=d);
  res.on('end',()=>{const j=JSON.parse(body);console.log('success:',j.success,'festival.venue:',j.data&&j.data.festival&&j.data.festival.venue);});
});
req.write(data);req.end();
"`;
      // First copy json to container then exec
      const steps = [
        `docker cp /tmp/settings_payload.json suvaialaya-application:/tmp/settings_payload.json`,
        nodeCmd
      ].join(' && ');
      
      conn.exec(steps, (err2, stream2) => {
        if (err2) { console.error(err2); conn.end(); return; }
        stream2.on('data', d => process.stdout.write(d.toString()));
        stream2.stderr.on('data', d => process.stderr.write(d.toString()));
        stream2.on('close', () => { console.log('\nDone'); conn.end(); });
      });
    });
  });
}).connect({
  host: '187.127.217.225',
  port: 22,
  username: 'root',
  password: 'Shalini@20052006'
});
