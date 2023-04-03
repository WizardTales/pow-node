// Require the framework and instantiate it
import Fastify from 'fastify';
import staticLoader from '@fastify/static';
import pow from './lib/controllers/pow.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from '@fastify/cors';
import config from './config.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({ logger: true });

fastify.register(staticLoader, {
  root: path.join(__dirname, 'public')
});

fastify.register(cors, config.server.cors);

// Declare a route
fastify.post('/api/v1/pow/config', pow.getPow);
fastify.post('/api/v1/pow/verify', pow.powVerify);
fastify.post('/api/v1/pow/siteverify', pow.siteverify);

fastify.get('/widget/', function (req, reply) {
  reply.sendFile('widget.html');
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
