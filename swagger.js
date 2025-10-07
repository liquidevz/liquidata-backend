const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Liquidata CMS API',
      version: '1.0.0',
      description: 'API for managing pages, components and hero sections',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {

        HeroComponent: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Build something incredible' },
            subtitle: { type: 'string', example: 'The future of development is here' },
            description: { type: 'string', example: 'Transform your ideas into reality with our cutting-edge platform designed for modern developers.' },
            announcement: { type: 'string', example: 'Exciting announcement 🎉' },
            buttonText: { type: 'string', example: 'Smart Calculator' },
            buttonUrl: { type: 'string', example: '/calculator' },
            secondaryButtonText: { type: 'string', example: 'Learn more' },
            secondaryButtonUrl: { type: 'string', example: '/#features' },
            isActive: { type: 'boolean', example: true }
          }
        },
        Logo: {
          type: 'object',
          properties: {
            url: { type: 'string', example: '/logo.svg' },
            altText: { type: 'string', example: 'Company Logo' },
            width: { type: 'number', example: 120 },
            height: { type: 'number', example: 40 },
            isActive: { type: 'boolean', example: true }
          }
        },
        LogoSection: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Main Logo Section' },
            logos: {
              type: 'array',
              items: { $ref: '#/components/schemas/Logo' }
            },
            text: { type: 'string', example: 'Liquidata' },
            showText: { type: 'boolean', example: false },
            isActive: { type: 'boolean', example: true }
          }
        },
        CTAComponent: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Ready to get started?' },
            description: { type: 'string', example: 'Join thousands of developers building the future.' },
            buttonText: { type: 'string', example: 'Start Building' },
            isActive: { type: 'boolean', example: true }
          }
        },
        StatsComponent: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Trusted by developers worldwide' },
            stats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', example: 'Active Users' },
                  value: { type: 'string', example: '10M+' }
                }
              }
            },
            isActive: { type: 'boolean', example: true }
          }
        },
        PricingComponent: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Simple, transparent pricing' },
            subtitle: { type: 'string', example: 'Choose the plan that works for you' },
            plans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Pro' },
                  price: { type: 'string', example: '$29' },
                  period: { type: 'string', example: 'month' },
                  features: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Unlimited projects', 'Priority support']
                  },
                  popular: { type: 'boolean', example: true }
                }
              }
            },
            isActive: { type: 'boolean', example: true }
          }
        },
        Component: {
          type: 'object',
          required: ['name', 'type', 'props'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated ID',
            },
            name: {
              type: 'string',
              description: 'Component name',
            },
            type: {
              type: 'string',
              enum: ['hero', 'text', 'button', 'image', 'card', 'testimonial', 'pricing'],
              description: 'Component type',
            },
            props: {
              type: 'object',
              description: 'Component properties',
            },
            order: {
              type: 'number',
              description: 'Display order',
              default: 0,
            },
            isActive: {
              type: 'boolean',
              description: 'Whether component is active',
              default: true,
            },
          },
        },
        Page: {
          type: 'object',
          required: ['name', 'slug'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated ID',
            },
            name: {
              type: 'string',
              description: 'Page name',
            },
            slug: {
              type: 'string',
              description: 'URL slug',
            },
            components: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of component IDs',
            },
            isPublished: {
              type: 'boolean',
              description: 'Whether page is published',
              default: false,
            },
            seoTitle: {
              type: 'string',
              description: 'SEO title',
            },
            seoDescription: {
              type: 'string',
              description: 'SEO description',
            },
          },
        },
      },
    },
    tags: [

      {
        name: 'Components',
        description: 'Component management',
      },
      {
        name: 'Pages',
        description: 'Page management',
      },
      {
        name: 'Page Components',
        description: 'Individual page component management',
      },
      {
        name: 'Logo Sections',
        description: 'Logo section management',
      },
    ],
  },
  apis: ['./server.js'],
};

module.exports = swaggerJsdoc(options);