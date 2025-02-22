
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Enable CORS with specific options
const corsOptions = {
  origin: true, // Allow any origin for development
  methods: ['POST', 'OPTIONS'] // We only need POST and preflight OPTIONS
};

// Enable CORS
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Get map image for zipcode
app.post('/', async (req, res) => {
  try {
    console.log('[getMapData] Received request for map image');
    
    const { zipcode } = req.body;
    if (!zipcode) {
      console.error('[getMapData] Missing zipcode in request');
      return res.status(400).json({ error: 'Missing zipcode' });
    }

    console.log('[getMapData] Fetching map image for:', zipcode);

    // Get static map image from Google Maps API
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(zipcode)}&zoom=14&size=1920x1080&maptype=satellite&key=${process.env.MAPS_API_KEY}`;

    // Download map image
    const response = await fetch(mapUrl);
    if (!response.ok) {
      const error = `Failed to fetch map image: ${response.statusText}`;
      console.error('[getMapData]', error);
      throw new Error(error);
    }
    
    console.log('[getMapData] Successfully fetched from Maps API');
    const imageBuffer = await response.buffer();
    const base64Image = imageBuffer.toString('base64');
    
    const imageData = `data:image/jpeg;base64,${base64Image}`;
    console.log('[getMapData] Image data length:', imageData.length);
    
    console.log('[getMapData] Returning response with image');
    res.json({
      mapUrl,
      mapImage: imageData
    });

  } catch (error) {
    console.error('[getMapData] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for cloud function
exports.getMapImage = app;
