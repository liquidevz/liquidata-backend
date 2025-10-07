const mongoose = require('mongoose');
const LogoSection = require('./models/LogoSection');
require('dotenv').config();

const seedLogos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata');
    
    // Clear existing logos
    await LogoSection.deleteMany({});
    
    // Create sample logos with real company logos
    const logos = [
      {
        name: 'Main Logo Section',
        logos: [
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
            altText: 'Google',
            width: 120,
            height: 32,
            isActive: true
          },
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg',
            altText: 'Microsoft',
            width: 120,
            height: 32,
            isActive: true
          },
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg',
            altText: 'Apple',
            width: 120,
            height: 32,
            isActive: true
          },
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazon/amazon-original.svg',
            altText: 'Amazon',
            width: 120,
            height: 32,
            isActive: true
          },
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg',
            altText: 'Meta',
            width: 120,
            height: 32,
            isActive: true
          },
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netflix/netflix-original.svg',
            altText: 'Netflix',
            width: 120,
            height: 32,
            isActive: true
          },
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/twitter/twitter-original.svg',
            altText: 'Twitter',
            width: 120,
            height: 32,
            isActive: true
          },
          {
            url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spotify/spotify-original.svg',
            altText: 'Spotify',
            width: 120,
            height: 32,
            isActive: true
          }
        ],
        text: 'Trusted by companies of all sizes',
        showText: true,
        isActive: true
      }
    ];
    
    await LogoSection.insertMany(logos);
    console.log('Logo sections seeded successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding logos:', error);
    process.exit(1);
  }
};

seedLogos();