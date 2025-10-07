const mongoose = require('mongoose');
const { HeroComponent } = require('./models/PageComponents');
require('dotenv').config();

const heroData = {
  title: 'Build something incredible',
  subtitle: 'The future of development is here',
  description: 'Transform your ideas into reality with our cutting-edge platform designed for modern developers.',
  announcement: 'Exciting announcement 🎉',
  buttonText: 'Smart Calculator',
  buttonUrl: '/calculator',
  secondaryButtonText: 'Learn more',
  secondaryButtonUrl: '/#features',
  isActive: true
};

async function seedHeroComponent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata');
    console.log('Connected to MongoDB');

    await HeroComponent.deleteMany({});
    console.log('Cleared existing hero components');

    const hero = await HeroComponent.create(heroData);
    console.log('Created hero component:', hero.title);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding hero component:', error);
    process.exit(1);
  }
}

seedHeroComponent();