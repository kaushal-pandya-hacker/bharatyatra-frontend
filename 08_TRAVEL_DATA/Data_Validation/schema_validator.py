import json
import os
import sys

def validate_destinations_json(filepath):
    print(f"[Validator] Validating file: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    destinations = data.get('destinations', [])
    print(f"[Validator] Loaded {len(destinations)} destination records.")
    
    errors = []
    seen_slugs = set()
    
    for idx, dest in enumerate(destinations):
        # Validate required fields
        req_fields = ['id', 'name', 'slug', 'region', 'latitude', 'longitude', 'sourceId', 'verificationStatus']
        for field in req_fields:
            if field not in dest or dest[field] is None:
                errors.append(f"Destination #{idx} ({dest.get('name', 'Unknown')}) missing required field: '{field}'")
        
        # Check duplicate slugs
        slug = dest.get('slug')
        if slug in seen_slugs:
            errors.append(f"Duplicate destination slug found: '{slug}'")
        seen_slugs.add(slug)
        
        # Validate coordinates bounds (Gujarat: Lat 20.0-24.8, Long 68.0-74.5)
        lat = dest.get('latitude', 0)
        lng = dest.get('longitude', 0)
        if not (20.0 <= lat <= 25.0 and 68.0 <= lng <= 75.0):
            errors.append(f"Destination '{dest.get('name')}' coordinates ({lat}, {lng}) outside Gujarat bounding box.")
            
    if errors:
        print(f"[Validator FAILED] Found {len(errors)} errors:")
        for err in errors:
            print(f"  - {err}")
        return False
        
    print("[Validator SUCCESS] All destination records passed schema validation 100%!")
    return True

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest_path = os.path.join(base_dir, 'Gujarat', 'Destinations', 'destinations.json')
    validate_destinations_json(dest_path)
