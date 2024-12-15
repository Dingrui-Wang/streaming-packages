from dataclasses import dataclass
from typing import Optional

@dataclass
class StreamingPackage:
    id: int
    name: str
    monthly_price_cents: Optional[int]
    yearly_price_cents: Optional[int]
    
    @classmethod
    def from_csv_row(cls, row):
        return cls(
            id=int(row['id']),
            name=row['name'],
            monthly_price_cents=int(row['monthly_price_cents']) if row['monthly_price_cents'] else None,
            yearly_price_cents=int(row['monthly_price_yearly_subscription_in_cents']) if row['monthly_price_yearly_subscription_in_cents'] else None
        )
    
    @property
    def monthly_price(self) -> float:
        """Returns monthly price in euros"""
        return self.monthly_price_cents / 100 if self.monthly_price_cents is not None else None
    
    @property
    def yearly_price(self) -> float:
        """Returns yearly price in euros"""
        return self.yearly_price_cents / 100 if self.yearly_price_cents is not None else None 