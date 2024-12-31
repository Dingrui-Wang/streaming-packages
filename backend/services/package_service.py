from typing import List, Dict
from models.data_loader import DataLoader
from models.package_analyzer import PackageAnalyzer

class PackageService:
    def __init__(self):
        self.data_loader = DataLoader()
        self.data_loader.load_data()
        self.package_analyzer = PackageAnalyzer(
            self.data_loader.games,
            self.data_loader.packages,
            self.data_loader.offers
        )
    
    def get_all_teams(self) -> List[str]:
        teams = set()
        for game in self.data_loader.games.values():
            teams.add(game.home_team)
            teams.add(game.away_team)
        return sorted(list(teams))
    
    def get_all_packages(self) -> List[Dict]:
        return [
            {
                'id': p.id,
                'name': p.name,
                'monthly_price': p.monthly_price,
                'yearly_price': p.yearly_price
            }
            for p in self.data_loader.packages.values()
        ]
    
    def analyze_packages(self, teams: List[str], leagues: List[str] = None, 
                        start_date: str = None, end_date: str = None,
                        upcoming_only: bool = False) -> Dict:
        try:
            results = self.package_analyzer.analyze_packages(
                teams=teams,
                leagues=leagues,
                start_date=start_date,
                end_date=end_date,
                upcoming_only=upcoming_only
            )
            
            # Format single packages
            formatted_packages = []
            for package_result in results['single_packages']:
                formatted_packages.append({
                    'package': {
                        'name': package_result['package'].name,
                        'monthly_price': package_result['package'].monthly_price,
                        'yearly_price': package_result['package'].yearly_price
                    },
                    'coverage_percentage': package_result['coverage_percentage'],
                    'covered_games': package_result['covered_games'],
                    'total_games': package_result['total_games']
                })
            
            # Format minimum combination
            min_combo = results['minimum_combination']
            if min_combo and min_combo['packages']:
                minimum_combination = {
                    'packages': [{
                        'name': p.name,
                        'monthly_price': p.monthly_price,
                        'yearly_price': p.yearly_price
                    } for p in min_combo['packages']],
                    'yearly_cost': min_combo['yearly_cost'],
                    'monthly_cost': min_combo['monthly_cost'],
                    'num_packages': min_combo['num_packages'],
                    'coverage_percentage': min_combo['coverage_percentage'],
                    'covered_games': min_combo['covered_games'],
                    'total_games': min_combo['total_games']
                }
            else:
                minimum_combination = None
            
            return {
                'single_packages': formatted_packages,
                'minimum_combination': minimum_combination
            }
        except Exception as e:
            print(f"Error in analyze_packages: {e}")
            return {
                'single_packages': [],
                'minimum_combination': None
            } 
    
    def get_all_leagues(self) -> List[str]:
        leagues = set()
        for game in self.data_loader.games.values():
            leagues.add(game.tournament)
        return sorted(list(leagues)) 
    
    def get_filtered_leagues(self, teams: List[str]) -> List[str]:
        """Get leagues that involve any of the selected teams"""
        leagues = set()
        if not teams:
            # If no teams selected, return all leagues
            return self.get_all_leagues()
        
        for game in self.data_loader.games.values():
            if game.home_team in teams or game.away_team in teams:
                leagues.add(game.tournament)
        return sorted(list(leagues)) 