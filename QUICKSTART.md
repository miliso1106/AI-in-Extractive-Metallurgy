# Quick Start Guide

## âš¡ Get Started in 5 Minutes

### Step 1: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 2: Set Up Your API Key
1. Open `.env.example` file
2. Copy all content
3. Create a new file called `.env` in the root directory
4. Paste the content
5. Replace `your_api_key_here` with your actual Open Router API key

**Don't have an API key?**
- Go to https://openrouter.ai
- Sign up (free)
- Create an API key
- Copy it to `.env` file

### Step 3: Start the Development Server
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000` ðŸŽ‰

---

## ðŸ“Š What Each Page Does

### 1. Dashboard (Home)
- See all key metrics at a glance
- 24-hour efficiency trend
- Metal recovery rates for different metals
- System status and alerts

### 2. Process Analyzer
- Input your current process parameters
- Click "Get AI Recommendations"
- Get specific suggestions to improve efficiency
- AI will analyze temperature, pressure, issues, etc.

### 3. Recovery Prediction
- Input leaching parameters (ore grade, time, temperature, etc.)
- Click "Predict Recovery Rate"
- See AI's prediction of how much metal you'll recover
- Get confidence levels and risk assessments

### 4. Environmental Impact
- Input your daily waste, water, energy, and emissions data
- Click "Analyze Environmental Impact"
- Get recommendations for sustainability
- See cost-benefit analysis

---

## ðŸ”§ Commands Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## ðŸ“± Tips & Tricks

âœ… **Pro Tips:**
- Save your parameter values (temperature, pressure ranges) for your specific process
- Use realistic values from your actual extraction process
- Read the AI recommendations carefully - they're based on metallurgy principles
- Check back daily for new optimization opportunities as your process parameters change

âš ï¸ **Important:**
- Never share your `.env` file or API key
- Close the app when not using it (prevents unnecessary API calls)
- The AI uses Open Router API, so you need internet connection
- Free API credits are limited, so test carefully before running production

---

## ðŸ†˜ Common Issues & Fixes

### "Module not found" error
```bash
npm install
```

### "Failed to get recommendations"
- Check your `.env` file has the correct API key
- Make sure your Open Router account has credits
- Check your internet connection

### Port 3000 already in use
The app will automatically try a different port. Check the terminal output for the correct URL.

---

## ðŸ“š File Structure Overview

```
Your Project
â”œâ”€â”€ src/                    â† All your code goes here
â”‚   â”œâ”€â”€ pages/            â† The 4 main pages
â”‚   â”œâ”€â”€ components/       â† Reusable components (Header)
â”‚   â”œâ”€â”€ services/         â† AI integration code
â”œâ”€â”€ public/               â† Images, static files
â”œâ”€â”€ package.json          â† Dependency list
â”œâ”€â”€ .env                  â† YOUR API KEY (keep secret!)
â””â”€â”€ index.html            â† Main HTML file
```

---

## Next Steps

1. âœ… Install dependencies
2. âœ… Set up API key
3. âœ… Run the app
4. ðŸ“Š Try entering some data in Process Analyzer
5. ðŸ§ª Experiment with different parameters
6. ðŸ“ Document your results for your report

---

## Need Help?

1. Review the main README.md for detailed docs
2. Check the Troubleshooting section
3. Visit: https://openrouter.ai/docs
4. Check React docs: https://react.dev

Happy optimizing! ðŸš€

