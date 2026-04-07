# AI-Driven Extractive Metallurgy Dashboard

## 📋 Project Overview

A modern, interactive dashboard for optimizing extractive metallurgy processes using AI/ML technologies. The application now combines OpenRouter-based AI analysis with a dedicated per-process ML prediction workflow that uses exported model artefacts and offline best-model benchmarking.

**Project Goal:** Increase extraction process efficiency through AI-powered insights and recommendations.

---

## 🎯 Key Features

### 1. **Real-Time Monitoring Dashboard**
   - Live efficiency tracking (24-hour trend)
   - Metal recovery rates by ore type
   - System alerts and status indicators
   - Key performance metrics visualization

### 2. **Process Analyzer**
   - Input custom process parameters (temperature, pressure, efficiency, issues)
   - Get AI-powered optimization recommendations
   - Identify bottlenecks and improvement opportunities
   - Expected efficiency gains calculation

### 3. **Recovery Rate Prediction**
   - Predict metal recovery rates based on leaching parameters
   - Analyze ore grade, temperature, pH, and chemical concentration
   - AI confidence levels for predictions
   - Risk factor assessment

### 4. **ML Prediction**
   - Dedicated per-process recovery prediction page
   - Live browser-side prediction using linear regression artefacts
   - Input guardrails based on dataset min/max ranges
   - Displays latest offline best-model metrics for each process

### 5. **Environmental Impact Analysis**
   - Assess waste generation, water usage, and energy consumption
   - Calculate CO2 emissions footprint
   - Get sustainability recommendations from AI
   - Cost-benefit analysis for improvements

---

## 🛠️ Tech Stack

- **Frontend:** React 18.2 with Vite
- **Styling:** Tailwind CSS 3.3 + Custom CSS
- **Charts:** Recharts 2.10 (data visualization)
- **Icons:** Lucide React 0.292
- **API Client:** Axios 1.6
- **LLM Integration:** OpenRouter API
- **Offline ML:** scikit-learn, XGBoost, SVR, Matplotlib, Seaborn
- **Environment:** Node.js 16+

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/miliso1106/AI-in-Extractive-Metallurgy.git
cd AI-in-Extractive-Metallurgy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Open Router API key
# Get your free API key at https://openrouter.ai
OPENROUTER_API_KEY=your_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
```

---

## 🔑 Getting Your Open Router API Key

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy it to your `.env` file

---

## 📊 Dashboard Components

### Main Navigation
- **Dashboard:** Overview of all key metrics
- **Process Data:** Inspect the curated metallurgy datasets
- **Process Analyzer:** Get optimization recommendations
- **Recovery Prediction:** LLM-based recovery analysis from input conditions
- **ML Prediction:** Deterministic per-process prediction using exported artefacts
- **Environmental Impact:** Assess sustainability metrics

### Data Visualization
- Line charts for efficiency trends
- Bar charts for metal recovery by type
- Stat cards for key metrics
- Alert panels for system status

---

## 🧠 AI Integration

The dashboard uses OpenRouter API to access various LLMs for:

1. **Process Optimization**
   - Analyzes current parameters
   - Identifies inefficiencies
   - Recommends specific improvements
   - Estimates implementation timeline

2. **Recovery Prediction**
   - Generates LLM-based recovery analysis
   - Assesses confidence levels
   - Identifies success factors
   - Provides risk assessment

3. **Environmental Analysis**
   - Evaluates sustainability impact
   - Recommends waste reduction strategies
   - Calculates ROI for improvements
   - Suggests green technologies

### ML Prediction Pipeline
- `src/pages/MLPrediction.jsx` provides the live ML UI
- `src/data/ml_models_by_process.json` stores exported linear-surrogate artefacts per process
- `src/data/best_models_summary.json` stores the latest offline best-model statistics
- `ml/train_and_generate_report_graphs.py` compares Linear Regression, Random Forest, SVR, and XGBoost and generates report-ready tables/graphs
- `ml/colab_per_process_compare.py` supports a lighter Colab workflow for per-process comparison/export

---

## 🎨 Customization

### Styling
- Tailwind configuration: `tailwind.config.js`
- Global styles: `src/index.css`
- Color scheme is easily customizable

### Adding New Processes
Modify the `ProcessAnalyzer` component to include new extraction methods:

```javascript
const processTypes = [
  'Copper Leaching',
  'Gold Cyanidation',
  'Zinc Roasting',
  // Add your processes here
];
```

### Modifying API Calls
Edit `src/services/openRouterService.js` to customize:
- Prompt engineering
- Model selection
- Response parsing
- Error handling

---

## 📁 Project Structure

```
.
├── index.html                      # Entry point
├── package.json                    # Dependencies
├── tailwind.config.js             # Tailwind configuration
├── vite.config.js                 # Vite configuration
├── postcss.config.js              # PostCSS configuration
│
├── src/
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Main app component
│   ├── index.css                  # Global styles
│   │
│   ├── components/
│   │   └── Header.jsx             # Navigation header
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── ProcessAnalyzer.jsx    # Process optimization
│   │   ├── RecoveryPrediction.jsx # LLM-based recovery analysis
│   │   ├── MLPrediction.jsx       # Per-process ML prediction
│   │   └── EnvironmentalImpact.jsx # Impact analysis
│   │
│   ├── data/
│   │   ├── ml_model.json          # Default fallback artefact
│   │   ├── ml_models_by_process.json # Per-process linear artefacts
│   │   └── best_models_summary.json  # Latest offline best-model stats
│   │
│   └── services/
│       └── openRouterService.js   # API integration
│
├── ml/
│   ├── colab_per_process_compare.py # Colab comparison/export script
│   ├── train_and_generate_report_graphs.py # Full ML evaluation pipeline
│   └── README.md                    # ML workflow notes
│
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

