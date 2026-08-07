const https = require('https');

const loginData = JSON.stringify({
  email: "admin@suvaialaya.com",
  password: "adminpassword"
});

const req = https.request({
  hostname: 'suvaialaya.com',
  port: 443,
  path: '/api/admin/login',
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
    console.log('Login:', data.success);
    if (!data.token) {
      console.log('No token. Use the token provided by the server.');
      return;
    }
    
    // Now update settings
    const settingsData = JSON.stringify({
      festival: {
        name: "Suvaialaya Grand Launch",
        restaurantName: "SUVAIALAYA",
        tagline: "Authentic South Indian Cuisine",
        eyebrow: "Something Grand is Coming Soon",
        dates: "August 7, 8 & 9, 2026",
        hours: "11:00 AM — 11:00 PM",
        venue: "Bommasandra, Bengaluru",
        description: "Experience the grand opening..."
      },
      contactPage: {
        heroEyebrow: "Get In Touch",
        heroTitle: "We'd love to hear from you.",
        heroDescription: "Have questions about the event, your booking, or the menu? Our team is ready to help.",
        info: [
          { iconName: "Phone", label: "Phone", value: "+91 90350 05335", sub: "Mon-Sun, 11 AM - 11 PM" },
          { iconName: "Mail", label: "Email", value: "hello@suvaialaya.com", sub: "We reply within 24 hours" },
          { iconName: "MapPin", label: "Venue", value: "Bommasandra, Bengaluru", sub: "N, 256/B, near Narayana Hrudayalaya Hospital, Karnataka 560099" },
          { iconName: "Clock", label: "Event Hours", value: "11 AM - 11 PM", sub: "All 3 days of the event" }
        ]
      }
    });
    
    const updateReq = https.request({
      hostname: 'suvaialaya.com',
      port: 443,
      path: '/api/settings',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
        'Content-Length': Buffer.byteLength(settingsData)
      }
    }, res2 => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => {
        console.log('Update response:', body2);
      });
    });
    updateReq.write(settingsData);
    updateReq.end();
  });
});
req.write(loginData);
req.end();
