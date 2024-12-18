from typing import List, Dict, Set
from itertools import combinations
from collections import defaultdict

class PackageAnalyzer:
    def __init__(self, games, packages, offers):
        self.games = games
        self.packages = packages
        self.offers = offers
        self._build_indices()

    def _build_indices(self):
        # Map package_id to set of game_ids it covers
        self.package_game_sets: Dict[int, Set[int]] = defaultdict(set)
        # Map game_id to list of package_ids that cover it
        self.game_packages: Dict[int, Set[int]] = defaultdict(set)
        
        # Build indices from offers
        for offer in self.offers:
            if offer.live_streaming or offer.highlights:
                self.package_game_sets[offer.package_id].add(offer.game_id)
                self.game_packages[offer.game_id].add(offer.package_id)

    def analyze_packages(self, teams: List[str]) -> Dict:
        """Main analysis function"""
        # Step 1: Get game set G (all games involving selected teams)
        game_set = self._get_team_games(teams)
        if not game_set:
            return {'single_packages': [], 'minimum_combination': None}

        # Step 2: Get coverage sets for each package
        package_sets = self._get_package_sets(game_set)
        
        # Step 3: Find minimum set cover using greedy algorithm
        min_packages = self._find_minimum_set_cover(game_set, package_sets)
        
        # Step 4: Calculate individual package coverage
        single_packages = self._analyze_individual_packages(game_set, package_sets)
        
        return {
            'single_packages': single_packages,
            'minimum_combination': min_packages
        }

    def _get_team_games(self, teams: List[str]) -> Set[int]:
        """Get set G of all games involving selected teams"""
        # If teams list is empty, return empty set
        if not teams:
            return set()
        
        # Optimization: If all teams are selected, return all games
        all_teams = {game.home_team for game in self.games.values()} | {game.away_team for game in self.games.values()}
        if set(teams) == all_teams:
            return set(self.games.keys())
        
        # Regular case: find games for selected teams
        game_set = set()
        for game in self.games.values():
            if game.home_team in teams or game.away_team in teams:
                game_set.add(game.id)
        print(f"Found {len(game_set)} games for teams: {teams}")
        return game_set

    def _get_package_sets(self, game_set: Set[int]) -> Dict[int, Set[int]]:
        """Get sets S_i for each package containing their covered games"""
        package_sets = {}
        for package_id, games in self.package_game_sets.items():
            # Only include games that are in our target game set
            covered_games = games.intersection(game_set)
            if covered_games:  # Only include packages that cover at least one relevant game
                package_sets[package_id] = covered_games
        return package_sets

    def _find_minimum_set_cover(self, game_set: Set[int], _package_sets: Dict[int, Set[int]]) -> Dict:
        """Greedy algorithm for minimum set cover"""
        package_sets = _package_sets.copy()
        uncovered_games = game_set.copy()
        total_games = len(uncovered_games)
        selected_packages = []
        total_cost = 0

        while uncovered_games and package_sets:
            # Find package that covers most uncovered games per cost
            best_package_id = None
            best_coverage = 0
            best_ratio = 0

            for package_id, covered_games in package_sets.items():
                # Calculate number of new games this package would cover
                new_games = len(covered_games.intersection(uncovered_games))
                if new_games > 0:
                    package = self.packages[package_id]
                    coverage_ratio = new_games / package.yearly_price if package.yearly_price > 0 else float('inf')
                    if coverage_ratio > best_ratio:
                        best_ratio = coverage_ratio
                        best_package_id = package_id
                        best_coverage = new_games

            if best_package_id is None:
                break

            # Add best package to solution
            selected_package = self.packages[best_package_id]
            selected_packages.append(selected_package)
            total_cost += selected_package.yearly_price

            # Update uncovered games
            uncovered_games -= package_sets[best_package_id]
            del package_sets[best_package_id]

        # Check if we found a valid solution
        #if not uncovered_games:
        total_monthly_cost = 0
        for p in selected_packages:
            if p.monthly_price is None:
                total_monthly_cost = None
                break
            total_monthly_cost += p.monthly_price

        coverage_percentage = ((total_games - len(uncovered_games)) / total_games) * 100
        return {
                'packages': selected_packages,
                'yearly_cost': total_cost,
                'monthly_cost': total_monthly_cost,
                'num_packages': len(selected_packages),
                'coverage_percentage': coverage_percentage
            }
        #return None

    def _analyze_individual_packages(self, game_set: Set[int], package_sets: Dict[int, Set[int]]) -> List[Dict]:
        """Analyze coverage of individual packages"""
        results = []
        total_games = len(game_set)

        for package_id, covered_games in package_sets.items():
            package = self.packages[package_id]
            coverage_percentage = (len(covered_games) / total_games) * 100
            
            results.append({
                'package': package,
                'coverage_percentage': coverage_percentage,
                'covered_games': len(covered_games),
                'total_games': total_games
            })

        # Sort by coverage percentage and then by price
        results.sort(key=lambda x: (-x['coverage_percentage'], x['package'].yearly_price))
        return results