---

## 🚀 Usage Examples

### Example 1: Optimize Copper Leaching Process
1. Navigate to "Process Analyzer"
2. Enter:
   - Process Type: "Copper Leaching"
   - Current Efficiency: 85%
   - Temperature: 70°C
   - Pressure: 2.5 atm
   - Issues: "Slow leaching rate"
3. Click "Get AI Recommendations"
4. View detailed AI suggestions

### Example 2: Predict Gold Recovery
1. Navigate to "Recovery Prediction"
2. Input leaching parameters:
   - Ore Grade: 5.2%
   - Leaching Time: 24 hours
   - Temperature: 80°C
   - Chemical Concentration: 20%
   - pH: 2.0
3. Click "Predict Recovery Rate"
4. Review prediction with confidence metrics

### Example 3: Run the ML Predictor
1. Navigate to "ML Prediction"
2. Select a process such as "Gold Cyanidation" or "Copper Flotation"
3. Adjust the four process-specific features within the allowed ranges
4. Review the live predicted recovery rate
5. Compare it with the displayed offline best model and CV/holdout metrics

### Example 4: Environmental Assessment
1. Navigate to "Environmental Impact"
2. Enter current metric values
3. Get AI recommendations for sustainability improvements
4. Review cost-benefit analysis

---

## 📈 Key Metrics Explained

- **Efficiency (%):** Percentage of theoretical maximum output achieved
- **Recovery Rate (%):** Percentage of valuable metal extracted from ore
- **CV R² / Holdout R²:** Offline model goodness-of-fit during cross-validation and test split evaluation
- **MAE:** Mean Absolute Error between predicted and actual recovery
- **Waste Reduction (%):** Improvement in waste minimization
- **Energy Optimization (%):** Reduction in energy consumption
- **CO2 Emissions:** Carbon footprint in kg equivalent

---

## 🔐 Security Notes

- **Never commit `.env` file** to version control
- Use `VITE_` prefix for environment variables (ignored in .gitignore)
- API keys are only used server-side (no exposure in frontend code)
- Keep dependencies updated for security patches

---

## 🐛 Troubleshooting

### Issue: "Failed to get recommendations"
- Check your API key in `.env`
- Ensure you have Open Router account with credits
- Verify internet connection

### Issue: Charts not displaying
- Clear browser cache
- Check browser console for errors
- Ensure Recharts is properly installed

### Issue: ML Prediction page looks outdated or inconsistent
- Check that `src/data/ml_models_by_process.json` and `src/data/best_models_summary.json` are both updated from the latest training run
- Rebuild with `npm run build` after replacing ML artefacts
- Verify the selected process exists in both JSON files

### Issue: Styling not applied
- Rebuild with `npm run build`
- Clear `dist/` folder and rebuild
- Check Tailwind CSS configuration

---

## 📝 Handwritten Report

A physical handwritten report documenting:
- Project objectives and methodology
- Technical architecture
- Test results and improvements achieved
- Environmental impact analysis
- Recommendations for future work

*(To be completed and submitted separately)*

---

## 🤝 Contributing

Potential improvements:
- Add more metal recovery models
- Implement real-time data streaming
- Create mobile-responsive enhancements
- Add export features (PDF, CSV)
- Integrate with IoT sensors

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

Student Project: Extractive Metallurgy Optimization using AI/ML

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Open Router documentation
3. Verify environment configuration

---

## 🎓 References

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Open Router API](https://openrouter.ai)
- [Extractive Metallurgy Principles](https://en.wikipedia.org/wiki/Extractive_metallurgy)

---

**Created:** April 2026
**Project Type:** Educational - AI/ML Application
**Status:** Development ✅
# AI-in-Extractive-Metallurgy


