# ðŸš€ Complete Setup Instructions

## Prerequisites

Before starting, ensure you have:
- âœ… Node.js 16+ installed ([Download](https://nodejs.org/))
- âœ… npm (comes with Node.js)
- âœ… A text editor (VS Code recommended - [Download](https://code.visualstudio.com/))
- âœ… An Open Router account ([Sign up for free](https://openrouter.ai))

---

## Step-by-Step Installation

### 1ï¸âƒ£ Navigate to Project Directory
```bash
cd "C:\Users\soumi\OneDrive\Desktop\AI/ML in Extractive Metallurgy"
```

### 2ï¸âƒ£ Install Dependencies
```bash
npm install
```
This will download and install all required packages.
*Might take 2-3 minutes on first run*

### 3ï¸âƒ£ Create Environment File
**Option A: Using Command Line**
```bash
copy .env.example .env
```

**Option B: Manual (Windows)**
1. Find `.env.example` file in root folder
2. Right-click â†’ Copy
3. Right-click in empty space â†’ Paste
4. Rename to `.env`

### 4ï¸âƒ£ Get Your API Key
1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Click "Sign Up" (it's free!)
3. Complete registration
4. Go to "API Keys"
5. Create a new key
6. Copy the key

### 5ï¸âƒ£ Configure API Key
1. Open `.env` file in VS Code
2. Find: `OPENROUTER_API_KEY=your_api_key_here`
3. Replace `your_api_key_here` with your actual key
4. Save file (Ctrl+S)

**Example:**
```
OPENROUTER_API_KEY=sk-or-xxx-yyy-zzz
```

### 6ï¸âƒ£ Start Development Server
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

---

## ðŸŽ‰ Success Indicators

You'll know it's working when:
- âœ… Terminal shows "VITE v5.0.0" 
- âœ… Browser opens with dark blue dashboard theme
- âœ… Four navigation tabs visible (Dashboard, Process Analyzer, Recovery Prediction, Environmental Impact)
- âœ… You can see charts and metric cards

---

## ðŸ“Š Testing the Dashboard

### Test 1: View Dashboard
1. Start app with `npm run dev`
2. You should see:
   - Process Efficiency: 87.3%
   - Metal Recovery Rate: 92.1%
   - Charts with data
   - System status alerts

### Test 2: Use Process Analyzer
1. Click "Process Analyzer" tab
2. Fill in sample data:
   - Process Type: "Copper Leaching"
   - Efficiency: 85
   - Temperature: 70
   - Pressure: 2.5
   - Issues: "Slow leaching"
3. Click "Get AI/ML Recommendations"
4. Wait for AI/ML response (10-30 seconds)
5. You should see recommendations appear

### Test 3: Predict Recovery
1. Click "Recovery Prediction" tab
2. Fill in sample data:
   - Ore Grade: 2.5
   - Leaching Time: 8
   - Temperature: 65
   - Chem. Concentration: 15
   - pH: 1.5
3. Click "Predict Recovery Rate"
4. See AI/ML prediction

### Test 4: Environmental Analysis
1. Click "Environmental Impact" tab
2. Enter sample metrics
3. Click "Analyze Environmental Impact"
4. Review sustainability recommendations

---

## ðŸ”§ Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for linting errors
npm run lint
```

---

## ðŸ“ Project Files Created

```
Your Project Root/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ main.jsx                    â† React entry point
â”‚   â”œâ”€â”€ App.jsx                     â† Main component
â”‚   â”œâ”€â”€ index.css                   â† Tailwind styles
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â””â”€â”€ Header.jsx              â† Navigation bar
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ Dashboard.jsx           â† Home dashboard
â”‚   â”‚   â”œâ”€â”€ ProcessAnalyzer.jsx     â† Optimization tool
â”‚   â”‚   â”œâ”€â”€ RecoveryPrediction.jsx  â† Prediction module
â”‚   â”‚   â””â”€â”€ EnvironmentalImpact.jsx â† Impact analysis
â”‚   â””â”€â”€ services/
â”‚       â””â”€â”€ openRouterService.js    â† API integration
â”‚
â”œâ”€â”€ Configuration Files:
â”‚   â”œâ”€â”€ index.html                  â† HTML entry
â”‚   â”œâ”€â”€ package.json                â† Dependencies list
â”‚   â”œâ”€â”€ vite.config.js             â† Build config
â”‚   â”œâ”€â”€ tailwind.config.js         â† Tailwind config
â”‚   â”œâ”€â”€ postcss.config.js          â† CSS processing
â”‚   â”œâ”€â”€ .eslintrc.json             â† Code quality
â”‚   â””â”€â”€ .env.example               â† Template for secrets
â”‚
â”œâ”€â”€ Documentation:
â”‚   â”œâ”€â”€ README.md                   â† Full documentation
â”‚   â”œâ”€â”€ QUICKSTART.md              â† Quick start guide
â”‚   â”œâ”€â”€ REPORT_GUIDELINES.md       â† Report writing help
â”‚   â””â”€â”€ SETUP_INSTRUCTIONS.md      â† This file
â”‚
â””â”€â”€ Git Files:
    â”œâ”€â”€ .gitignore                 â† What to exclude from git
    â””â”€â”€ README.md                  â† Project overview
```

---

## âš ï¸ Important Security Notes

### ðŸ”’ Protect Your API Key
- **NEVER commit `.env` file to Git**
- **NEVER share your API key**
- **Use `.gitignore`** (already configured)
- The `.env` file should stay local only

### âœ… Good Practice
```bash
# DO NOT do this
git add .env
git commit -m "Add API key"

# Only commit tracked files
git add .
git commit -m "Update features"
```

---

## ðŸ› Troubleshooting

### Issue: `npm: command not found`
**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: `Port 3000 already in use`
**Solution:** The app will use a different port (3001, 3002, etc.). Check terminal output for the correct URL.

### Issue: `Cannot find module 'react'`
**Solution:** Run `npm install` again

### Issue: "Failed to get recommendations" Error
**Possible causes:**
- API key is incorrect
- Account has no credits
- Internet connection is down
- Open Router API is temporarily down

**Solutions:**
1. Double-check `.env` file
2. Visit [openrouter.ai](https://openrouter.ai) and verify account
3. Check internet connection
4. Try again after 5 minutes

### Issue: Styles not applied (plain looking)
**Solution:** Rebuild the project
```bash
npm run build
npm run preview
```

---

## ðŸš€ Deployment

### Local Only (Development)
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
Creates `dist/` folder with production files ready to deploy.

### Deploy to Vercel (Free)
1. Push code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy with one click

---

## ðŸ“š Learning Resources

- **React:** [react.dev](https://react.dev)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)
- **Vite:** [vitejs.dev](https://vitejs.dev)
- **Open Router:** [openrouter.ai/docs](https://openrouter.ai/docs)
- **Recharts:** [recharts.org](https://recharts.org)

---

## âœ… Next Steps After Installation

1. âœ… Run the app successfully
2. âœ… Test all four main pages
3. âœ… Try using AI/ML recommendations with real data
4. âœ… Document results for your report
5. âœ… Customize for your specific metallurgy process
6. âœ… Write your handwritten report

---

## ðŸ“ž Quick Help

**Can't connect to API?**
- Check internet connection
- Verify API key is correct
- Try a different browser

**Need to reset everything?**
```bash
# Delete dependencies and reinstall
rm -r node_modules
npm install
```

**Want to stop the server?**
- Press `Ctrl+C` in terminal

**Want to clear browser cache?**
- Press `Ctrl+Shift+Delete` in browser
- Clear cache and cookies

---

## ðŸŽ¯ Your Project Is Ready! ðŸŽ‰

You now have a fully functional AI/ML-driven extractive metallurgy dashboard.

**Next:** Follow the QUICKSTART.md for rapid testing, or start writing your report using REPORT_GUIDELINES.md.

Good luck with your project! ðŸš€


