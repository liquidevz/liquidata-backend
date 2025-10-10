const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger setup
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Liquidata API',
    version: '2.0.0',
    description: 'Enhanced Calculator API with Admin Management and Indian Pricing (INR)',
    contact: {
      name: 'Liquidata API Support',
      email: 'connect@liquidata.dev'
    }
  },
  servers: [
    { 
      url: process.env.NODE_ENV === 'production' 
        ? 'https://liquidata-backend.onrender.com' 
        : `http://localhost:${PORT}`,
      description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
    }
  ],
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
    '/api/admin/setup/check': {
      get: {
        summary: 'Check if admin setup is needed',
        tags: ['Admin Setup'],
        responses: {
          200: {
            description: 'Admin setup status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    hasAdmin: { type: 'boolean' },
                    adminCount: { type: 'number' },
                    needsSetup: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/setup/first': {
      post: {
        summary: 'First-time admin setup (no auth required)',
        tags: ['Admin Setup'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  email: { type: 'string', format: 'email', example: 'admin@liquidata.com' },
                  password: { type: 'string', minLength: 8, example: 'SecurePassword123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'First admin created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
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
          400: { description: 'Admin already exists or validation error' }
        }
      }
    },
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
    '/api/admin/me': {
      get: {
        summary: 'Get current admin profile',
        tags: ['Admin Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current admin profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/users': {
      get: {
        summary: 'Get all admin users (Super Admin only)',
        tags: ['Admin Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of admin users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    admins: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          username: { type: 'string' },
                          email: { type: 'string' },
                          role: { type: 'string' },
                          isActive: { type: 'boolean' },
                          createdAt: { type: 'string' }
                        }
                      }
                    },
                    total: { type: 'number' }
                  }
                }
              }
            }
          },
          403: { description: 'Forbidden - Super Admin only' }
        }
      },
      post: {
        summary: 'Create new admin user (Super Admin only)',
        tags: ['Admin Management'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'newadmin' },
                  email: { type: 'string', format: 'email', example: 'newadmin@liquidata.com' },
                  password: { type: 'string', minLength: 8, example: 'SecurePass123' },
                  role: { type: 'string', enum: ['admin', 'super_admin'], default: 'admin' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Admin user created successfully' },
          400: { description: 'Validation error or duplicate user' },
          403: { description: 'Forbidden - Super Admin only' }
        }
      }
    },
    '/api/admin/users/{id}': {
      get: {
        summary: 'Get admin user by ID',
        tags: ['Admin Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Admin user details' },
          403: { description: 'Forbidden' },
          404: { description: 'Admin not found' }
        }
      },
      put: {
        summary: 'Update admin user',
        tags: ['Admin Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['admin', 'super_admin'] },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Admin user updated successfully' },
          403: { description: 'Forbidden' },
          404: { description: 'Admin not found' }
        }
      },
      delete: {
        summary: 'Delete admin user (Super Admin only)',
        tags: ['Admin Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Admin user deleted successfully' },
          400: { description: 'Cannot delete own account' },
          403: { description: 'Forbidden - Super Admin only' },
          404: { description: 'Admin not found' }
        }
      }
    },
    '/api/admin/users/{id}/password': {
      put: {
        summary: 'Change admin password',
        tags: ['Admin Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newPassword'],
                properties: {
                  currentPassword: { type: 'string', description: 'Required when changing own password' },
                  newPassword: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Password changed successfully' },
          401: { description: 'Current password incorrect' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/api/admin/users/{id}/toggle-active': {
      patch: {
        summary: 'Toggle admin active status (Super Admin only)',
        tags: ['Admin Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Admin status toggled successfully' },
          400: { description: 'Cannot deactivate own account' },
          403: { description: 'Forbidden - Super Admin only' },
          404: { description: 'Admin not found' }
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
    '/api/admin/calculator': {
      put: {
        summary: 'Update calculator configuration',
        tags: ['Calculator'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  currency: { type: 'string' },
                  basePrice: { type: 'number' },
                  steps: { type: 'array' },
                  pricingRules: { type: 'object' },
                  pricingConfig: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Calculator updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    calculator: { $ref: '#/components/schemas/Calculator' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          500: { description: 'Failed to update calculator' }
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
    },
    '/api/calculator-submissions': {
      get: {
        summary: 'Get all calculator submissions (Admin only)',
        tags: ['Calculator Submissions'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of calculator submissions' }
        }
      },
      post: {
        summary: 'Create calculator submission (Public)',
        tags: ['Calculator Submissions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['selections', 'result'],
                properties: {
                  selections: { type: 'object' },
                  result: { type: 'object' },
                  contactInfo: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Calculator submission created' }
        }
      }
    },
    '/api/admin/seed-calculator': {
      post: {
        summary: 'Seed calculator configuration (Admin only)',
        tags: ['Calculator'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Calculator seeded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    stepCount: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route - API landing page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liquidata API - Backend Server</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 900px;
            width: 100%;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 50px;
            margin-top: 15px;
            font-size: 0.9rem;
        }
        
        .status-dot {
            width: 10px;
            height: 10px;
            background: #4ade80;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h2 {
            color: #333;
            font-size: 1.5rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .icon {
            width: 24px;
            height: 24px;
        }
        
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .card:hover {
            border-color: #667eea;
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
        }
        
        .card h3 {
            color: #667eea;
            font-size: 1.2rem;
            margin-bottom: 10px;
        }
        
        .card p {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.6;
        }
        
        .endpoint-list {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-top: 15px;
        }
        
        .endpoint {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .endpoint:last-child {
            border-bottom: none;
        }
        
        .method {
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            min-width: 60px;
            text-align: center;
        }
        
        .method.get { background: #dbeafe; color: #1e40af; }
        .method.post { background: #dcfce7; color: #166534; }
        .method.put { background: #fef3c7; color: #92400e; }
        .method.delete { background: #fee2e2; color: #991b1b; }
        .method.patch { background: #e0e7ff; color: #3730a3; }
        
        .endpoint-path {
            flex: 1;
            font-family: 'Courier New', monospace;
            color: #334155;
            font-size: 0.9rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .stat {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        
        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Liquidata API</h1>
            <p>Backend Server & REST API</p>
            <div class="status-badge">
                <span class="status-dot"></span>
                <span>Server Running</span>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Quick Links
                </h2>
                <div class="card-grid">
                    <a href="/api-docs" class="card">
                        <h3>📚 API Documentation</h3>
                        <p>Interactive Swagger UI with all endpoints, request/response examples, and testing tools</p>
                    </a>
                    <a href="/health" class="card">
                        <h3>❤️ Health Check</h3>
                        <p>Check server status and uptime. Returns JSON with current timestamp</p>
                    </a>
                    <a href="/api/admin/setup/check" class="card">
                        <h3>🔐 Admin Setup</h3>
                        <p>Check if admin setup is needed. Use for first-time configuration</p>
                    </a>
                </div>
            </div>
            
            <div class="section">
                <h2>
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    API Statistics
                </h2>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">12+</div>
                        <div class="stat-label">Endpoints</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">v2.0</div>
                        <div class="stat-label">API Version</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">JWT</div>
                        <div class="stat-label">Auth Method</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">REST</div>
                        <div class="stat-label">API Type</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                    Main Endpoints
                </h2>
                <div class="endpoint-list">
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/health</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api-docs</span>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span class="endpoint-path">/api/admin/login</span>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span class="endpoint-path">/api/admin/setup/first</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/admin/users</span>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span class="endpoint-path">/api/contact-submissions</span>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span class="endpoint-path">/api/calculator-submissions</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/calculator</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    Documentation
                </h2>
                <p style="color: #64748b; margin-bottom: 15px;">
                    For detailed API documentation, authentication guides, and code examples, visit:
                </p>
                <a href="/api-docs" class="btn">View Full Documentation →</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Liquidata Backend API • Built with Express.js & MongoDB</p>
            <p style="margin-top: 10px; font-size: 0.85rem;">
                Port: ${PORT} • Environment: ${process.env.NODE_ENV || 'development'}
            </p>
        </div>
    </div>
</body>
</html>
  `;
  
  res.send(html);
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://myliquidata:myliquidata@liquidata-backend.pje93kc.mongodb.net/?retryWrites=true&w=majority&appName=liquidata-backend')
  .then(async () => {
    console.log('MongoDB connected successfully.');
    // Auto-seed calculator configuration
    const { autoSeedCalculator } = require('./auto-seed-calculator');
    await autoSeedCalculator(Calculator);
  })
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

// ============= ADMIN AUTHENTICATION & MANAGEMENT APIs =============

// Check if any admin exists (for first-time setup)
app.get('/api/admin/setup/check', async (req, res) => {
  try {
    const adminCount = await AdminUser.countDocuments();
    res.json({ 
      hasAdmin: adminCount > 0,
      adminCount: adminCount,
      needsSetup: adminCount === 0
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

// First-time admin setup (no authentication required, only if no admins exist)
app.post('/api/admin/setup/first', async (req, res) => {
  try {
    // Check if any admin exists
    const existingAdmin = await AdminUser.findOne();
    
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists. Use login instead.' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({
      username,
      email,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'First admin created successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('First admin setup error:', error);
    res.status(500).json({ error: 'Failed to setup first admin' });
  }
});

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

// Get All Admins (Super Admin only)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can view all admin users' });
    }

    const admins = await AdminUser.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json({
      admins,
      total: admins.length
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});

// Get Single Admin (Admin can view themselves, Super Admin can view any)
app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Admin can only view their own profile, Super Admin can view any
    if (req.admin.role !== 'super_admin' && req.admin._id.toString() !== id) {
      return res.status(403).json({ error: 'You can only view your own profile' });
    }

    const admin = await AdminUser.findById(id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Failed to fetch admin user' });
  }
});

// Create Admin User (Super Admin only)
app.post('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create admin users' });
    }

    const { username, email, password, role = 'admin' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
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
      role: role === 'super_admin' ? 'super_admin' : 'admin',
      isActive: true
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Update Admin User (Admin can update themselves, Super Admin can update any)
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    // Admin can only update their own profile (except role), Super Admin can update any
    if (req.admin.role !== 'super_admin' && req.admin._id.toString() !== id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Only super admin can change roles and active status
    if ((role || isActive !== undefined) && req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can change role or active status' });
    }

    const admin = await AdminUser.findById(id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Check if username/email already exists (excluding current user)
    if (username || email) {
      const existingAdmin = await AdminUser.findOne({
        _id: { $ne: id },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingAdmin) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
    }

    // Update fields
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (role && req.admin.role === 'super_admin') {
      admin.role = role === 'super_admin' ? 'super_admin' : 'admin';
    }
    if (isActive !== undefined && req.admin.role === 'super_admin') {
      admin.isActive = isActive;
    }

    await admin.save();

    res.json({
      message: 'Admin user updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Failed to update admin user' });
  }
});

// Change Admin Password
app.put('/api/admin/users/:id/password', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Admin can only change their own password, Super Admin can change any
    if (req.admin.role !== 'super_admin' && req.admin._id.toString() !== id) {
      return res.status(403).json({ error: 'You can only change your own password' });
    }

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const admin = await AdminUser.findById(id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // If changing own password, verify current password
    if (req.admin._id.toString() === id) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    // Update password
    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete Admin User (Super Admin only, cannot delete self)
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can delete admin users' });
    }

    const { id } = req.params;

    // Cannot delete self
    if (req.admin._id.toString() === id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const admin = await AdminUser.findById(id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    await AdminUser.findByIdAndDelete(id);

    res.json({ 
      message: 'Admin user deleted successfully',
      deletedAdmin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin user' });
  }
});

// Toggle Admin Active Status (Super Admin only)
app.patch('/api/admin/users/:id/toggle-active', authenticateAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can toggle admin status' });
    }

    const { id } = req.params;

    // Cannot deactivate self
    if (req.admin._id.toString() === id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    const admin = await AdminUser.findById(id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({ 
      message: `Admin user ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        id: admin._id,
        username: admin.username,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ error: 'Failed to toggle admin status' });
  }
});

// Get Current Admin Profile
app.get('/api/admin/me', authenticateAdmin, async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
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

// Comprehensive Dashboard API (Admin only)
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query; // 7d, 30d, 90d, 1y
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get all submissions
    const [
      calculatorSubmissions,
      contactSubmissions,
      recentCalculatorSubs,
      recentContactSubs,
      calculator
    ] = await Promise.all([
      CalculatorSubmission.find({ createdAt: { $gte: startDate } }).sort({ createdAt: -1 }),
      ContactSubmission.find({ createdAt: { $gte: startDate } }).sort({ createdAt: -1 }),
      CalculatorSubmission.find().sort({ createdAt: -1 }).limit(10),
      ContactSubmission.find().sort({ createdAt: -1 }).limit(10),
      Calculator.findOne({ isActive: true })
    ]);

    // Calculate previous period for comparison
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

    const [prevCalculatorCount, prevContactCount] = await Promise.all([
      CalculatorSubmission.countDocuments({ 
        createdAt: { $gte: prevStartDate, $lt: prevEndDate } 
      }),
      ContactSubmission.countDocuments({ 
        createdAt: { $gte: prevStartDate, $lt: prevEndDate } 
      })
    ]);

    // Calculate growth rates
    const calcGrowth = prevCalculatorCount > 0 
      ? ((calculatorSubmissions.length - prevCalculatorCount) / prevCalculatorCount) * 100 
      : 100;
    
    const contactGrowth = prevContactCount > 0 
      ? ((contactSubmissions.length - prevContactCount) / prevContactCount) * 100 
      : 100;

    // Aggregate project types
    const projectTypes = {};
    calculatorSubmissions.forEach(sub => {
      const type = sub.selections?.projectType || 'Unknown';
      projectTypes[type] = (projectTypes[type] || 0) + 1;
    });

    // Aggregate industries
    const industries = {};
    calculatorSubmissions.forEach(sub => {
      const inds = sub.selections?.selectedIndustries || [];
      inds.forEach(ind => {
        industries[ind] = (industries[ind] || 0) + 1;
      });
    });

    // Aggregate features
    const features = {};
    calculatorSubmissions.forEach(sub => {
      const feats = sub.selections?.selectedFeatures || [];
      feats.forEach(feat => {
        features[feat] = (features[feat] || 0) + 1;
      });
    });

    // Calculate average project value
    let totalValue = 0;
    let valueCount = 0;
    calculatorSubmissions.forEach(sub => {
      if (sub.result?.finalPrice) {
        totalValue += sub.result.finalPrice;
        valueCount++;
      }
    });
    const avgProjectValue = valueCount > 0 ? Math.round(totalValue / valueCount) : calculator?.basePrice || 0;

    // Calculate daily submissions for chart
    const dailyData = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyData[dateKey] = {
        calculator: 0,
        contact: 0,
        total: 0
      };
    }

    calculatorSubmissions.forEach(sub => {
      const dateKey = sub.createdAt.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].calculator++;
        dailyData[dateKey].total++;
      }
    });

    contactSubmissions.forEach(sub => {
      const dateKey = sub.createdAt.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].contact++;
        dailyData[dateKey].total++;
      }
    });

    // Get top project types (sorted)
    const topProjectTypes = Object.entries(projectTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    // Get top industries (sorted)
    const topIndustries = Object.entries(industries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([industry, count]) => ({ industry, count }));

    // Get top features (sorted)
    const topFeatures = Object.entries(features)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([feature, count]) => ({ feature, count }));

    // Response
    res.json({
      timeRange,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: daysDiff
      },
      overview: {
        totalLeads: calculatorSubmissions.length + contactSubmissions.length,
        calculatorSubmissions: calculatorSubmissions.length,
        contactSubmissions: contactSubmissions.length,
        totalGrowth: Math.round((calcGrowth + contactGrowth) / 2),
        calculatorGrowth: Math.round(calcGrowth),
        contactGrowth: Math.round(contactGrowth),
        avgProjectValue: avgProjectValue,
        currency: calculator?.currency || 'INR',
        conversionRate: calculatorSubmissions.length > 0 
          ? Math.round((contactSubmissions.length / calculatorSubmissions.length) * 100) 
          : 0
      },
      trends: {
        daily: Object.entries(dailyData).map(([date, data]) => ({
          date,
          ...data
        })),
        projectTypes: topProjectTypes,
        industries: topIndustries,
        features: topFeatures
      },
      recentActivity: {
        calculatorSubmissions: recentCalculatorSubs.map(sub => ({
          id: sub._id,
          projectType: sub.selections?.projectType,
          estimatedValue: sub.result?.finalPrice,
          currency: sub.result?.currency || 'INR',
          contactEmail: sub.contactInfo?.email,
          contactName: sub.contactInfo?.name,
          createdAt: sub.createdAt
        })),
        contactSubmissions: recentContactSubs.map(sub => ({
          id: sub._id,
          name: sub.name,
          email: sub.email,
          company: sub.company,
          budget: sub.budget,
          createdAt: sub.createdAt
        }))
      },
      performance: {
        avgResponseTime: '24h', // Placeholder
        systemUptime: 99.9, // Placeholder
        activeCalculatorVersion: calculator?.version || '1.0',
        totalSteps: calculator?.steps?.length || 0
      }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
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

// Contact Submissions (Admin only - view submissions)
app.get('/api/contact-submissions', authenticateAdmin, async (req, res) => {
  try {
    const submissions = await ContactSubmission.find({}).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Public endpoint - anyone can submit contact form
app.post('/api/contact-submissions', async (req, res) => {
  try {
    const submission = await ContactSubmission.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// Admin only - delete contact submission
app.delete('/api/contact-submissions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await ContactSubmission.findByIdAndDelete(id);
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// Calculator Submissions (Admin only - view submissions)
app.get('/api/calculator-submissions', authenticateAdmin, async (req, res) => {
  try {
    const submissions = await CalculatorSubmission.find({}).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calculator submissions' });
  }
});

// Public endpoint - anyone can submit calculator data
app.post('/api/calculator-submissions', async (req, res) => {
  try {
    const submission = await CalculatorSubmission.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save calculator submission' });
  }
});

// Admin only - delete calculator submission
app.delete('/api/calculator-submissions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await CalculatorSubmission.findByIdAndDelete(id);
    res.json({ message: 'Calculator submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete calculator submission' });
  }
});

// Admin only - seed calculator configuration
app.post('/api/admin/seed-calculator', authenticateAdmin, async (req, res) => {
  try {
    const { autoSeedCalculator } = require('./auto-seed-calculator');
    const seeded = await autoSeedCalculator(Calculator);
    
    if (seeded) {
      const calculator = await Calculator.findOne({ isActive: true });
      res.json({ 
        message: 'Calculator seeded successfully!',
        stepCount: calculator.steps.length
      });
    } else {
      const calculator = await Calculator.findOne({ isActive: true });
      res.json({ 
        message: 'Calculator already exists',
        stepCount: calculator.steps.length
      });
    }
  } catch (error) {
    console.error('Seed calculator error:', error);
    res.status(500).json({ error: 'Failed to seed calculator' });
  }
});

// Seed Admin User (One-time setup)
app.post('/api/seed-admin', async (req, res) => {
  try {
    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists', username: 'admin' });
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await AdminUser.create({
      username: 'admin',
      email: 'admin@liquidata.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });
    
    res.json({ 
      message: 'Admin user created successfully',
      username: 'admin',
      password: 'admin123'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});