// Auto-seed calculator configuration on server startup
// This ensures the calculator is always populated with the latest configuration

async function autoSeedCalculator(Calculator) {
  try {
    const count = await Calculator.countDocuments();
    
    if (count === 0) {
      console.log('📊 No calculator configuration found. Seeding...');
      
      const calculatorData = {
        title: 'Liquidata Project Calculator',
        description: 'Get accurate estimates for your software development project with our smart calculator',
        currency: 'INR',
        basePrice: 50000,
        steps: [
          {
            id: 'project-type',
            title: 'Select Project Type',
            subtitle: 'What type of project are you building?',
            type: 'single-select',
            required: true,
            order: 1,
            options: [
              { key: 'website', title: 'Website', description: 'Static or dynamic website', icon: 'Globe', multiplier: 0.6 },
              { key: 'web-app', title: 'Web Application', description: 'Interactive web app', icon: 'AppWindow', multiplier: 1.0, isPopular: true },
              { key: 'mobile-app', title: 'Mobile App', description: 'iOS or Android app', icon: 'Smartphone', multiplier: 1.3 },
              { key: 'desktop-app', title: 'Desktop App', description: 'Windows, Mac or Linux', icon: 'Monitor', multiplier: 1.2 },
              { key: 'api-backend', title: 'API & Backend', description: 'REST API or GraphQL', icon: 'Server', multiplier: 0.8 }
            ]
          },
          {
            id: 'industries',
            title: 'Select Industries',
            subtitle: 'Which industries does your project target?',
            type: 'multi-select',
            required: true,
            order: 2,
            options: [
              { key: 'saas', title: 'SaaS', description: 'Software as a Service', icon: 'Cloud', multiplier: 1.2 },
              { key: 'e-commerce', title: 'E-commerce', description: 'Online store', icon: 'ShoppingCart', multiplier: 1.1 },
              { key: 'fintech', title: 'Fintech', description: 'Financial services', icon: 'DollarSign', multiplier: 1.4 },
              { key: 'healthcare', title: 'Healthcare', description: 'Medical & health', icon: 'Heart', multiplier: 1.3 },
              { key: 'education', title: 'Education', description: 'EdTech platform', icon: 'BookOpen', multiplier: 1.0 },
              { key: 'enterprise', title: 'Enterprise', description: 'Business tools', icon: 'Building', multiplier: 1.3 }
            ]
          },
          {
            id: 'services',
            title: 'Type of Service',
            subtitle: 'What services do you need?',
            type: 'multi-select',
            required: true,
            order: 3,
            options: [
              { key: 'design', title: 'UI/UX Design', description: 'Interface design', icon: 'Palette', multiplier: 1.1, addCost: 15000 },
              { key: 'development', title: 'Development', description: 'Code & build', icon: 'Code', multiplier: 1.0, isPopular: true },
              { key: 'testing', title: 'QA Testing', description: 'Quality assurance', icon: 'Shield', addCost: 10000 },
              { key: 'deployment', title: 'Deployment', description: 'Launch & hosting', icon: 'Rocket', addCost: 5000 }
            ]
          },
          {
            id: 'scope',
            title: 'Project Scope',
            subtitle: 'What level of complexity?',
            type: 'single-select',
            required: true,
            order: 4,
            options: [
              { key: 'mvp', title: 'MVP', description: 'Minimum viable product', icon: 'Zap', multiplier: 0.6 },
              { key: 'standard', title: 'Standard', description: 'Full featured', icon: 'Layers', multiplier: 1.0, isPopular: true },
              { key: 'enterprise', title: 'Enterprise', description: 'Complex & scalable', icon: 'Building2', multiplier: 1.8 }
            ]
          },
          {
            id: 'team',
            title: 'Team Size',
            subtitle: 'What team size do you need?',
            type: 'single-select',
            required: true,
            order: 5,
            options: [
              { key: 'solo', title: 'Solo Developer', description: '1 developer', icon: 'User', multiplier: 0.5 },
              { key: 'small', title: 'Small Team', description: '2-3 developers', icon: 'Users', multiplier: 1.0, isPopular: true },
              { key: 'medium', title: 'Medium Team', description: '4-6 developers', icon: 'Users', multiplier: 1.5 },
              { key: 'large', title: 'Large Team', description: '7+ developers', icon: 'Users', multiplier: 2.0 }
            ]
          },
          {
            id: 'timeline',
            title: 'Project Timeline',
            subtitle: 'When do you need it?',
            type: 'single-select',
            required: true,
            order: 6,
            options: [
              { key: 'rush', title: 'Rush', description: '1-2 months', icon: 'Zap', multiplier: 1.5 },
              { key: 'standard', title: 'Standard', description: '3-6 months', icon: 'Timer', multiplier: 1.0, isPopular: true },
              { key: 'extended', title: 'Extended', description: '6-12 months', icon: 'Calendar', multiplier: 0.9 },
              { key: 'ongoing', title: 'Ongoing', description: '12+ months', icon: 'Calendar', multiplier: 0.8 }
            ]
          },
          {
            id: 'tech-stack',
            title: 'Technology Stack',
            subtitle: 'Select your preferred technologies',
            type: 'multi-select',
            required: false,
            order: 7,
            options: [
              { key: 'react-nextjs', title: 'React + Next.js', description: 'Modern React framework', icon: 'Code', multiplier: 1.0 },
              { key: 'vue-nuxt', title: 'Vue + Nuxt', description: 'Progressive framework', icon: 'Code', multiplier: 1.0 },
              { key: 'angular', title: 'Angular', description: 'Enterprise framework', icon: 'Code', multiplier: 1.1 },
              { key: 'nodejs', title: 'Node.js', description: 'JavaScript runtime', icon: 'Server', multiplier: 1.0 },
              { key: 'python-django', title: 'Python + Django', description: 'Rapid development', icon: 'Server', multiplier: 1.0 },
              { key: 'php-laravel', title: 'PHP + Laravel', description: 'Web artisan', icon: 'Server', multiplier: 0.9 }
            ]
          },
          {
            id: 'platforms',
            title: 'Platform Targets',
            subtitle: 'Where will your app run?',
            type: 'multi-select',
            required: false,
            order: 8,
            condition: 'projectType !== "website"',
            options: [
              { key: 'web', title: 'Web Browser', description: 'Chrome, Safari, Firefox', icon: 'Globe', multiplier: 1.0 },
              { key: 'ios', title: 'iOS', description: 'iPhone & iPad', icon: 'Smartphone', multiplier: 1.2 },
              { key: 'android', title: 'Android', description: 'Android devices', icon: 'Smartphone', multiplier: 1.2 },
              { key: 'windows', title: 'Windows', description: 'Windows desktop', icon: 'Monitor', multiplier: 1.1 },
              { key: 'macos', title: 'macOS', description: 'Mac desktop', icon: 'Monitor', multiplier: 1.1 },
              { key: 'linux', title: 'Linux', description: 'Linux desktop', icon: 'Monitor', multiplier: 1.0 }
            ]
          },
          {
            id: 'features',
            title: 'Core Features',
            subtitle: 'What features do you need?',
            type: 'multi-select',
            required: false,
            order: 9,
            condition: 'projectType !== "website"',
            options: [
              { key: 'user-mgmt', title: 'User Management', description: 'Registration, profiles', icon: 'Users', addCost: 15000 },
              { key: 'authentication', title: 'Authentication', description: 'Login, OAuth', icon: 'Lock', addCost: 12000 },
              { key: 'payments', title: 'Payment Processing', description: 'Stripe, Razorpay', icon: 'CreditCard', addCost: 25000 },
              { key: 'analytics', title: 'Analytics', description: 'Tracking, reports', icon: 'BarChart', addCost: 10000 },
              { key: 'notifications', title: 'Notifications', description: 'Push, email, SMS', icon: 'Bell', addCost: 8000 },
              { key: 'chat', title: 'Chat/Messaging', description: 'Real-time chat', icon: 'MessageSquare', addCost: 20000 },
              { key: 'search', title: 'Search', description: 'Advanced search', icon: 'Search', addCost: 10000 },
              { key: 'api-integration', title: 'API Integration', description: 'Third-party APIs', icon: 'Link', addCost: 15000 }
            ]
          },
          {
            id: 'auth',
            title: 'Authentication',
            subtitle: 'What authentication methods?',
            type: 'multi-select',
            required: false,
            order: 10,
            condition: 'projectType !== "website"',
            options: [
              { key: 'email-password', title: 'Email/Password', description: 'Standard login', icon: 'Mail', addCost: 5000 },
              { key: 'social-login', title: 'Social Login', description: 'Google, Facebook', icon: 'Share2', addCost: 8000 },
              { key: 'two-factor', title: 'Two-Factor Auth', description: '2FA security', icon: 'Shield', addCost: 10000 },
              { key: 'sso', title: 'Single Sign-On', description: 'Enterprise SSO', icon: 'Key', addCost: 20000 }
            ]
          },
          {
            id: 'database',
            title: 'Database',
            subtitle: 'What database do you need?',
            type: 'multi-select',
            required: false,
            order: 11,
            condition: 'projectType !== "website"',
            options: [
              { key: 'postgresql', title: 'PostgreSQL', description: 'Relational database', icon: 'Database', multiplier: 1.0 },
              { key: 'mongodb', title: 'MongoDB', description: 'NoSQL database', icon: 'Database', multiplier: 1.0 },
              { key: 'redis', title: 'Redis', description: 'Cache & sessions', icon: 'Zap', addCost: 5000 },
              { key: 'elasticsearch', title: 'Elasticsearch', description: 'Search engine', icon: 'Search', addCost: 15000 }
            ]
          },
          {
            id: 'integrations',
            title: 'Integrations',
            subtitle: 'Third-party integrations?',
            type: 'multi-select',
            required: false,
            order: 12,
            options: [
              { key: 'payment-gateway', title: 'Payment Gateway', description: 'Stripe, Razorpay', icon: 'CreditCard', addCost: 20000 },
              { key: 'email-service', title: 'Email Service', description: 'SendGrid, Mailgun', icon: 'Mail', addCost: 5000 },
              { key: 'sms-service', title: 'SMS Service', description: 'Twilio, MSG91', icon: 'MessageSquare', addCost: 5000 },
              { key: 'cloud-storage', title: 'Cloud Storage', description: 'AWS S3, GCP', icon: 'Cloud', addCost: 8000 },
              { key: 'maps', title: 'Maps', description: 'Google Maps', icon: 'MapPin', addCost: 10000 },
              { key: 'analytics', title: 'Analytics', description: 'Google Analytics', icon: 'BarChart', addCost: 3000 }
            ]
          },
          {
            id: 'design-requirements',
            title: 'Design Requirements',
            subtitle: 'What level of design?',
            type: 'single-select',
            required: false,
            order: 13,
            options: [
              { key: 'basic', title: 'Basic Design', description: 'Simple & functional', icon: 'Layout', multiplier: 0.8 },
              { key: 'custom', title: 'Custom Design', description: 'Unique brand', icon: 'Palette', multiplier: 1.2, isPopular: true },
              { key: 'premium', title: 'Premium Design', description: 'High-end design', icon: 'Star', multiplier: 1.5 }
            ]
          },
          {
            id: 'hosting',
            title: 'Hosting & Deployment',
            subtitle: 'Where will you host?',
            type: 'single-select',
            required: false,
            order: 14,
            options: [
              { key: 'cloud', title: 'Cloud Hosting', description: 'AWS, GCP, Azure', icon: 'Cloud', addCost: 10000 },
              { key: 'managed', title: 'Managed Hosting', description: 'Vercel, Netlify', icon: 'Server', addCost: 5000 },
              { key: 'self-hosted', title: 'Self-Hosted', description: 'Your own server', icon: 'HardDrive', addCost: 0 }
            ]
          },
          {
            id: 'support',
            title: 'Support & Maintenance',
            subtitle: 'Post-launch support?',
            type: 'single-select',
            required: false,
            order: 15,
            options: [
              { key: 'none', title: 'No Support', description: 'One-time delivery', icon: 'X', multiplier: 1.0 },
              { key: '3-months', title: '3 Months', description: 'Basic support', icon: 'LifeBuoy', addCost: 15000 },
              { key: '6-months', title: '6 Months', description: 'Standard support', icon: 'LifeBuoy', addCost: 25000, isPopular: true },
              { key: '12-months', title: '12 Months', description: 'Premium support', icon: 'LifeBuoy', addCost: 45000 }
            ]
          },
          {
            id: 'budget',
            title: 'Budget Range',
            subtitle: 'What is your budget?',
            type: 'single-select',
            required: false,
            order: 16,
            options: [
              { key: '0-1l', title: 'Under ₹1L', description: 'Small projects', icon: 'DollarSign' },
              { key: '1l-2l', title: '₹1L - ₹2L', description: 'Basic apps', icon: 'DollarSign' },
              { key: '2l-4l', title: '₹2L - ₹4L', description: 'Standard projects', icon: 'DollarSign', isPopular: true },
              { key: '4l-8l', title: '₹4L - ₹8L', description: 'Complex apps', icon: 'DollarSign' },
              { key: '8l+', title: 'Above ₹8L', description: 'Enterprise', icon: 'DollarSign' }
            ]
          },
          {
            id: 'contact',
            title: 'Contact Information',
            subtitle: 'How can we reach you?',
            type: 'contact',
            required: true,
            order: 17,
            options: []
          },
          {
            id: 'estimate',
            title: 'Your Estimate',
            subtitle: 'Based on your selections',
            type: 'estimate',
            required: false,
            order: 18,
            options: []
          }
        ],
        pricingRules: {
          industryMultipliers: {
            'saas': 1.2,
            'fintech': 1.4,
            'healthcare': 1.3,
            'enterprise': 1.3,
            'e-commerce': 1.1,
            'education': 1.0
          },
          projectTypeMultipliers: {
            'website': 0.6,
            'web-app': 1.0,
            'mobile-app': 1.3,
            'desktop-app': 1.2,
            'api-backend': 0.8
          },
          scopeMultipliers: {
            'mvp': 0.6,
            'standard': 1.0,
            'enterprise': 1.8
          },
          teamMultipliers: {
            'solo': 0.5,
            'small': 1.0,
            'medium': 1.5,
            'large': 2.0
          },
          timelineMultipliers: {
            'rush': 1.5,
            'standard': 1.0,
            'extended': 0.9,
            'ongoing': 0.8
          }
        },
        pricingConfig: {
          minPrice: 25000,
          maxPrice: 5000000,
          estimateVariance: 0.2,
          gstRate: 0.18
        },
        isActive: true,
        version: '2.0'
      };
      
      await Calculator.create(calculatorData);
      console.log('✅ Calculator configuration seeded successfully with all 18 steps!');
      return true;
    } else {
      console.log('✅ Calculator configuration already exists');
      return false;
    }
  } catch (error) {
    console.error('❌ Error seeding calculator:', error);
    return false;
  }
}

module.exports = { autoSeedCalculator };

