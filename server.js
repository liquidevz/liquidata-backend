const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger setup
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DevFlow Calculator API',
    version: '2.0.0',
    description: 'Enhanced Calculator API with Admin Management and Indian Pricing (INR)',
    contact: {
      name: 'DevFlow API Support',
      email: 'api@devflow.com'
    }
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Calculator: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'DevFlow Project Calculator' },
          description: { type: 'string', example: 'Get accurate estimates for your software & hardware development project' },
          currency: { type: 'string', example: 'INR' },
          basePrice: { type: 'number', example: 50000 },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                subtitle: { type: 'string' },
                type: { type: 'string', enum: ['single-select', 'multi-select', 'contact', 'estimate'] },
                required: { type: 'boolean' },
                condition: { type: 'string' },
                order: { type: 'number' },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      key: { type: 'string' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      icon: { type: 'string' },
                      multiplier: { type: 'number' },
                      addCost: { type: 'number' },
                      isPopular: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          },
          pricingRules: { type: 'object' },
          pricingConfig: {
            type: 'object',
            properties: {
              minPrice: { type: 'number', example: 25000 },
              maxPrice: { type: 'number', example: 5000000 },
              estimateVariance: { type: 'number', example: 0.2 },
              gstRate: { type: 'number', example: 0.18 }
            }
          }
        }
      },
      PriceCalculation: {
        type: 'object',
        properties: {
          basePrice: { type: 'number', example: 50000 },
          finalPrice: { type: 'number', example: 125000 },
          lowEstimate: { type: 'number', example: 100000 },
          highEstimate: { type: 'number', example: 150000 },
          gstAmount: { type: 'number', example: 22500 },
          totalWithGST: { type: 'number', example: 147500 },
          currency: { type: 'string', example: 'INR' },
          estimateRange: { type: 'string', example: '₹1,00,000 - ₹1,50,000' },
          formattedPrice: { type: 'string', example: '₹1,25,000' },
          formattedTotal: { type: 'string', example: '₹1,47,500' },
          breakdown: {
            type: 'object',
            properties: {
              adjustments: { type: 'array' },
              features: { type: 'array' },
              services: { type: 'array' },
              platforms: { type: 'array' },
              integrations: { type: 'array' },
              techStack: { type: 'array' },
              support: { type: 'array' }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/admin/login': {
      post: {
        summary: 'Admin login',
        tags: ['Admin Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    admin: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/calculator': {
      get: {
        summary: 'Get calculator configuration',
        tags: ['Calculator'],
        responses: {
          200: {
            description: 'Calculator configuration',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Calculator' }
              }
            }
          }
        }
      }
    },
    '/api/calculator/calculate': {
      post: {
        summary: 'Calculate project price with Indian pricing (INR)',
        tags: ['Calculator'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['selections'],
                properties: {
                  selections: {
                    type: 'object',
                    properties: {
                      projectType: { type: 'string', example: 'web-app' },
                      selectedIndustries: { type: 'array', items: { type: 'string' }, example: ['Healthcare', 'SaaS'] },
                      selectedServices: { type: 'array', items: { type: 'string' }, example: ['web-development', 'ui-ux-design'] },
                      selectedFeatures: { type: 'array', items: { type: 'string' }, example: ['User management', 'Authentication'] },
                      selectedPlatforms: { type: 'array', items: { type: 'string' }, example: ['web', 'ios'] },
                      selectedIntegrations: { type: 'array', items: { type: 'string' }, example: ['stripe', 'sendgrid'] },
                      selectedTechStack: { type: 'array', items: { type: 'string' }, example: ['react-nextjs', 'nodejs'] },
                      scope: { type: 'string', example: 'standard' },
                      team: { type: 'string', example: 'small' },
                      timeline: { type: 'string', example: 'standard' },
                      support: { type: 'string', example: 'standard' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Calculated price with GST and breakdown',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PriceCalculation' }
              }
            }
          },
          400: { description: 'Invalid selections' },
          404: { description: 'Calculator configuration not found' }
        }
      }
    },
    '/api/calculator/steps': {
      post: {
        summary: 'Get conditional calculator steps',
        tags: ['Calculator'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentSelections: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Available steps based on current selections',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    steps: { type: 'array' },
                    totalSteps: { type: 'number' },
                    currentStep: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/calculator': {
      put: {
        summary: 'Update calculator configuration (Admin only)',
        tags: ['Admin - Calculator'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Calculator' }
            }
          }
        },
        responses: {
          200: { description: 'Calculator updated successfully' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/admin/pricing': {
      get: {
        summary: 'Get pricing configuration (Admin only)',
        tags: ['Admin - Pricing'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Pricing configuration',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    basePrice: { type: 'number' },
                    currency: { type: 'string' },
                    pricingRules: { type: 'object' },
                    pricingConfig: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update pricing configuration (Admin only)',
        tags: ['Admin - Pricing'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  basePrice: { type: 'number', example: 50000 },
                  pricingRules: { type: 'object' },
                  pricingConfig: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Pricing updated successfully' }
        }
      }
    },
    '/api/admin/pricing/{ruleType}': {
      put: {
        summary: 'Update individual pricing rule (Admin only)',
        tags: ['Admin - Pricing'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'ruleType',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['projectTypeMultipliers', 'industryMultipliers', 'scopeMultipliers', 'teamMultipliers', 'timelineMultipliers', 'featureCosts', 'serviceCosts', 'platformCosts', 'integrationCosts', 'techStackCosts', 'supportCosts']
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rules: {
                    type: 'object',
                    example: {
                      'web-app': 1.0,
                      'mobile-app': 1.2,
                      'website': 0.5
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Pricing rule updated successfully' }
        }
      }
    },
    '/api/admin/calculator/analytics': {
      get: {
        summary: 'Get calculator analytics (Admin only)',
        tags: ['Admin - Analytics'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          }
        ],
        responses: {
          200: {
            description: 'Calculator analytics data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalCalculations: { type: 'number' },
                    averageProjectValue: { type: 'number' },
                    popularProjectTypes: { type: 'array', items: { type: 'string' } },
                    popularFeatures: { type: 'array', items: { type: 'string' } },
                    conversionRate: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/contact-form': {
      get: {
        summary: 'Get contact form configuration',
        tags: ['Contact Form'],
        responses: {
          200: { description: 'Contact form configuration' }
        }
      }
    },
    '/api/contact-submissions': {
      get: {
        summary: 'Get all contact submissions',
        tags: ['Contact Submissions'],
        responses: {
          200: { description: 'List of contact submissions' }
        }
      },
      post: {
        summary: 'Create new contact submission',
        tags: ['Contact Submissions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  company: { type: 'string', example: 'Tech Corp' },
                  goal: { type: 'string', example: 'Build a web application' },
                  date: { type: 'string', example: '2024-12-31' },
                  budget: { type: 'string', example: '4l-8l' },
                  email: { type: 'string', format: 'email', example: 'john@techcorp.com' },
                  details: { type: 'string', example: 'We need a custom CRM system' },
                  privacyPolicy: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Submission created successfully' }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata')
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

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
  basePrice: { type: Number, default: 50000 }, // Base price in INR
  steps: [{
    id: String,
    title: String,
    subtitle: String,
    type: { type: String, enum: ['single-select', 'multi-select', 'contact', 'estimate'] },
    required: { type: Boolean, default: true },
    condition: String, // JSON condition for when to show this step
    order: { type: Number, default: 0 },
    options: [{
      key: String,
      title: String,
      description: String,
      icon: String,
      multiplier: { type: Number, default: 1 },
      addCost: { type: Number, default: 0 }, // Additional cost in INR
      isPopular: { type: Boolean, default: false }
    }]
  }],
  pricingRules: {
    // Base multipliers for different project types
    projectTypeMultipliers: { type: Map, of: Number },
    // Industry-specific complexity multipliers
    industryMultipliers: { type: Map, of: Number },
    // Project scope multipliers
    scopeMultipliers: { type: Map, of: Number },
    // Team size multipliers
    teamMultipliers: { type: Map, of: Number },
    // Timeline urgency multipliers
    timelineMultipliers: { type: Map, of: Number },
    // Feature-specific costs
    featureCosts: { type: Map, of: Number },
    // Service-specific costs
    serviceCosts: { type: Map, of: Number },
    // Platform-specific costs
    platformCosts: { type: Map, of: Number },
    // Integration costs
    integrationCosts: { type: Map, of: Number },
    // Technology stack costs
    techStackCosts: { type: Map, of: Number },
    // Support & maintenance costs
    supportCosts: { type: Map, of: Number }
  },
  // Pricing configuration
  pricingConfig: {
    minPrice: { type: Number, default: 25000 }, // Minimum project price
    maxPrice: { type: Number, default: 5000000 }, // Maximum project price
    estimateVariance: { type: Number, default: 0.2 }, // ±20% variance for estimates
    gstRate: { type: Number, default: 0.18 }, // 18% GST
    discountRules: [{
      condition: String, // JSON condition
      discountPercent: Number,
      description: String
    }]
  },
  isActive: { type: Boolean, default: true },
  version: { type: String, default: '1.0' }
}, { timestamps: true });

// Contact Form Schema
const contactFormSchema = new mongoose.Schema({
  title: { type: String, default: 'Get In Touch' },
  subtitle: { type: String, default: 'Fill the form below:' },
  budgetOptions: [{
    value: String,
    label: String
  }],
  submitUrl: { type: String, default: 'https://form.thetaphaus.in/send-email' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Contact Submission Schema
const contactSubmissionSchema = new mongoose.Schema({
  name: String,
  company: String,
  goal: String,
  date: String,
  budget: String,
  email: String,
  details: String,
  privacyPolicy: Boolean
}, { timestamps: true });

// Calculator Submission Schema
const calculatorSubmissionSchema = new mongoose.Schema({
  selections: {
    projectType: String,
    selectedIndustries: [String],
    selectedServices: [String],
    selectedFeatures: [String],
    selectedPlatforms: [String],
    selectedIntegrations: [String],
    selectedTechStack: [String],
    scope: String,
    team: String,
    timeline: String,
    support: String
  },
  result: {
    basePrice: Number,
    finalPrice: Number,
    lowEstimate: Number,
    highEstimate: Number,
    gstAmount: Number,
    totalWithGST: Number,
    currency: String,
    estimateRange: String,
    formattedPrice: String,
    formattedTotal: String,
    breakdown: Object
  },
  contactInfo: {
    name: String,
    email: String,
    phone: String,
    company: String
  }
}, { timestamps: true });

const AdminUser = mongoose.model('AdminUser', adminUserSchema);
const Calculator = mongoose.model('Calculator', calculatorSchema);
const ContactForm = mongoose.model('ContactForm', contactFormSchema);
const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);
const CalculatorSubmission = mongoose.model('CalculatorSubmission', calculatorSubmissionSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'devflow_calculator_secret_2024';

// Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await AdminUser.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid token or inactive admin.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Enhanced pricing calculation function
const calculateProjectPrice = (calculator, selections) => {
  let basePrice = calculator.basePrice;
  let breakdown = {
    basePrice: basePrice,
    adjustments: [],
    features: [],
    services: [],
    platforms: [],
    integrations: [],
    techStack: [],
    support: []
  };

  // Project type multiplier
  if (selections.projectType && calculator.pricingRules?.projectTypeMultipliers) {
    const multiplier = calculator.pricingRules.projectTypeMultipliers.get(selections.projectType) || 1;
    basePrice *= multiplier;
    breakdown.adjustments.push({ 
      type: 'Project Type', 
      factor: multiplier, 
      description: `${selections.projectType} project complexity` 
    });
  }

  // Industry complexity multipliers
  if (selections.selectedIndustries && calculator.pricingRules?.industryMultipliers) {
    selections.selectedIndustries.forEach(industry => {
      const multiplier = calculator.pricingRules.industryMultipliers.get(industry) || 1;
      if (multiplier !== 1) {
        basePrice *= multiplier;
        breakdown.adjustments.push({ 
          type: `Industry: ${industry}`, 
          factor: multiplier,
          description: `${industry} industry complexity`
        });
      }
    });
  }

  // Service costs
  if (selections.selectedServices && calculator.pricingRules?.serviceCosts) {
    selections.selectedServices.forEach(service => {
      const cost = calculator.pricingRules.serviceCosts.get(service) || 0;
      if (cost > 0) {
        basePrice += cost;
        breakdown.services.push({ 
          service: service, 
          cost: cost,
          description: `${service} service`
        });
      }
    });
  }

  // Feature costs
  if (selections.selectedFeatures && calculator.pricingRules?.featureCosts) {
    selections.selectedFeatures.forEach(feature => {
      const cost = calculator.pricingRules.featureCosts.get(feature) || 0;
      if (cost > 0) {
        basePrice += cost;
        breakdown.features.push({ 
          feature: feature, 
          cost: cost,
          description: `${feature} feature implementation`
        });
      }
    });
  }

  // Platform costs
  if (selections.selectedPlatforms && calculator.pricingRules?.platformCosts) {
    selections.selectedPlatforms.forEach(platform => {
      const cost = calculator.pricingRules.platformCosts.get(platform) || 0;
      if (cost > 0) {
        basePrice += cost;
        breakdown.platforms.push({ 
          platform: platform, 
          cost: cost,
          description: `${platform} platform development`
        });
      }
    });
  }

  // Integration costs
  if (selections.selectedIntegrations && calculator.pricingRules?.integrationCosts) {
    selections.selectedIntegrations.forEach(integration => {
      const cost = calculator.pricingRules.integrationCosts.get(integration) || 0;
      if (cost > 0) {
        basePrice += cost;
        breakdown.integrations.push({ 
          integration: integration, 
          cost: cost,
          description: `${integration} integration`
        });
      }
    });
  }

  // Tech stack costs
  if (selections.selectedTechStack && calculator.pricingRules?.techStackCosts) {
    selections.selectedTechStack.forEach(tech => {
      const cost = calculator.pricingRules.techStackCosts.get(tech) || 0;
      if (cost > 0) {
        basePrice += cost;
        breakdown.techStack.push({ 
          tech: tech, 
          cost: cost,
          description: `${tech} technology implementation`
        });
      }
    });
  }

  // Scope multiplier
  if (selections.scope && calculator.pricingRules?.scopeMultipliers) {
    const multiplier = calculator.pricingRules.scopeMultipliers.get(selections.scope) || 1;
    basePrice *= multiplier;
    breakdown.adjustments.push({ 
      type: 'Project Scope', 
      factor: multiplier,
      description: `${selections.scope} scope complexity`
    });
  }

  // Team size multiplier
  if (selections.team && calculator.pricingRules?.teamMultipliers) {
    const multiplier = calculator.pricingRules.teamMultipliers.get(selections.team) || 1;
    basePrice *= multiplier;
    breakdown.adjustments.push({ 
      type: 'Team Size', 
      factor: multiplier,
      description: `${selections.team} team configuration`
    });
  }

  // Timeline urgency multiplier
  if (selections.timeline && calculator.pricingRules?.timelineMultipliers) {
    const multiplier = calculator.pricingRules.timelineMultipliers.get(selections.timeline) || 1;
    basePrice *= multiplier;
    breakdown.adjustments.push({ 
      type: 'Timeline', 
      factor: multiplier,
      description: `${selections.timeline} timeline requirement`
    });
  }

  // Support & maintenance costs
  if (selections.support && calculator.pricingRules?.supportCosts) {
    const cost = calculator.pricingRules.supportCosts.get(selections.support) || 0;
    if (cost > 0) {
      basePrice += cost;
      breakdown.support.push({ 
        support: selections.support, 
        cost: cost,
        description: `${selections.support} support package`
      });
    }
  }

  // Apply pricing constraints
  const minPrice = calculator.pricingConfig?.minPrice || 25000;
  const maxPrice = calculator.pricingConfig?.maxPrice || 5000000;
  const variance = calculator.pricingConfig?.estimateVariance || 0.2;
  const gstRate = calculator.pricingConfig?.gstRate || 0.18;

  // Ensure price is within bounds
  basePrice = Math.max(minPrice, Math.min(maxPrice, basePrice));

  // Calculate estimates with variance
  const finalPrice = Math.round(basePrice);
  const lowEstimate = Math.round(finalPrice * (1 - variance));
  const highEstimate = Math.round(finalPrice * (1 + variance));

  // Calculate GST
  const gstAmount = Math.round(finalPrice * gstRate);
  const totalWithGST = finalPrice + gstAmount;

  return {
    basePrice: calculator.basePrice,
    finalPrice: finalPrice,
    lowEstimate: lowEstimate,
    highEstimate: highEstimate,
    gstAmount: gstAmount,
    totalWithGST: totalWithGST,
    currency: calculator.currency || 'INR',
    breakdown: breakdown,
    estimateRange: `₹${lowEstimate.toLocaleString('en-IN')} - ₹${highEstimate.toLocaleString('en-IN')}`,
    formattedPrice: `₹${finalPrice.toLocaleString('en-IN')}`,
    formattedTotal: `₹${totalWithGST.toLocaleString('en-IN')}`
  };
};

// ============= ADMIN AUTHENTICATION APIs =============

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await AdminUser.findOne({ 
      $or: [{ username }, { email: username }],
      isActive: true 
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create Admin User (Super Admin only)
app.post('/api/admin/create', authenticateAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create admin users' });
    }

    const { username, email, password, role = 'admin' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const existingAdmin = await AdminUser.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({
      username,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// ============= CALCULATOR APIs =============

// Get Calculator Configuration
app.get('/api/calculator', async (req, res) => {
  try {
    let calculator = await Calculator.findOne({ isActive: true });
    if (!calculator) {
      // Create default calculator if none exists
      calculator = await Calculator.create({});
    }
    res.json(calculator);
  } catch (error) {
    console.error('Get calculator error:', error);
    res.status(500).json({ error: 'Failed to fetch calculator configuration' });
  }
});

// Update Calculator Configuration (Admin only)
app.put('/api/admin/calculator', authenticateAdmin, async (req, res) => {
  try {
    let calculator = await Calculator.findOne({ isActive: true });
    
    if (!calculator) {
      calculator = await Calculator.create(req.body);
    } else {
      calculator = await Calculator.findByIdAndUpdate(
        calculator._id, 
        { ...req.body, updatedAt: new Date() }, 
        { new: true }
      );
    }
    
    res.json({
      message: 'Calculator updated successfully',
      calculator
    });
  } catch (error) {
    console.error('Update calculator error:', error);
    res.status(500).json({ error: 'Failed to update calculator configuration' });
  }
});

// Calculate Project Price
app.post('/api/calculator/calculate', async (req, res) => {
  try {
    const { selections } = req.body;
    
    if (!selections) {
      return res.status(400).json({ error: 'Selections are required' });
    }

    const calculator = await Calculator.findOne({ isActive: true });
    
    if (!calculator) {
      return res.status(404).json({ error: 'Calculator configuration not found' });
    }
    
    const result = calculateProjectPrice(calculator, selections);
    
    res.json(result);
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ error: 'Failed to calculate project price' });
  }
});

// Get Calculator Steps with Conditional Logic
app.post('/api/calculator/steps', async (req, res) => {
  try {
    const { currentSelections } = req.body;
    const calculator = await Calculator.findOne({ isActive: true });
    
    if (!calculator) {
      return res.status(404).json({ error: 'Calculator configuration not found' });
    }
    
    // Filter steps based on conditions and sort by order
    const availableSteps = calculator.steps
      .filter(step => {
        if (!step.condition) return true;
        
        try {
          const condition = JSON.parse(step.condition);
          return evaluateCondition(condition, currentSelections);
        } catch {
          return true;
        }
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    res.json({ 
      steps: availableSteps,
      totalSteps: availableSteps.length,
      currentStep: currentSelections?.currentStep || 0
    });
  } catch (error) {
    console.error('Get steps error:', error);
    res.status(500).json({ error: 'Failed to get calculator steps' });
  }
});

// ============= ADMIN PRICING MANAGEMENT APIs =============

// Get Pricing Rules (Admin only)
app.get('/api/admin/pricing', authenticateAdmin, async (req, res) => {
  try {
    const calculator = await Calculator.findOne({ isActive: true });
    
    if (!calculator) {
      return res.status(404).json({ error: 'Calculator configuration not found' });
    }
    
    res.json({
      basePrice: calculator.basePrice,
      currency: calculator.currency,
      pricingRules: calculator.pricingRules,
      pricingConfig: calculator.pricingConfig
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing configuration' });
  }
});

// Update Pricing Rules (Admin only)
app.put('/api/admin/pricing', authenticateAdmin, async (req, res) => {
  try {
    const { basePrice, pricingRules, pricingConfig } = req.body;
    
    const calculator = await Calculator.findOne({ isActive: true });
    
    if (!calculator) {
      return res.status(404).json({ error: 'Calculator configuration not found' });
    }
    
    const updateData = {};
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (pricingRules) updateData.pricingRules = pricingRules;
    if (pricingConfig) updateData.pricingConfig = pricingConfig;
    
    const updatedCalculator = await Calculator.findByIdAndUpdate(
      calculator._id,
      updateData,
      { new: true }
    );
    
    res.json({
      message: 'Pricing configuration updated successfully',
      basePrice: updatedCalculator.basePrice,
      currency: updatedCalculator.currency,
      pricingRules: updatedCalculator.pricingRules,
      pricingConfig: updatedCalculator.pricingConfig
    });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ error: 'Failed to update pricing configuration' });
  }
});

// Update Individual Pricing Rule (Admin only)
app.put('/api/admin/pricing/:ruleType', authenticateAdmin, async (req, res) => {
  try {
    const { ruleType } = req.params;
    const { rules } = req.body;
    
    const validRuleTypes = [
      'projectTypeMultipliers',
      'industryMultipliers', 
      'scopeMultipliers',
      'teamMultipliers',
      'timelineMultipliers',
      'featureCosts',
      'serviceCosts',
      'platformCosts',
      'integrationCosts',
      'techStackCosts',
      'supportCosts'
    ];
    
    if (!validRuleTypes.includes(ruleType)) {
      return res.status(400).json({ error: 'Invalid rule type' });
    }
    
    const calculator = await Calculator.findOne({ isActive: true });
    
    if (!calculator) {
      return res.status(404).json({ error: 'Calculator configuration not found' });
    }
    
    // Convert rules object to Map
    const ruleMap = new Map(Object.entries(rules));
    
    const updatedCalculator = await Calculator.findByIdAndUpdate(
      calculator._id,
      { [`pricingRules.${ruleType}`]: ruleMap },
      { new: true }
    );
    
    res.json({
      message: `${ruleType} updated successfully`,
      [ruleType]: Object.fromEntries(updatedCalculator.pricingRules[ruleType] || new Map())
    });
  } catch (error) {
    console.error('Update pricing rule error:', error);
    res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

// Get Calculator Analytics (Admin only)
app.get('/api/admin/calculator/analytics', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // This would typically query calculation logs/submissions
    // For now, return basic stats
    const calculator = await Calculator.findOne({ isActive: true });
    const totalSubmissions = await ContactSubmission.countDocuments();
    
    res.json({
      totalCalculations: totalSubmissions, // Placeholder
      averageProjectValue: calculator?.basePrice || 0,
      popularProjectTypes: ['web-app', 'mobile-app', 'website'],
      popularFeatures: ['User management', 'Authentication', 'Payment processing'],
      conversionRate: 0.15 // Placeholder
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch calculator analytics' });
  }
});

// Simple condition evaluator
function evaluateCondition(condition, selections) {
  if (condition.type === 'equals') {
    return selections[condition.field] === condition.value;
  }
  if (condition.type === 'includes') {
    return selections[condition.field]?.includes(condition.value);
  }
  if (condition.type === 'not_equals') {
    return selections[condition.field] !== condition.value;
  }
  if (condition.type === 'exists') {
    return selections[condition.field] !== undefined && selections[condition.field] !== null;
  }
  return true;
}

// Contact Form APIs
app.get('/api/contact-form', async (req, res) => {
  try {
    let contactForm = await ContactForm.findOne({ isActive: true });
    if (!contactForm) {
      contactForm = await ContactForm.create({
        budgetOptions: [
          { value: "4l-8l", label: "₹4,00,000 - ₹8,00,000" },
          { value: "8l-20l", label: "₹8,00,000 - ₹20,00,000" },
          { value: "20l-40l", label: "₹20,00,000 - ₹40,00,000" },
          { value: "40l+", label: "₹40,00,000+" }
        ]
      });
    }
    res.json(contactForm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact form' });
  }
});

app.put('/api/contact-form', async (req, res) => {
  try {
    let contactForm = await ContactForm.findOne({ isActive: true });
    if (!contactForm) {
      contactForm = await ContactForm.create(req.body);
    } else {
      contactForm = await ContactForm.findByIdAndUpdate(contactForm._id, req.body, { new: true });
    }
    res.json(contactForm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact form' });
  }
});

// Contact Submissions
app.get('/api/contact-submissions', async (req, res) => {
  try {
    const submissions = await ContactSubmission.find({}).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.post('/api/contact-submissions', async (req, res) => {
  try {
    const submission = await ContactSubmission.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// Calculator Submissions
app.get('/api/calculator-submissions', async (req, res) => {
  try {
    const submissions = await CalculatorSubmission.find({}).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calculator submissions' });
  }
});

app.post('/api/calculator-submissions', async (req, res) => {
  try {
    const submission = await CalculatorSubmission.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save calculator submission' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});