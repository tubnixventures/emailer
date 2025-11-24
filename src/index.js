// src/index.js (Deno version, plain JS)

// Import Hono directly from deno.land
import { Hono } from "https://deno.land/x/hono/mod.js";

// Import your ZeptoMail service (already adapted for Deno)
import { initZeptoMail } from "./services.js";

// Import all your route handlers
import { postCeoEmail } from "./routes/ceo.js";
import { postAdminEmail } from "./routes/admin.js";
import { postCustomerCareEmail } from "./routes/customercare.js";
import { postBookingsEmail } from "./routes/bookings.js";
import { postPaymentsEmail } from "./routes/payments.js";
import { postPropertiesEmail } from "./routes/properties.js";
import { postNoreplyEmail } from "./routes/noreply.js";
import { postInfoEmail } from "./routes/info.js";

// Initialize Hono app
const app = new Hono();

// --- Routing ---

// Health check
app.get("/health", (c) => c.text("ok"));

// Register all email endpoints
app.post("/emails/ceo", postCeoEmail);
app.post("/emails/admin", postAdminEmail);
app.post("/emails/customercare", postCustomerCareEmail);
app.post("/emails/bookings", postBookingsEmail);
app.post("/emails/payments", postPaymentsEmail);
app.post("/emails/properties", postPropertiesEmail);
app.post("/emails/noreply", postNoreplyEmail);
app.post("/emails/info", postInfoEmail);

// --- Run with Deno ---
Deno.serve(app.fetch);
