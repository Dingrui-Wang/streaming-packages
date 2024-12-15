# Streaming Package Comparison App

A data-driven application that helps users find the optimal streaming package combinations for watching their favorite sports teams.

## Overview

This application solves the complex problem of finding the most cost-effective streaming package combinations by:
1. Analyzing team schedules and broadcast rights
2. Comparing streaming service offerings
3. Calculating optimal package combinations
4. Presenting personalized recommendations

## Technical Architecture

### Frontend
- React.js with TypeScript for type safety
- Redux for state management
- Material-UI for responsive design
- React Query for efficient data fetching

### Backend
- Python FastAPI for high-performance REST API
- PostgreSQL for relational data storage
- Redis for caching frequently accessed data
- Celery for background task processing

## Core Algorithm

The package recommendation engine uses a dynamic programming approach to solve the "Set Cover" problem:

1. **Data Collection**
   - Team schedules from sports league APIs
   - Streaming service offerings and blackout rules
   - Real-time pricing data

2. **Optimization Process**
   - Builds a coverage matrix (Games × Packages)
   - Uses weighted set cover algorithm to minimize cost
   - Considers regional blackouts and local availability

3. **Result Generation**
   - Ranks package combinations by:
     - Total cost
     - Coverage percentage
     - Number of required subscriptions

## Performance Optimizations

### Implemented
- Redis caching for frequently requested team combinations
- Batch processing for multiple team analyses
- Precomputed coverage matrices for popular teams
- Database indexing on frequently queried fields

### Future Optimizations
1. **Algorithm Improvements**
   - Parallel processing for large team sets
   - Progressive loading of recommendations
   - Machine learning for personalized rankings

2. **Caching Strategy**
   - Geographic-based cache partitioning
   - Predictive caching during peak seasons
   - Cache warming for trending teams

3. **Infrastructure**
   - CDN integration for static assets
   - Regional API deployment
   - Horizontal scaling during high-traffic periods

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL 12+
- Redis 6+

### Backend Setup
1. Create a virtual environment:   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   .\venv\Scripts\activate   # Windows   ```

2. Install dependencies:   ```bash
   pip install -r requirements.txt   ```

3. Configure environment:   ```bash
   cp .env.example .env#Edit .env with your configuration   ```

### Frontend Setup
1. Install dependencies:   ```bash
   npm install   ```

2. Start development server:   ```bash
   npm run dev   ```

## API Documentation
API documentation is available at `/docs` when running the server.

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.