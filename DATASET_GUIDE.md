# 📊 Dataset Management Guide

## Overview

Your AI Metallurgy Dashboard now includes a complete dataset management system with:
- 10 sample metallurgical processes
- Real-time data table display
- Advanced filtering and sorting
- CSV export functionality
- Environmental impact tracking

---

## 📁 Dataset Structure

### Location
```
src/data/processData.json
```

### Data Format
```json
{
  "processes": [
    {
      "id": 1,
      "processName": "Copper Leaching",
      "oreGrade": 2.5,
      "temperature": 70,
      "pressure": 2.5,
      "leachingTime": 8,
      "recoveryRate": 94.2,
      "efficiency": 87.3,
      "wasteGenerated": 150,
      "waterUsage": 500,
      "energyConsumption": 250,
      "co2Emissions": 1200,
      "status": "Optimal",
      "timestamp": "2024-01-15 10:30"
    }
  ]
}
```

---

## 📋 Field Descriptions

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| **id** | Integer | - | Unique process identifier |
| **processName** | String | - | Name of extraction process |
| **oreGrade** | Float | % | Metal content percentage in ore |
| **temperature** | Integer | °C | Operating temperature |
| **pressure** | Float | atm | Operating pressure (atmospheres) |
| **leachingTime** | Integer | hours | Duration of leaching/processing |
| **recoveryRate** | Float | % | % of metal successfully extracted |
| **efficiency** | Float | % | Overall process efficiency |
| **wasteGenerated** | Integer | tons/day | Daily waste production |
| **waterUsage** | Integer | m³/day | Daily water consumption |
| **energyConsumption** | Integer | MWh/day | Daily energy usage |
| **co2Emissions** | Integer | kg/day | Daily CO₂ emissions |
| **status** | String | - | Optimal / Warning / Alert |
| **timestamp** | String | - | Data collection timestamp |

---

## 🎯 Sample Processes Included

### 1. Copper Leaching
- Ore Grade: 2.5% | Recovery: 94.2% | Efficiency: 87.3% | Status: ✓ Optimal

### 2. Gold Cyanidation
- Ore Grade: 5.2% | Recovery: 91.5% | Efficiency: 84.2% | Status: ✓ Optimal

### 3. Silver Leaching
- Ore Grade: 3.8% | Recovery: 89.3% | Efficiency: 81.5% | Status: ⚠ Warning

### 4. Zinc Roasting
- Ore Grade: 6.1% | Recovery: 93.1% | Efficiency: 88.9% | Status: ✓ Optimal

### 5. Lead Smelting
- Ore Grade: 4.3% | Recovery: 88.7% | Efficiency: 79.2% | Status: ✕ Alert

### 6. Nickel Laterite
- Ore Grade: 1.8% | Recovery: 85.4% | Efficiency: 76.1% | Status: ✕ Alert

### 7. Copper Flotation
- Ore Grade: 1.2% | Recovery: 92.8% | Efficiency: 86.5% | Status: ✓ Optimal

### 8. Aluminum Bauxite
- Ore Grade: 45.0% | Recovery: 96.2% | Efficiency: 91.8% | Status: ✓ Optimal

### 9. Iron Magnetite
- Ore Grade: 65.0% | Recovery: 94.5% | Efficiency: 89.3% | Status: ✓ Optimal

### 10. Cobalt Leaching
- Ore Grade: 0.5% | Recovery: 87.9% | Efficiency: 80.4% | Status: ⚠ Warning

---

## 🎛️ Dashboard Features

### 📊 Process Data Page

**Location:** Database icon in navigation menu

**Features:**
1. **Statistics Summary**
   - Total number of processes
   - Average recovery rate
   - Average efficiency
   - Total CO₂ emissions

2. **Status Overview**
   - Count of Optimal processes
   - Count of Warning processes
   - Count of Alert processes

3. **Environmental Metrics**
   - Average waste generated
   - Average water usage
   - Average energy consumption

4. **Data Table**
   - Sortable columns (click headers)
   - Real-time search
   - Filter by status
   - Progress bars for metrics
   - Color-coded performance

5. **Export Functionality**
   - **Export to CSV:** Download all data for Excel analysis
   - **Refresh Data:** Reload data from source
   - **Status Badges:** Visual process health indicators

---

## 🔍 How to Use the Table

### Sorting
- Click any column header to sort ascending/descending
- Arrow indicators show current sort direction
- Supports numerical and alphabetical sorting

### Searching
```
Search Box: "Copper"
Result: Shows only Copper Leaching and Copper Flotation
```

### Filtering by Status
- **All Status:** Show all processes
- **Optimal:** Efficiency > 85%, recovery > 90%
- **Warning:** Efficiency 80-85%, minor issues
- **Alert:** Efficiency < 80%, needs attention

### Data Summary
Each filter/search shows:
- Number of matching processes
- Average recovery rate
- Average efficiency
- Total CO₂ emissions for selected processes

---

## 📤 Exporting Data

### CSV Export
1. Go to "Process Data" page
2. Click "Export to CSV" button
3. File downloads as `process_data.csv`
4. Open in Excel/Google Sheets for analysis

### CSV Format Example
```
id,processName,oreGrade,temperature,pressure,...
1,Copper Leaching,2.5,70,2.5,...
2,Gold Cyanidation,5.2,25,1.0,...
```

### Columns in Export
All 15 fields are exported:
- Process identifiers
- Operating parameters
- Performance metrics
- Environmental impact
- Status information
- Timestamp

---

## 📈 Dashboard Data Preview

### Dashboard Tab
The Dashboard home page includes:
- **Recent Process Data section**
- Shows first 5 processes in a mini-table
- Links to full "Process Data" page
- Quick view of critical metrics

