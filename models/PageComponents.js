const mongoose = require('mongoose');

// Hero Component Schema
const HeroComponentSchema = new mongoose.Schema({
  title: { type: String, default: 'Build something incredible' },
  subtitle: { type: String, default: 'The future of development is here' },
  description: { type: String, default: 'Transform your ideas into reality with our cutting-edge platform.' },
  announcement: { type: String, default: 'Exciting announcement 🎉' },
  buttonText: { type: String, default: 'Get Started' },
  buttonUrl: { type: String, default: '#' },
  secondaryButtonText: { type: String, default: 'Learn More' },
  secondaryButtonUrl: { type: String, default: '#' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// CTA Component Schema
const CTAComponentSchema = new mongoose.Schema({
  title: { type: String, default: 'Ready to get started?' },
  description: { type: String, default: 'Join thousands of developers building the future.' },
  buttonText: { type: String, default: 'Start Building' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Stats Component Schema
const StatsComponentSchema = new mongoose.Schema({
  title: { type: String, default: 'Trusted by developers worldwide' },
  stats: [{
    label: { type: String, required: true },
    value: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pricing Component Schema
const PricingComponentSchema = new mongoose.Schema({
  title: { type: String, default: 'Simple, transparent pricing' },
  subtitle: { type: String, default: 'Choose the plan that works for you' },
  plans: [{
    name: { type: String, required: true },
    price: { type: String, required: true },
    period: { type: String, default: 'month' },
    features: [{ type: String }],
    popular: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Features Component Schema
const FeaturesComponentSchema = new mongoose.Schema({
  title: { type: String, default: 'Everything you need' },
  subtitle: { type: String, default: 'Powerful features for modern development' },
  features: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Footer Component Schema
const FooterComponentSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Liquidata' },
  description: { type: String, default: 'Building the future of technology' },
  links: [{
    title: { type: String, required: true },
    items: [{
      label: { type: String, required: true },
      href: { type: String, required: true }
    }]
  }],
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = {
  HeroComponent: mongoose.model('HeroComponent', HeroComponentSchema),
  CTAComponent: mongoose.model('CTAComponent', CTAComponentSchema),
  StatsComponent: mongoose.model('StatsComponent', StatsComponentSchema),
  PricingComponent: mongoose.model('PricingComponent', PricingComponentSchema),
  FeaturesComponent: mongoose.model('FeaturesComponent', FeaturesComponentSchema),
  FooterComponent: mongoose.model('FooterComponent', FooterComponentSchema)
};