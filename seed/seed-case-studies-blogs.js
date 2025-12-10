const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata';

// Schemas
const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  featuredImage: { type: String, required: true },
  gallery: [{ type: String }],
  client: { type: String, required: true },
  industry: { type: String, required: true },
  projectType: { type: String, required: true },
  duration: { type: String },
  teamSize: { type: String },
  technologies: [{ type: String }],
  metrics: [{
    label: { type: String },
    value: { type: String },
    description: { type: String }
  }],
  liveUrl: { type: String },
  githubUrl: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  featured: { type: Boolean, default: false },
  publishedAt: { type: Date },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  featuredImage: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  readingTime: { type: Number },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  publishedAt: { type: Date },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

const blogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: '#3B82F6' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const adminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

// Sample Data
const sampleCategories = [
  { name: 'Technology', slug: 'technology', description: 'Latest in tech and software', color: '#3B82F6', isActive: true },
  { name: 'Design', slug: 'design', description: 'Design insights and trends', color: '#8B5CF6', isActive: true },
  { name: 'Business', slug: 'business', description: 'Business strategies and growth', color: '#10B981', isActive: true },
  { name: 'Development', slug: 'development', description: 'Web and app development', color: '#F59E0B', isActive: true },
  { name: 'Marketing', slug: 'marketing', description: 'Digital marketing insights', color: '#EF4444', isActive: true }
];

const sampleCaseStudies = [
  {
    title: 'AI-Powered Analytics Platform',
    slug: 'ai-powered-analytics-platform',
    subtitle: 'Transforming data into actionable insights',
    description: 'We built a comprehensive analytics platform that uses machine learning to provide real-time business intelligence and predictive analytics for enterprise clients.',
    excerpt: 'A comprehensive analytics platform leveraging AI and machine learning to deliver real-time business intelligence.',
    content: '<h2>The Challenge</h2><p>Our client needed a way to process millions of data points daily and extract meaningful insights without requiring a team of data scientists.</p><h2>Our Solution</h2><p>We developed an AI-powered platform that automatically analyzes data patterns, detects anomalies, and provides predictive forecasts with 95% accuracy.</p><h2>Results</h2><p>The platform reduced analysis time by 80% and increased forecast accuracy by 35%, helping the client make faster, data-driven decisions.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
    client: 'TechCorp Global',
    industry: 'Technology',
    projectType: 'Web Application',
    duration: '6 months',
    teamSize: '8 developers',
    technologies: ['React', 'Python', 'TensorFlow', 'AWS', 'MongoDB'],
    metrics: [
      { label: 'Processing Speed', value: '80%', description: 'Faster data analysis' },
      { label: 'Accuracy', value: '95%', description: 'Prediction accuracy rate' },
      { label: 'Cost Reduction', value: '60%', description: 'Operational cost savings' }
    ],
    liveUrl: 'https://example.com',
    status: 'published',
    featured: true,
    publishedAt: new Date('2024-11-15')
  },
  {
    title: 'E-Commerce Revolution',
    slug: 'ecommerce-revolution',
    subtitle: 'Next-generation shopping experience',
    description: 'A complete overhaul of an e-commerce platform to deliver seamless shopping experiences across all devices with advanced personalization features.',
    excerpt: 'Revolutionizing online shopping with personalized experiences and cutting-edge technology.',
    content: '<h2>Overview</h2><p>We redesigned and rebuilt the entire e-commerce infrastructure to handle 10x traffic with personalized product recommendations.</p><h2>Key Features</h2><ul><li>AI-powered product recommendations</li><li>One-click checkout</li><li>Real-time inventory management</li><li>Multi-currency support</li></ul><h2>Impact</h2><p>Sales increased by 150% in the first quarter, and customer satisfaction scores improved by 40%.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop',
    client: 'RetailMax',
    industry: 'E-Commerce',
    projectType: 'Full Stack Application',
    duration: '8 months',
    teamSize: '12 developers',
    technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe'],
    metrics: [
      { label: 'Sales Increase', value: '150%', description: 'First quarter growth' },
      { label: 'Load Time', value: '2.1s', description: 'Average page load' },
      { label: 'Conversion Rate', value: '+45%', description: 'Checkout conversions' }
    ],
    status: 'published',
    featured: true,
    publishedAt: new Date('2024-10-20')
  },
  {
    title: 'Healthcare Management System',
    slug: 'healthcare-management-system',
    subtitle: 'Streamlining patient care',
    description: 'An integrated healthcare management system that connects patients, doctors, and administrators in a secure, HIPAA-compliant platform.',
    excerpt: 'Secure, HIPAA-compliant platform connecting all stakeholders in healthcare delivery.',
    content: '<h2>The Problem</h2><p>Healthcare providers were using multiple disconnected systems, leading to inefficiencies and potential errors in patient care.</p><h2>Our Approach</h2><p>We created a unified platform that integrates appointment scheduling, electronic health records, billing, and telemedicine capabilities.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop',
    client: 'HealthFirst Medical',
    industry: 'Healthcare',
    projectType: 'Enterprise Software',
    duration: '12 months',
    teamSize: '15 developers',
    technologies: ['Angular', 'Java Spring', 'MySQL', 'Docker', 'Kubernetes'],
    metrics: [
      { label: 'Efficiency', value: '70%', description: 'Administrative time saved' },
      { label: 'Patient Satisfaction', value: '4.8/5', description: 'Average rating' },
      { label: 'Uptime', value: '99.9%', description: 'System availability' }
    ],
    status: 'published',
    featured: false,
    publishedAt: new Date('2024-09-10')
  },
  {
    title: 'FinTech Mobile Banking',
    slug: 'fintech-mobile-banking',
    subtitle: 'Banking reimagined for mobile',
    description: 'A modern mobile banking application with advanced security features, instant payments, and intelligent financial insights.',
    excerpt: 'Revolutionary mobile banking app with cutting-edge security and smart financial management.',
    content: '<h2>Innovation in Banking</h2><p>We built a mobile-first banking platform that combines security with simplicity, offering features like biometric authentication, instant transfers, and AI-powered budgeting tools.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=800&fit=crop',
    client: 'NeoBank',
    industry: 'Finance',
    projectType: 'Mobile Application',
    duration: '10 months',
    teamSize: '10 developers',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS', 'Blockchain'],
    metrics: [
      { label: 'Users', value: '500K+', description: 'Active monthly users' },
      { label: 'Transactions', value: '$2B+', description: 'Processed annually' },
      { label: 'App Rating', value: '4.9/5', description: 'Store ratings' }
    ],
    status: 'published',
    featured: true,
    publishedAt: new Date('2024-12-01')
  }
];

