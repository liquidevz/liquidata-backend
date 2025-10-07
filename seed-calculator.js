const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://myliquidata:myliquidata@liquidata-backend.pje93kc.mongodb.net/?retryWrites=true&w=majority&appName=liquidata-backend');

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

const Calculator = mongoose.model('Calculator', calculatorSchema);

async function seedCalculator() {
  try {
    await Calculator.deleteMany({});
    
    const calculator = await Calculator.create({
      title: 'Project Cost Calculator',
      description: 'Get an instant estimate for your development project',
      basePrice: 75000,
      fields: [
        {
          name: 'projectType',
          label: 'Project Type',
          type: 'select',
          options: ['Landing Page', 'Business Website', 'E-commerce', 'Web Application', 'Mobile App'],
          multiplier: 1.2
        },
        {
          name: 'complexity',
          label: 'Complexity',
          type: 'select',
          options: ['Basic', 'Standard', 'Advanced', 'Enterprise'],
          multiplier: 1.8
        },
        {
          name: 'pages',
          label: 'Number of Pages',
          type: 'number',
          multiplier: 0.05
        },
        {
          name: 'timeline',
          label: 'Timeline (weeks)',
          type: 'number',
          multiplier: 0.08
        }
      ],
      isActive: true
    });

    console.log('✅ Calculator seeded:', calculator.title);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedCalculator();