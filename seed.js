const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata');

// Calculator Schema
const calculatorSchema = new mongoose.Schema({
  title: { type: String, default: 'Smart Calculator' },
  description: { type: String, default: 'Calculate your project costs instantly' },
  fields: [{
    name: String,
    label: String,
    type: { type: String, enum: ['number', 'select', 'text'] },
    options: [String],
    multiplier: { type: Number, default: 1 }
  }],
  basePrice: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Contact Form Schema
const contactFormSchema = new mongoose.Schema({
  title: { type: String, default: 'Get In Touch' },
  subtitle: { type: String, default: 'Fill the form below:' },
  budgetOptions: [{
    value: String,
    label: String
  }],
  submitUrl: { type: String, default: 'https://form.thetaphaus.in/send-email' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Calculator = mongoose.model('Calculator', calculatorSchema);
const ContactForm = mongoose.model('ContactForm', contactFormSchema);

async function seedData() {
  try {
    // Clear existing data
    await Calculator.deleteMany({});
    await ContactForm.deleteMany({});

    // Seed Calculator
    const calculator = await Calculator.create({
      title: 'Project Cost Calculator',
      description: 'Get an instant estimate for your web development project',
      basePrice: 50000,
      fields: [
        {
          name: 'projectType',
          label: 'Project Type',
          type: 'select',
          options: ['Website', 'E-commerce', 'Mobile App', 'Web App'],
          multiplier: 1
        },
        {
          name: 'complexity',
          label: 'Complexity Level',
          type: 'select',
          options: ['Simple', 'Medium', 'Complex', 'Enterprise'],
          multiplier: 1.5
        },
        {
          name: 'timeline',
          label: 'Timeline (weeks)',
          type: 'number',
          multiplier: 0.1
        },
        {
          name: 'features',
          label: 'Additional Features',
          type: 'select',
          options: ['Basic', 'Advanced', 'Premium'],
          multiplier: 0.8
        }
      ],
      isActive: true
    });

    // Seed Contact Form
    const contactForm = await ContactForm.create({
      title: 'Get In Touch',
      subtitle: 'Fill the form below:',
      budgetOptions: [
        { value: "4l-8l", label: "₹4,00,000 - ₹8,00,000" },
        { value: "8l-20l", label: "₹8,00,000 - ₹20,00,000" },
        { value: "20l-40l", label: "₹20,00,000 - ₹40,00,000" },
        { value: "40l+", label: "₹40,00,000+" }
      ],
      submitUrl: 'https://form.thetaphaus.in/send-email',
      isActive: true
    });

    console.log('✅ Database seeded successfully!');
    console.log('📊 Calculator created:', calculator.title);
    console.log('📝 Contact Form created:', contactForm.title);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();