const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Affecta API',
      version: '1.0.0',
      description: 'Emotional diary API with NLP analysis and knowledge base',
    },
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
      },
      schemas: {
        Entry: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            text: { type: 'string' },
            emotion: { type: 'string', enum: ['нейтральный','счастье','грусть','энтузиазм','страх','гнев','отвращение'] },
            recommendation: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        EmotionResult: {
          type: 'object',
          properties: {
            emotion: { type: 'string' },
            score: { type: 'number' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' }, gender: { type: 'string' } } } } } },
          responses: { 201: { description: 'User created' }, 409: { description: 'Email exists' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { 200: { description: 'Logged in, sets cookie' } },
        },
      },
      '/auth/logout': {
        post: { tags: ['Auth'], summary: 'Logout', responses: { 200: { description: 'Logged out' } } },
      },
      '/entries': {
        get: {
          tags: ['Entries'],
          summary: 'Get entries (paginated, optional date filter)',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { 200: { description: 'Paginated entries list' } },
        },
        post: {
          tags: ['Entries'],
          summary: 'Create entry (runs NLP analysis)',
          security: [{ cookieAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } } } } } },
          responses: { 200: { description: 'Entry created with emotion and recommendation' } },
        },
      },
      '/entries/{id}': {
        get: {
          tags: ['Entries'],
          summary: 'Get single entry',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Entry object' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['Entries'],
          summary: 'Delete entry',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/analyze-emotion': {
        post: {
          tags: ['NLP'],
          summary: 'Analyze emotion in text',
          security: [{ cookieAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' } } } } } },
          responses: { 200: { description: 'Emotion and score' } },
        },
      },
      '/tags': {
        get: { tags: ['Tags'], summary: 'Get all available tags', responses: { 200: { description: 'Array of tag names' } } },
      },
      '/recommendation': {
        get: {
          tags: ['Knowledge Base'],
          summary: 'Get recommendation from Neo4j knowledge base',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'emotion', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'tags', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
          ],
          responses: { 200: { description: 'Recommendation text' } },
        },
      },
      '/ui-reaction': {
        get: {
          tags: ['Knowledge Base'],
          summary: 'Get UI reaction for emotion from Neo4j',
          parameters: [{ name: 'emotion', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'UI animation/style/color' } },
        },
      },
      '/stats/summary': {
        get: {
          tags: ['Stats'],
          summary: 'Get total entries count and active days',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: '{ totalEntries, activeDays }' } },
        },
      },
      '/stats/emotions': {
        get: {
          tags: ['Stats'],
          summary: 'Emotion counts (all-time or by date)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }],
          responses: { 200: { description: 'Map emotion → count' } },
        },
      },
      '/stats/tags': {
        get: {
          tags: ['Stats'],
          summary: 'Tag counts (all-time or by date)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }],
          responses: { 200: { description: 'Map tag → count' } },
        },
      },
      '/stats/trends': {
        get: {
          tags: ['Stats'],
          summary: 'Daily emotion trends (tied emotions shown as array)',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { 200: { description: 'Array of { date, emotions[] }' } },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
