// src/services.js

// Default to v1.0/email, but allow override via env
const ZEPTO_URL = process.env.ZEPTO_API_URL || 'https://api.zeptomail.com/v1.1/email';

const SENDERS = {
  CEO: { address: 'ceo@housika.co.ke', name: 'Housika CEO' },
  ADMIN: { address: 'admin@housika.co.ke', name: 'Housika Admin' },
  NO_REPLY: { address: 'noreply@housika.co.ke', name: 'Housika No Reply' },
  PAYMENTS: { address: 'payments@housika.co.ke', name: 'Housika Payments' },
  BOOKINGS: { address: 'bookings@housika.co.ke', name: 'Housika Bookings' },
  VERIFY: { address: 'verify@housika.co.ke', name: 'Housika Verify' },
  CUSTOMER_CARE: { address: 'customercare@housika.co.ke', name: 'Housika Customer Care' },
  UPGRADE: { address: 'upgrade@housika.co.ke', name: 'Housika Account Upgrade' },
  PROPERTIES: { address: 'properties@housika.co.ke', name: 'Housika Properties' },
};

export class ZeptoMailError extends Error {
  constructor(message, data = null) {
    super(message);
    this.name = 'ZeptoMailError';
    this.data = data;
  }
}

let zeptoApiKey, setupError, setupPromise;

const ensureReady = async (env) => {
  if (setupError) throw setupError;
  if (zeptoApiKey) return;

  if (!setupPromise) {
    setupPromise = (async () => {
      zeptoApiKey = env?.ZEPTO_API_KEY || process.env.ZEPTO_API_KEY;
      if (!zeptoApiKey) {
        setupError = new ZeptoMailError('ZeptoMail API key missing.');
      }
    })();
  }

  await setupPromise;
  if (setupError) throw setupError;
};

export async function initZeptoMail(env) {
  await ensureReady(env);

  const formatRecipients = (to, name = 'User') => {
    const list = Array.isArray(to) ? to : [to];
    return list.map(email => {
      if (typeof email !== 'string' || !email.includes('@')) {
        throw new ZeptoMailError(`Invalid recipient: ${email}`);
      }
      return { email_address: { address: email, name } };
    });
  };

  const sendEmail = async ({ sender, to, subject, htmlbody, recipientName = 'User' }) => {
    if (!sender?.address || !sender?.name || !to || !subject || !htmlbody) {
      throw new ZeptoMailError('Missing required email fields.');
    }

    const payload = {
      from: sender,
      to: formatRecipients(to, recipientName),
      subject,
      htmlbody,
    };

    try {
      console.log('📨 Sending email via ZeptoMail:', {
        url: ZEPTO_URL,
        sender: sender.address,
        to,
        subject,
      });

      const res = await fetch(ZEPTO_URL, {
        method: 'POST',
        headers: {
          Authorization: zeptoApiKey.startsWith('Zoho-enczapikey')
            ? zeptoApiKey
            : `Zoho-enczapikey ${zeptoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      console.log('📧 ZeptoMail API Response:', {
        status: res.status,
        statusText: res.statusText,
        data,
      });

      if (!res.ok) {
        throw new ZeptoMailError(data.message || `Email failed with status ${res.status}`, data);
      }

      return data;
    } catch (err) {
      const detail = err instanceof ZeptoMailError ? err.data : err.stack || err;
      console.error(`[ZEPTOMAIL ERROR] ${sender.address} → ${to}`, detail);
      throw err instanceof ZeptoMailError ? err : new ZeptoMailError('Unexpected email error.', detail);
    }
  };

  return {
    sendCeoEmail: (p) => sendEmail({ sender: SENDERS.CEO, ...p }),
    sendAdminEmail: (p) => sendEmail({ sender: SENDERS.ADMIN, ...p }),
    sendVerificationEmail: (p) => sendEmail({ sender: SENDERS.NO_REPLY, ...p }),
    sendPasswordReset: (p) => sendEmail({ sender: SENDERS.NO_REPLY, ...p }),
    sendNotification: (p) => sendEmail({ sender: SENDERS.NO_REPLY, ...p }),
    sendPaymentConfirmation: (p) => sendEmail({ sender: SENDERS.PAYMENTS, ...p }),
    sendInvoice: (p) => sendEmail({ sender: SENDERS.PAYMENTS, ...p }),
    sendBookingConfirmation: (p) => sendEmail({ sender: SENDERS.BOOKINGS, ...p }),
    sendBookingUpdate: (p) => sendEmail({ sender: SENDERS.BOOKINGS, ...p }),
    sendVerificationCode: (p) => sendEmail({ sender: SENDERS.VERIFY, ...p }),
    sendAccountVerification: (p) => sendEmail({ sender: SENDERS.VERIFY, ...p }),
    sendCustomerCareReply: (p) => sendEmail({ sender: SENDERS.CUSTOMER_CARE, ...p }),
    sendSupportResponse: (p) => sendEmail({ sender: SENDERS.CUSTOMER_CARE, ...p }),
    sendRoleUpgrade: (p) => sendEmail({ sender: SENDERS.UPGRADE, ...p }),
    sendAccountUpgrade: (p) => sendEmail({ sender: SENDERS.UPGRADE, ...p }),
    sendPropertyListing: (p) => sendEmail({ sender: SENDERS.PROPERTIES, ...p }),
    sendPropertyUpdate: (p) => sendEmail({ sender: SENDERS.PROPERTIES, ...p }),
    sendPropertyNotification: (p) => sendEmail({ sender: SENDERS.PROPERTIES, ...p }),
    sendMail: (p) => sendEmail({ sender: SENDERS.NO_REPLY, ...p }),
    sendEmail: (senderType, p) => {
      const sender = SENDERS[senderType];
      if (!sender) throw new ZeptoMailError(`Unknown sender type: ${senderType}`);
      return sendEmail({ sender, ...p });
    },
  };
}