const sampleBlogs = [
  {
    title: 'The Future of Web Development in 2025',
    slug: 'future-of-web-development-2025',
    excerpt: 'Exploring emerging trends and technologies that will shape web development in the coming year.',
    content: '<h2>Introduction</h2><p>Web development is evolving at an unprecedented pace. In this article, we explore the key trends that will define 2025.</p><h2>Key Trends</h2><h3>1. AI-Powered Development</h3><p>AI tools are becoming integral to the development process, from code generation to testing and optimization.</p><h3>2. WebAssembly Growth</h3><p>WebAssembly is enabling near-native performance in browsers, opening new possibilities for web applications.</p><h3>3. Edge Computing</h3><p>Edge computing is bringing computation closer to users, reducing latency and improving performance.</p><h2>Conclusion</h2><p>The future of web development is exciting, with new technologies making apps faster, smarter, and more capable than ever.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop',
    category: 'Development',
    tags: ['Web Development', 'Technology Trends', 'AI', 'WebAssembly'],
    readingTime: 8,
    status: 'published',
    featured: true,
    views: 1250,
    publishedAt: new Date('2025-01-05')
  },
  {
    title: 'Designing for Accessibility: Best Practices',
    slug: 'designing-for-accessibility-best-practices',
    excerpt: 'A comprehensive guide to creating inclusive digital experiences that work for everyone.',
    content: '<h2>Why Accessibility Matters</h2><p>Accessibility isn\'t just about compliance—it\'s about creating better experiences for all users.</p><h2>Core Principles</h2><h3>Perceivable</h3><p>Information must be presentable to users in ways they can perceive.</p><h3>Operable</h3><p>User interface components must be operable by all users.</p><h3>Understandable</h3><p>Information and operation must be understandable.</p><h3>Robust</h3><p>Content must be robust enough to work with various technologies.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=800&fit=crop',
    category: 'Design',
    tags: ['Accessibility', 'UX Design', 'Web Standards', 'Inclusive Design'],
    readingTime: 12,
    status: 'published',
    featured: true,
    views: 890,
    publishedAt: new Date('2024-12-28')
  },
  {
    title: 'Scaling Your SaaS Business: Lessons Learned',
    slug: 'scaling-saas-business-lessons-learned',
    excerpt: 'Practical insights from growing a SaaS company from 0 to 10,000 customers.',
    content: '<h2>The Journey</h2><p>Scaling a SaaS business requires more than just great product—it demands strategic thinking, operational excellence, and customer focus.</p><h2>Key Lessons</h2><h3>Focus on Customer Success</h3><p>Happy customers are your best marketing tool. Invest in customer success early.</p><h3>Build for Scale</h3><p>Technical debt will slow you down. Build with scalability in mind from day one.</p><h3>Measure Everything</h3><p>Data-driven decisions are critical. Track metrics that matter and act on insights.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
    category: 'Business',
    tags: ['SaaS', 'Entrepreneurship', 'Growth', 'Startups'],
    readingTime: 10,
    status: 'published',
    featured: false,
    views: 654,
    publishedAt: new Date('2024-12-15')
  },
  {
    title: 'React Server Components: A Deep Dive',
    slug: 'react-server-components-deep-dive',
    excerpt: 'Understanding React Server Components and how they\'re changing the way we build React applications.',
    content: '<h2>What Are Server Components?</h2><p>React Server Components represent a new paradigm in React development, allowing components to render on the server.</p><h2>Benefits</h2><ul><li>Zero bundle size for server components</li><li>Direct backend access</li><li>Improved performance</li><li>Better SEO</li></ul><h2>Getting Started</h2><p>Learn how to integrate Server Components into your Next.js application.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=800&fit=crop',
    category: 'Development',
    tags: ['React', 'Server Components', 'Next.js', 'JavaScript'],
    readingTime: 15,
    status: 'published',
    featured: true,
    views: 2100,
    publishedAt: new Date('2025-01-10')
  },
  {
    title: 'Building a Design System from Scratch',
    slug: 'building-design-system-from-scratch',
    excerpt: 'Step-by-step guide to creating a comprehensive design system for your organization.',
    content: '<h2>Why Design Systems Matter</h2><p>A design system ensures consistency, improves collaboration, and speeds up development.</p><h2>Components of a Design System</h2><h3>Design Tokens</h3><p>Colors, typography, spacing—the building blocks of your design.</p><h3>Component Library</h3><p>Reusable UI components with clear documentation.</p><h3>Guidelines</h3><p>Patterns and best practices for using the system.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=800&fit=crop',
    category: 'Design',
    tags: ['Design Systems', 'UI/UX', 'Component Library', 'Frontend'],
    readingTime: 18,
    status: 'published',
    featured: false,
    views: 1420,
    publishedAt: new Date('2024-12-20')
  }
];

