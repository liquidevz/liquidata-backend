const mongoose = require('mongoose');
const Component = require('./models/Component');
require('dotenv').config();

const sampleComponents = [
  {
    name: 'Main Hero Section',
    type: 'hero',
    props: {
      title: 'Build the future with Liquidata',
      subtitle: 'The most advanced platform for modern businesses',
      description: 'Transform your business with our cutting-edge solutions designed for the modern world. Get started today and see the difference.',
      buttonText: 'Get Started Free',
      buttonColor: '#3b82f6',
      secondaryButtonText: 'Watch Demo',
      announcement: 'New AI features now available 🚀',
      color: '#ffffff',
      bgGradient: 'from-blue-600 to-purple-600'
    },
    order: 1,
    isActive: true,
    category: 'hero',
    description: 'Main hero section with call-to-action buttons',
    tags: ['hero', 'cta', 'landing']
  },
  {
    name: 'Customer Logos',
    type: 'customers',
    props: {
      title: 'Trusted by industry leaders worldwide',
      subtitle: 'Join thousands of companies',
      logos: [
        { name: 'TechCorp', url: '/logos/techcorp.svg' },
        { name: 'InnovateLab', url: '/logos/innovatelab.svg' },
        { name: 'FutureWorks', url: '/logos/futureworks.svg' },
        { name: 'DataFlow', url: '/logos/dataflow.svg' },
        { name: 'CloudTech', url: '/logos/cloudtech.svg' },
        { name: 'NextGen', url: '/logos/nextgen.svg' }
      ]
    },
    order: 2,
    isActive: true,
    category: 'social-proof',
    description: 'Customer logos and social proof section',
    tags: ['customers', 'logos', 'social-proof']
  },
  {
    name: 'Feature Highlights',
    type: 'features',
    props: {
      title: 'Everything you need to succeed',
      subtitle: 'Powerful features for modern teams',
      description: 'Our comprehensive platform provides all the tools and features you need to build, deploy, and scale your applications.',
      features: [
        {
          title: 'Lightning Fast',
          description: 'Optimized for speed with sub-second response times and global CDN distribution.',
          icon: 'zap',
          color: '#f59e0b'
        },
        {
          title: 'Enterprise Security',
          description: 'Bank-grade security with end-to-end encryption and compliance certifications.',
          icon: 'shield',
          color: '#10b981'
        },
        {
          title: 'Scalable Infrastructure',
          description: 'Auto-scaling infrastructure that grows with your business needs.',
          icon: 'trending-up',
          color: '#3b82f6'
        },
        {
          title: '24/7 Support',
          description: 'Round-the-clock expert support to help you succeed.',
          icon: 'headphones',
          color: '#8b5cf6'
        },
        {
          title: 'Advanced Analytics',
          description: 'Deep insights and analytics to optimize your performance.',
          icon: 'bar-chart',
          color: '#ef4444'
        },
        {
          title: 'Easy Integration',
          description: 'Seamless integration with your existing tools and workflows.',
          icon: 'link',
          color: '#06b6d4'
        }
      ]
    },
    order: 3,
    isActive: true,
    category: 'features',
    description: 'Feature grid showcasing key capabilities',
    tags: ['features', 'grid', 'capabilities']
  },
  {
    name: 'Performance Stats',
    type: 'stats',
    props: {
      title: 'Trusted by millions worldwide',
      subtitle: 'The numbers speak for themselves',
      stats: [
        { label: 'Active Users', value: '10M+', description: 'Growing daily' },
        { label: 'Countries', value: '150+', description: 'Global reach' },
        { label: 'Uptime', value: '99.9%', description: 'Reliable service' },
        { label: 'Support Rating', value: '4.9/5', description: 'Customer satisfaction' }
      ],
      bgColor: '#1f2937',
      textColor: '#ffffff'
    },
    order: 4,
    isActive: true,
    category: 'social-proof',
    description: 'Key performance statistics and metrics',
    tags: ['stats', 'metrics', 'social-proof']
  },
  {
    name: 'Pricing Plans',
    type: 'pricing',
    props: {
      title: 'Simple, transparent pricing',
      subtitle: 'Choose the plan that works for you',
      description: 'Start free and scale as you grow. No hidden fees, no surprises.',
      plans: [
        {
          name: 'Starter',
          price: '$0',
          period: 'month',
          description: 'Perfect for getting started',
          features: [
            'Up to 3 projects',
            'Basic support',
            '1GB storage',
            'Community access'
          ],
          popular: false,
          buttonText: 'Start Free',
          buttonColor: '#6b7280'
        },
        {
          name: 'Professional',
          price: '$29',
          period: 'month',
          description: 'For growing businesses',
          features: [
            'Unlimited projects',
            'Priority support',
            '50GB storage',
            'Advanced analytics',
            'Team collaboration',
            'API access'
          ],
          popular: true,
          buttonText: 'Start Trial',
          buttonColor: '#3b82f6'
        },
        {
          name: 'Enterprise',
          price: '$99',
          period: 'month',
          description: 'For large organizations',
          features: [
            'Everything in Pro',
            'Custom integrations',
            'Dedicated support',
            'Unlimited storage',
            'Advanced security',
            'SLA guarantee'
          ],
          popular: false,
          buttonText: 'Contact Sales',
          buttonColor: '#1f2937'
        }
      ]
    },
    order: 5,
    isActive: true,
    category: 'pricing',
    description: 'Pricing plans and subscription options',
    tags: ['pricing', 'plans', 'subscription']
  },
  {
    name: 'Call to Action',
    type: 'cta',
    props: {
      title: 'Ready to transform your business?',
      subtitle: 'Join thousands of companies already using Liquidata',
      description: 'Start your free trial today and see why leading companies choose our platform.',
      buttonText: 'Start Free Trial',
      buttonColor: '#3b82f6',
      secondaryButtonText: 'Schedule Demo',
      bgColor: '#1f2937',
      textColor: '#ffffff',
      pattern: 'dots'
    },
    order: 6,
    isActive: true,
    category: 'cta',
    description: 'Final call-to-action section',
    tags: ['cta', 'conversion', 'trial']
  },
  {
    name: 'Site Footer',
    type: 'footer',
    props: {
      companyName: 'Liquidata',
      description: 'Building the future of business technology with innovative solutions.',
      logo: '/logo.svg',
      links: [
        {
          title: 'Product',
          items: [
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Security', href: '/security' },
            { label: 'Integrations', href: '/integrations' }
          ]
        },
        {
          title: 'Company',
          items: [
            { label: 'About', href: '/about' },
            { label: 'Careers', href: '/careers' },
            { label: 'Blog', href: '/blog' },
            { label: 'Press', href: '/press' }
          ]
        },
        {
          title: 'Resources',
          items: [
            { label: 'Documentation', href: '/docs' },
            { label: 'Help Center', href: '/help' },
            { label: 'Community', href: '/community' },
            { label: 'API Reference', href: '/api' }
          ]
        },
        {
          title: 'Legal',
          items: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
            { label: 'GDPR', href: '/gdpr' }
          ]
        }
      ],
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/liquidata', icon: 'twitter' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/liquidata', icon: 'linkedin' },
        { platform: 'github', url: 'https://github.com/liquidata', icon: 'github' },
        { platform: 'youtube', url: 'https://youtube.com/liquidata', icon: 'youtube' }
      ],
      newsletter: {
        title: 'Stay updated',
        description: 'Get the latest news and updates delivered to your inbox.',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe'
      }
    },
    order: 7,
    isActive: true,
    category: 'footer',
    description: 'Site footer with links and information',
    tags: ['footer', 'links', 'social', 'newsletter']
  }
];

async function seedComponents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata');
    console.log('Connected to MongoDB');

    // Clear existing components
    await Component.deleteMany({});
    console.log('Cleared existing components');

    // Insert sample components
    const components = await Component.insertMany(sampleComponents);
    console.log(`Created ${components.length} sample components`);

    console.log('Sample components created:');
    components.forEach(component => {
      console.log(`- ${component.name} (${component.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding components:', error);
    process.exit(1);
  }
}

seedComponents();