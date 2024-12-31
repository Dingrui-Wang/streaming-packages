import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './App.css';
import SavedSearches from './components/SavedSearches';

function FilterSection({ title, icon, children }) {
  return (
    <div className="filter-section">
      <div className="filter-header">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function GamesList({ games }) {
  return (
    <div className="games-list">
      <h3>Matched Games</h3>
      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-date">{new Date(game.date).toLocaleString()}</div>
            <div className="game-teams">
              <span className="home-team">{game.home_team}</span>
              <span className="vs">vs</span>
              <span className="away-team">{game.away_team}</span>
            </div>
            <div className="game-tournament">{game.tournament}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectionsSummary({ teams, leagues, startDate, endDate }) {
  return (
    <div className="selections-summary">
      <h3>Current Selections</h3>
      <div className="selections-grid">
        <div className="selection-group">
          <span className="selection-label">Teams:</span>
          <div className="selection-values">
            {teams.length > 0 ? (
              teams.map((team, index) => (
                <span key={team.value} className="selection-item">
                  {`${index + 1}. ${team.label}`}
                </span>
              ))
            ) : (
              <span className="selection-item">All teams</span>
            )}
          </div>
        </div>

        <div className="selection-group">
          <span className="selection-label">Leagues:</span>
          <div className="selection-values">
            {leagues.length > 0 ? (
              leagues.map(league => (
                <span key={league.value} className="selection-item">
                  {league.label}
                </span>
              ))
            ) : (
              <span className="selection-item">All leagues</span>
            )}
          </div>
        </div>

        <div className="selection-group">
          <span className="selection-label">Date Range:</span>
          <div className="selection-values">
            {(startDate || endDate) ? (
              <div className="date-range-display">
                {startDate && <span className="selection-item">From: {startDate.toLocaleDateString()}</span>}
                {endDate && <span className="selection-item">To: {endDate.toLocaleDateString()}</span>}
              </div>
            ) : (
              <span className="selection-item">All dates</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [results, setResults] = useState({ single_packages: [], minimum_combination: null });
  const [matchedGames, setMatchedGames] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const saveCurrentSearch = () => {
    const currentSearch = {
      teams: selectedTeams,
      leagues: selectedLeagues,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      timestamp: new Date().toISOString()
    };
    
    const updatedSearches = [...savedSearches, currentSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
  };

  const loadSavedSearch = (search) => {
    setSelectedTeams(search.teams);
    setSelectedLeagues(search.leagues);
    setStartDate(search.startDate ? new Date(search.startDate) : null);
    setEndDate(search.endDate ? new Date(search.endDate) : null);
    handleAnalyze();
  };

  const deleteSavedSearch = (index) => {
    const updatedSearches = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updatedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
  };

  const fetchFilteredLeagues = (selectedTeams) => {
    const teamValues = selectedTeams.map(team => team.value);
    
    fetch('http://localhost:5000/api/leagues/filtered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teams: teamValues }),
    })
      .then(res => res.json())
      .then(data => {
        const leagueOptions = data.map(league => ({
          value: league,
          label: league
        }));
        setLeagues(leagueOptions);
        setSelectedLeagues([]);
      })
      .catch(err => console.error('Error fetching filtered leagues:', err));
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/teams')
      .then(res => res.json())
      .then(data => {
        const teamOptions = data.map(team => ({
          value: team,
          label: team
        }));
        setTeams(teamOptions);
      })
      .catch(err => console.error('Error fetching teams:', err));

    // Fetch all leagues initially
    fetch('http://localhost:5000/api/leagues')
      .then(res => res.json())
      .then(data => {
        const leagueOptions = data.map(league => ({
          value: league,
          label: league
        }));
        setLeagues(leagueOptions);
      })
      .catch(err => console.error('Error fetching leagues:', err));
  }, []);

  const handleTeamChange = (newSelectedTeams) => {
    setSelectedTeams(newSelectedTeams);
    if (newSelectedTeams.length > 0) {
      fetchFilteredLeagues(newSelectedTeams);
    } else {
      // If no teams selected, fetch all leagues
      fetch('http://localhost:5000/api/leagues')
        .then(res => res.json())
        .then(data => {
          const leagueOptions = data.map(league => ({
            value: league,
            label: league
          }));
          setLeagues(leagueOptions);
        })
        .catch(err => console.error('Error fetching leagues:', err));
    }
  };

  useEffect(() => {
    if (upcomingOnly) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [upcomingOnly]);

  useEffect(() => {
    if (startDate || endDate) {
      setUpcomingOnly(false);
    }
  }, [startDate, endDate]);

  const handleAnalyze = () => {
    const formatDate = (date) => {
      if (!date) return null;
      return date.toISOString().split('.')[0];  // Remove milliseconds and Z
    };

    const requestData = {
      teams: selectedTeams.map(team => team.value),
      leagues: selectedLeagues.map(league => league.value),
      date_range: {
        start: formatDate(startDate),
        end: formatDate(endDate)
      },
      upcomingOnly: upcomingOnly
    };

    console.log('Analyzing with filters:', requestData);
    fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Analysis results:', data);
        setResults(data);
        setMatchedGames(data.matched_games || []);
      })
      .catch(err => {
        console.error('Error analyzing packages:', err);
        setResults({ single_packages: [], minimum_combination: null });
      });
  };

  const handleClearAll = () => {
    setSelectedTeams([]);
    setSelectedLeagues([]);
    setStartDate(null);
    setEndDate(null);
    setResults({ single_packages: [], minimum_combination: null });
    setMatchedGames([]);
    // Reset leagues to all available leagues
    fetch('http://localhost:5000/api/leagues')
      .then(res => res.json())
      .then(data => {
        const leagueOptions = data.map(league => ({
          value: league,
          label: league
        }));
        setLeagues(leagueOptions);
      })
      .catch(err => console.error('Error fetching leagues:', err));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Combo!</h1>
      <h2 className="subtitle text-center mb-8">Find the Best Streaming Package Combination for Your 🔥 Loving ⚽ Teams </h2>
      <div className="selection-notice">
        <span className="notice-icon">📝 Warm Notice:</span>
        <span className="notice-text">Leave any slot blank</span>
        <span className="notice-equals">🟰</span> 
        <span className="notice-text">Select All</span>
      </div>
      
      <div className="filters-container">
        <FilterSection 
          title="Select Teams" 
          icon={<svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
        >
          <Select
            isMulti
            options={teams}
            value={selectedTeams}
            onChange={handleTeamChange}
            placeholder="Select teams..."
            className="select-input"
            classNamePrefix="select"
          />
        </FilterSection>

        <FilterSection 
          title="Select Leagues"
          icon={<svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>}
        >
          <Select
            isMulti
            options={leagues}
            value={selectedLeagues}
            onChange={setSelectedLeagues}
            placeholder="Select leagues..."
            className="select-input"
            classNamePrefix="select"
          />
        </FilterSection>

        <FilterSection 
          title="Select Date Range"
          icon={<svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
        >
          <div className="date-picker-container">
            <div className="date-picker-wrapper">
              <label>Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Select start date"
                className="date-picker-input"
                dateFormat="MMM d, yyyy"
                disabled={upcomingOnly}
              />
            </div>
            <div className="date-picker-wrapper">
              <label>End Date</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="Select end date"
                className="date-picker-input"
                dateFormat="MMM d, yyyy"
                disabled={upcomingOnly}
              />
            </div>
          </div>
        </FilterSection>

        <div className="upcoming-games-option">
          <label className="option-label">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => setUpcomingOnly(e.target.checked)}
              className="option-checkbox"
            />
            <span>Only check upcoming games</span>
          </label>
        </div>

        <button
          onClick={handleClearAll}
          className="clear-selections-button"
        >
          Clear All Selections
        </button>
      </div>

      <button
        onClick={handleAnalyze}
        className="analyze-button"
      >
        Analyze Packages
      </button>

      {(selectedTeams.length > 0 || selectedLeagues.length > 0 || startDate || endDate) && (
        <button
          onClick={saveCurrentSearch}
          className="save-search-button"
        >
          Save Current Search
        </button>
      )}

      <SavedSearches
        searches={savedSearches}
        onLoadSearch={loadSavedSearch}
        onDeleteSearch={deleteSavedSearch}
      />

      <div className="results">
        <SelectionsSummary 
          teams={selectedTeams}
          leagues={selectedLeagues}
          startDate={startDate}
          endDate={endDate}
        />
        
        {matchedGames.length > 0 && (
          <GamesList games={matchedGames} />
        )}

        {results.minimum_combination && (
          <div className="minimum-combination">
            <h2>Recommended Package Combination</h2>
            <div className="package-card optimal">
              <div className="optimal-badge">Best Value</div>
              <h3>Maximum Coverage with Minimum Package Combination</h3>
              <div className="coverage-bar-container">
                <div
                  className="coverage-bar"
                  style={{ width: `${results.minimum_combination.coverage_percentage}%` }}
                >
                  {results.minimum_combination.coverage_percentage.toFixed(1)}%
                </div>
              </div>
              <div className="package-details">
                <div className="packages-needed">
                  <h4>Required Packages ({results.minimum_combination.num_packages}):</h4>
                  <div className="games-coverage-info">
                    <p>Games covered: {results.minimum_combination.covered_games} / {results.minimum_combination.total_games} games</p>
                    <p className="coverage-note">
                      {results.minimum_combination.coverage_percentage < 100
                        ? "⚠️ Doesn't cover all selected games"
                        : "✅ Covers all selected games"}
                    </p>
                  </div>
                  <ul>
                    {results.minimum_combination.packages.map((pkg, index) => (
                      <li key={index}>
                        <span className="package-name">{pkg.name}</span>
                        <span className="package-price">
                          {pkg.monthly_price !== null && pkg.monthly_price !== undefined ? (
                            <p>€{(pkg.monthly_price).toFixed(2)}/mo</p>
                          ) : (
                            <p>No monthly offer</p>
                          )}
                        </span>
                        <span className="package-price">€{(pkg.yearly_price * 12).toFixed(2)}/yr</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="total-costs">
                  <div className="monthly-total">
                    <h4>Monthly Subscription</h4>
                    {results.minimum_combination.monthly_cost !== null && results.minimum_combination.monthly_cost !== undefined ? (
                      <>
                       <p>€{(results.minimum_combination.monthly_cost).toFixed(2)}</p>
                       <p className="monthly-equivalent">(€{(results.minimum_combination.monthly_cost * 12).toFixed(2)}/yr)</p>
                      </>
                    ) : (
                      <p>No monthly offer</p>
                    )}

                  </div>
                  <div className="yearly-total">
                    <h4>Yearly Subscription</h4>
                    <p>€{(results.minimum_combination.yearly_cost * 12).toFixed(2)}</p>
                    <p className="monthly-equivalent">(€{(results.minimum_combination.yearly_cost).toFixed(2)}/mo)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="package-rankings-title">All Package Rankings</h2>
        {results.single_packages.length === 0 ? (
          <div className="no-results">
            <p>No streaming packages found for the selected team(s).</p>
            <p>This might be because:</p>
            <ul>
              <li>The selected team(s) don't have any scheduled matches</li>
              <li>No streaming service covers these matches</li>
              <li>The matches are outside the current season</li>
            </ul>
          </div>
        ) : (
          <div className="package-rankings">
            {results.single_packages.map((result, index) => (
              <div key={index} className="package-card">
                <div className="rank-badge">{index + 1}</div>
                <h3>{result.package_name}</h3>
                <div className="coverage-bar-container">
                  <div
                    className="coverage-bar"
                    style={{ width: `${result.coverage_percentage}%` }}
                  >
                    {result.coverage_percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="package-details">
                  <div className="games-coverage">
                    <p>Games covered: {result.covered_games} / {result.total_games}</p>
                    <p className="coverage-note">
                      {result.coverage_percentage < 100
                        ? "⚠️ Doesn't cover all games"
                        : "✅ Full coverage"}
                    </p>
                  </div>
                  <div className="pricing-comparison">
                    <div className="monthly-price">
                      <h4>Monthly</h4>
                      {result.monthly_price !== null && result.monthly_price !== undefined ? (
                        <>
                          <p>€{(result.monthly_price).toFixed(2)}/mo</p>
                          <p className="yearly-equivalent">
                            (€{(result.monthly_price * 12).toFixed(2)}/yr)
                          </p>
                        </>
                      ) : (
                        <p>No monthly offer</p>
                      )}
                    </div>
                    <div className="yearly-price">
                      <h4>Yearly</h4>
                      <p>€{(result.yearly_price * 12).toFixed(2)}/yr</p>
                      <p className="monthly-equivalent">
                        (€{(result.yearly_price).toFixed(2)}/mo)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
