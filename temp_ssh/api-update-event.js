const https = require('https');

const loginData = JSON.stringify({
  email: "admin@suvaialaya.com",
  password: "admin123"
});

const req = https.request({
  hostname: 'suvaialaya.com',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    const token = data.data?.token;
    if (!token) return console.log('No token, login failed. Response:', body);
    
    https.get('https://suvaialaya.com/api/events', resEvents => {
      let eBody = '';
      resEvents.on('data', d => eBody += d);
      resEvents.on('end', () => {
        const events = JSON.parse(eBody).data;
        if (!events || events.length === 0) return console.log('No events found');
        
        const event = events[0];
        const updateData = JSON.stringify({
          basePrice: 1199
        });
        
        const updateReq = https.request({
          hostname: 'suvaialaya.com',
          port: 443,
          path: `/api/events/${event._id}`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(updateData)
          }
        }, resUpdate => {
          let uBody = '';
          resUpdate.on('data', d => uBody += d);
          resUpdate.on('end', () => console.log('Update event:', uBody));
        });
        updateReq.write(updateData);
        updateReq.end();
      });
    });
  });
});
req.write(loginData);
req.end();
