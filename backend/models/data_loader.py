import csv
from typing import List, Dict
from pathlib import Path
import logging

from .game import Game
from .streaming_package import StreamingPackage
from .streaming_offer import StreamingOffer

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self):
        self.games: Dict[int, Game] = {}
        self.packages: Dict[int, StreamingPackage] = {}
        self.offers: List[StreamingOffer] = []
        
    def load_data(self):
        data_dir = Path(__file__).parent.parent / 'data'
        
        # Load games
        games_path = data_dir / 'bc_game.csv'
        logger.debug(f"Loading games from {games_path}")
        
        with open(games_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=',')
            logger.debug(f"Games CSV Headers: {reader.fieldnames}")
            for row in reader:
                logger.debug(f"Processing game row: {row}")
                game = Game.from_csv_row(row)
                self.games[game.id] = game
                
        # Load packages
        packages_path = data_dir / 'bc_streaming_package.csv'
        logger.debug(f"Loading packages from {packages_path}")
        
        with open(packages_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=',')
            logger.debug(f"Packages CSV Headers: {reader.fieldnames}")
            for row in reader:
                logger.debug(f"Processing package row: {row}")
                package = StreamingPackage.from_csv_row(row)
                self.packages[package.id] = package
                
        # Load offers
        offers_path = data_dir / 'bc_streaming_offer.csv'
        logger.debug(f"Loading offers from {offers_path}")
        
        with open(offers_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=',')
            logger.debug(f"Offers CSV Headers: {reader.fieldnames}")
            for row in reader:
                logger.debug(f"Processing offer row: {row}")
                offer = StreamingOffer.from_csv_row(row)
                self.offers.append(offer) 