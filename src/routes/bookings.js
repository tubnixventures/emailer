// routes/bookings.js
import { initZeptoMail, ZeptoMailError } from '../services.js'; 

/**
 * POST /emails/bookings
 * Sends booking confirmations/updates.
 * Requires: to, bookingId, date, propertyName
 */
export const postBookingsEmail = async (c) => {
    const timestamp = new Date().toISOString();
    let body;

    try { body = await c.req.json(); if (!body || typeof body !== 'object') throw new Error('Invalid JSON'); } catch (err) { return c.json({ success: false, error: 'INVALID_JSON', message: 'Request body must be valid JSON.', timestamp }, 400); }

    const { to, recipientName, bookingId, date, propertyName, totalAmount } = body;
    
    if (!to || !bookingId || !date || !propertyName) {
        return c.json({ success: false, error: 'MISSING_FIELDS', message: 'Required fields: to, bookingId, date, and propertyName must be provided.', timestamp }, 400);
    }

    try {
        const zepto = await initZeptoMail(c.env);
        const subject = `Booking Confirmation - ${propertyName}`;

        // --- TEMPLATING IS DEFINED INTERNALLY HERE ---
        const htmlbody = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
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
        
        .confirmation-badge {
            background: #00c853;
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
        
        .property-highlight {
            background: #e3f2fd;
            padding: 20px 25px;
            border-bottom: 1px solid #bbdefb;
            text-align: center;
        }
        
        .property-name {
            font-weight: 700;
            color: #1e3c72;
            font-size: 22px;
            margin-bottom: 5px;
        }
        
        .booking-status {
            color: #00c853;
            font-weight: 600;
            font-size: 16px;
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
        
        .success-message {
            text-align: center;
            margin-bottom: 25px;
            font-size: 16px;
            color: #555;
        }
        
        .booking-details {
            background: #f0f8ff;
            border: 2px solid #1e3c72;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 8px rgba(30, 60, 114, 0.1);
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #d0e4ff;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #1e3c72;
        }
        
        .detail-value {
            font-weight: 600;
            color: #2a5298;
        }
        
        .amount-highlight {
            font-size: 20px;
            color: #00c853;
            font-weight: 700;
        }
        
        .next-steps {
            background: #e8f5e9;
            border: 1px solid #c8e6c9;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .next-steps h3 {
            color: #1e3c72;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .steps-list {
            list-style: none;
            padding-left: 0;
        }
        
        .steps-list li {
            padding: 8px 0;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        
        .property-features {
            background: #fff3e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .property-features h4 {
            color: #1e3c72;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
        
        .confirmation-note {
            background: #fff9e6;
            border: 1px solid #ffd966;
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
        
        .download-section {
            text-align: center;
            margin-top: 20px;
        }
        
        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #1e3c72;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 0 10px;
            transition: all 0.3s ease;
        }
        
        .download-btn:hover {
            background: #2a5298;
            transform: translateY(-2px);
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
            <div class="confirmation-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white"/>
                </svg>
                BOOKING CONFIRMED
            </div>
        </div>
        
        <div class="property-highlight">
            <div class="property-name">${propertyName}</div>
            <div class="booking-status">✓ Successfully Booked</div>
        </div>
        
        <div class="content">
            <p class="greeting">Dear ${recipientName || 'Valued Client'},</p>
            
            <p class="success-message">Your booking has been successfully processed and confirmed!</p>
            
            <div class="booking-details">
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${bookingId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Date:</span>
                    <span class="detail-value">${new Date(date).toDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="amount-highlight">${totalAmount ? `Ksh ${totalAmount}` : 'Not Specified'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="color: #00c853;">Confirmed</span>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 15H11V13H9V15ZM9 11H11V5H9V11Z" fill="#1e3c72"/>
                    </svg>
                    What Happens Next?
                </h3>
                <ul class="steps-list">
                    <li>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#00c853"/>
                        </svg>
                        You will receive property access details within 24 hours
                    </li>
                    <li>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#00c853"/>
                        </svg>
                        Our team will contact you to confirm check-in arrangements
                    </li>
                    <li>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#00c853"/>
                        </svg>
                        Prepare your identification for the check-in process
                    </li>
                </ul>
            </div>
            
            <div class="property-features">
                <h4>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="#1e3c72"/>
                        <path d="M10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15Z" fill="#1e3c72"/>
                        <path d="M10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" fill="#1e3c72"/>
                    </svg>
                    Property Highlights
                </h4>
                <div class="features-grid">
                    <div class="feature-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#1e3c72"/>
                        </svg>
                        24/7 Security
                    </div>
                    <div class="feature-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#1e3c72"/>
                        </svg>
                        Free WiFi
                    </div>
                    <div class="feature-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#1e3c72"/>
                        </svg>
                        Parking Available
                    </div>
                    <div class="feature-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 12L3 8L4.41 6.59L7 9.17L11.59 4.58L13 6L7 12Z" fill="#1e3c72"/>
                        </svg>
                        Fully Furnished
                    </div>
                </div>
            </div>
            
            <div class="confirmation-note">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 15H11V13H9V15ZM9 11H11V5H9V11Z" fill="#ff8c00"/>
                </svg>
                <div>
                    <strong>Important:</strong> Please keep this confirmation email for your records. You may need to present it during check-in.
                </div>
            </div>
            
            <div class="download-section">
                <a href="#" class="download-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 9H11V3H5V9H2L8 15L14 9Z" fill="white"/>
                    </svg>
                    Download Receipt
                </a>
                <a href="#" class="download-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3H2C1.44772 3 1 3.44772 1 4V12C1 12.5523 1.44772 13 2 13H14C14.5523 13 15 12.5523 15 12V4C15 3.44772 14.5523 3 14 3Z" stroke="white" stroke-width="1.5"/>
                        <path d="M1 4L8 8.5L15 4" stroke="white" stroke-width="1.5"/>
                    </svg>
                    View Booking Details
                </a>
            </div>
            
            <div class="closing">
                <p>We look forward to hosting you and ensuring you have a wonderful experience!</p>
                
                <div class="team-name">Housika Bookings Team</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="contact-info">
                <div class="contact-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3H2C1.44772 3 1 3.44772 1 4V12C1 12.5523 1.44772 13 2 13H14C14.5523 13 15 12.5523 15 12V4C15 3.44772 14.5523 3 14 3Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M1 4L8 8.5L15 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>bookings@housika.co.ke</span>
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

        const result = await zepto.sendBookingConfirmation({ 
            to, subject, htmlbody, recipientName: recipientName || 'Client',
        });
        return c.json({ success: true, message: 'Booking email sent successfully.', result, timestamp }, 200);
    } catch (err) {
        const errorType = err instanceof ZeptoMailError ? 'EMAIL_SERVICE_ERROR' : 'REQUEST_ERROR';
        return c.json({ success: false, error: errorType, message: err.message || 'Unexpected error.', timestamp }, 500);
    }
};