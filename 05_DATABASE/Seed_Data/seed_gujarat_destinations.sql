-- =============================================================================
-- CHALO FARVA — VERIFIED GUJARAT DESTINATIONS SEED DATA (24 DESTINATIONS)
-- Description: Baseline reference travel data for 24 Gujarat destinations.
-- =============================================================================

INSERT INTO destinations (destination_id, name, slug, state, district, region, latitude, longitude, description, best_season, recommended_duration_hours) VALUES
(uuid_generate_v4(), 'Ahmedabad', 'ahmedabad', 'Gujarat', 'Ahmedabad', 'Central_Gujarat', 23.0225, 72.5714, 'UNESCO World Heritage City known for Sabarmati Ashram, Adalaj Stepwell, and textile heritage.', 'October to March', 48),
(uuid_generate_v4(), 'Vadodara', 'vadodara', 'Gujarat', 'Vadodara', 'Central_Gujarat', 22.3072, 73.1812, 'Cultural capital of Gujarat, home to Laxmi Vilas Palace and Sayaji Baug.', 'October to March', 36),
(uuid_generate_v4(), 'Surat', 'surat', 'Gujarat', 'Surat', 'South_Gujarat', 21.1702, 72.8311, 'Diamond and silk hub of India, renowned for street food and Dutch cemeteries.', 'October to March', 36),
(uuid_generate_v4(), 'Rajkot', 'rajkot', 'Gujarat', 'Rajkot', 'Saurashtra', 22.3039, 70.8022, 'Commercial heart of Saurashtra, Watson Museum, and Mahatma Gandhi childhood home.', 'October to March', 24),
(uuid_generate_v4(), 'Dwarka', 'dwarka', 'Gujarat', 'Devbhumi Dwarka', 'Saurashtra', 22.2442, 68.9685, 'Sacred kingdom of Lord Krishna, Dwarkadhish Temple, and Bet Dwarka Island.', 'October to March', 36),
(uuid_generate_v4(), 'Somnath', 'somnath', 'Gujarat', 'Gir Somnath', 'Saurashtra', 20.8880, 70.4012, 'First among the twelve sacred Jyotirlinga shrines on the Arabian Sea coast.', 'All Year', 24),
(uuid_generate_v4(), 'Diu', 'diu', 'Gujarat', 'Diu', 'Saurashtra', 20.7144, 70.9874, 'Historic Portuguese island territory with pristine beaches and Diu Fort.', 'October to April', 48),
(uuid_generate_v4(), 'Gir (Sasan Gir)', 'sasan-gir', 'Gujarat', 'Junagadh', 'Saurashtra', 21.1243, 70.8242, 'The sole sanctuary of the wild Asiatic Lion in Gir National Park.', 'November to April', 36),
(uuid_generate_v4(), 'Girnar', 'girnar', 'Gujarat', 'Junagadh', 'Saurashtra', 21.5266, 70.5360, 'Sacred mountain range featuring 10,000 steps, Jain temples, and Amba Mata shrine.', 'October to March', 24),
(uuid_generate_v4(), 'Bhuj', 'bhuj', 'Gujarat', 'Kutch', 'Kutch', 23.2420, 69.6669, 'Cultural epicenter of Kutch, Prag Mahal, Aina Mahal, and handicraft villages.', 'October to March', 48),
(uuid_generate_v4(), 'Kutch (Dhordo)', 'kutch-dhordo', 'Gujarat', 'Kutch', 'Kutch', 23.8200, 69.8500, 'Host village for the world-famous Rann Utsav festival.', 'November to February', 48),
(uuid_generate_v4(), 'Rann of Kutch', 'rann-of-kutch', 'Gujarat', 'Kutch', 'Kutch', 23.8291, 69.8540, 'Vast endless white salt desert offering breathtaking full-moon views.', 'November to February', 48),
(uuid_generate_v4(), 'Statue of Unity (Kevadia)', 'statue-of-unity', 'Gujarat', 'Narmada', 'Central_Gujarat', 21.8380, 73.7191, 'World tallest statue honoring Sardar Vallabhbhai Patel.', 'All Year', 36),
(uuid_generate_v4(), 'Saputara', 'saputara', 'Gujarat', 'Dang', 'South_Gujarat', 20.5774, 73.7483, 'Gujarat only hill station in the lush Western Ghats (Sahyadri).', 'July to March', 48),
(uuid_generate_v4(), 'Champaner-Pavagadh', 'champaner-pavagadh', 'Gujarat', 'Panchmahal', 'Central_Gujarat', 22.4842, 73.5356, 'UNESCO World Heritage archaeological park with Kalika Mata hill temple.', 'October to March', 24),
(uuid_generate_v4(), 'Patan', 'patan', 'Gujarat', 'Patan', 'North_Gujarat', 23.8493, 72.1266, 'Home to the magnificent Rani ki Vav stepwell and Patola silk weavers.', 'October to March', 24),
(uuid_generate_v4(), 'Modhera', 'modhera', 'Gujarat', 'Mehsana', 'North_Gujarat', 23.5836, 72.1331, '11th-century Chalukya-era Sun Temple and solar-powered heritage village.', 'October to March', 12),
(uuid_generate_v4(), 'Porbandar', 'porbandar', 'Gujarat', 'Porbandar', 'Saurashtra', 21.6417, 69.6293, 'Birthplace of Mahatma Gandhi (Kirti Mandir) and ancient coastal port.', 'October to March', 24),
(uuid_generate_v4(), 'Mandvi', 'mandvi', 'Gujarat', 'Kutch', 'Kutch', 22.8354, 69.3562, 'Royal Vijay Vilas Palace, wooden shipbuilding yard, and windmills beach.', 'October to March', 36),
(uuid_generate_v4(), 'Gandhinagar', 'gandhinagar', 'Gujarat', 'Gandhinagar', 'North_Gujarat', 23.2156, 72.6369, 'Capital city of Gujarat, featuring Akshardham Temple and Sarita Udyan.', 'October to March', 24),
(uuid_generate_v4(), 'Polo Forest', 'polo-forest', 'Gujarat', 'Sabarkantha', 'North_Gujarat', 23.9500, 73.3000, 'Ancient 15th-century temple ruins nestled in dense teak forest.', 'July to February', 24),
(uuid_generate_v4(), 'Nal Sarovar', 'nal-sarovar', 'Gujarat', 'Ahmedabad', 'Central_Gujarat', 23.0416, 72.0417, 'Largest wetland bird sanctuary in Gujarat, hosting migratory flamingos.', 'November to February', 12),
(uuid_generate_v4(), 'Little Rann of Kutch', 'little-rann-kutch', 'Gujarat', 'Surendranagar', 'Saurashtra', 23.2500, 71.4000, 'Exclusive sanctuary for the endangered Indian Wild Ass (Khur).', 'November to March', 36),
(uuid_generate_v4(), 'Marine National Park', 'marine-national-park', 'Gujarat', 'Jamnagar', 'Saurashtra', 22.4700, 70.0700, 'First marine sanctuary in India featuring coral reefs and mangrove walks.', 'November to March', 24);
