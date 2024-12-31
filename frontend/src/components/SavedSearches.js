import React from 'react';

function SavedSearches({ searches, onLoadSearch, onDeleteSearch }) {
  return (
    <div className="saved-searches">
      <h3>Past Searches</h3>
      {searches.length === 0 ? (
        <p className="no-searches">No saved searches yet</p>
      ) : (
        <div className="saved-searches-grid">
          {searches.map((search, index) => (
            <div key={index} className="saved-search-card">
              <div className="saved-search-content">
                <div className="saved-search-details">
                  <span className="search-date">{new Date(search.timestamp).toLocaleDateString()}</span>
                  <div className="search-params">
                    {search.teams.length > 0 && (
                      <div className="param-group">
                        <span className="param-label">Teams:</span>
                        <span>{search.teams.map(t => t.label).join(', ')}</span>
                      </div>
                    )}
                    {search.leagues.length > 0 && (
                      <div className="param-group">
                        <span className="param-label">Leagues:</span>
                        <span>{search.leagues.map(l => l.label).join(', ')}</span>
                      </div>
                    )}
                    {(search.startDate || search.endDate) && (
                      <div className="param-group">
                        <span className="param-label">Dates:</span>
                        <span>
                          {search.startDate && `From: ${new Date(search.startDate).toLocaleDateString()}`}
                          {search.endDate && ` To: ${new Date(search.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="saved-search-actions">
                  <button onClick={() => onLoadSearch(search)} className="load-search-btn">
                    Load
                  </button>
                  <button onClick={() => onDeleteSearch(index)} className="delete-search-btn">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedSearches; 