async function seedData() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get models
    const CaseStudy = mongoose.model('CaseStudy', caseStudySchema);
    const Blog = mongoose.model('Blog', blogSchema);
    const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);
    const AdminUser = mongoose.model('AdminUser', adminUserSchema);

    // Get admin user for author reference
    const adminUser = await AdminUser.findOne();
    if (!adminUser) {
      console.log('⚠️  No admin user found. Please run seed-admin.js first.');
      process.exit(1);
    }

    console.log(`📝 Using admin user: ${adminUser.username}`);

    // Seed Blog Categories
    console.log('\n📚 Seeding blog categories...');
    await BlogCategory.deleteMany({});
    const categories = await BlogCategory.insertMany(sampleCategories);
    console.log(`✅ Created ${categories.length} blog categories`);

    // Seed Case Studies
    console.log('\n🎨 Seeding case studies...');
    await CaseStudy.deleteMany({});
    const caseStudiesWithAuthor = sampleCaseStudies.map(cs => ({
      ...cs,
      author: adminUser._id
    }));
    const caseStudies = await CaseStudy.insertMany(caseStudiesWithAuthor);
    console.log(`✅ Created ${caseStudies.length} case studies`);

    // Seed Blogs
    console.log('\n📝 Seeding blog posts...');
    await Blog.deleteMany({});
    const blogsWithAuthor = sampleBlogs.map(blog => ({
      ...blog,
      author: adminUser._id
    }));
    const blogs = await Blog.insertMany(blogsWithAuthor);
    console.log(`✅ Created ${blogs.length} blog posts`);

    console.log('\n✨ All data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${categories.length} blog categories`);
    console.log(`   - ${caseStudies.length} case studies`);
    console.log(`   - ${blogs.length} blog posts`);
    console.log('\n🚀 You can now view the content in your application!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

