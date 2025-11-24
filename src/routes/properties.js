// routes/properties.js
import { initZeptoMail, ZeptoMailError } from '../services.js'; 

/**
 * POST /emails/properties
 * Sends property listing updates or notifications.
 * Requires: to, propertyId, updateType, bodyMessage (plain text)
 */
export const postPropertiesEmail = async (c) => {
    const timestamp = new Date().toISOString();
    let body;

    try { body = await c.req.json(); if (!body || typeof body !== 'object') throw new Error('Invalid JSON'); } catch (err) { return c.json({ success: false, error: 'INVALID_JSON', message: 'Request body must be valid JSON.', timestamp }, 400); }

    const { to, recipientName, propertyId, updateType, bodyMessage } = body;
    
    if (!to || !propertyId || !updateType || !bodyMessage) {
        return c.json({ success: false, error: 'MISSING_FIELDS', message: 'Required fields: to, propertyId, updateType, and bodyMessage (plain text) must be provided.', timestamp }, 400);
    }

    try {
        const zepto = await initZeptoMail(c.env);
        const subject = `Property Update: ID ${propertyId} - ${updateType}`;

        const formattedBody = bodyMessage.replace(/\n/g, '</p><p>');

        // --- TEMPLATING IS DEFINED INTERNALLY HERE ---
        const htmlbody = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Notification</title>
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
            background: #ff9800;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
        }
        
        .property-info {
            background: #fff3e0;
            padding: 20px 25px;
            border-bottom: 1px solid #ffcc80;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .property-id {
            font-weight: 700;
            color: #1e3c72;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .update-type {
            background: #ff9800;
            color: white;
            padding: 6px 15px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: 600;
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
        
        .notification-message {
            text-align: center;
            margin-bottom: 25px;
            font-size: 16px;
            color: #555;
        }
        
        .notification-container {
            background: #fffbe6;
            border: 2px solid #ffcc00;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 8px rgba(255, 204, 0, 0.1);
        }
        
        .action-required {
            background: #e3f2fd;
            border: 1px solid #64b5f6;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .action-required h3 {
            color: #1e3c72;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 15px;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
        }
        
        .property-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .detail-label {
            font-size: 12px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .detail-value {
            font-weight: 600;
            color: #1e3c72;
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
        
        .help-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
        }
        
        .help-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        
        .help-link {
            color: #2a5298;
            text-decoration: none;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .help-link:hover {
            text-decoration: underline;
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
            <div class="notification-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 15H11V13H9V15ZM9 11H11V5H9V11Z" fill="white"/>
                </svg>
                PROPERTY NOTIFICATION
            </div>
        </div>
        
        <div class="property-info">
            <div class="property-id">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="#1e3c72"/>
                    <path d="M10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15Z" fill="#1e3c72"/>
                    <path d="M10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" fill="#1e3c72"/>
                </svg>
                Property ID: ${propertyId}
            </div>
            <div class="update-type">${updateType}</div>
        </div>
        
        <div class="content">
            <p class="greeting">Dear ${recipientName || 'Property Contact'},</p>
            
            <p class="notification-message">A <strong>${updateType}</strong> update has been issued for your property.</p>
            
            <div class="notification-container">
                <p>${formattedBody}</p>
            </div>
            
            <div class="action-required">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 15H11V13H9V15ZM9 11H11V5H9V11Z" fill="#1e3c72"/>
                    </svg>
                    Required Action
                </h3>
                <p>Please login to your dashboard to view complete details and take any necessary actions regarding this update.</p>
                <a href="#" class="cta-button">Access Property Dashboard</a>
            </div>
            
            <div class="property-details">
                <h4 style="color: #1e3c72; margin-bottom: 15px;">Property Summary</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Property ID</span>
                        <span class="detail-value">${propertyId}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Update Type</span>
                        <span class="detail-value">${updateType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Notification Date</span>
                        <span class="detail-value">${new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" style="color: #ff9800;">Active</span>
                    </div>
                </div>
            </div>
            
            <div class="help-section">
                <p style="text-align: center; color: #666; margin-bottom: 15px;">Need assistance with your property?</p>
                <div class="help-links">
                    <a href="#" class="help-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#2a5298"/>
                        </svg>
                        Property Management Guide
                    </a>
                    <a href="#" class="help-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#2a5298"/>
                        </svg>
                        Contact Support
                    </a>
                    <a href="#" class="help-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#2a5298"/>
                        </svg>
                        FAQ
                    </a>
                </div>
            </div>
            
            <div class="closing">
                <p>Thank you for using Housika Property Services.</p>
                
                <div class="team-name">Housika Property Team</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="contact-info">
                <div class="contact-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3H2C1.44772 3 1 3.44772 1 4V12C1 12.5523 1.44772 13 2 13H14C14.5523 13 15 12.5523 15 12V4C15 3.44772 14.5523 3 14 3Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M1 4L8 8.5L15 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>properties@housika.co.ke</span>
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

        const result = await zepto.sendPropertyListing({ 
            to, subject, htmlbody, recipientName: recipientName || 'Property Contact',
        });
        return c.json({ success: true, message: 'Property email sent successfully.', result, timestamp }, 200);
    } catch (err) {
        const errorType = err instanceof ZeptoMailError ? 'EMAIL_SERVICE_ERROR' : 'REQUEST_ERROR';
        return c.json({ success: false, error: errorType, message: err.message || 'Unexpected error.', timestamp }, 500);
    }
};