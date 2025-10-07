const mongoose = require('mongoose');
const Component = require('./models/Component');
require('dotenv').config();

const websiteComponents = [
  {
    name: 'Hero Section',
    type: 'hero',
    props: {},
    order: 1,
    isActive: true,
    category: 'hero',
    description: 'Main hero section with dynamic content'
  },
  {
    name: 'Company Logos',
    type: 'logos',
    props: {},
    order: 2,
    isActive: true,
    category: 'social-proof',
    description: 'Company logos section'
  },
  {
    name: 'Feature Grid',
    type: 'features',
    props: {},
    order: 3,
    isActive: true,
    category: 'features',
    description: 'Feature grid with cards'
  },
  {
    name: 'Code Demo',
    type: 'codedemo',
    props: {},
    order: 4,
    isActive: true,
    category: 'features',
    description: 'Interactive code demonstration'
  },
  {
    name: 'Feature Carousel',
    type: 'carousel',
    props: {},
    order: 5,
    isActive: true,
    category: 'features',
    description: 'Feature carousel component'
  },
  {
    name: 'Customer Section',
    type: 'customers',
    props: {},
    order: 6,
    isActive: true,
    category: 'social-proof',
    description: 'Customer testimonials and reviews'
  },
  {
    name: 'Statistics',
    type: 'stats',
    props: {},
    order: 7,
    isActive: true,
    category: 'social-proof',
    description: 'Key statistics and metrics'
  },
  {
    name: 'Pricing Plans',
    type: 'pricing',
    props: {},
    order: 8,
    isActive: true,
    category: 'pricing',
    description: 'Pricing plans and packages'
  },
  {
    name: 'Call to Action',
    type: 'cta',
    props: {},
    order: 9,
    isActive: true,
    category: 'cta',
    description: 'Final call-to-action section'
  },
  {
    name: 'Footer',
    type: 'footer',
    props: {},
    order: 10,
    isActive: true,
    category: 'footer',
    description: 'Site footer with links'
  }
];

async function seedWebsiteComponents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata');
    console.log('Connected to MongoDB');

    // Clear existing components
    await Component.deleteMany({});
    console.log('Cleared existing components');

    // Insert website components
    const components = await Component.insertMany(websiteComponents);
    console.log(`Created ${components.length} website components`);

    console.log('Website components created:');
    components.forEach(component => {
      console.log(`- ${component.name} (${component.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding website components:', error);
    process.exit(1);
  }
}

seedWebsiteComponents();