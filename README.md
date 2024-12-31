# Combo - Smart Sports Streaming Package Finder

A smart assistant that helps sports fans find the most cost-effective streaming package combinations for their favorite teams.

## Demo

https://github.com/user-attachments/assets/ce44644d-bc7b-41f0-b1e3-acd82826cc1d

## Features

- 🎯 Find optimal streaming package combinations
- 💰 Compare monthly and yearly subscription costs
- 📊 View coverage analysis for each package
- 🗓️ Filter by date ranges or upcoming games only
- 💾 Save and manage search history
- 🌐 Support for multiple leagues and teams
- 📱 Responsive design for all devices

## Project Structure

```
combo/
├── backend/
│   ├── data/
│   │   └── bc_game.csv         # Game data
│   ├── models/
│   │   ├── data_loader.py      # Data loading utilities
│   │   ├── game.py             # Game model
│   │   └── package_analyzer.py # Analysis engine
│   ├── routes/
│   │   └── api.py             # API endpoints
│   ├── services/
│   │   └── package_service.py # Business logic
│   └── app.py                 # Main backend application
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── SavedSearches.js
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Styles
│   │   └── index.js           # Entry point
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Backend Setup
1. Create a virtual environment using [miniconda](https://docs.anaconda.com/free/miniconda/miniconda-install/):   
   ```bash
   conda create -n streaming python=3.10
   conda activate streaming
   ```

2. Install dependencies:   
   ```bash
   pip install -r requirements.txt   
   cd backend
   ```

3. Run backend app:   
   ```bash
   python app.py  
   ```

### Frontend Setup
1. Install dependencies:   
   ```bash
   cd frontend
   npm install   
   ```

2. Start development server:   
   ```bash
   npm start 
   ```

## Technical Details

### Core Algorithm
The package recommendation engine uses a modified Set Cover algorithm to:
1. Analyze team schedules and broadcast rights
2. Calculate optimal package combinations
3. Minimize total subscription costs
4. Maximize game coverage

### Key Features Implementation
- **Smart Filtering**: Dynamically updates available leagues based on selected teams
- **Flexible Date Handling**: Supports both date range and upcoming games filters
- **Cost Analysis**: Compares monthly vs yearly subscription options
- **Search History**: Locally stores and manages past searches
- **Coverage Visualization**: Shows percentage of games covered by each package

### Performance Optimizations
- Efficient set operations for package analysis
- Smart caching of frequently accessed data
- Optimized league filtering based on team selection
- Responsive UI updates with minimal re-renders

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
Based on the [CHECK24 GenDev Streaming Package Comparison Challenge](https://github.com/check24-scholarships/check24-best-combination-challenge).