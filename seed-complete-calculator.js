const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata');

const calculatorSchema = new mongoose.Schema({
  title: String,
  description: String,
  basePrice: Number,
  currency: String,
  steps: [{
    id: String,
    title: String,
    subtitle: String,
    type: { type: String, enum: ['single-select', 'multi-select', 'contact', 'estimate'] },
    required: { type: Boolean, default: true },
    condition: String,
    order: Number,
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
    minPrice: Number,
    maxPrice: Number,
    estimateVariance: Number,
    gstRate: Number
  },
  isActive: Boolean
}, { timestamps: true });

const Calculator = mongoose.model('Calculator', calculatorSchema);

async function seedCompleteCalculator() {
  try {
    await Calculator.deleteMany({});
    
    const calculator = await Calculator.create({
      title: 'Smart Project Calculator',
      description: 'Complete calculator with all conditional steps (26-30 total based on selections)',
      basePrice: 50000,
      currency: 'INR',
      steps: [
        // ========== CORE STEPS (Always present) ==========
        // Step 1
        {
          id: 'project-type',
          title: 'Project type',
          subtitle: 'Select your project category',
          type: 'single-select',
          required: true,
          order: 1,
          options: [
            { key: 'website', title: 'Website', description: 'Marketing site, portfolio, blog', icon: 'Monitor', multiplier: 0.5 },
            { key: 'web-app', title: 'Web Application', description: 'SaaS, dashboard, web platform', icon: 'AppWindow', multiplier: 1.0 },
            { key: 'mobile-app', title: 'Mobile Application', description: 'iOS, Android, cross-platform', icon: 'Smartphone', multiplier: 1.2 },
            { key: 'desktop-app', title: 'Desktop Application', description: 'Windows, macOS, Linux', icon: 'Monitor', multiplier: 1.1 },
            { key: 'api-backend', title: 'API & Backend', description: 'REST API, microservices', icon: 'Server', multiplier: 0.8 }
          ]
        },
        // Step 2
        {
          id: 'industries',
          title: 'Industries',
          subtitle: 'Select one or more industries',
          type: 'multi-select',
          required: true,
          order: 2,
          options: [
            { key: 'SaaS', title: 'SaaS', icon: 'Layers', multiplier: 1.1 },
            { key: 'Healthcare', title: 'Healthcare', icon: 'Heart', multiplier: 1.3 },
            { key: 'Finance', title: 'Finance', icon: 'Building2', multiplier: 1.4 },
            { key: 'Education', title: 'Education', icon: 'Sparkles', multiplier: 1.0 },
            { key: 'E-commerce', title: 'E-commerce', icon: 'Globe', multiplier: 1.1 },
            { key: 'Transportation', title: 'Transportation', icon: 'Layers', multiplier: 1.1 },
            { key: 'IoT', title: 'IoT', icon: 'Blocks', multiplier: 1.2 },
            { key: 'Insurance', title: 'Insurance', icon: 'Shield', multiplier: 1.3 },
            { key: 'Real Estate', title: 'Real Estate', icon: 'Building2', multiplier: 1.1 },
            { key: 'Web3', title: 'Web3', icon: 'Blocks', multiplier: 1.3 },
            { key: 'Social Media', title: 'Social Media', icon: 'Users', multiplier: 1.1 },
            { key: 'Gaming', title: 'Gaming', icon: 'Sparkles', multiplier: 1.2 },
            { key: 'Government', title: 'Government', icon: 'Shield', multiplier: 1.2 }
          ]
        },
        // Step 3
        {
          id: 'services',
          title: 'Type of service',
          subtitle: 'What services do you need?',
          type: 'multi-select',
          required: true,
          order: 3,
          options: [
            { key: 'web-development', title: 'Web Development', description: 'Custom websites & web apps', icon: 'Globe', addCost: 0 },
            { key: 'mobile-development', title: 'Mobile Development', description: 'iOS & Android apps', icon: 'Smartphone', addCost: 20000 },
            { key: 'ui-ux-design', title: 'UI/UX Design', description: 'User interface & experience', icon: 'Palette', addCost: 15000 },
            { key: 'backend-development', title: 'Backend Development', description: 'APIs & server architecture', icon: 'Server', addCost: 25000 },
            { key: 'devops', title: 'DevOps & Infrastructure', description: 'Deployment & scaling', icon: 'Cloud', addCost: 18000 },
            { key: 'consulting', title: 'Technical Consulting', description: 'Architecture & strategy', icon: 'Sparkles', addCost: 12000 }
          ]
        },
        
        // ========== CONDITIONAL: Additional Services (Not for simple websites) ==========
        // Step 4
        {
          id: 'additional-services',
          title: 'Additional services',
          subtitle: 'Extra services for your project',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 4,
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
        
        // Step 5
        {
          id: 'scope',
          title: 'Project scope',
          subtitle: 'Define your project complexity',
          type: 'single-select',
          required: true,
          order: 5,
          options: [
            { key: 'mvp', title: 'MVP', description: 'Minimum viable product', icon: 'Sparkles', multiplier: 0.7 },
            { key: 'standard', title: 'Standard', description: 'Full-featured application', icon: 'Layers', multiplier: 1.0 },
            { key: 'enterprise', title: 'Enterprise', description: 'Complex, scalable solution', icon: 'Timer', multiplier: 1.8 }
          ]
        },
        
        // ========== CONDITIONAL: Team Size (Not for simple websites) ==========
        // Step 6
        {
          id: 'team',
          title: 'Team size',
          subtitle: 'How large should the development team be?',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 6,
          options: [
            { key: 'solo', title: 'Solo Developer', description: '1 developer', multiplier: 0.8 },
            { key: 'small', title: 'Small Team', description: '2-4 specialists', multiplier: 1.0 },
            { key: 'medium', title: 'Medium Team', description: '5-8 specialists', multiplier: 1.2 },
            { key: 'large', title: 'Large Team', description: '9+ specialists', multiplier: 1.5 }
          ]
        },
        
        // Step 7
        {
          id: 'timeline',
          title: 'Timeline',
          subtitle: 'Project completion timeframe',
          type: 'single-select',
          required: true,
          order: 7,
          options: [
            { key: 'rush', title: 'Rush (1-2 months)', description: 'Urgent delivery', multiplier: 1.5 },
            { key: 'standard', title: 'Standard (3-6 months)', description: 'Balanced approach', multiplier: 1.0 },
            { key: 'extended', title: 'Extended (6-12 months)', description: 'Comprehensive development', multiplier: 0.9 },
            { key: 'ongoing', title: 'Ongoing (12+ months)', description: 'Phased development', multiplier: 0.8 }
          ]
        },
        
        // ========== CONDITIONAL: Tech Stack (Complex projects) ==========
        // Step 8
        {
          id: 'tech-stack',
          title: 'Tech Stack',
          subtitle: 'Choose your technology stack',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 8,
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
        
        // ========== CONDITIONAL: Platforms (Complex projects) ==========
        // Step 9
        {
          id: 'platforms',
          title: 'Platform targets',
          subtitle: 'Where will your application run?',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 9,
          options: [
            { key: 'web', title: 'Web Browser', description: 'Chrome, Safari, Firefox', icon: 'Globe', addCost: 0 },
            { key: 'ios', title: 'iOS', description: 'iPhone, iPad', icon: 'Smartphone', addCost: 25000 },
            { key: 'android', title: 'Android', description: 'Android phones, tablets', icon: 'Smartphone', addCost: 25000 },
            { key: 'windows', title: 'Windows', description: 'Windows 10/11', icon: 'Monitor', addCost: 20000 },
            { key: 'macos', title: 'macOS', description: 'Mac computers', icon: 'Monitor', addCost: 20000 },
            { key: 'linux', title: 'Linux', description: 'Ubuntu, CentOS', icon: 'Monitor', addCost: 15000 }
          ]
        },
        
        // ========== CONDITIONAL: Core Features (Complex projects) ==========
        // Step 10
        {
          id: 'features',
          title: 'Core features',
          subtitle: 'Essential functionality for your project',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 10,
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
        
        // ========== CONDITIONAL: Auth Methods (If Authentication selected) ==========
        // Step 11
        {
          id: 'auth',
          title: 'User authentication',
          subtitle: 'Authentication methods',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'Authentication' }),
          order: 11,
          options: [
            { key: 'email-password', title: 'Email & Password', icon: 'Lock', addCost: 5000 },
            { key: 'social-login', title: 'Social Login', description: 'Google, Facebook, etc.', icon: 'Users', addCost: 8000 },
            { key: 'sso', title: 'Single Sign-On (SSO)', description: 'SAML, OAuth', icon: 'Shield', addCost: 15000 },
            { key: '2fa', title: 'Two-Factor Authentication', icon: 'Shield', addCost: 10000 },
            { key: 'biometric', title: 'Biometric Auth', description: 'Fingerprint, Face ID', icon: 'Smartphone', addCost: 12000 }
          ]
        },
        
        // ========== CONDITIONAL: Database (Complex projects) ==========
        // Step 12
        {
          id: 'database',
          title: 'Database requirements',
          subtitle: 'Choose your data storage solution',
          type: 'multi-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 12,
          options: [
            { key: 'postgresql', title: 'PostgreSQL', description: 'Relational database', icon: 'Database', addCost: 8000 },
            { key: 'mysql', title: 'MySQL', description: 'Popular SQL database', icon: 'Database', addCost: 7000 },
            { key: 'mongodb', title: 'MongoDB', description: 'NoSQL document database', icon: 'Database', addCost: 8000 },
            { key: 'firebase', title: 'Firebase', description: 'Google platform', icon: 'Database', addCost: 10000 },
            { key: 'supabase', title: 'Supabase', description: 'Open source alternative', icon: 'Database', addCost: 9000 },
            { key: 'redis', title: 'Redis', description: 'In-memory cache', icon: 'Database', addCost: 6000 }
          ]
        },
        
        // ========== CONDITIONAL: Design Requirements (If UI/UX service selected) ==========
        // Step 13
        {
          id: 'design-requirements',
          title: 'Design Requirements',
          subtitle: 'Choose your design approach',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'includes', field: 'selectedServices', value: 'ui-ux-design' }),
          order: 13,
          options: [
            { key: 'custom', title: 'Custom Design System', description: 'Built from scratch', icon: 'Palette', addCost: 30000 },
            { key: 'material', title: 'Material Design', description: 'Google design system', icon: 'Palette', addCost: 10000 },
            { key: 'bootstrap', title: 'Bootstrap', description: 'Popular CSS framework', icon: 'Palette', addCost: 5000 },
            { key: 'tailwind', title: 'Tailwind CSS', description: 'Utility-first CSS', icon: 'Palette', addCost: 8000 },
            { key: 'ant-design', title: 'Ant Design', description: 'Enterprise design language', icon: 'Palette', addCost: 12000 }
          ]
        },
        
        // ========== CONDITIONAL: UX Flow (Complex projects) ==========
        // Step 14
        {
          id: 'ux-flow',
          title: 'User experience flow',
          subtitle: 'Define user journey complexity',
          type: 'single-select',
          required: false,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 14,
          options: [
            { key: 'simple', title: 'Simple Flow', description: 'Linear user journey', addCost: 0 },
            { key: 'moderate', title: 'Moderate Flow', description: 'Multiple paths', addCost: 15000 },
            { key: 'complex', title: 'Complex Flow', description: 'Advanced interactions', addCost: 30000 }
          ]
        },
        
        // ========== CONDITIONAL: Integrations (Complex projects) ==========
        // Step 15
        {
          id: 'integrations',
          title: 'Integrations',
          subtitle: 'Third-party service integrations',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 15,
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
        
        // ========== CONDITIONAL: Mobile-specific (Mobile apps only) ==========
        // Step 16
        {
          id: 'app-store',
          title: 'App store requirements',
          subtitle: 'App store submission and optimization',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'equals', field: 'projectType', value: 'mobile-app' }),
          order: 16,
          options: [
            { key: 'app-store-optimization', title: 'App Store Optimization', addCost: 8000 },
            { key: 'app-store-submission', title: 'App Store Submission', addCost: 5000 },
            { key: 'app-preview-videos', title: 'App Preview Videos', addCost: 10000 }
          ]
        },
        
        // Step 17
        {
          id: 'device-features',
          title: 'Device features',
          subtitle: 'Native device capabilities',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'equals', field: 'projectType', value: 'mobile-app' }),
          order: 17,
          options: [
            { key: 'camera', title: 'Camera Access', addCost: 5000 },
            { key: 'geolocation', title: 'Geolocation', addCost: 7000 },
            { key: 'push-notifications', title: 'Push Notifications', addCost: 10000 },
            { key: 'offline-mode', title: 'Offline Mode', addCost: 15000 },
            { key: 'biometric-auth', title: 'Biometric Auth', addCost: 8000 }
          ]
        },
        
        // ========== CONDITIONAL: AI/ML Features (If AI/ML selected in features) ==========
        // Step 18
        {
          id: 'ai-features',
          title: 'AI/ML capabilities',
          subtitle: 'Artificial intelligence features',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'includes', field: 'selectedFeatures', value: 'AI/ML features' }),
          order: 18,
          options: [
            { key: 'recommendation-engine', title: 'Recommendation Engine', addCost: 40000 },
            { key: 'nlp', title: 'Natural Language Processing', addCost: 50000 },
            { key: 'computer-vision', title: 'Computer Vision', addCost: 60000 },
            { key: 'predictive-analytics', title: 'Predictive Analytics', addCost: 45000 },
            { key: 'chatbot', title: 'AI Chatbot', addCost: 35000 }
          ]
        },
        
        // ========== CONDITIONAL: Hosting (Complex projects) ==========
        // Step 19
        {
          id: 'hosting',
          title: 'Hosting & infrastructure',
          subtitle: 'Where will your application be hosted?',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 19,
          options: [
            { key: 'aws', title: 'Amazon Web Services', description: 'Enterprise cloud', icon: 'Cloud', addCost: 15000 },
            { key: 'vercel', title: 'Vercel', description: 'Frontend deployment', icon: 'Cloud', addCost: 5000 },
            { key: 'netlify', title: 'Netlify', description: 'JAMstack hosting', icon: 'Cloud', addCost: 5000 },
            { key: 'heroku', title: 'Heroku', description: 'Simple deployment', icon: 'Cloud', addCost: 8000 },
            { key: 'digital-ocean', title: 'DigitalOcean', description: 'Developer cloud', icon: 'Cloud', addCost: 10000 },
            { key: 'google-cloud', title: 'Google Cloud', description: 'Google cloud platform', icon: 'Cloud', addCost: 15000 }
          ]
        },
        
        // ========== CONDITIONAL: Scalability (Enterprise projects) ==========
        // Step 20
        {
          id: 'scalability',
          title: 'Scalability requirements',
          subtitle: 'Expected user scale',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'equals', field: 'scope', value: 'enterprise' }),
          order: 20,
          options: [
            { key: 'low', title: 'Low Scale', description: '< 1K users', icon: 'Users', multiplier: 1.0 },
            { key: 'medium', title: 'Medium Scale', description: '1K - 100K users', icon: 'Users', multiplier: 1.2 },
            { key: 'high', title: 'High Scale', description: '100K+ users', icon: 'Users', multiplier: 1.5 },
            { key: 'enterprise', title: 'Enterprise Scale', description: 'Millions of users', icon: 'Users', multiplier: 2.0 }
          ]
        },
        
        // ========== CONDITIONAL: DevOps (Complex projects) ==========
        // Step 21
        {
          id: 'devops',
          title: 'DevOps & CI/CD',
          subtitle: 'Continuous integration and deployment',
          type: 'multi-select',
          required: false,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 21,
          options: [
            { key: 'ci-cd-pipeline', title: 'CI/CD Pipeline', addCost: 12000 },
            { key: 'docker', title: 'Docker Containers', addCost: 10000 },
            { key: 'kubernetes', title: 'Kubernetes Orchestration', addCost: 20000 },
            { key: 'monitoring', title: 'Monitoring & Logging', addCost: 8000 },
            { key: 'auto-scaling', title: 'Auto-scaling Setup', addCost: 15000 }
          ]
        },
        
        // ========== CONDITIONAL: QA (Complex projects) ==========
        // Step 22
        {
          id: 'qa',
          title: 'Quality assurance',
          subtitle: 'Testing and quality control',
          type: 'single-select',
          required: true,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          order: 22,
          options: [
            { key: 'basic', title: 'Basic Testing', description: 'Manual testing', icon: 'Shield', addCost: 10000 },
            { key: 'automated', title: 'Automated Testing', description: 'Unit & integration tests', icon: 'Shield', addCost: 20000 },
            { key: 'comprehensive', title: 'Comprehensive QA', description: 'Full test suite', icon: 'Shield', addCost: 35000 }
          ]
        },
        
        // ========== CORE STEPS (Always present - Final) ==========
        // Step 23
        {
          id: 'support',
          title: 'Support & Maintenance',
          subtitle: 'Post-launch support options',
          type: 'single-select',
          required: true,
          order: 23,
          options: [
            { key: 'none', title: 'No Support', description: 'One-time delivery', icon: 'Timer', multiplier: 1.0 },
            { key: 'basic', title: 'Basic Support', description: '3 months bug fixes', icon: 'LifeBuoy', addCost: 15000 },
            { key: 'standard', title: 'Standard Support', description: '6 months + updates', icon: 'LifeBuoy', addCost: 30000 },
            { key: 'premium', title: 'Premium Support', description: '12 months + priority', icon: 'LifeBuoy', addCost: 50000 },
            { key: 'enterprise', title: 'Enterprise Support', description: '24/7 dedicated support', icon: 'Shield', addCost: 100000 }
          ]
        },
        
        // Step 24
        {
          id: 'budget',
          title: 'Budget Range',
          subtitle: 'Your expected budget range',
          type: 'single-select',
          required: true,
          order: 24,
          options: [
            { key: 'startup', title: '₹1L - ₹5L', description: 'Startup budget', icon: 'Building2' },
            { key: 'small', title: '₹5L - ₹15L', description: 'Small business', icon: 'Building2' },
            { key: 'medium', title: '₹15L - ₹40L', description: 'Growing company', icon: 'Building2' },
            { key: 'large', title: '₹40L - ₹1Cr', description: 'Enterprise project', icon: 'Building2' },
            { key: 'enterprise', title: '₹1Cr+', description: 'Large enterprise', icon: 'Building2' }
          ]
        },
        
        // Step 25
        {
          id: 'contact',
          title: 'Contact information',
          subtitle: 'How can we reach you?',
          type: 'contact',
          required: true,
          order: 25
        },
        
        // Step 26
        {
          id: 'estimate',
          title: 'Receive estimate',
          subtitle: 'Your personalized project estimate',
          type: 'estimate',
          required: false,
          order: 26
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
          ['Gaming', 1.2],
          ['IoT', 1.2],
          ['Transportation', 1.1],
          ['Real Estate', 1.1],
          ['Social Media', 1.1]
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
        ]),
        integrationCosts: new Map([
          ['stripe', 8000],
          ['paypal', 6000],
          ['sendgrid', 5000],
          ['twilio', 10000],
          ['aws-s3', 7000],
          ['google-maps', 12000],
          ['analytics', 4000],
          ['crm', 15000]
        ]),
        supportCosts: new Map([
          ['none', 0],
          ['basic', 15000],
          ['standard', 30000],
          ['premium', 50000],
          ['enterprise', 100000]
        ])
      },
      
      pricingConfig: {
        minPrice: 25000,
        maxPrice: 10000000,
        estimateVariance: 0.2,
        gstRate: 0.18
      },
      
      isActive: true
    });

    console.log('✅ Complete calculator seeded successfully!');
    console.log('📊 Total steps:', calculator.steps.length);
    console.log('🔄 Conditional steps:', calculator.steps.filter(s => s.condition).length);
    console.log('✓ Always visible:', calculator.steps.filter(s => !s.condition).length);
    console.log('');
    console.log('Step breakdown:');
    console.log('- Core steps (always): 8 steps');
    console.log('- Website path: 8 steps total');
    console.log('- Web/Mobile app path: 18-26 steps (depending on selections)');
    console.log('- With AI/ML features: +1 step');
    console.log('- With Auth selected: +1 step');
    console.log('- With UI/UX design: +2 steps');
    console.log('- Mobile app specific: +2 steps');
    console.log('- Enterprise scope: +1 step');
    console.log('');
    console.log('Maximum possible: 26 steps');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedCompleteCalculator();

