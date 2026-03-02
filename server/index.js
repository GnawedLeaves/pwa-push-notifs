require('dotenv').config();
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Essential for parsing the subscription object

// 1. Configure VAPID keys
webpush.setVapidDetails(
  'mailto:marcelyap31@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

// 2. Storage (In production, use a Database like MongoDB or PostgreSQL)
let subscriptions = []; 

// 3. Endpoint: Receive subscription from React
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  // Check if we already have this subscription to avoid duplicates
  const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
  
  if (!exists) {
    subscriptions.push(subscription);
    console.log('New subscription added!');
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});

// 4. Endpoint: Trigger a notification to ALL subscribers
app.post('/send-notification', (req, res) => {
  const notificationPayload = JSON.stringify({
    title: req.body.title || 'Default Title',
    body: req.body.body || 'Default message body',
    url: '/dashboard'
  });
  

  const promises = subscriptions.map(sub => 
    webpush.sendNotification(sub, notificationPayload)
      .catch(err => {
        console.error("Error sending to endpoint:", sub.endpoint, err);
        // If the subscription is expired or invalid, remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      })
  );

  Promise.all(promises).then(() => res.json({ message: 'Notifications sent!' }));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));