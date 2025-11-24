import 'dotenv/config';
import { Hono } from 'hono';
import { initZeptoMail } from './services.js';

// Import all your route handlers
import { postCeoEmail } from './routes/ceo.js';
import { postAdminEmail } from './routes/admin.js';
import { postCustomerCareEmail } from './routes/customercare.js';
import { postBookingsEmail } from './routes/bookings.js';
import { postPaymentsEmail } from './routes/payments.js';
import { postPropertiesEmail } from './routes/properties.js';
import { postNoreplyEmail } from './routes/noreply.js';
import { postInfoEmail } from './routes/info.js';

// Initialize Hono app
const app = new Hono();

// --- Routing ---

// Health check
app.get('/health', (c) => c.text('ok'));

// Register all email endpoints
app.post('/emails/ceo', postCeoEmail);
app.post('/emails/admin', postAdminEmail);
app.post('/emails/customercare', postCustomerCareEmail);
app.post('/emails/bookings', postBookingsEmail);
app.post('/emails/payments', postPaymentsEmail);
app.post('/emails/properties', postPropertiesEmail);
app.post('/emails/noreply', postNoreplyEmail);
app.post('/emails/info', postInfoEmail);

// --- Export as a function ---
// This makes the app reusable across Node environments (serverless, edge, etc.)
// without binding it to a specific server runtime.
export default app;

// Optional: if you still want local dev with Node
if (process.env.NODE_ENV !== 'production') {
  const { serve } = await import('@hono/node-server');
  const PORT = Number(process.env.PORT || 3000);

  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`Server listening on http://localhost:${info.port}`);
  });

  // Global handlers
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
}
