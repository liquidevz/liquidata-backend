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
    featureCosts: { type: Map, of: Number },
    serviceCosts: { type: Map, of: Number },
    platformCosts: { type: Map, of: Number },
    integrationCosts: { type: Map, of: Number },
    techStackCosts: { type: Map, of: Number }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Calculator = mongoose.model('Calculator', calculatorSchema);

async function seedFullCalculator() {
  try {
    await Calculator.deleteMany({});
    
    const calculator = await Calculator.create({
      title: 'Smart Project Calculator',
      description: 'Get comprehensive estimates for your development project',
      basePrice: 50000,
      steps: [
        // Core Steps (Always present)
        {
          id: 'project-type',
          title: 'Project type',
          type: 'single-select',
          required: true,
          options: [
            { key: 'website', title: 'Website', description: 'Marketing site, portfolio, blog', icon: 'Monitor' },
            { key: 'web-app', title: 'Web Application', description: 'SaaS, dashboard, web platform', icon: 'AppWindow' },
            { key: 'mobile-app', title: 'Mobile Application', description: 'iOS, Android, cross-platform', icon: 'Smartphone' },
            { key: 'desktop-app', title: 'Desktop Application', description: 'Windows, macOS, Linux', icon: 'Monitor' },
            { key: 'api-backend', title: 'API & Backend', description: 'REST API, microservices', icon: 'Server' }
          ]
        },
        {
          id: 'industries',
          title: 'Industries',
          type: 'multi-select',
          required: true,
          options: [
            { key: 'SaaS', title: 'SaaS', icon: 'Layers' },
            { key: 'Healthcare', title: 'Healthcare', icon: 'Heart' },
            { key: 'Finance', title: 'Finance', icon: 'Building2' },
            { key: 'Education', title: 'Education', icon: 'Sparkles' },
            { key: 'E-commerce', title: 'E-commerce', icon: 'Globe' },
            { key: 'Transportation', title: 'Transportation', icon: 'Layers' },
            { key: 'IoT', title: 'IoT', icon: 'Blocks' },
            { key: 'Insurance', title: 'Insurance', icon: 'Shield' },
            { key: 'Real Estate', title: 'Real Estate', icon: 'Building2' },
            { key: 'Web3', title: 'Web3', icon: 'Blocks' },
            { key: 'Social Media', title: 'Social Media', icon: 'Users' },
            { key: 'Gaming', title: 'Gaming', icon: 'Sparkles' },
            { key: 'Government', title: 'Government', icon: 'Shield' }
          ]
        },
        {
          id: 'services',
          title: 'Type of service',
          type: 'multi-select',
          required: true,
          options: [
            { key: 'web-development', title: 'Web Development', description: 'Custom websites & web apps', icon: 'Globe' },
            { key: 'mobile-development', title: 'Mobile Development', description: 'iOS & Android apps', icon: 'Smartphone' },
            { key: 'ui-ux-design', title: 'UI/UX Design', description: 'User interface & experience', icon: 'Palette' },
            { key: 'backend-development', title: 'Backend Development', description: 'APIs & server architecture', icon: 'Server' },
            { key: 'devops', title: 'DevOps & Infrastructure', description: 'Deployment & scaling', icon: 'Cloud' },
            { key: 'consulting', title: 'Technical Consulting', description: 'Architecture & strategy', icon: 'Sparkles' }
          ]
        },
        
        // Complex Application Flow (14-20+ steps)
        {
          id: 'additional-services',
          title: 'Additional services',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'branding', title: 'Branding & Logo Design', icon: 'Palette', addCost: 15000 },
            { key: 'content-creation', title: 'Content Creation', icon: 'Users', addCost: 10000 },
            { key: 'seo', title: 'SEO Optimization', icon: 'Search', addCost: 12000 },
            { key: 'analytics', title: 'Analytics Setup', icon: 'Sparkles', addCost: 8000 },
            { key: 'maintenance', title: 'Ongoing Maintenance', icon: 'Settings', addCost: 20000 },
            { key: 'training', title: 'Team Training', icon: 'Users', addCost: 15000 },
            { key: 'documentation', title: 'Technical Documentation', icon: 'Layers', addCost: 10000 },
            { key: 'testing', title: 'Quality Assurance Testing', icon: 'Shield', addCost: 25000 }
          ]
        },
        {
          id: 'scope',
          title: 'Project scope',
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
          title: 'Team size',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'solo', title: 'Solo Developer', description: '1 developer' },
            { key: 'small', title: 'Small Team', description: '2-4 specialists' },
            { key: 'medium', title: 'Medium Team', description: '5-8 specialists' },
            { key: 'large', title: 'Large Team', description: '9+ specialists' }
          ]
        },
        {
          id: 'timeline',
          title: 'Timeline',
          type: 'single-select',
          required: true,
          options: [
            { key: 'rush', title: 'Rush (1-2 months)', description: 'Urgent delivery' },
            { key: 'standard', title: 'Standard (3-6 months)', description: 'Balanced approach' },
            { key: 'extended', title: 'Extended (6-12 months)', description: 'Comprehensive development' },
            { key: 'ongoing', title: 'Ongoing (12+ months)', description: 'Phased development' }
          ]
        },
        
        // Technical Requirements
        {
          id: 'tech-stack',
          title: 'Tech Stack',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'react-nextjs', title: 'React + Next.js', description: 'Modern React framework', icon: 'Code' },
            { key: 'vue-nuxt', title: 'Vue + Nuxt', description: 'Progressive framework', icon: 'Code' },
            { key: 'angular', title: 'Angular', description: 'Enterprise framework', icon: 'Code' },
            { key: 'nodejs', title: 'Node.js', description: 'JavaScript runtime', icon: 'Server' },
            { key: 'python-django', title: 'Python + Django', description: 'Rapid development', icon: 'Server' },
            { key: 'php-laravel', title: 'PHP + Laravel', description: 'Web artisan framework', icon: 'Server' },
            { key: 'ruby-rails', title: 'Ruby on Rails', description: 'Convention over configuration', icon: 'Server' },
            { key: 'dotnet', title: '.NET Core', description: 'Microsoft framework', icon: 'Server' }
          ]
        },
        {
          id: 'platforms',
          title: 'Platform targets',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'web', title: 'Web Browser', description: 'Chrome, Safari, Firefox', icon: 'Globe' },
            { key: 'ios', title: 'iOS', description: 'iPhone, iPad', icon: 'Smartphone' },
            { key: 'android', title: 'Android', description: 'Android phones, tablets', icon: 'Smartphone' },
            { key: 'windows', title: 'Windows', description: 'Windows 10/11', icon: 'Monitor' },
            { key: 'macos', title: 'macOS', description: 'Mac computers', icon: 'Monitor' },
            { key: 'linux', title: 'Linux', description: 'Ubuntu, CentOS', icon: 'Monitor' }
          ]
        },
        {
          id: 'features',
          title: 'Core features',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'User management', title: 'User Management', icon: 'Users', addCost: 15000 },
            { key: 'Authentication', title: 'Authentication', icon: 'Lock', addCost: 10000 },
            { key: 'Payment processing', title: 'Payment Processing', icon: 'Building2', addCost: 25000 },
            { key: 'E-commerce', title: 'E-commerce', icon: 'Globe', addCost: 40000 },
            { key: 'Content management', title: 'Content Management', icon: 'Layers', addCost: 20000 },
            { key: 'Real-time chat', title: 'Real-time Chat', icon: 'Users', addCost: 30000 },
            { key: 'File upload/storage', title: 'File Upload/Storage', icon: 'Database', addCost: 15000 },
            { key: 'Search functionality', title: 'Search Functionality', icon: 'Search', addCost: 20000 },
            { key: 'Analytics & reporting', title: 'Analytics & Reporting', icon: 'Sparkles', addCost: 25000 },
            { key: 'API integrations', title: 'API Integrations', icon: 'Blocks', addCost: 15000 },
            { key: 'Notifications', title: 'Notifications', icon: 'Zap', addCost: 10000 },
            { key: 'Multi-language', title: 'Multi-language', icon: 'Globe', addCost: 15000 },
            { key: 'Social login', title: 'Social Login', icon: 'Users', addCost: 8000 },
            { key: 'Data visualization', title: 'Data Visualization', icon: 'Sparkles', addCost: 30000 },
            { key: 'AI/ML features', title: 'AI/ML Features', icon: 'Sparkles', addCost: 50000 },
            { key: 'Workflow automation', title: 'Workflow Automation', icon: 'Settings', addCost: 35000 }
          ]
        },
        {
          id: 'auth',
          title: 'User authentication',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'Authentication' }),
          options: [
            { key: 'email-password', title: 'Email & Password', icon: 'Lock' },
            { key: 'social-login', title: 'Social Login', description: 'Google, Facebook, etc.', icon: 'Users' },
            { key: 'sso', title: 'Single Sign-On (SSO)', description: 'SAML, OAuth', icon: 'Shield' },
            { key: '2fa', title: 'Two-Factor Authentication', icon: 'Shield' },
            { key: 'biometric', title: 'Biometric Auth', description: 'Fingerprint, Face ID', icon: 'Smartphone' }
          ]
        },
        {
          id: 'database',
          title: 'Database requirements',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'postgresql', title: 'PostgreSQL', description: 'Relational database', icon: 'Database' },
            { key: 'mysql', title: 'MySQL', description: 'Popular SQL database', icon: 'Database' },
            { key: 'mongodb', title: 'MongoDB', description: 'NoSQL document database', icon: 'Database' },
            { key: 'firebase', title: 'Firebase', description: 'Google platform', icon: 'Database' },
            { key: 'supabase', title: 'Supabase', description: 'Open source alternative', icon: 'Database' },
            { key: 'redis', title: 'Redis', description: 'In-memory cache', icon: 'Database' }
          ]
        },
        
        // Design & UX
        {
          id: 'design-requirements',
          title: 'Design Requirements',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'includes', field: 'selectedServices', value: 'ui-ux-design' }),
          options: [
            { key: 'custom', title: 'Custom Design System', description: 'Built from scratch', icon: 'Palette' },
            { key: 'material', title: 'Material Design', description: 'Google design system', icon: 'Palette' },
            { key: 'bootstrap', title: 'Bootstrap', description: 'Popular CSS framework', icon: 'Palette' },
            { key: 'tailwind', title: 'Tailwind CSS', description: 'Utility-first CSS', icon: 'Palette' },
            { key: 'ant-design', title: 'Ant Design', description: 'Enterprise design language', icon: 'Palette' }
          ]
        },
        
        // Integrations & Advanced features
        {
          id: 'integrations',
          title: 'Integrations',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'stripe', title: 'Stripe', description: 'Payment processing', icon: 'Building2', addCost: 8000 },
            { key: 'paypal', title: 'PayPal', description: 'Payment gateway', icon: 'Building2', addCost: 6000 },
            { key: 'sendgrid', title: 'SendGrid', description: 'Email delivery', icon: 'LifeBuoy', addCost: 5000 },
            { key: 'twilio', title: 'Twilio', description: 'SMS & voice', icon: 'Smartphone', addCost: 10000 },
            { key: 'aws-s3', title: 'AWS S3', description: 'File storage', icon: 'Cloud', addCost: 7000 },
            { key: 'google-maps', title: 'Google Maps', description: 'Location services', icon: 'Globe', addCost: 12000 },
            { key: 'analytics', title: 'Google Analytics', description: 'Web analytics', icon: 'Sparkles', addCost: 4000 },
            { key: 'crm', title: 'CRM Integration', description: 'Salesforce, HubSpot', icon: 'Users', addCost: 15000 }
          ]
        },
        
        // Infrastructure & Deployment
        {
          id: 'hosting',
          title: 'Hosting & infrastructure',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'aws', title: 'Amazon Web Services', description: 'Enterprise cloud', icon: 'Cloud' },
            { key: 'vercel', title: 'Vercel', description: 'Frontend deployment', icon: 'Cloud' },
            { key: 'netlify', title: 'Netlify', description: 'JAMstack hosting', icon: 'Cloud' },
            { key: 'heroku', title: 'Heroku', description: 'Simple deployment', icon: 'Cloud' },
            { key: 'digital-ocean', title: 'DigitalOcean', description: 'Developer cloud', icon: 'Cloud' },
            { key: 'google-cloud', title: 'Google Cloud', description: 'Google cloud platform', icon: 'Cloud' }
          ]
        },
        {
          id: 'scalability',
          title: 'Scalability requirements',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'equals', field: 'scope', value: 'enterprise' }),
          options: [
            { key: 'low', title: 'Low Scale', description: '< 1K users', icon: 'Users' },
            { key: 'medium', title: 'Medium Scale', description: '1K - 100K users', icon: 'Users' },
            { key: 'high', title: 'High Scale', description: '100K+ users', icon: 'Users' },
            { key: 'enterprise', title: 'Enterprise Scale', description: 'Millions of users', icon: 'Users' }
          ]
        },
        
        // Final project management steps
        {
          id: 'qa',
          title: 'Quality assurance',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'basic', title: 'Basic Testing', description: 'Manual testing', icon: 'Shield' },
            { key: 'automated', title: 'Automated Testing', description: 'Unit & integration tests', icon: 'Shield' },
            { key: 'comprehensive', title: 'Comprehensive QA', description: 'Full test suite', icon: 'Shield' }
          ]
        },
        {
          id: 'support',
          title: 'Support & Maintenance',
          type: 'single-select',
          required: true,
          options: [
            { key: 'none', title: 'No Support', description: 'One-time delivery', icon: 'Timer' },
            { key: 'basic', title: 'Basic Support', description: '3 months bug fixes', icon: 'LifeBuoy' },
            { key: 'standard', title: 'Standard Support', description: '6 months + updates', icon: 'LifeBuoy' },
            { key: 'premium', title: 'Premium Support', description: '12 months + priority', icon: 'LifeBuoy' },
            { key: 'enterprise', title: 'Enterprise Support', description: '24/7 dedicated support', icon: 'Shield' }
          ]
        },
        {
          id: 'budget',
          title: 'Budget Range',
          type: 'single-select',
          required: true,
          options: [
            { key: 'startup', title: '$5K - $25K', description: 'Startup budget', icon: 'Building2' },
            { key: 'small', title: '$25K - $75K', description: 'Small business', icon: 'Building2' },
            { key: 'medium', title: '$75K - $200K', description: 'Growing company', icon: 'Building2' },
            { key: 'large', title: '$200K - $500K', description: 'Enterprise project', icon: 'Building2' },
            { key: 'enterprise', title: '$500K+', description: 'Large enterprise', icon: 'Building2' }
          ]
        },
        {
          id: 'contact',
          title: 'Contact information',
          type: 'contact',
          required: true
        },
        {
          id: 'estimate',
          title: 'Receive estimate',
          type: 'estimate',
          required: false
        }
      ],
      pricingRules: {
        projectTypeMultipliers: new Map([
          ['website', 0.5],
          ['web-app', 1.0],
          ['mobile-app', 1.2],
          ['desktop-app', 1.1],
          ['api-backend', 0.8]
        ]),
        industryMultipliers: new Map([
          ['Healthcare', 1.3],
          ['Finance', 1.4],
          ['Insurance', 1.3],
          ['Government', 1.2],
          ['E-commerce', 1.1],
          ['SaaS', 1.1],
          ['Education', 1.0],
          ['Web3', 1.3],
          ['Gaming', 1.2]
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
          ['extended', 0.9],
          ['ongoing', 0.8]
        ]),
        serviceCosts: new Map([
          ['web-development', 0],
          ['mobile-development', 20000],
          ['ui-ux-design', 15000],
          ['backend-development', 25000],
          ['devops', 18000],
          ['consulting', 12000]
        ]),
        platformCosts: new Map([
          ['web', 0],
          ['ios', 25000],
          ['android', 25000],
          ['windows', 20000],
          ['macos', 20000],
          ['linux', 15000]
        ])
      },
      isActive: true
    });

    console.log('✅ Full calculator seeded:', calculator.title);
    console.log('📊 Total steps:', calculator.steps.length);
    console.log('💰 Base price: ₹', calculator.basePrice);
    console.log('🔧 Conditional steps with complex pricing rules');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedFullCalculator();