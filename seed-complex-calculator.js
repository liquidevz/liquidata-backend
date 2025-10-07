const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://myliquidata:myliquidata@liquidata-backend.pje93kc.mongodb.net/?retryWrites=true&w=majority&appName=liquidata-backend');

const calculatorSchema = new mongoose.Schema({
  title: { type: String, default: 'Smart Calculator' },
  description: { type: String, default: 'Calculate your project costs instantly' },
  basePrice: { type: Number, default: 50000 },
  steps: [{
    id: String,
    title: String,
    type: { type: String, enum: ['single-select', 'multi-select', 'contact', 'estimate'] },
    required: { type: Boolean, default: true },
    condition: String,
    options: [{
      key: String,
      title: String,
      description: String,
      icon: String,
      multiplier: { type: Number, default: 1 },
      addCost: { type: Number, default: 0 }
    }]
  }],
  pricingRules: {
    projectTypeMultipliers: { type: Map, of: Number },
    industryMultipliers: { type: Map, of: Number },
    scopeMultipliers: { type: Map, of: Number },
    teamMultipliers: { type: Map, of: Number },
    timelineMultipliers: { type: Map, of: Number },
    featureCosts: { type: Map, of: Number }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Calculator = mongoose.model('Calculator', calculatorSchema);

async function seedComplexCalculator() {
  try {
    await Calculator.deleteMany({});
    
    const calculator = await Calculator.create({
      title: 'Smart Project Calculator',
      description: 'Get accurate estimates for your development project',
      basePrice: 75000,
      steps: [
        {
          id: 'project-type',
          title: 'Select your project type',
          type: 'single-select',
          required: true,
          options: [
            { key: 'website', title: 'Website', description: 'Marketing site, portfolio, blog', icon: 'Monitor' },
            { key: 'web-app', title: 'Web Application', description: 'SaaS, dashboard, web platform', icon: 'AppWindow' },
            { key: 'mobile-app', title: 'Mobile Application', description: 'iOS, Android, cross-platform', icon: 'Smartphone' },
            { key: 'api-backend', title: 'API & Backend', description: 'REST API, microservices', icon: 'Server' }
          ]
        },
        {
          id: 'industries',
          title: 'Which industries does this serve?',
          type: 'multi-select',
          required: true,
          options: [
            { key: 'SaaS', title: 'SaaS', icon: 'Layers' },
            { key: 'Healthcare', title: 'Healthcare', icon: 'Heart' },
            { key: 'Finance', title: 'Finance', icon: 'Building2' },
            { key: 'E-commerce', title: 'E-commerce', icon: 'Globe' },
            { key: 'Education', title: 'Education', icon: 'Sparkles' }
          ]
        },
        {
          id: 'features',
          title: 'What core features do you need?',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'User management', title: 'User Management', icon: 'Users', addCost: 15000 },
            { key: 'Authentication', title: 'Authentication', icon: 'Lock', addCost: 10000 },
            { key: 'Payment processing', title: 'Payment Processing', icon: 'Building2', addCost: 25000 },
            { key: 'Real-time chat', title: 'Real-time Chat', icon: 'Users', addCost: 30000 },
            { key: 'AI/ML features', title: 'AI/ML Features', icon: 'Sparkles', addCost: 50000 }
          ]
        },
        {
          id: 'scope',
          title: 'What is the project scope?',
          type: 'single-select',
          required: true,
          options: [
            { key: 'mvp', title: 'MVP', description: 'Minimum viable product', icon: 'Sparkles' },
            { key: 'standard', title: 'Standard', description: 'Full-featured application', icon: 'Layers' },
            { key: 'enterprise', title: 'Enterprise', description: 'Complex, scalable solution', icon: 'Timer' }
          ]
        },
        {
          id: 'team',
          title: 'What team size do you need?',
          type: 'single-select',
          required: true,
          options: [
            { key: 'solo', title: 'Solo Developer', description: '1 developer' },
            { key: 'small', title: 'Small Team', description: '2-4 specialists' },
            { key: 'medium', title: 'Medium Team', description: '5-8 specialists' },
            { key: 'large', title: 'Large Team', description: '9+ specialists' }
          ]
        },
        {
          id: 'timeline',
          title: 'What is your timeline?',
          type: 'single-select',
          required: true,
          options: [
            { key: 'rush', title: 'Rush (1-2 months)', description: 'Urgent delivery' },
            { key: 'standard', title: 'Standard (3-6 months)', description: 'Balanced approach' },
            { key: 'extended', title: 'Extended (6-12 months)', description: 'Comprehensive development' }
          ]
        },
        {
          id: 'contact',
          title: 'Contact Information',
          type: 'contact',
          required: true
        },
        {
          id: 'estimate',
          title: 'Your Project Estimate',
          type: 'estimate',
          required: false
        }
      ],
      pricingRules: {
        projectTypeMultipliers: new Map([
          ['website', 0.5],
          ['web-app', 1.0],
          ['mobile-app', 1.2],
          ['api-backend', 0.8]
        ]),
        industryMultipliers: new Map([
          ['Healthcare', 1.3],
          ['Finance', 1.4],
          ['SaaS', 1.1],
          ['E-commerce', 1.1],
          ['Education', 1.0]
        ]),
        scopeMultipliers: new Map([
          ['mvp', 0.7],
          ['standard', 1.0],
          ['enterprise', 1.8]
        ]),
        teamMultipliers: new Map([
          ['solo', 0.8],
          ['small', 1.0],
          ['medium', 1.2],
          ['large', 1.5]
        ]),
        timelineMultipliers: new Map([
          ['rush', 1.5],
          ['standard', 1.0],
          ['extended', 0.9]
        ]),
        featureCosts: new Map([
          ['User management', 15000],
          ['Authentication', 10000],
          ['Payment processing', 25000],
          ['Real-time chat', 30000],
          ['AI/ML features', 50000]
        ])
      },
      isActive: true
    });

    console.log('✅ Complex calculator seeded:', calculator.title);
    console.log('📊 Steps:', calculator.steps.length);
    console.log('💰 Base price: ₹', calculator.basePrice);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedComplexCalculator();