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
    
    def format_date(self, format_str='%Y-%m-%d %H:%M'):
        """Format the date in a user-friendly way"""
        return self.date.strftime(format_str)
    
    def to_dict(self):
        """Convert game to dictionary with formatted date"""
        return {
            'id': self.id,
            'home_team': self.home_team,
            'away_team': self.away_team,
            'date': self.format_date(),
            'tournament': self.tournament
        } 