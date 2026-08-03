/**
 * KampoStay API Documentation
 * This file contains API endpoint documentation for reference
 * 
 * Base URL: /api/v1
 * Authentication: Bearer token (JWT) or cookie
 */

const apiDocs = {
  info: {
    title: 'KampoStay API',
    version: '1.0.0',
    description: 'Kenya\'s premier student accommodation platform API',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development server',
    },
    {
      url: 'https://kampostay-api.onrender.com/api/v1',
      description: 'Production server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        description: 'Returns API health status',
        tags: ['System'],
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                example: {
                  status: 'ok',
                  timestamp: '2024-01-01T00:00:00.000Z',
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user',
        description: 'Create a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string', enum: ['student', 'landlord', 'admin'] },
                  phone: { type: 'string' },
                  university: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
          },
          '400': {
            description: 'Invalid input',
          },
          '409': {
            description: 'Email already exists',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User login',
        description: 'Authenticate user and return tokens',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    accessToken: 'jwt_token',
                    refreshToken: 'jwt_token',
                    user: {
                      id: 'user_id',
                      email: 'user@example.com',
                      role: 'student',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        description: 'Get new access token using refresh token',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'Token refreshed successfully',
          },
          '401': {
            description: 'Invalid refresh token',
          },
        },
      },
    },
    '/properties': {
      get: {
        summary: 'Get all properties',
        description: 'Retrieve properties with optional filters',
        tags: ['Properties'],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['published', 'draft', 'rented'] },
          },
          {
            name: 'university',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'minRent',
            in: 'query',
            schema: { type: 'number' },
          },
          {
            name: 'maxRent',
            in: 'query',
            schema: { type: 'number' },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Properties retrieved successfully',
          },
        },
      },
      post: {
        summary: 'Create new property',
        description: 'Add a new property listing (requires authentication)',
        tags: ['Properties'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'rent', 'university'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  rent: { type: 'number' },
                  university: { type: 'string' },
                  location: {
                    type: 'object',
                    properties: {
                      address: { type: 'string' },
                      city: { type: 'string' },
                      coordinates: {
                        type: 'object',
                        properties: {
                          type: { type: 'string', enum: ['Point'] },
                          coordinates: { type: 'array', items: { type: 'number' } },
                        },
                      },
                    },
                  },
                  amenities: {
                    type: 'object',
                    properties: {
                      wifi: { type: 'boolean' },
                      water: { type: 'boolean' },
                      furnished: { type: 'boolean' },
                      parking: { type: 'boolean' },
                    },
                  },
                  media: {
                    type: 'object',
                    properties: {
                      images: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            url: { type: 'string' },
                            isPrimary: { type: 'boolean' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Property created successfully',
          },
          '401': {
            description: 'Unauthorized',
          },
        },
      },
    },
    '/properties/{id}': {
      get: {
        summary: 'Get property by ID',
        description: 'Retrieve a single property',
        tags: ['Properties'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Property retrieved successfully',
          },
          '404': {
            description: 'Property not found',
          },
        },
      },
      patch: {
        summary: 'Update property',
        description: 'Update property details (requires authentication)',
        tags: ['Properties'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Property updated successfully',
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'Property not found',
          },
        },
      },
      delete: {
        summary: 'Delete property',
        description: 'Remove a property (requires authentication)',
        tags: ['Properties'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Property deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'Property not found',
          },
        },
      },
    },
    '/upload/image': {
      post: {
        summary: 'Upload single image',
        description: 'Upload an image to Cloudinary or local storage',
        tags: ['Upload'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                  folder: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Image uploaded successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    url: 'https://res.cloudinary.com/...',
                    publicId: 'kampostay/...',
                    format: 'jpg',
                    bytes: 12345,
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        summary: 'Get all users',
        description: 'Retrieve users (admin only)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string', enum: ['student', 'landlord', 'admin'] },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Users retrieved successfully',
          },
          '403': {
            description: 'Forbidden - admin only',
          },
        },
      },
    },
    '/bookings': {
      get: {
        summary: 'Get bookings',
        description: 'Retrieve user bookings or all bookings (admin)',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Bookings retrieved successfully',
          },
        },
      },
      post: {
        summary: 'Create booking',
        description: 'Book a property',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['propertyId'],
                properties: {
                  propertyId: { type: 'string' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Booking created successfully',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

module.exports = apiDocs;
