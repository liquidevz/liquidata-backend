// Swagger documentation for Blogs and Case Studies APIs
module.exports = {
  '/api/case-studies': {
    get: {
      summary: 'Get all published case studies',
      tags: ['Case Studies - Public'],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', default: 'published' } },
        { name: 'featured', in: 'query', schema: { type: 'boolean' } },
        { name: 'industry', in: 'query', schema: { type: 'string' } },
        { name: 'projectType', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'number', default: 10 } },
        { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
        { name: 'search', in: 'query', schema: { type: 'string' } }
      ],
      responses: { 200: { description: 'List of case studies' } }
    }
  },
  '/api/case-studies/{slug}': {
    get: {
      summary: 'Get single case study by slug',
      tags: ['Case Studies - Public'],
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Case study details' }, 404: { description: 'Not found' } }
    }
  },
  '/api/admin/case-studies': {
    get: {
      summary: 'Get all case studies (Admin)',
      tags: ['Case Studies - Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'featured', in: 'query', schema: { type: 'boolean' } },
        { name: 'limit', in: 'query', schema: { type: 'number', default: 20 } },
        { name: 'page', in: 'query', schema: { type: 'number', default: 1 } }
      ],
      responses: { 200: { description: 'List of all case studies' } }
    },
    post: {
      summary: 'Create case study',
      tags: ['Case Studies - Admin'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title'],
              properties: {
                title: { type: 'string' },
                subtitle: { type: 'string' },
                description: { type: 'string' },
                content: { type: 'string' },
                featuredImage: { type: 'string' },
                client: { type: 'string' },
                industry: { type: 'string' },
                projectType: { type: 'string' },
                status: { type: 'string', enum: ['draft', 'published', 'archived'] },
                featured: { type: 'boolean' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Case study created' } }
    }
  },
  '/api/admin/case-studies/{id}': {
    get: {
      summary: 'Get case study by ID',
      tags: ['Case Studies - Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Case study details' }, 404: { description: 'Not found' } }
    },
    put: {
      summary: 'Update case study',
      tags: ['Case Studies - Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Updated' } }
    },
    delete: {
      summary: 'Delete case study',
      tags: ['Case Studies - Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Deleted' } }
    }
  },
  '/api/blogs': {
    get: {
      summary: 'Get all published blogs',
      tags: ['Blogs - Public'],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', default: 'published' } },
        { name: 'featured', in: 'query', schema: { type: 'boolean' } },
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'tags', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'number', default: 10 } },
        { name: 'page', in: 'query', schema: { type: 'number', default: 1 } }
      ],
      responses: { 200: { description: 'List of blogs' } }
    }
  },
  '/api/blogs/{slug}': {
    get: {
      summary: 'Get single blog by slug',
      tags: ['Blogs - Public'],
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Blog details' } }
    }
  },
  '/api/admin/blogs': {
    get: {
      summary: 'Get all blogs (Admin)',
      tags: ['Blogs - Admin'],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of all blogs' } }
    },
    post: {
      summary: 'Create blog',
      tags: ['Blogs - Admin'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title'],
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                excerpt: { type: 'string' },
                featuredImage: { type: 'string' },
                category: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                status: { type: 'string', enum: ['draft', 'published', 'archived'] },
                featured: { type: 'boolean' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Blog created' } }
    }
  },
  '/api/admin/blogs/{id}': {
    get: {
      summary: 'Get blog by ID',
      tags: ['Blogs - Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Blog details' }, 404: { description: 'Not found' } }
    },
    put: {
      summary: 'Update blog',
      tags: ['Blogs - Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Updated' } }
    },
    delete: {
      summary: 'Delete blog',
      tags: ['Blogs - Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Deleted' } }
    }
  },
  '/api/blog-categories': {
    get: {
      summary: 'Get all blog categories',
      tags: ['Blog Categories - Public'],
      responses: { 200: { description: 'List of categories' } }
    }
  },
  '/api/admin/blog-categories': {
    get: {
      summary: 'Get all categories (Admin)',
      tags: ['Blog Categories - Admin'],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of all categories' } }
    },
    post: {
      summary: 'Create category',
      tags: ['Blog Categories - Admin'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                color: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Category created' } }
    }
  },
  '/api/admin/case-studies/upload': {
    post: {
      summary: 'Upload case study image',
      tags: ['File Upload - Admin'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'multipart/form-data': { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } } }
      },
      responses: { 200: { description: 'Image uploaded' } }
    }
  },
  '/api/admin/blogs/upload': {
    post: {
      summary: 'Upload blog image',
      tags: ['File Upload - Admin'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'multipart/form-data': { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } } }
      },
      responses: { 200: { description: 'Image uploaded' } }
    }
  }
};
