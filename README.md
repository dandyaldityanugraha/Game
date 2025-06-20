# Catch the Book of Mormon Game

An interactive game that teaches about the importance of the Book of Mormon through gameplay and reflection.

## Email Setup Instructions

To enable automatic email notifications when users submit reflections, follow these steps:

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Set Up Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" (or your preferred email provider)
4. Connect your email account (dandyalditya@go.byuh.edu)
5. Note down the Service ID (e.g., "service_abc123")

### 3. Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Name it "Game Reflection Notification"
4. Set up the template with these variables:
   - `{{to_email}}` - recipient email
   - `{{subject}}` - email subject
   - `{{message}}` - email body
5. Note down the Template ID (e.g., "template_xyz789")

### 4. Get Your Public Key
1. Go to "Account" → "API Keys"
2. Copy your Public Key

### 5. Update the Code
Replace the placeholders in `index.html`:
- Replace `YOUR_PUBLIC_KEY_HERE` with your actual public key
- Replace `service_id` in `script.js` with your service ID
- Replace `template_id` in `script.js` with your template ID

### Example:
```javascript
// In index.html
emailjs.init("public_key_here");

// In script.js
emailjs.send('service_abc123', 'template_xyz789', emailData)
```

## How It Works
- When a user completes the game and submits their reflection
- The reflection is saved locally and sent directly to your email
- You'll receive a notification with the user's game score and reflection answers
- No email client required on the user's side

## Features
- Interactive gameplay with character selection
- Progressive difficulty based on score
- Spiritual messages and blessings
- Reflection prompts for deeper learning
- Email notifications for all submissions
- Local storage for reflection history
- Mobile-responsive design

## Files
- `index.html` - Main game interface
- `script.js` - Game logic and functionality
- `style.css` - Styling and responsive design
- `images/` - Game assets and characters