import math
from typing import List, Tuple, Dict, Any

class RouteOptimizer:
    """
    Sequence & distance optimization engine for Gujarat travel routes.
    Prevents geographic backtracking (e.g. Ahmedabad -> Dwarka -> Statue of Unity -> Somnath).
    """

    # Major Gujarat geographic coordinates
    GUJARAT_CITIES_COORDS = {
        "Ahmedabad": (23.0225, 72.5714),
        "Gandhinagar": (23.2156, 72.6369),
        "Vadodara": (22.3072, 73.1812),
        "Kevadia": (21.8380, 73.7191), # Statue of Unity
        "Rajkot": (22.3039, 70.8022),
        "Junagadh": (21.5222, 70.4579),
        "Gir Somnath": (20.9042, 70.3820),
        "Somnath": (20.8880, 70.4012),
        "Dwarka": (22.2442, 68.9685),
        "Porbandar": (21.6417, 69.6293),
        "Bhuj": (23.2420, 69.6669),
        "Dhordo": (23.7788, 69.5134), # Rann of Kutch
        "Surat": (21.1702, 72.8311),
    }

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great circle distance in km between two lat/lon points."""
        R = 6371.0 # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        # Road distance factor multiplier (typically 1.25x haversine in India)
        return round(distance * 1.25, 1)

    def get_city_distance(self, city_a: str, city_b: str) -> float:
        """Returns estimated road distance in km between two Gujarat cities."""
        if city_a == city_b:
            return 0.0
        coords_a = self.GUJARAT_CITIES_COORDS.get(city_a)
        coords_b = self.GUJARAT_CITIES_COORDS.get(city_b)
        if coords_a and coords_b:
            return self.haversine_distance_km(coords_a[0], coords_a[1], coords_b[0], coords_b[1])
        return 100.0 # Default fallback distance

    def optimize_city_sequence(self, origin: str, destinations: List[str]) -> List[str]:
        """Simple greedy Nearest Neighbor TSP optimizer for sequence order."""
        if not destinations:
            return []
        
        unvisited = list(destinations)
        current = origin
        ordered = []

        while unvisited:
            nearest = min(unvisited, key=lambda city: self.get_city_distance(current, city))
            ordered.append(nearest)
            unvisited.remove(nearest)
            current = nearest

        return ordered
