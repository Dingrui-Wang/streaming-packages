import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [results, setResults] = useState({ single_packages: [], minimum_combination: null });

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
  }, []);

  const handleTeamSelect = (selectedOptions) => {
    const selected = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedTeams(selected);

    if (selected.length > 0) {
      console.log('Analyzing teams:', selected);
      fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teams: selected }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Analysis results:', data);
          setResults(data);
        })
        .catch(err => {
          console.error('Error analyzing packages:', err);
          setResults({ single_packages: [], minimum_combination: null });
        });
    } else {
      setResults({ single_packages: [], minimum_combination: null });
    }
  };

  const handleSelectAll = () => {
    const allTeamOptions = teams.map(team => ({
      value: team.value,
      label: team.label
    }));
    setSelectedTeams(allTeamOptions.map(option => option.value));
    handleTeamSelect(allTeamOptions);
  };

  return (
    <div className="App">
      <h1>Streaming Package Comparison</h1>

      <div className="team-selector">
        <h2>Select Teams</h2>
        <button 
          className="select-all-button" 
          onClick={handleSelectAll}
        >
          Select All Teams (All Games)
        </button>
        <Select
          isMulti
          options={teams}
          onChange={handleTeamSelect}
          value={teams.filter(option => selectedTeams.includes(option.value))}
          placeholder="Select multiple teams..."
          className="team-select-container"
          classNamePrefix="team-select"
        />
      </div>

      {selectedTeams.length > 0 && (
        <div className="results">
          <div className="selected-teams-display">
            <h3>Selected Teams:</h3>
            <div className="team-tags">
              {selectedTeams.map(team => (
                <span key={team} className="team-tag">{team}</span>
              ))}
            </div>
          </div>

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

          <h2>All Package Rankings</h2>
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
      )}
    </div>
  );
}

export default App;
