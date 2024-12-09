from dataclasses import dataclass

@dataclass
class StreamingOffer:
    game_id: int
    package_id: int
    live_streaming: bool
    highlights: bool
    
    @classmethod
    def from_csv_row(cls, row):
        return cls(
            game_id=int(row['game_id']),
            package_id=int(row['streaming_package_id']),
            live_streaming=bool(int(row['live'])),
            highlights=bool(int(row['highlights']))
        ) 