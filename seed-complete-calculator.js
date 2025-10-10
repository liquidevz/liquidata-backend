const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://myliquidata:myliquidata@liquidata-backend.pje93kc.mongodb.net/?retryWrites=true&w=majority&appName=liquidata-backend');

// Admin User Schema
const adminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Calculator Schema with enhanced pricing structure
const calculatorSchema = new mongoose.Schema({
  title: { type: String, default: 'DevFlow Project Calculator' },
  description: { type: String, default: 'Get accurate estimates for your software & hardware development project' },
  currency: { type: String, default: 'INR' },
  basePrice: { type: Number, default: 50000 },
  steps: [{
    id: String,
    title: String,
    subtitle: String,
    type: { type: String, enum: ['single-select', 'multi-select', 'contact', 'estimate'] },
    required: { type: Boolean, default: true },
    condition: String,
    order: { type: Number, default: 0 },
    options: [{
      key: String,
      title: String,
      description: String,
      icon: String,
      multiplier: { type: Number, default: 1 },
      addCost: { type: Number, default: 0 },
      isPopular: { type: Boolean, default: false }
    }]
  }],
  pricingRules: {
    projectTypeMultipliers: { type: Map, of: Number },
    industryMultipliers: { type: Map, of: Number },
    scopeMultipliers: { type: Map, of: Number },
    teamMultipliers: { type: Map, of: Number },
    timelineMultipliers: { type: Map, of: Number },
    featureCosts: { type: Map, of: Number },
    serviceCosts: { type: Map, of: Number },
    platformCosts: { type: Map, of: Number },
    integrationCosts: { type: Map, of: Number },
    techStackCosts: { type: Map, of: Number },
    supportCosts: { type: Map, of: Number }
  },
  pricingConfig: {
    minPrice: { type: Number, default: 25000 },
    maxPrice: { type: Number, default: 5000000 },
    estimateVariance: { type: Number, default: 0.2 },
    gstRate: { type: Number, default: 0.18 },
    discountRules: [{
      condition: String,
      discountPercent: Number,
      description: String
    }]
  },
  isActive: { type: Boolean, default: true },
  version: { type: String, default: '1.0' }
}, { timestamps: true });

const AdminUser = mongoose.model('AdminUser', adminUserSchema);
const Calculator = mongoose.model('Calculator', calculatorSchema);

