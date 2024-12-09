from flask import Blueprint, jsonify, request
from services.package_service import PackageService

api_blueprint = Blueprint('api', __name__)
package_service = PackageService()

@api_blueprint.route('/teams', methods=['GET'])
def get_teams():
    return jsonify(package_service.get_all_teams())

@api_blueprint.route('/analyze', methods=['POST'])
def analyze_packages():
    data = request.get_json()
    teams = data.get('teams', [])
    
    # Get analysis results
    results = package_service.analyze_packages(teams)
    
    # Format the response
    response = {
        'single_packages': [{
            'package_name': r['package']['name'],
            'provider': r['package']['name'].split(' - ')[0] if ' - ' in r['package']['name'] else '',
            'coverage_percentage': r['coverage_percentage'],
            'covered_games': r['covered_games'],
            'total_games': r['total_games'],
            'monthly_price': r['package']['monthly_price'],
            'yearly_price': r['package']['yearly_price']
        } for r in results['single_packages']],
        
        'minimum_combination': None
    }
    
    # Add minimum combination if available
    if results['minimum_combination']:
        min_combo = results['minimum_combination']
        response['minimum_combination'] = {
            'packages': [{
                'name': p['name'],
                'monthly_price': p['monthly_price'],
                'yearly_price': p['yearly_price']
            } for p in min_combo['packages']],
            'total_yearly_cost': min_combo['yearly_cost'],
            'total_monthly_cost': min_combo['monthly_cost'],
            'num_packages': min_combo['num_packages'],
            'coverage_percentage': min_combo['coverage_percentage']
        }
    
    return jsonify(response)

@api_blueprint.route('/packages', methods=['GET'])
def get_packages():
    return jsonify(package_service.get_all_packages()) 