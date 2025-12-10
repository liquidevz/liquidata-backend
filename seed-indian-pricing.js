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

async function seedIndianPricing() {
  try {
    // Clear existing data
    await Calculator.deleteMany({});
    await AdminUser.deleteMany({});
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await AdminUser.create({
      username: 'admin',
      email: 'admin@devflow.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    // Create calculator with Indian pricing
    const calculator = await Calculator.create({
      title: 'DevFlow Project Calculator',
      description: 'Get accurate estimates for your software & hardware development project in Indian Rupees',
      currency: 'INR',
      basePrice: 75000, // Base price in INR
      steps: [
        // Step 1: Project Type
        {
          id: 'project-type',
          title: 'What type of project do you need?',
          subtitle: 'Select the primary type of development work',
          type: 'single-select',
          required: true,
          order: 1,
          options: [
            { 
              key: 'website', 
              title: 'Website', 
              description: 'Marketing site, portfolio, blog', 
              icon: 'Monitor',
              isPopular: false
            },
            { 
              key: 'web-app', 
              title: 'Web Application', 
              description: 'SaaS, dashboard, web platform', 
              icon: 'AppWindow',
              isPopular: true
            },
            { 
              key: 'mobile-app', 
              title: 'Mobile Application', 
              description: 'iOS, Android, cross-platform', 
              icon: 'Smartphone',
              isPopular: true
            },
            { 
              key: 'desktop-app', 
              title: 'Desktop Application', 
              description: 'Windows, macOS, Linux', 
              icon: 'Monitor',
              isPopular: false
            },
            { 
              key: 'api-backend', 
              title: 'API & Backend', 
              description: 'REST API, microservices', 
              icon: 'Server',
              isPopular: false
            },
            { 
              key: 'hardware', 
              title: 'Hardware Development', 
              description: 'IoT devices, embedded systems', 
              icon: 'Cpu',
              isPopular: false
            }
          ]
        },

        // Step 2: Industries
        {
          id: 'industries',
          title: 'Which industries does this serve?',
          subtitle: 'Select all relevant industries (affects complexity)',
          type: 'multi-select',
          required: true,
          order: 2,
          options: [
            { key: 'SaaS', title: 'SaaS', icon: 'Layers' },
            { key: 'Healthcare', title: 'Healthcare', icon: 'Heart' },
            { key: 'Finance', title: 'Finance & Banking', icon: 'Building2' },
            { key: 'Education', title: 'Education', icon: 'Sparkles' },
            { key: 'E-commerce', title: 'E-commerce', icon: 'Globe' },
            { key: 'Manufacturing', title: 'Manufacturing', icon: 'Settings' },
            { key: 'Real Estate', title: 'Real Estate', icon: 'Building2' },
            { key: 'Government', title: 'Government', icon: 'Shield' },
            { key: 'Startup', title: 'Startup', icon: 'Sparkles' },
            { key: 'Enterprise', title: 'Enterprise', icon: 'Building2' }
          ]
        },

        // Step 3: Services
        {
          id: 'services',
          title: 'What services do you need?',
          subtitle: 'Select all required services',
          type: 'multi-select',
          required: true,
          order: 3,
          options: [
            { 
              key: 'web-development', 
              title: 'Web Development', 
              description: 'Custom websites & web apps', 
              icon: 'Globe',
              isPopular: true
            },
            { 
              key: 'mobile-development', 
              title: 'Mobile Development', 
              description: 'iOS & Android apps', 
              icon: 'Smartphone',
              isPopular: true
            },
            { 
              key: 'ui-ux-design', 
              title: 'UI/UX Design', 
              description: 'User interface & experience', 
              icon: 'Palette',
              isPopular: true
            },
            { 
              key: 'backend-development', 
              title: 'Backend Development', 
              description: 'APIs & server architecture', 
              icon: 'Server',
              isPopular: false
            },
            { 
              key: 'devops', 
              title: 'DevOps & Infrastructure', 
              description: 'Deployment & scaling', 
              icon: 'Cloud',
              isPopular: false
            },
            { 
              key: 'hardware-design', 
              title: 'Hardware Design', 
              description: 'PCB design, embedded systems', 
              icon: 'Cpu',
              isPopular: false
            },
            { 
              key: 'consulting', 
              title: 'Technical Consulting', 
              description: 'Architecture & strategy', 
              icon: 'Sparkles',
              isPopular: false
            }
          ]
        },

        // Step 4: Features (conditional)
        {
          id: 'features',
          title: 'What core features do you need?',
          subtitle: 'Select all required features',
          type: 'multi-select',
          required: true,
          order: 4,
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
            { key: 'AI/ML features', title: 'AI/ML Features', icon: 'Sparkles', addCost: 75000 },
            { key: 'Workflow automation', title: 'Workflow Automation', icon: 'Settings', addCost: 50000 }
          ]
        },

        // Step 5: Platforms (conditional)
        {
          id: 'platforms',
          title: 'Which platforms do you need to support?',
          subtitle: 'Select target platforms',
          type: 'multi-select',
          required: true,
          order: 5,
          condition: JSON.stringify({ type: 'not_equals', field: 'projectType', value: 'website' }),
          options: [
            { key: 'web', title: 'Web Browser', description: 'Chrome, Safari, Firefox', icon: 'Globe' },
            { key: 'ios', title: 'iOS', description: 'iPhone, iPad', icon: 'Smartphone', addCost: 40000 },
            { key: 'android', title: 'Android', description: 'Android phones, tablets', icon: 'Smartphone', addCost: 35000 },
            { key: 'windows', title: 'Windows', description: 'Windows 10/11', icon: 'Monitor', addCost: 30000 },
            { key: 'macos', title: 'macOS', description: 'Mac computers', icon: 'Monitor', addCost: 30000 },
            { key: 'linux', title: 'Linux', description: 'Ubuntu, CentOS', icon: 'Monitor', addCost: 25000 }
          ]
        },

        // Step 6: Project Scope
        {
          id: 'scope',
          title: 'What is the project scope?',
          subtitle: 'Choose the complexity level',
          type: 'single-select',
          required: true,
          order: 6,
          options: [
            { 
              key: 'mvp', 
              title: 'MVP (Minimum Viable Product)', 
              description: 'Basic functionality to validate concept', 
              icon: 'Sparkles',
              isPopular: true
            },
            { 
              key: 'standard', 
              title: 'Standard', 
              description: 'Full-featured application', 
              icon: 'Layers',
              isPopular: true
            },
            { 
              key: 'enterprise', 
              title: 'Enterprise', 
              description: 'Complex, scalable solution', 
              icon: 'Timer',
              isPopular: false
            }
          ]
        },

        // Step 7: Team Size
        {
          id: 'team',
          title: 'What team size do you prefer?',
          subtitle: 'Choose based on timeline and budget',
          type: 'single-select',
          required: true,
          order: 7,
          options: [
            { key: 'solo', title: 'Solo Developer', description: '1 developer - Cost effective' },
            { key: 'small', title: 'Small Team', description: '2-4 specialists - Balanced approach', isPopular: true },
            { key: 'medium', title: 'Medium Team', description: '5-8 specialists - Faster delivery' },
            { key: 'large', title: 'Large Team', description: '9+ specialists - Enterprise scale' }
          ]
        },

        // Step 8: Timeline
        {
          id: 'timeline',
          title: 'What is your timeline?',
          subtitle: 'Choose your preferred delivery timeline',
          type: 'single-select',
          required: true,
          order: 8,
          options: [
            { key: 'rush', title: 'Rush (1-3 months)', description: 'Urgent delivery - Premium pricing' },
            { key: 'standard', title: 'Standard (3-6 months)', description: 'Balanced timeline', isPopular: true },
            { key: 'extended', title: 'Extended (6-12 months)', description: 'Comprehensive development' },
            { key: 'ongoing', title: 'Ongoing (12+ months)', description: 'Phased development approach' }
          ]
        },

        // Step 9: Support
        {
          id: 'support',
          title: 'What level of support do you need?',
          subtitle: 'Post-launch support and maintenance',
          type: 'single-select',
          required: true,
          order: 9,
          options: [
            { key: 'none', title: 'No Support', description: 'One-time delivery only', icon: 'Timer' },
            { key: 'basic', title: 'Basic Support', description: '3 months bug fixes', icon: 'LifeBuoy', addCost: 15000 },
            { key: 'standard', title: 'Standard Support', description: '6 months support + updates', icon: 'LifeBuoy', addCost: 35000, isPopular: true },
            { key: 'premium', title: 'Premium Support', description: '12 months priority support', icon: 'LifeBuoy', addCost: 75000 },
            { key: 'enterprise', title: 'Enterprise Support', description: '24/7 dedicated support', icon: 'Shield', addCost: 150000 }
          ]
        },

        // Step 10: Contact
        {
          id: 'contact',
          title: 'Contact Information',
          subtitle: 'We\'ll send your estimate to this email',
          type: 'contact',
          required: true,
          order: 10
        },

        // Step 11: Estimate
        {
          id: 'estimate',
          title: 'Your Project Estimate',
          subtitle: 'Based on your selections',
          type: 'estimate',
          required: false,
          order: 11
        }
      ],

      // Indian Market Pricing Rules (All prices in INR)
      pricingRules: {
        // Project type base multipliers
        projectTypeMultipliers: new Map([
          ['website', 0.4],           // Simple websites
          ['web-app', 1.0],           // Standard web applications
          ['mobile-app', 1.3],        // Mobile apps (higher complexity)
          ['desktop-app', 1.1],       // Desktop applications
          ['api-backend', 0.8],       // Backend/API only
          ['hardware', 1.8]           // Hardware development (specialized)
        ]),

        // Industry complexity multipliers (Indian market considerations)
        industryMultipliers: new Map([
          ['Healthcare', 1.4],        // High compliance requirements
          ['Finance', 1.5],           // Banking regulations, security
          ['Government', 1.3],        // Compliance, security
          ['E-commerce', 1.2],        // Payment integration complexity
          ['Education', 1.0],         // Standard complexity
          ['SaaS', 1.1],             // Scalability requirements
          ['Manufacturing', 1.2],     // Industry-specific needs
          ['Real Estate', 1.1],       // Standard business logic
          ['Startup', 0.9],           // Budget-conscious
          ['Enterprise', 1.3]         // Complex requirements
        ]),

        // Service-specific costs (in INR)
        serviceCosts: new Map([
          ['web-development', 0],      // Base service
          ['mobile-development', 30000], // Additional mobile expertise
          ['ui-ux-design', 25000],     // Design services
          ['backend-development', 35000], // Backend complexity
          ['devops', 25000],           // Infrastructure setup
          ['hardware-design', 75000],  // Specialized hardware skills
          ['consulting', 15000]        // Strategy and planning
        ]),

        // Platform-specific costs (in INR)
        platformCosts: new Map([
          ['web', 0],                  // Base platform
          ['ios', 40000],              // iOS development
          ['android', 35000],          // Android development
          ['windows', 30000],          // Windows desktop
          ['macos', 30000],            // macOS desktop
          ['linux', 25000]             // Linux support
        ]),

        // Integration costs (in INR)
        integrationCosts: new Map([
          ['razorpay', 12000],         // Indian payment gateway
          ['payu', 10000],             // Indian payment gateway
          ['phonepe', 15000],          // PhonePe integration
          ['upi', 8000],               // UPI integration
          ['aadhaar', 20000],          // Aadhaar verification
          ['gstin', 15000],            // GST integration
          ['aws', 10000],              // AWS services
          ['google-maps', 8000],       // Google Maps
          ['whatsapp', 12000],         // WhatsApp Business API
          ['sms-gateway', 6000]        // SMS integration
        ]),

        // Technology stack costs (in INR)
        techStackCosts: new Map([
          ['react-nextjs', 0],         // Popular, no premium
          ['vue-nuxt', 5000],          // Less common
          ['angular', 8000],           // Enterprise, more complex
          ['nodejs', 0],               // Standard backend
          ['python-django', 5000],     // Python expertise
          ['php-laravel', 3000],       // Common in India
          ['dotnet', 10000],           // Microsoft stack
          ['java-spring', 8000],       // Enterprise Java
          ['flutter', 5000],           // Cross-platform mobile
          ['react-native', 8000]       // Cross-platform mobile
        ]),

        // Project scope multipliers
        scopeMultipliers: new Map([
          ['mvp', 0.6],                // Reduced scope
          ['standard', 1.0],           // Full scope
          ['enterprise', 2.0]          // Complex enterprise features
        ]),

        // Team size multipliers (Indian market rates)
        teamMultipliers: new Map([
          ['solo', 0.7],               // Single developer discount
          ['small', 1.0],              // Optimal team size
          ['medium', 1.3],             // Coordination overhead
          ['large', 1.6]               // Management complexity
        ]),

        // Timeline urgency multipliers
        timelineMultipliers: new Map([
          ['rush', 1.6],               // Rush delivery premium
          ['standard', 1.0],           // Standard timeline
          ['extended', 0.85],          // Extended timeline discount
          ['ongoing', 0.8]             // Long-term engagement discount
        ]),

        // Support package costs (in INR)
        supportCosts: new Map([
          ['none', 0],
          ['basic', 15000],            // 3 months basic support
          ['standard', 35000],         // 6 months standard support
          ['premium', 75000],          // 12 months premium support
          ['enterprise', 150000]       // Enterprise 24/7 support
        ])
      },

      // Pricing configuration for Indian market
      pricingConfig: {
        minPrice: 25000,              // Minimum project cost (₹25K)
        maxPrice: 5000000,            // Maximum project cost (₹50L)
        estimateVariance: 0.25,       // ±25% variance for estimates
        gstRate: 0.18,                // 18% GST in India
        discountRules: [
          {
            condition: JSON.stringify({ type: 'equals', field: 'scope', value: 'mvp' }),
            discountPercent: 10,
            description: 'MVP Discount - 10% off for startups'
          },
          {
            condition: JSON.stringify({ type: 'includes', field: 'selectedIndustries', value: 'Startup' }),
            discountPercent: 15,
            description: 'Startup Discount - 15% off for startups'
          }
        ]
      },

      isActive: true,
      version: '2.0'
    });

    console.log('✅ Indian pricing calculator seeded successfully!');
    console.log('📊 Calculator Details:');
    console.log(`   - Title: ${calculator.title}`);
    console.log(`   - Base Price: ₹${calculator.basePrice.toLocaleString('en-IN')}`);
    console.log(`   - Currency: ${calculator.currency}`);
    console.log(`   - Total Steps: ${calculator.steps.length}`);
    console.log(`   - Min Price: ₹${calculator.pricingConfig.minPrice.toLocaleString('en-IN')}`);
    console.log(`   - Max Price: ₹${calculator.pricingConfig.maxPrice.toLocaleString('en-IN')}`);
    console.log(`   - GST Rate: ${calculator.pricingConfig.gstRate * 100}%`);
    console.log('');
    console.log('🔐 Default Admin User Created:');
    console.log('   - Username: admin');
    console.log('   - Email: admin@devflow.com');
    console.log('   - Password: admin123');
    console.log('   - Role: super_admin');
    console.log('');
    console.log('🚀 Ready to use! Start the server and visit /api-docs for API documentation');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Indian pricing:', error);
    process.exit(1);
  }
}

seedIndianPricing();
