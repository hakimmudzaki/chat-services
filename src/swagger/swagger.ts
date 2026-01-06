import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Chat Services API',
    version: '1.0.0',
    description: 'API Documentation untuk Chat Services - Aplikasi Chat sederhana',
    contact: {
      name: 'Developer',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints (Register, Login, Change Password)',
    },
    {
      name: 'Friends',
      description: 'Friend management endpoints',
    },
    {
      name: 'Chat',
      description: 'Chat messaging endpoints',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-xxxx-xxxx' },
          username: { type: 'string', example: 'john_doe' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'msg-uuid-xxxx' },
          senderId: { type: 'string', example: 'user-uuid-1' },
          receiverId: { type: 'string', example: 'user-uuid-2' },
          message: { type: 'string', example: 'Hello!' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error message' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register user baru',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'john_doe', description: 'Username untuk akun baru' },
                  password: { type: 'string', example: 'password123', description: 'Password untuk akun baru' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Registrasi berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'User registered successfully' },
                    userId: { type: 'string', example: 'uuid-xxxx-xxxx' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Registrasi gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'john_doe' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Login successful' },
                    userId: { type: 'string', example: 'uuid-xxxx-xxxx' },
                    username: { type: 'string', example: 'john_doe' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Login gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/change-password': {
      post: {
        summary: 'Ganti password user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'newPassword'],
                properties: {
                  userId: { type: 'string', example: 'uuid-xxxx-xxxx', description: 'ID user' },
                  newPassword: { type: 'string', example: 'newpassword456', description: 'Password baru' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password berhasil diganti',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Password changed successfully' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'User tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/friends/add': {
      post: {
        summary: 'Tambah teman baru',
        tags: ['Friends'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['myId', 'friendUsername'],
                properties: {
                  myId: { type: 'string', example: 'uuid-xxxx-xxxx', description: 'ID user' },
                  friendUsername: { type: 'string', example: 'jane_doe', description: 'Username teman' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Berhasil menambah teman',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Friend added successfully' },
                    contact: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid-friend-xxxx' },
                        username: { type: 'string', example: 'jane_doe' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Gagal menambah teman',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/friends/{userId}': {
      get: {
        summary: 'Ambil daftar teman user',
        tags: ['Friends'],
        parameters: [
          {
            in: 'path',
            name: 'userId',
            required: true,
            schema: { type: 'string' },
            description: 'ID user',
            example: 'uuid-xxxx-xxxx',
          },
        ],
        responses: {
          '200': {
            description: 'Daftar teman berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/chat/send': {
      post: {
        summary: 'Kirim pesan ke teman',
        tags: ['Chat'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['senderId', 'receiverId', 'message'],
                properties: {
                  senderId: { type: 'string', example: 'uuid-sender-xxxx', description: 'ID pengirim' },
                  receiverId: { type: 'string', example: 'uuid-receiver-xxxx', description: 'ID penerima' },
                  message: { type: 'string', example: 'Halo, apa kabar?', description: 'Isi pesan' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Pesan berhasil dikirim',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Message sent successfully' },
                    data: { $ref: '#/components/schemas/Message' },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/chat/history': {
      get: {
        summary: 'Ambil history chat dengan teman',
        tags: ['Chat'],
        parameters: [
          {
            in: 'query',
            name: 'myId',
            required: true,
            schema: { type: 'string' },
            description: 'ID user yang login',
            example: 'uuid-my-xxxx',
          },
          {
            in: 'query',
            name: 'friendId',
            required: true,
            schema: { type: 'string' },
            description: 'ID teman',
            example: 'uuid-friend-xxxx',
          },
        ],
        responses: {
          '200': {
            description: 'History chat berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Message' },
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  // Disable cache untuk swagger-ui
  app.use('/api-docs', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Swagger UI route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Chat Services API Docs',
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
  }));

  // JSON spec endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.send(swaggerSpec);
  });
}

