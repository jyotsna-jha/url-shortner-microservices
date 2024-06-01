require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const { URL } = require('url'); // Import URL class from Node.js

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Placeholder database for storing URLs
const urlDatabase = {};

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Routes
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint for shortening URLs
let shortUrlCounter = 1; // Simple counter for generating short URLs

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate URL format using URL class
  try {
    new URL(originalUrl); // Throws TypeError if URL format is invalid
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  // Validate URL using dns.lookup (optional step)
  const urlObject = new URL(originalUrl); // Parse URL
  const hostname = urlObject.hostname;

  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Assuming validation passed, store URL and generate short URL
      const shortUrl = shortUrlCounter++;
      urlDatabase[shortUrl] = originalUrl;
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// Redirect to original URL when accessing /api/shorturl/<short_url>
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'Short URL not found' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
