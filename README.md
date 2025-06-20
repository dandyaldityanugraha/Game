# Catch the Book of Mormon Game

An interactive game that teaches about the importance of the Book of Mormon through gameplay and reflection.

## Email Notification Setup (Google Forms - Easiest Method)

To get email notifications when users submit reflections, follow these steps:

### 1. Create Google Form
1. Go to [Google Forms](https://forms.google.com)
2. Create a new form titled "Game Reflection Submissions"
3. Add these questions:
   - **Player Name** (Short answer)
   - **Date** (Short answer)
   - **Time** (Short answer) 
   - **Game Score** (Short answer)
   - **Books Caught** (Short answer)
   - **Blessings Reflection** (Long answer)
   - **Life Without BOM** (Long answer)
   - **Key Principle** (Long answer)

### 2. Enable Email Notifications
1. Click the **Responses** tab
2. Click the **three dots** menu (⋮)
3. Select **Get email notifications for new responses**
4. Enter your email: `dandyalditya@go.byuh.edu`
5. Save settings

### 3. Get Form ID and Entry IDs
1. Click **Send** button
2. Copy the form URL
3. Extract the form ID from the URL: `https://docs.google.com/forms/d/FORM_ID_HERE/formResponse`
4. To get entry IDs:
   - Right-click on each question → **Inspect**
   - Look for `entry.XXXXXXXXX` in the HTML
   - Note down each entry ID

### 4. Update the Code
Replace the placeholders in `script.js`:
- Replace `YOUR_FORM_ID` with your actual form ID
- Replace the entry IDs (like `entry.0000000000`) with your actual entry IDs

### Example:
```javascript
const formUrl = "https://docs.google.com/forms/d/1ABC123DEF456/formResponse";
formData.append("entry.0000000000", latestReflection.name); // Player Name
formData.append("entry.1234567890", latestReflection.date); // Date
```

## Alternative Methods

### Option 2: Formspree (Also Easy)
1. Go to [Formspree.io](https://formspree.io)
2. Create account and form
3. Get form endpoint
4. Update code to use Formspree instead

### Option 3: Netlify Forms (If hosting on Netlify)
1. Add `netlify` attribute to form
2. Netlify automatically handles submissions
3. Get email notifications in Netlify dashboard

### Option 4: Simple Analytics
1. Add Google Analytics to track page views
2. Set up goals for form submissions
3. Get notifications when goals are completed

## How It Works
- When a user completes the game and submits their reflection
- The reflection is automatically submitted to your Google Form
- You'll receive an email notification with all the reflection details including the player's name
- All submissions are also saved in Google Sheets for easy viewing

## Features
- Interactive gameplay with character selection
- Progressive difficulty based on score
- Spiritual messages and blessings
- Reflection prompts for deeper learning
- Player name identification
- Email notifications for all submissions
- Local storage for reflection history
- Mobile-responsive design

## Files
- `index.html` - Main game interface
- `script.js` - Game logic and functionality
- `style.css` - Styling and responsive design
- `images/` - Game assets and characters