### Quick Stats
- Process Efficiency: 87.3%
- Metal Recovery: 92.1%
- Waste Reduction: 34.2%
- Energy Optimization: 28.5%

---

## 🔄 How to Update the Dataset

### Method 1: Edit JSON File Directly
1. Open `src/data/processData.json`
2. Add or modify process objects
3. Save file
4. Refresh browser (auto-reload)

### Method 2: Add New Process
```json
{
  "id": 11,
  "processName": "Tin Leaching",
  "oreGrade": 3.2,
  "temperature": 85,
  "pressure": 2.0,
  "leachingTime": 10,
  "recoveryRate": 90.5,
  "efficiency": 83.2,
  "wasteGenerated": 175,
  "waterUsage": 450,
  "energyConsumption": 220,
  "co2Emissions": 1100,
  "status": "Optimal",
  "timestamp": "2024-01-15 14:00"
}
```

### Method 3: Bulk Update
1. Export current CSV
2. Edit in Excel
3. Convert back to JSON format
4. Replace `processData.json`

---

## 📊 Status Calculation Logic

### Optimal
```
- Efficiency > 85%
- Recovery Rate > 90%
- CO₂ Emissions < 1500 kg/day
```

### Warning
```
- Efficiency 80-85%
- Recovery Rate 85-90%
- CO₂ Emissions 1500-2000 kg/day
```

### Alert
```
- Efficiency < 80%
- Recovery Rate < 85%
- CO₂ Emissions > 2000 kg/day
```

---

## 📝 Real-World Application

### Using with Your Report

Include in your handwritten report:
1. **Data Analysis Section**
   - Screenshot of Process Data table
   - Statistics from dashboard
   - Efficiency trends

2. **Environmental Impact**
   - CO₂ emissions by process
   - Waste generation analysis
   - Water usage comparison

3. **Performance Comparison**
   - Best performing processes
   - Processes needing improvement
   - Recovery rate optimization

4. **Recommendations**
   - Based on data analysis
   - Specific parameter adjustments
   - Expected improvements

---

## 🔧 Customization Options

### Add More Processes
1. Open `processData.json`
2. Add new process object
3. Ensure unique ID
4. Maintain consistent field format

### Modify Columns
Edit `src/components/DataTable.jsx`:
```javascript
<TableHeader label="New Column" sortKey="fieldName" columnClass="w-28" />
```

### Change Status Thresholds
Edit `src/pages/ProcessDataPage.jsx`:
```javascript
// Modify threshold values for status determination
```

### Add New Features
- Filter by ore type
- Graph visualizations
- Historical data tracking
- Comparison tools

---

## 💡 Analysis Ideas for Your Report

### 1. Process Efficiency Analysis
- What are the most efficient processes?
- Which processes have room for improvement?
- Correlation between parameters and efficiency

### 2. Environmental Impact
- CO₂ emissions by process type
- Water usage optimization opportunities
- Waste reduction strategies

### 3. Recovery Rate Optimization
- Which parameters most affect recovery?
- Best ore grades for each process
- Temperature/pressure sweet spots

### 4. Cost-Benefit Analysis
- Energy cost vs. recovery gains
- Waste treatment costs
- Overall process profitability

---

## 🚀 Getting Started

### Quick Start
1. Open application at `http://localhost:3000`
2. Navigate to "Process Data" tab
3. Explore the data table
4. Try sorting and filtering
5. Export to CSV for spreadsheet analysis

### Integration with AI Features
The data works with other dashboard features:

**Process Analyzer:**
- Use real data for optimization recommendations
- Get AI suggestions for process improvements

**Recovery Prediction:**
- Input parameters from dataset
- Predict outcomes for different scenarios

**Environmental Impact:**
- Analyze actual environmental metrics
- Get AI recommendations for sustainability

---

## 📚 Advanced Features

### Real-Time Updates
Future enhancement: Connect to live data sources
- IoT sensor integration
- Real-time database connection
- Automatic data refresh

### Historical Analysis
Future enhancement: Track data over time
- Trend analysis
- Performance tracking
- Predictive analytics

### Predictive Models
Future enhancement: ML-powered predictions
- Forecast recovery rates
- Predict equipment failures
- Optimize parameters automatically

---

## 🐛 Troubleshooting

### Data Not Showing
- Check file location: `src/data/processData.json`
- Verify JSON format is valid
- Refresh browser page (Ctrl+R)

### Export Not Working
- Try different browser
- Check file download folder
- Ensure pop-ups are allowed

### Filtering Not Working
- Check status values are correct
- Verify search term matches process names
- Clear browser cache

---

## 📞 Support

For help with:
- **Data structure:** See Field Descriptions above
- **Using the table:** Check "How to Use" sections
- **Adding data:** Follow "Update Dataset" instructions
- **Integration:** See "Integration with AI Features"

---

## 📋 Checklist for Using This Feature

✅ **Setup**
- [ ] Open Process Data page
- [ ] Verify all 10 processes load
- [ ] Check statistics display correctly

✅ **Testing**
- [ ] Sort by different columns
- [ ] Search for specific process
- [ ] Filter by status
- [ ] Export to CSV

✅ **For Your Report**
- [ ] Take screenshots of table
- [ ] Document findings
- [ ] Include in environmental analysis
- [ ] Add recommendations

✅ **Presentation**
- [ ] Show data loading on dashboard
- [ ] Demonstrate filtering/sorting
- [ ] Export CSV live demo
- [ ] Reference in project explanation

---

**Last Updated:** April 2026
**Dataset Version:** 1.0
**Number of Processes:** 10 samples
**Total Data Points:** 150+ fields