async function seedCompleteCalculator() {
  try {
    // Clear existing data
    await Calculator.deleteMany({});
    
    // Check if admin exists, if not create one
    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await AdminUser.create({
        username: 'admin',
        email: 'admin@devflow.com',
        password: hashedPassword,
        role: 'super_admin'
      });
      console.log('✅ Created default admin user');
    }

    // Create comprehensive calculator with all 30+ steps
    const calculator = await Calculator.create({
      title: 'DevFlow Project Calculator',
      description: 'Get accurate estimates for your software & hardware development project in Indian Rupees',
      currency: 'INR',
      basePrice: 75000,
      steps: [
        // STEP 1: Project Type (Always shown)
        {
          id: 'project-type',
          title: 'What type of project do you need?',
          subtitle: 'Select the primary type of development work',
          type: 'single-select',
          required: true,
          order: 1,
          options: [
            { key: 'website', title: 'Website', description: 'Marketing site, portfolio, blog', icon: 'Monitor', multiplier: 0.4, isPopular: false },
            { key: 'web-app', title: 'Web Application', description: 'SaaS, dashboard, web platform', icon: 'AppWindow', multiplier: 1.0, isPopular: true },
            { key: 'mobile-app', title: 'Mobile Application', description: 'iOS, Android, cross-platform', icon: 'Smartphone', multiplier: 1.3, isPopular: true },
            { key: 'desktop-app', title: 'Desktop Application', description: 'Windows, macOS, Linux', icon: 'Monitor', multiplier: 1.1, isPopular: false },
            { key: 'api-backend', title: 'API & Backend', description: 'REST API, microservices', icon: 'Server', multiplier: 0.8, isPopular: false },
            { key: 'hardware', title: 'Hardware Development', description: 'IoT devices, embedded systems', icon: 'Cpu', multiplier: 1.8, isPopular: false }
          ]
        },

        // STEP 2: Industries (Always shown)
        {
          id: 'industries',
          title: 'Which industries does this serve?',
          subtitle: 'Select all relevant industries (affects complexity)',
          type: 'multi-select',
          required: true,
          order: 2,
          options: [
            { key: 'SaaS', title: 'SaaS', icon: 'Layers', multiplier: 1.1 },
            { key: 'Healthcare', title: 'Healthcare', icon: 'Heart', multiplier: 1.4 },
            { key: 'Finance', title: 'Finance & Banking', icon: 'Building2', multiplier: 1.5 },
            { key: 'Education', title: 'Education', icon: 'Sparkles', multiplier: 1.0 },
            { key: 'E-commerce', title: 'E-commerce', icon: 'Globe', multiplier: 1.2 },
            { key: 'Manufacturing', title: 'Manufacturing', icon: 'Settings', multiplier: 1.2 },
            { key: 'Real Estate', title: 'Real Estate', icon: 'Building2', multiplier: 1.1 },
            { key: 'Government', title: 'Government', icon: 'Shield', multiplier: 1.3 },
            { key: 'Startup', title: 'Startup', icon: 'Sparkles', multiplier: 0.9 },
            { key: 'Enterprise', title: 'Enterprise', icon: 'Building2', multiplier: 1.3 },
            { key: 'Insurance', title: 'Insurance', icon: 'Shield', multiplier: 1.3 },
            { key: 'Transportation', title: 'Transportation & Logistics', icon: 'Layers', multiplier: 1.2 },
            { key: 'IoT', title: 'IoT & Smart Devices', icon: 'Blocks', multiplier: 1.4 }
          ]
        },

        // STEP 3: Services (Always shown)
        {
          id: 'services',
          title: 'What services do you need?',
          subtitle: 'Select all required services',
          type: 'multi-select',
          required: true,
          order: 3,
          options: [
            { key: 'web-development', title: 'Web Development', description: 'Custom websites & web apps', icon: 'Globe', addCost: 0, isPopular: true },
            { key: 'mobile-development', title: 'Mobile Development', description: 'iOS & Android apps', icon: 'Smartphone', addCost: 30000, isPopular: true },
            { key: 'ui-ux-design', title: 'UI/UX Design', description: 'User interface & experience', icon: 'Palette', addCost: 25000, isPopular: true },
            { key: 'backend-development', title: 'Backend Development', description: 'APIs & server architecture', icon: 'Server', addCost: 35000, isPopular: false },
            { key: 'devops', title: 'DevOps & Infrastructure', description: 'Deployment & scaling', icon: 'Cloud', addCost: 25000, isPopular: false },
            { key: 'hardware-design', title: 'Hardware Design', description: 'PCB design, embedded systems', icon: 'Cpu', addCost: 75000, isPopular: false },
            { key: 'consulting', title: 'Technical Consulting', description: 'Architecture & strategy', icon: 'Sparkles', addCost: 15000, isPopular: false }
          ]
        },

        // STEP 4: Additional Services (Conditional - for non-website projects)
        {
          id: 'additional-services',
          title: 'Any additional services?',
          subtitle: 'Optional services to enhance your project',
          type: 'multi-select',
          required: false,
          order: 4,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'branding', title: 'Branding & Logo', icon: 'Palette', addCost: 20000 },
            { key: 'content-creation', title: 'Content Creation', icon: 'Users', addCost: 15000 },
            { key: 'seo', title: 'SEO Optimization', icon: 'Search', addCost: 18000 },
            { key: 'analytics-setup', title: 'Analytics Setup', icon: 'Sparkles', addCost: 10000 },
            { key: 'maintenance', title: 'Ongoing Maintenance', icon: 'Settings', addCost: 25000 },
            { key: 'training', title: 'Team Training', icon: 'Users', addCost: 20000 },
            { key: 'documentation', title: 'Technical Docs', icon: 'Layers', addCost: 15000 },
            { key: 'testing', title: 'QA Testing', icon: 'Shield', addCost: 30000 }
          ]
        },

        // STEP 5: Project Scope (Always shown)
        {
          id: 'scope',
          title: 'What is the project scope?',
          subtitle: 'Choose the complexity level',
          type: 'single-select',
          required: true,
          order: 5,
          options: [
            { key: 'mvp', title: 'MVP (Minimum Viable Product)', description: 'Basic functionality to validate concept', icon: 'Sparkles', multiplier: 0.6, isPopular: true },
            { key: 'standard', title: 'Standard', description: 'Full-featured application', icon: 'Layers', multiplier: 1.0, isPopular: true },
            { key: 'enterprise', title: 'Enterprise', description: 'Complex, scalable solution', icon: 'Timer', multiplier: 2.0, isPopular: false }
          ]
        },

        // STEP 6: Team Size (Conditional - for non-website projects)
        {
          id: 'team',
          title: 'What team size do you prefer?',
          subtitle: 'Choose based on timeline and budget',
          type: 'single-select',
          required: true,
          order: 6,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'solo', title: 'Solo Developer', description: '1 developer - Cost effective', multiplier: 0.7 },
            { key: 'small', title: 'Small Team', description: '2-4 specialists - Balanced approach', multiplier: 1.0, isPopular: true },
            { key: 'medium', title: 'Medium Team', description: '5-8 specialists - Faster delivery', multiplier: 1.3 },
            { key: 'large', title: 'Large Team', description: '9+ specialists - Enterprise scale', multiplier: 1.6 }
          ]
        },

        // STEP 7: Timeline (Always shown)
        {
          id: 'timeline',
          title: 'What is your timeline?',
          subtitle: 'Choose your preferred delivery timeline',
          type: 'single-select',
          required: true,
          order: 7,
          options: [
            { key: 'rush', title: 'Rush (1-3 months)', description: 'Urgent delivery - Premium pricing', multiplier: 1.6 },
            { key: 'standard', title: 'Standard (3-6 months)', description: 'Balanced timeline', multiplier: 1.0, isPopular: true },
            { key: 'extended', title: 'Extended (6-12 months)', description: 'Comprehensive development', multiplier: 0.85 },
            { key: 'ongoing', title: 'Ongoing (12+ months)', description: 'Phased development approach', multiplier: 0.8 }
          ]
        },

        // STEP 8: Tech Stack (Conditional - for non-website projects)
        {
          id: 'tech-stack',
          title: 'What technology stack?',
          subtitle: 'Select your preferred technologies',
          type: 'multi-select',
          required: false,
          order: 8,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'react-nextjs', title: 'React + Next.js', description: 'Modern React framework', icon: 'Code', addCost: 0 },
            { key: 'vue-nuxt', title: 'Vue + Nuxt', description: 'Progressive framework', icon: 'Code', addCost: 5000 },
            { key: 'angular', title: 'Angular', description: 'Enterprise framework', icon: 'Code', addCost: 8000 },
            { key: 'nodejs', title: 'Node.js', description: 'JavaScript runtime', icon: 'Server', addCost: 0 },
            { key: 'python-django', title: 'Python + Django', description: 'Rapid development', icon: 'Server', addCost: 5000 },
            { key: 'php-laravel', title: 'PHP + Laravel', description: 'Web artisan', icon: 'Server', addCost: 3000 },
            { key: 'ruby-rails', title: 'Ruby on Rails', description: 'Convention over config', icon: 'Server', addCost: 7000 },
            { key: 'dotnet', title: '.NET Core', description: 'Microsoft framework', icon: 'Server', addCost: 10000 },
            { key: 'flutter', title: 'Flutter', description: 'Cross-platform mobile', icon: 'Smartphone', addCost: 5000 },
            { key: 'react-native', title: 'React Native', description: 'JS mobile framework', icon: 'Smartphone', addCost: 8000 }
          ]
        },

        // STEP 9: Platforms (Conditional - for non-website projects)
        {
          id: 'platforms',
          title: 'Which platforms do you need to support?',
          subtitle: 'Select target platforms',
          type: 'multi-select',
          required: true,
          order: 9,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'web', title: 'Web Browser', description: 'Chrome, Safari, Firefox', icon: 'Globe', addCost: 0 },
            { key: 'ios', title: 'iOS', description: 'iPhone, iPad', icon: 'Smartphone', addCost: 40000 },
            { key: 'android', title: 'Android', description: 'Android phones, tablets', icon: 'Smartphone', addCost: 35000 },
            { key: 'windows', title: 'Windows', description: 'Windows 10/11', icon: 'Monitor', addCost: 30000 },
            { key: 'macos', title: 'macOS', description: 'Mac computers', icon: 'Monitor', addCost: 30000 },
            { key: 'linux', title: 'Linux', description: 'Ubuntu, CentOS', icon: 'Monitor', addCost: 25000 }
          ]
        },

        // STEP 10: Core Features (Conditional - for non-website projects)
        {
          id: 'features',
          title: 'What core features do you need?',
          subtitle: 'Select all required features',
          type: 'multi-select',
          required: true,
          order: 10,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'User management', title: 'User Management', icon: 'Users', addCost: 25000 },
            { key: 'Authentication', title: 'Authentication & Security', icon: 'Lock', addCost: 15000 },
            { key: 'Payment processing', title: 'Payment Processing', icon: 'Building2', addCost: 35000 },
            { key: 'E-commerce', title: 'E-commerce Features', icon: 'Globe', addCost: 60000 },
            { key: 'Content management', title: 'Content Management', icon: 'Layers', addCost: 30000 },
            { key: 'Real-time chat', title: 'Real-time Chat', icon: 'Users', addCost: 45000 },
            { key: 'File upload/storage', title: 'File Upload/Storage', icon: 'Database', addCost: 20000 },
            { key: 'Search functionality', title: 'Search Functionality', icon: 'Search', addCost: 25000 },
            { key: 'Analytics & reporting', title: 'Analytics & Reporting', icon: 'Sparkles', addCost: 35000 },
            { key: 'API integrations', title: 'Third-party Integrations', icon: 'Blocks', addCost: 20000 },
            { key: 'Notifications', title: 'Push Notifications', icon: 'Zap', addCost: 15000 },
            { key: 'Multi-language', title: 'Multi-language Support', icon: 'Globe', addCost: 20000 },
            { key: 'Social login', title: 'Social Media Login', icon: 'Users', addCost: 12000 },
            { key: 'Data visualization', title: 'Data Visualization', icon: 'Sparkles', addCost: 30000 },
            { key: 'AI/ML features', title: 'AI/ML Features', icon: 'Sparkles', addCost: 75000 },
            { key: 'Workflow automation', title: 'Workflow Automation', icon: 'Settings', addCost: 50000 }
          ]
        },

        // STEP 11: Authentication Methods (Conditional - for non-website projects)
        {
          id: 'auth',
          title: 'What authentication methods?',
          subtitle: 'How should users authenticate',
          type: 'multi-select',
          required: false,
          order: 11,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'email-password', title: 'Email & Password', description: 'Standard login', icon: 'Lock', addCost: 5000 },
            { key: 'social-login', title: 'Social Login', description: 'Google, Facebook, etc.', icon: 'Users', addCost: 12000 },
            { key: 'sso', title: 'Single Sign-On (SSO)', description: 'SAML, OAuth', icon: 'Shield', addCost: 25000 },
            { key: '2fa', title: 'Two-Factor Auth', description: '2FA security', icon: 'Shield', addCost: 15000 },
            { key: 'biometric', title: 'Biometric Auth', description: 'Fingerprint, Face ID', icon: 'Smartphone', addCost: 20000 }
          ]
        },

        // STEP 12: Database (Conditional - for non-website projects)
        {
          id: 'database',
          title: 'What database do you need?',
          subtitle: 'Select database technologies',
          type: 'multi-select',
          required: false,
          order: 12,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'postgresql', title: 'PostgreSQL', description: 'Relational database', icon: 'Database', addCost: 0 },
            { key: 'mysql', title: 'MySQL', description: 'Popular SQL database', icon: 'Database', addCost: 0 },
            { key: 'mongodb', title: 'MongoDB', description: 'NoSQL document DB', icon: 'Database', addCost: 0 },
            { key: 'firebase', title: 'Firebase', description: 'Google platform', icon: 'Database', addCost: 8000 },
            { key: 'supabase', title: 'Supabase', description: 'Open source alternative', icon: 'Database', addCost: 6000 },
            { key: 'redis', title: 'Redis', description: 'In-memory cache', icon: 'Database', addCost: 8000 },
            { key: 'elasticsearch', title: 'Elasticsearch', description: 'Search engine', icon: 'Search', addCost: 18000 }
          ]
        },

        // STEP 13: Design Requirements (Conditional - for non-website projects)
        {
          id: 'design-requirements',
          title: 'What level of design?',
          subtitle: 'Choose your design complexity',
          type: 'single-select',
          required: false,
          order: 13,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'basic', title: 'Basic Design', description: 'Simple & functional', icon: 'Layout', multiplier: 0.8 },
            { key: 'custom', title: 'Custom Design', description: 'Unique brand identity', icon: 'Palette', multiplier: 1.2, isPopular: true },
            { key: 'premium', title: 'Premium Design', description: 'High-end design system', icon: 'Star', multiplier: 1.5 }
          ]
        },

        // STEP 14: UX Flow (Conditional - for web-app or mobile-app)
        {
          id: 'ux-flow',
          title: 'User experience flow complexity?',
          subtitle: 'How complex are the user journeys',
          type: 'single-select',
          required: false,
          order: 14,
          condition: JSON.stringify({ type: 'includes', field: 'projectType', value: 'app' }),
          options: [
            { key: 'simple', title: 'Simple Flow', description: 'Few screens, linear path', icon: 'Layers', multiplier: 0.9 },
            { key: 'moderate', title: 'Moderate Flow', description: 'Multiple user paths', icon: 'Layers', multiplier: 1.0, isPopular: true },
            { key: 'complex', title: 'Complex Flow', description: 'Multiple roles & workflows', icon: 'Layers', multiplier: 1.3 }
          ]
        },

        // STEP 15: Integrations (Conditional - for non-website projects)
        {
          id: 'integrations',
          title: 'Third-party integrations?',
          subtitle: 'Select required integrations',
          type: 'multi-select',
          required: false,
          order: 15,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'stripe', title: 'Stripe', description: 'Payment processing', icon: 'Building2', addCost: 20000 },
            { key: 'razorpay', title: 'Razorpay', description: 'Indian payment gateway', icon: 'Building2', addCost: 18000 },
            { key: 'paypal', title: 'PayPal', description: 'Payment gateway', icon: 'Building2', addCost: 20000 },
            { key: 'sendgrid', title: 'SendGrid', description: 'Email delivery', icon: 'LifeBuoy', addCost: 8000 },
            { key: 'twilio', title: 'Twilio', description: 'SMS & voice', icon: 'Smartphone', addCost: 12000 },
            { key: 'aws-s3', title: 'AWS S3', description: 'File storage', icon: 'Cloud', addCost: 10000 },
            { key: 'google-maps', title: 'Google Maps', description: 'Location services', icon: 'Globe', addCost: 12000 },
            { key: 'analytics', title: 'Google Analytics', description: 'Web analytics', icon: 'Sparkles', addCost: 5000 },
            { key: 'crm', title: 'CRM Integration', description: 'Salesforce, HubSpot', icon: 'Users', addCost: 25000 }
          ]
        },

        // STEP 16: Mobile-specific features (Conditional - for mobile-app)
        {
          id: 'mobile-features',
          title: 'Mobile-specific features?',
          subtitle: 'Select mobile capabilities',
          type: 'multi-select',
          required: false,
          order: 16,
          condition: JSON.stringify({ type: 'equals', field: 'projectType', value: 'mobile-app' }),
          options: [
            { key: 'push-notifications', title: 'Push Notifications', icon: 'Zap', addCost: 15000 },
            { key: 'offline-mode', title: 'Offline Mode', icon: 'Database', addCost: 25000 },
            { key: 'camera', title: 'Camera Integration', icon: 'Smartphone', addCost: 12000 },
            { key: 'geolocation', title: 'Geolocation', icon: 'Globe', addCost: 10000 },
            { key: 'biometric', title: 'Biometric Auth', icon: 'Shield', addCost: 15000 },
            { key: 'ar-features', title: 'AR Features', icon: 'Sparkles', addCost: 60000 },
            { key: 'background-sync', title: 'Background Sync', icon: 'Cloud', addCost: 18000 }
          ]
        },

        // STEP 17: App Store Requirements (Conditional - for mobile-app)
        {
          id: 'app-store',
          title: 'App store requirements?',
          subtitle: 'Deployment and distribution',
          type: 'multi-select',
          required: false,
          order: 17,
          condition: JSON.stringify({ type: 'equals', field: 'projectType', value: 'mobile-app' }),
          options: [
            { key: 'app-store-submission', title: 'App Store Submission', description: 'iOS App Store', icon: 'Smartphone', addCost: 15000 },
            { key: 'play-store-submission', title: 'Play Store Submission', description: 'Google Play', icon: 'Smartphone', addCost: 12000 },
            { key: 'app-store-optimization', title: 'ASO', description: 'App Store Optimization', icon: 'Search', addCost: 20000 }
          ]
        },

        // STEP 18: Web Technologies (Conditional - for web-app)
        {
          id: 'web-tech',
          title: 'Web technologies needed?',
          subtitle: 'Select web-specific features',
          type: 'multi-select',
          required: false,
          order: 18,
          condition: JSON.stringify({ type: 'equals', field: 'projectType', value: 'web-app' }),
          options: [
            { key: 'pwa', title: 'Progressive Web App', description: 'Offline-first PWA', icon: 'Globe', addCost: 25000 },
            { key: 'websockets', title: 'Real-time WebSockets', description: 'Live updates', icon: 'Zap', addCost: 20000 },
            { key: 'server-side-rendering', title: 'SSR', description: 'Server-side rendering', icon: 'Server', addCost: 15000 },
            { key: 'static-generation', title: 'Static Site Generation', description: 'Pre-rendered pages', icon: 'Layers', addCost: 12000 }
          ]
        },

        // STEP 19: Performance Requirements (Conditional - for web-app)
        {
          id: 'performance',
          title: 'Performance requirements?',
          subtitle: 'Select optimization needs',
          type: 'multi-select',
          required: false,
          order: 19,
          condition: JSON.stringify({ type: 'equals', field: 'projectType', value: 'web-app' }),
          options: [
            { key: 'caching', title: 'Advanced Caching', icon: 'Zap', addCost: 15000 },
            { key: 'cdn', title: 'CDN Setup', description: 'Content Delivery Network', icon: 'Cloud', addCost: 12000 },
            { key: 'load-balancing', title: 'Load Balancing', icon: 'Server', addCost: 25000 },
            { key: 'lazy-loading', title: 'Lazy Loading', icon: 'Layers', addCost: 8000 }
          ]
        },

        // STEP 20: SEO Requirements (Conditional - for web-app or website)
        {
          id: 'seo',
          title: 'SEO requirements?',
          subtitle: 'Search engine optimization',
          type: 'multi-select',
          required: false,
          order: 20,
          condition: JSON.stringify({ type: 'includes', field: 'projectType', value: 'web' }),
          options: [
            { key: 'basic-seo', title: 'Basic SEO', description: 'Meta tags, sitemap', icon: 'Search', addCost: 10000 },
            { key: 'advanced-seo', title: 'Advanced SEO', description: 'Schema markup, rich snippets', icon: 'Search', addCost: 25000 },
            { key: 'seo-audit', title: 'SEO Audit', description: 'Comprehensive analysis', icon: 'Search', addCost: 15000 }
          ]
        },

        // STEP 21: Payment Methods (Conditional - if E-commerce or Payment processing selected)
        {
          id: 'payment-methods',
          title: 'Payment methods to support?',
          subtitle: 'Select payment options',
          type: 'multi-select',
          required: false,
          order: 21,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'Payment processing' }),
          options: [
            { key: 'credit-cards', title: 'Credit/Debit Cards', icon: 'Building2', addCost: 15000 },
            { key: 'upi', title: 'UPI Payments', description: 'PhonePe, GPay', icon: 'Smartphone', addCost: 12000 },
            { key: 'netbanking', title: 'Net Banking', icon: 'Building2', addCost: 10000 },
            { key: 'wallets', title: 'Digital Wallets', description: 'Paytm, etc.', icon: 'Smartphone', addCost: 12000 },
            { key: 'emi', title: 'EMI Options', description: 'Installment payments', icon: 'Building2', addCost: 20000 }
          ]
        },

        // STEP 22: Inventory Management (Conditional - if E-commerce selected)
        {
          id: 'inventory',
          title: 'Inventory management?',
          subtitle: 'Stock management features',
          type: 'multi-select',
          required: false,
          order: 22,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'E-commerce' }),
          options: [
            { key: 'stock-tracking', title: 'Stock Tracking', icon: 'Database', addCost: 18000 },
            { key: 'multi-warehouse', title: 'Multi-warehouse', description: 'Multiple locations', icon: 'Building2', addCost: 30000 },
            { key: 'low-stock-alerts', title: 'Low Stock Alerts', icon: 'Bell', addCost: 10000 },
            { key: 'supplier-management', title: 'Supplier Management', icon: 'Users', addCost: 25000 }
          ]
        },

        // STEP 23: Shipping & Logistics (Conditional - if E-commerce selected)
        {
          id: 'shipping',
          title: 'Shipping & logistics?',
          subtitle: 'Delivery management',
          type: 'multi-select',
          required: false,
          order: 23,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'E-commerce' }),
          options: [
            { key: 'shipping-calculator', title: 'Shipping Calculator', icon: 'Globe', addCost: 15000 },
            { key: 'carrier-integration', title: 'Carrier Integration', description: 'Delhivery, BlueDart', icon: 'Building2', addCost: 25000 },
            { key: 'order-tracking', title: 'Order Tracking', icon: 'Search', addCost: 20000 },
            { key: 'returns-management', title: 'Returns Management', icon: 'Settings', addCost: 22000 }
          ]
        },

        // STEP 24: Tax & Compliance (Conditional - if E-commerce selected)
        {
          id: 'tax-compliance',
          title: 'Tax & compliance features?',
          subtitle: 'Legal and tax requirements',
          type: 'multi-select',
          required: false,
          order: 24,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'E-commerce' }),
          options: [
            { key: 'gst-calculation', title: 'GST Calculation', icon: 'Building2', addCost: 15000 },
            { key: 'invoice-generation', title: 'Invoice Generation', icon: 'Layers', addCost: 12000 },
            { key: 'tax-reports', title: 'Tax Reports', icon: 'Sparkles', addCost: 18000 }
          ]
        },

        // STEP 25: Compliance Requirements (Conditional - Finance/Healthcare/Insurance industries)
        {
          id: 'compliance',
          title: 'Compliance requirements?',
          subtitle: 'Regulatory compliance',
          type: 'multi-select',
          required: false,
          order: 25,
          condition: JSON.stringify({ type: 'includes_any', field: 'selectedIndustries', values: ['Finance', 'Healthcare', 'Insurance'] }),
          options: [
            { key: 'hipaa', title: 'HIPAA Compliance', description: 'Healthcare data', icon: 'Shield', addCost: 50000 },
            { key: 'pci-dss', title: 'PCI DSS', description: 'Payment card security', icon: 'Shield', addCost: 45000 },
            { key: 'gdpr', title: 'GDPR Compliance', description: 'EU data protection', icon: 'Shield', addCost: 40000 },
            { key: 'sox', title: 'SOX Compliance', description: 'Financial reporting', icon: 'Shield', addCost: 55000 }
          ]
        },

        // STEP 26: Security Standards (Conditional - Finance/Healthcare/Insurance industries)
        {
          id: 'security',
          title: 'Security standards?',
          subtitle: 'Enhanced security measures',
          type: 'multi-select',
          required: false,
          order: 26,
          condition: JSON.stringify({ type: 'includes_any', field: 'selectedIndustries', values: ['Finance', 'Healthcare', 'Insurance'] }),
          options: [
            { key: 'encryption', title: 'End-to-end Encryption', icon: 'Lock', addCost: 30000 },
            { key: 'penetration-testing', title: 'Penetration Testing', icon: 'Shield', addCost: 40000 },
            { key: 'security-audit', title: 'Security Audit', icon: 'Shield', addCost: 35000 },
            { key: 'ddos-protection', title: 'DDoS Protection', icon: 'Shield', addCost: 25000 }
          ]
        },

        // STEP 27: AI/ML Requirements (Conditional - if AI/ML features selected)
        {
          id: 'ai-ml',
          title: 'AI/ML requirements?',
          subtitle: 'Machine learning capabilities',
          type: 'multi-select',
          required: false,
          order: 27,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'AI/ML features' }),
          options: [
            { key: 'recommendation-engine', title: 'Recommendation Engine', icon: 'Sparkles', addCost: 60000 },
            { key: 'chatbot', title: 'AI Chatbot', icon: 'Users', addCost: 50000 },
            { key: 'image-recognition', title: 'Image Recognition', icon: 'Smartphone', addCost: 70000 },
            { key: 'natural-language', title: 'NLP', description: 'Natural Language Processing', icon: 'Sparkles', addCost: 65000 },
            { key: 'predictive-analytics', title: 'Predictive Analytics', icon: 'Sparkles', addCost: 75000 }
          ]
        },

        // STEP 28: Hosting & Infrastructure (Conditional - for non-website projects)
        {
          id: 'hosting',
          title: 'Hosting & infrastructure?',
          subtitle: 'Where will you host',
          type: 'single-select',
          required: false,
          order: 28,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'aws', title: 'AWS', description: 'Amazon Web Services', icon: 'Cloud', addCost: 15000 },
            { key: 'gcp', title: 'Google Cloud', description: 'GCP platform', icon: 'Cloud', addCost: 15000 },
            { key: 'azure', title: 'Microsoft Azure', description: 'Azure cloud', icon: 'Cloud', addCost: 15000 },
            { key: 'vercel', title: 'Vercel', description: 'Frontend deployment', icon: 'Cloud', addCost: 5000 },
            { key: 'digitalocean', title: 'DigitalOcean', description: 'Developer cloud', icon: 'Cloud', addCost: 8000 },
            { key: 'self-hosted', title: 'Self-hosted', description: 'Your own servers', icon: 'Server', addCost: 20000 }
          ]
        },

        // STEP 29: Scalability (Conditional - for enterprise scope or large team)
        {
          id: 'scalability',
          title: 'Scalability requirements?',
          subtitle: 'Future growth planning',
          type: 'multi-select',
          required: false,
          order: 29,
          condition: JSON.stringify({ type: 'equals', field: 'scope', value: 'enterprise' }),
          options: [
            { key: 'auto-scaling', title: 'Auto-scaling', description: 'Dynamic resource allocation', icon: 'Zap', addCost: 25000 },
            { key: 'microservices', title: 'Microservices Architecture', icon: 'Server', addCost: 40000 },
            { key: 'containerization', title: 'Docker/Kubernetes', description: 'Containerization', icon: 'Cloud', addCost: 35000 },
            { key: 'caching-layer', title: 'Distributed Caching', icon: 'Database', addCost: 20000 }
          ]
        },

        // STEP 30: DevOps & CI/CD (Conditional - for non-website projects)
        {
          id: 'devops',
          title: 'DevOps & CI/CD?',
          subtitle: 'Deployment automation',
          type: 'multi-select',
          required: false,
          order: 30,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'ci-cd-pipeline', title: 'CI/CD Pipeline', description: 'Automated deployment', icon: 'Zap', addCost: 25000 },
            { key: 'monitoring', title: 'Monitoring & Alerts', description: 'System monitoring', icon: 'Activity', addCost: 18000 },
            { key: 'logging', title: 'Centralized Logging', icon: 'Layers', addCost: 15000 },
            { key: 'backup-recovery', title: 'Backup & Recovery', icon: 'Database', addCost: 20000 }
          ]
        },

        // STEP 31: Quality Assurance (Conditional - for non-website projects)
        {
          id: 'qa',
          title: 'Quality assurance?',
          subtitle: 'Testing requirements',
          type: 'multi-select',
          required: false,
          order: 31,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'unit-testing', title: 'Unit Testing', icon: 'Shield', addCost: 15000 },
            { key: 'integration-testing', title: 'Integration Testing', icon: 'Shield', addCost: 20000 },
            { key: 'e2e-testing', title: 'End-to-End Testing', icon: 'Shield', addCost: 25000 },
            { key: 'performance-testing', title: 'Performance Testing', icon: 'Zap', addCost: 22000 },
            { key: 'security-testing', title: 'Security Testing', icon: 'Lock', addCost: 30000 }
          ]
        },

        // STEP 32: Support & Maintenance (Always shown)
        {
          id: 'support',
          title: 'What level of support do you need?',
          subtitle: 'Post-launch support and maintenance',
          type: 'single-select',
          required: true,
          order: 32,
          options: [
            { key: 'none', title: 'No Support', description: 'One-time delivery only', icon: 'Timer', addCost: 0 },
            { key: 'basic', title: 'Basic Support', description: '3 months bug fixes', icon: 'LifeBuoy', addCost: 15000 },
            { key: 'standard', title: 'Standard Support', description: '6 months support + updates', icon: 'LifeBuoy', addCost: 35000, isPopular: true },
            { key: 'premium', title: 'Premium Support', description: '12 months priority support', icon: 'LifeBuoy', addCost: 75000 },
            { key: 'enterprise', title: 'Enterprise Support', description: '24/7 dedicated support', icon: 'Shield', addCost: 150000 }
          ]
        },

        // STEP 33: Budget Range (Always shown)
        {
          id: 'budget',
          title: 'What is your budget range?',
          subtitle: 'Select your approximate budget',
          type: 'single-select',
          required: false,
          order: 33,
          options: [
            { key: '0-1l', title: 'Under ₹1L', description: 'Small projects', icon: 'DollarSign' },
            { key: '1l-2l', title: '₹1L - ₹2L', description: 'Basic apps', icon: 'DollarSign' },
            { key: '2l-4l', title: '₹2L - ₹4L', description: 'Standard projects', icon: 'DollarSign', isPopular: true },
            { key: '4l-8l', title: '₹4L - ₹8L', description: 'Complex apps', icon: 'DollarSign' },
            { key: '8l+', title: 'Above ₹8L', description: 'Enterprise', icon: 'DollarSign' }
          ]
        }
      ],

      // Enhanced Pricing Rules (All prices in INR)
      pricingRules: {
        projectTypeMultipliers: new Map([
          ['website', 0.4],
          ['web-app', 1.0],
          ['mobile-app', 1.3],
          ['desktop-app', 1.1],
          ['api-backend', 0.8],
          ['hardware', 1.8]
        ]),

        industryMultipliers: new Map([
          ['Healthcare', 1.4],
          ['Finance', 1.5],
          ['Government', 1.3],
          ['Insurance', 1.3],
          ['E-commerce', 1.2],
          ['Education', 1.0],
          ['SaaS', 1.1],
          ['Manufacturing', 1.2],
          ['Real Estate', 1.1],
          ['Startup', 0.9],
          ['Enterprise', 1.3],
          ['Transportation', 1.2],
          ['IoT', 1.4]
        ]),

        serviceCosts: new Map([
          ['web-development', 0],
          ['mobile-development', 30000],
          ['ui-ux-design', 25000],
          ['backend-development', 35000],
          ['devops', 25000],
          ['hardware-design', 75000],
          ['consulting', 15000]
        ]),

        platformCosts: new Map([
          ['web', 0],
          ['ios', 40000],
          ['android', 35000],
          ['windows', 30000],
          ['macos', 30000],
          ['linux', 25000]
        ]),

        featureCosts: new Map([
          ['User management', 25000],
          ['Authentication', 15000],
          ['Payment processing', 35000],
          ['E-commerce', 60000],
          ['Content management', 30000],
          ['Real-time chat', 45000],
          ['File upload/storage', 20000],
          ['Search functionality', 25000],
          ['Analytics & reporting', 35000],
          ['API integrations', 20000],
          ['Notifications', 15000],
          ['Multi-language', 20000],
          ['Social login', 12000],
          ['Data visualization', 30000],
          ['AI/ML features', 75000],
          ['Workflow automation', 50000]
        ]),

        integrationCosts: new Map([
          ['stripe', 20000],
          ['razorpay', 18000],
          ['paypal', 20000],
          ['sendgrid', 8000],
          ['twilio', 12000],
          ['aws-s3', 10000],
          ['google-maps', 12000],
          ['analytics', 5000],
          ['crm', 25000]
        ]),

        techStackCosts: new Map([
          ['react-nextjs', 0],
          ['vue-nuxt', 5000],
          ['angular', 8000],
          ['nodejs', 0],
          ['python-django', 5000],
          ['php-laravel', 3000],
          ['ruby-rails', 7000],
          ['dotnet', 10000],
          ['flutter', 5000],
          ['react-native', 8000]
        ]),

        scopeMultipliers: new Map([
          ['mvp', 0.6],
          ['standard', 1.0],
          ['enterprise', 2.0]
        ]),

        teamMultipliers: new Map([
          ['solo', 0.7],
          ['small', 1.0],
          ['medium', 1.3],
          ['large', 1.6]
        ]),

        timelineMultipliers: new Map([
          ['rush', 1.6],
          ['standard', 1.0],
          ['extended', 0.85],
          ['ongoing', 0.8]
        ]),

        supportCosts: new Map([
          ['none', 0],
          ['basic', 15000],
          ['standard', 35000],
          ['premium', 75000],
          ['enterprise', 150000]
        ])
      },

      pricingConfig: {
        minPrice: 25000,
        maxPrice: 5000000,
        estimateVariance: 0.25,
        gstRate: 0.18,
        discountRules: [
          {
            condition: JSON.stringify({ type: 'equals', field: 'scope', value: 'mvp' }),
            discountPercent: 10,
            description: 'MVP Discount - 10% off for startups'
          },
          {
            condition: JSON.stringify({ type: 'includes', field: 'selectedIndustries', value: 'Startup' }),
            discountPercent: 15,
            description: 'Startup Discount - 15% off'
          }
        ]
      },

      isActive: true,
      version: '3.0'
    });

    console.log('✅ Complete calculator seeded successfully!');
    console.log('📊 Calculator Details:');
    console.log(`   - Title: ${calculator.title}`);
    console.log(`   - Base Price: ₹${calculator.basePrice.toLocaleString('en-IN')}`);
    console.log(`   - Currency: ${calculator.currency}`);
    console.log(`   - Total Steps: ${calculator.steps.length}`);
    console.log(`   - Conditional Steps: ${calculator.steps.filter(s => s.condition).length}`);
    console.log(`   - Min Price: ₹${calculator.pricingConfig.minPrice.toLocaleString('en-IN')}`);
    console.log(`   - Max Price: ₹${calculator.pricingConfig.maxPrice.toLocaleString('en-IN')}`);
    console.log(`   - GST Rate: ${calculator.pricingConfig.gstRate * 100}%`);
    console.log('');
    console.log('🎯 Step Breakdown:');
    console.log(`   - Always shown: ${calculator.steps.filter(s => !s.condition).length} steps`);
    console.log(`   - Website flow: ~8 steps`);
    console.log(`   - Web app flow: ~20-25 steps`);
    console.log(`   - Mobile app flow: ~22-27 steps`);
    console.log(`   - Enterprise + E-commerce: ~30+ steps`);
    console.log('');
    console.log('🚀 Ready to use! All 30+ steps with conditional logic implemented');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding complete calculator:', error);
    process.exit(1);
  }
}

seedCompleteCalculator();
