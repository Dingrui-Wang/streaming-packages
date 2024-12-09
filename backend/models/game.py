from dataclasses import dataclass
from datetime import datetime

@dataclass
class Game:
    id: int
    home_team: str
    away_team: str
    date: datetime
    tournament: str
    
    @classmethod
    def from_csv_row(cls, row):
        return cls(
            id=int(row['id']),
            home_team=row['team_home'],
            away_team=row['team_away'],
            date=datetime.strptime(row['starts_at'], '%Y-%m-%d %H:%M:%S'),
            tournament=row['tournament_name']
        ) 