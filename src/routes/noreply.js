// routes/noreply.js
import { initZeptoMail, ZeptoMailError } from '../services.js'; 

/**
 * POST /emails/noreply
 * Sends automated notifications.
 * Requires: to, bodyMessage (plain text), subject
 */
export const postNoreplyEmail = async (c) => {
    const timestamp = new Date().toISOString();
    let body;

    try { body = await c.req.json(); if (!body || typeof body !== 'object') throw new Error('Invalid JSON'); } catch (err) { return c.json({ success: false, error: 'INVALID_JSON', message: 'Request body must be valid JSON.', timestamp }, 400); }

    const { to, subject, bodyMessage, recipientName } = body;
    
    if (!to || !subject || !bodyMessage) {
        return c.json({ success: false, error: 'MISSING_FIELDS', message: 'Required fields: to, subject, and bodyMessage (plain text) must be provided.', timestamp }, 400);
    }

    try {
        const zepto = await initZeptoMail(c.env);

        const formattedBody = bodyMessage.replace(/\n/g, '</p><p>');

        // --- TEMPLATING IS DEFINED INTERNALLY HERE ---
        const htmlbody = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification</title>
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
            padding: 20px;
        }
        
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 25px;
            text-align: center;
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
        }
        
        .notification-badge {
            background: #ff6b6b;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
        }
        
        .subject-container {
            background: #e9f5ff;
            padding: 20px 25px;
            border-bottom: 1px solid #d0e4ff;
        }
        
        .subject {
            font-weight: 700;
            color: #1e3c72;
            font-size: 20px;
            text-align: center;
        }
        
        .content {
            padding: 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2a5298;
            font-weight: 600;
        }
        
        .notification-container {
            background: #f8f9fa;
            border-left: 4px solid #2a5298;
            padding: 25px;
            border-radius: 0 8px 8px 0;
            margin: 25px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .automated-notice {
            background: #fff3e6;
            border: 1px solid #ffb366;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .closing {
            margin-top: 25px;
            text-align: center;
        }
        
        .team-name {
            font-weight: 700;
            font-size: 18px;
            color: #1e3c72;
            margin-top: 10px;
        }
        
        .footer {
            background: #1a1a2e;
            color: #fff;
            padding: 25px;
            text-align: center;
            font-size: 14px;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            margin: 15px 0;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
        }
        
        .social-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .social-icon:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        .registration {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 15px;
        }
        
        .notification-type {
            display: inline-block;
            background: #e6f7ff;
            color: #1890ff;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-container">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0Z" fill="#FFFFFF"/>
                    <path d="M26 14H14V26H26V14Z" fill="#2A5298"/>
                    <path d="M18 18H22V22H18V18Z" fill="#FFFFFF"/>
                </svg>
                <span style="margin-left: 10px; font-size: 24px; font-weight: bold;">HOUSIKA</span>
            </div>
            <div class="notification-badge">AUTOMATED NOTIFICATION</div>
        </div>
        
        <div class="subject-container">
            <div class="subject">${subject}</div>
        </div>
        
        <div class="content">
            <p class="greeting">Dear ${recipientName || 'Valued User'},</p>
            
            <div class="notification-container">
                <div class="notification-type">SYSTEM NOTIFICATION</div>
                <p>${formattedBody}</p>
            </div>
            
            <div class="automated-notice">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 15H11V13H9V15ZM9 11H11V5H9V11Z" fill="#ff8c00"/>
                </svg>
                <div>
                    <strong>Automated Message:</strong> This is an automated notification. Please do not reply to this email address. If you need assistance, please contact our support team using the information below.
                </div>
            </div>
            
            <div class="closing">
                <p>Thank you for being a valued part of the Housika community.</p>
                
                <div class="team-name">The Housika Team</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="contact-info">
                <div class="contact-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3H2C1.44772 3 1 3.44772 1 4V12C1 12.5523 1.44772 13 2 13H14C14.5523 13 15 12.5523 15 12V4C15 3.44772 14.5523 3 14 3Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M1 4L8 8.5L15 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>support@housika.co.ke</span>
                </div>
                <div class="contact-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 11V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H11.5C5.701 15 1 10.299 1 4.5V4C1 3.46957 1.21071 2.96086 1.58579 2.58579C1.96086 2.21071 2.46957 2 3 2H5C5.26522 2 5.51957 2.10536 5.70711 2.29289C5.89464 2.48043 6 2.73478 6 3V6.586C6 6.85122 5.89464 7.10557 5.70711 7.29311L4.414 8.586C5.30016 10.4591 6.79174 12.0374 8.672 13.101L9.707 11.707C9.89464 11.5196 10.149 11.4142 10.414 11.4142H14C14.2652 11.4142 14.5196 11.5196 14.7071 11.7071C14.8946 11.8946 15 12.149 15 12.4142V11Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Business: 0745108505 (WhatsApp)</span>
                </div>
            </div>
            
            <div class="social-links">
                <a href="#" class="social-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1.5H10.5C9.70435 1.5 8.94129 1.81607 8.37868 2.37868C7.81607 2.94129 7.5 3.70435 7.5 4.5V6H6V8.25H7.5V15H9.75V8.25H11.25L12 6H9.75V4.5C9.75 4.30109 9.82902 4.11032 9.96967 3.96967C10.1103 3.82902 10.3011 3.75 10.5 3.75H12V1.5Z" fill="white"/>
                    </svg>
                </a>
            </div>
            
            <div class="registration">
                <p>Housika is a registered software development, design, and maintenance business in Kenya</p>
                <p>Business Registration Number: BN-36S5WLAP</p>
            </div>
        </div>
    </div>
</body>
</html>
        `;
        // ---------------------------------------------

        const result = await zepto.sendNotification({ 
            to, subject, htmlbody, recipientName: recipientName || 'User',
        });
        return c.json({ success: true, message: 'NoReply email sent successfully.', result, timestamp }, 200);
    } catch (err) {
        const errorType = err instanceof ZeptoMailError ? 'EMAIL_SERVICE_ERROR' : 'REQUEST_ERROR';
        return c.json({ success: false, error: errorType, message: err.message || 'Unexpected error.', timestamp }, 500);
    }
};