// Automatically generated All-India Tourism Dataset (District & City-wise)
// Supports City -> State -> Place selection flow

export interface IndiaPlaceItem {
  id: string;
  name: string;
  slug: string;
  state: string;
  city: string;
  category: string;
  description: string;
  imageUrl: string;
}

export interface IndiaCityRegion {
  city: string;
  icon: string;
  places: IndiaPlaceItem[];
}

export interface IndiaStateDataset {
  state: string;
  flag: string;
  regions: IndiaCityRegion[];
}

export const ALL_INDIA_TOURISM_DATA: IndiaStateDataset[] = [
  {
  "state": "Gujarat",
  "flag": "🇮🇳",
  "regions": [
    {
      "city": "Ahmedabad",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-1",
          "name": "Sabarmati Ashram",
          "slug": "sabarmati-ashram-ahmedabad",
          "state": "Gujarat",
          "city": "Ahmedabad",
          "category": "Heritage & Forts",
          "description": "Mahatma Gandhi's iconic freedom movement ashram and museum.",
          "imageUrl": "/landmarks/sabarmati-ashram.jpg"
        },
        {
          "id": "gj-2",
          "name": "Sabarmati Riverfront",
          "slug": "sabarmati-riverfront-ahmedabad",
          "state": "Gujarat",
          "city": "Ahmedabad",
          "category": "Modern & Cultural",
          "description": "Modern riverside urban promenade with boating and parks.",
          "imageUrl": "/landmarks/sabarmati-riverfront.png"
        },
        {
          "id": "gj-3",
          "name": "Kankaria Lake",
          "slug": "kankaria-lake-ahmedabad",
          "state": "Gujarat",
          "city": "Ahmedabad",
          "category": "Modern & Cultural",
          "description": "Vibrant circular lake with Nagina Wadi, zoo, and train ride.",
          "imageUrl": "/landmarks/kankaria-lake.jpg"
        },
        {
          "id": "gj-4",
          "name": "Adalaj Stepwell",
          "slug": "adalaj-stepwell-ahmedabad",
          "state": "Gujarat",
          "city": "Ahmedabad",
          "category": "Heritage & Forts",
          "description": "15th-century Solanki style sandstone subterranean stepwell.",
          "imageUrl": "/landmarks/adalaj-stepwell-real.jpg"
        },
        {
          "id": "gj-5",
          "name": "Sidi Saiyyed Mosque",
          "slug": "sidi-saiyyed-mosque-ahmedabad",
          "state": "Gujarat",
          "city": "Ahmedabad",
          "category": "Heritage & Forts",
          "description": "Iconic 16th-century mosque with delicate Tree of Life stone jalis.",
          "imageUrl": "/landmarks/jama-masjid-ahmedabad.jpg"
        },
        {
          "id": "gj-6",
          "name": "Science City",
          "slug": "science-city-ahmedabad",
          "state": "Gujarat",
          "city": "Ahmedabad",
          "category": "Modern & Cultural",
          "description": "High-tech science park with aquatic gallery and robotics gallery.",
          "imageUrl": "/landmarks/science-city-ahmedabad.jpg"
        },
        {
          "id": "gj-7",
          "name": "Atal Bridge",
          "slug": "atal-bridge-ahmedabad",
          "state": "Gujarat",
          "city": "Ahmedabad",
          "category": "Modern & Cultural",
          "description": "Stunning kite-inspired pedestrian glass bridge over Sabarmati.",
          "imageUrl": "/landmarks/atal-bridge-riverfront.jpg"
        }
      ]
    },
    {
      "city": "Gandhinagar",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-8",
          "name": "Akshardham Temple",
          "slug": "akshardham-temple-gandhinagar",
          "state": "Gujarat",
          "city": "Gandhinagar",
          "category": "Pilgrimage & Temples",
          "description": "Grand Swaminarayan sandstone temple complex with Sat-Chit-Anand water show.",
          "imageUrl": "/landmarks/akshardham-temple.jpg"
        },
        {
          "id": "gj-9",
          "name": "Indroda Nature Park",
          "slug": "indroda-nature-park-gandhinagar",
          "state": "Gujarat",
          "city": "Gandhinagar",
          "category": "Nature & Wildlife",
          "description": "India's premier dinosaur fossil park and botanical zoo.",
          "imageUrl": "/landmarks/punit-van-gandhinagar.jpg"
        },
        {
          "id": "gj-10",
          "name": "Adalaj Stepwell (Gandhinagar Circuit)",
          "slug": "adalaj-stepwell-gandhinagar",
          "state": "Gujarat",
          "city": "Gandhinagar",
          "category": "Heritage & Forts",
          "description": "Intricate Solanki stepwell bordering Gandhinagar.",
          "imageUrl": "/landmarks/adalaj-stepwell-real.jpg"
        },
        {
          "id": "gj-11",
          "name": "Sarita Udyan",
          "slug": "sarita-udyan-gandhinagar",
          "state": "Gujarat",
          "city": "Gandhinagar",
          "category": "Nature & Wildlife",
          "description": "Lush botanical park along Sabarmati River in Gandhinagar.",
          "imageUrl": "/landmarks/sarita-udyan.jpg"
        },
        {
          "id": "gj-12",
          "name": "Dandi Kutir",
          "slug": "dandi-kutir-gandhinagar",
          "state": "Gujarat",
          "city": "Gandhinagar",
          "category": "Heritage & Forts",
          "description": "World's largest salt-mound museum celebrating Mahatma Gandhi.",
          "imageUrl": "/landmarks/dandi-kutir.jpg"
        }
      ]
    },
    {
      "city": "Kutch",
      "icon": "🏜️",
      "places": [
        {
          "id": "gj-13",
          "name": "Rann of Kutch (White Desert)",
          "slug": "rann-of-kutch-white-desert",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Nature & Wildlife",
          "description": "Endless white salt desert world-famous for full-moon Rann Utsav.",
          "imageUrl": "/bhuj-kutch-bg.jpg"
        },
        {
          "id": "gj-14",
          "name": "Kala Dungar",
          "slug": "kala-dungar-kutch",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Nature & Wildlife",
          "description": "Highest peak in Kutch with panoramic views of Great Rann.",
          "imageUrl": "/landmarks/kala-dungar.jpg"
        },
        {
          "id": "gj-15",
          "name": "Mandvi Beach",
          "slug": "mandvi-beach-kutch",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Beaches & Coast",
          "description": "Golden sand beach with windmills and sunset camel rides.",
          "imageUrl": "/places/mandvi-beach.jpg"
        },
        {
          "id": "gj-16",
          "name": "Vijay Vilas Palace",
          "slug": "vijay-vilas-palace-kutch",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Heritage & Forts",
          "description": "Royal red sandstone palace on Mandvi coastline.",
          "imageUrl": "/places/vijay-vilas-palace.jpg"
        },
        {
          "id": "gj-17",
          "name": "Dholavira Harappan Metropolis",
          "slug": "dholavira-harappan-metropolis",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Heritage & Forts",
          "description": "UNESCO World Heritage ancient Indus Valley metropolis.",
          "imageUrl": "/places/dholavira.jpg"
        },
        {
          "id": "gj-18",
          "name": "Bhujodi Craft Village",
          "slug": "bhujodi-handicraft-village",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Modern & Cultural",
          "description": "Renowned Kutchi artisan weaving and handicraft hamlet.",
          "imageUrl": "/landmarks/bhujodi-craft-village.jpg"
        },
        {
          "id": "gj-19",
          "name": "Aina Mahal",
          "slug": "aina-mahal-bhuj",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Heritage & Forts",
          "description": "18th-century palace of mirrors and Venetian glass chandeliers.",
          "imageUrl": "/places/aina-mahal.jpg"
        },
        {
          "id": "gj-20",
          "name": "Prag Mahal",
          "slug": "prag-mahal-bhuj",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Heritage & Forts",
          "description": "Gothic sandstone palace with 45-meter bell tower.",
          "imageUrl": "/places/prag-mahal.jpg"
        },
        {
          "id": "gj-21",
          "name": "Kutch Museum",
          "slug": "kutch-museum-bhuj",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Heritage & Forts",
          "description": "Gujarat's oldest museum with ancient Kutchi artifacts.",
          "imageUrl": "/places/kutch-museum.jpg"
        },
        {
          "id": "gj-22",
          "name": "Narayan Sarovar",
          "slug": "narayan-sarovar-kutch",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Pilgrimage & Temples",
          "description": "One of Hinduism's 5 sacred holy lakes on Arabian Sea border.",
          "imageUrl": "/landmarks/narayan-sarovar.jpg"
        },
        {
          "id": "gj-23",
          "name": "Koteshwar Temple",
          "slug": "koteshwar-temple-kutch",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Pilgrimage & Temples",
          "description": "Ancient Lord Shiva coastal shrine at India's western tip.",
          "imageUrl": "/landmarks/koteshwar-temple.jpg"
        },
        {
          "id": "gj-24",
          "name": "Mata No Madh",
          "slug": "mata-no-madh-kutch",
          "state": "Gujarat",
          "city": "Kutch",
          "category": "Pilgrimage & Temples",
          "description": "Revered 1200-year-old Ashapura Mata pilgrimage shrine.",
          "imageUrl": "/landmarks/mata-no-madh.jpg"
        }
      ]
    },
    {
      "city": "Gir Somnath",
      "icon": "🦁",
      "places": [
        {
          "id": "gj-25",
          "name": "Somnath Temple",
          "slug": "somnath-temple",
          "state": "Gujarat",
          "city": "Gir Somnath",
          "category": "Pilgrimage & Temples",
          "description": "First among 12 holy Shiva Jyotirlingas on Arabian Sea shore.",
          "imageUrl": "/landmarks/somnath-temple-real.png"
        },
        {
          "id": "gj-26",
          "name": "Somnath Beach",
          "slug": "somnath-beach",
          "state": "Gujarat",
          "city": "Gir Somnath",
          "category": "Beaches & Coast",
          "description": "Coastal oceanfront promenade adjacent to Somnath Temple.",
          "imageUrl": "/landmarks/somnath-beach.png"
        },
        {
          "id": "gj-27",
          "name": "Bhalka Tirth",
          "slug": "bhalka-tirth-somnath",
          "state": "Gujarat",
          "city": "Gir Somnath",
          "category": "Pilgrimage & Temples",
          "description": "Sacred shrine where Lord Krishna concluded his earthly avatar.",
          "imageUrl": "/places/bhalka-tirth.jpg"
        },
        {
          "id": "gj-28",
          "name": "Triveni Sangam",
          "slug": "triveni-sangam-somnath",
          "state": "Gujarat",
          "city": "Gir Somnath",
          "category": "Pilgrimage & Temples",
          "description": "Sacred confluence of three holy rivers entering the Arabian Sea.",
          "imageUrl": "/landmarks/triveni-sangam-somnath.png"
        },
        {
          "id": "gj-29",
          "name": "Gir National Park",
          "slug": "gir-national-park",
          "state": "Gujarat",
          "city": "Gir Somnath",
          "category": "Nature & Wildlife",
          "description": "Sole natural sanctuary of wild Asiatic Lions on earth.",
          "imageUrl": "/places/sasan-gir-wildlife-sanctuary.jpg"
        },
        {
          "id": "gj-30",
          "name": "Devalia Safari Park",
          "slug": "devalia-safari-park-gir",
          "state": "Gujarat",
          "city": "Gir Somnath",
          "category": "Nature & Wildlife",
          "description": "Gir lion interpretation zone with bus and jeep safaris.",
          "imageUrl": "/places/sasan-gir-safari.webp"
        }
      ]
    },
    {
      "city": "Devbhumi Dwarka",
      "icon": "🛕",
      "places": [
        {
          "id": "gj-31",
          "name": "Dwarkadhish Temple",
          "slug": "dwarkadhish-temple-dwarka",
          "state": "Gujarat",
          "city": "Devbhumi Dwarka",
          "category": "Pilgrimage & Temples",
          "description": "Sacred 16th-century Char Dham temple of Lord Krishna.",
          "imageUrl": "/places/dwarkadhish-temple.jpg"
        },
        {
          "id": "gj-32",
          "name": "Dwarka Beach",
          "slug": "dwarka-beach",
          "state": "Gujarat",
          "city": "Devbhumi Dwarka",
          "category": "Beaches & Coast",
          "description": "Pristine coast near Bhadkeshwar Mahadev sea shrine.",
          "imageUrl": "/landmarks/dwarka-beach.png"
        },
        {
          "id": "gj-33",
          "name": "Bet Dwarka Island",
          "slug": "bet-dwarka-island",
          "state": "Gujarat",
          "city": "Devbhumi Dwarka",
          "category": "Pilgrimage & Temples",
          "description": "Sacred island residence of Lord Krishna via boat ferry.",
          "imageUrl": "/places/bet-dwarka.jpg"
        },
        {
          "id": "gj-34",
          "name": "Nageshwar Jyotirlinga",
          "slug": "nageshwar-jyotirlinga-dwarka",
          "state": "Gujarat",
          "city": "Devbhumi Dwarka",
          "category": "Pilgrimage & Temples",
          "description": "Sacred Shiva Jyotirlinga featuring colossal 85-ft statue.",
          "imageUrl": "/places/nageshwar-jyotirlinga.jpg"
        },
        {
          "id": "gj-35",
          "name": "Shivrajpur Beach",
          "slug": "shivrajpur-beach-dwarka",
          "state": "Gujarat",
          "city": "Devbhumi Dwarka",
          "category": "Beaches & Coast",
          "description": "Pristine Blue Flag certified beach for scuba diving & dolphins.",
          "imageUrl": "/landmarks/shivrajpur-beach-real.png"
        },
        {
          "id": "gj-36",
          "name": "Rukmini Temple",
          "slug": "rukmini-temple-dwarka",
          "state": "Gujarat",
          "city": "Devbhumi Dwarka",
          "category": "Pilgrimage & Temples",
          "description": "12th-century stone temple of Devi Rukmini.",
          "imageUrl": "/landmarks/rukmini-temple-dwarka.png"
        }
      ]
    },
    {
      "city": "Junagadh",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-37",
          "name": "Girnar Hill",
          "slug": "girnar-hill-junagadh",
          "state": "Gujarat",
          "city": "Junagadh",
          "category": "Pilgrimage & Temples",
          "description": "Sacred mountain peak with Asia's longest ropeway & Jain temples.",
          "imageUrl": "/places/girnar-hill.jpg"
        },
        {
          "id": "gj-38",
          "name": "Uparkot Fort",
          "slug": "uparkot-fort-junagadh",
          "state": "Gujarat",
          "city": "Junagadh",
          "category": "Heritage & Forts",
          "description": "Ancient 2,300-year-old Mauryan citadel with stepwells & cannons.",
          "imageUrl": "/landmarks/uparkot-fort-junagadh.jpg"
        },
        {
          "id": "gj-39",
          "name": "Mahabat Maqbara",
          "slug": "mahabat-maqbara-junagadh",
          "state": "Gujarat",
          "city": "Junagadh",
          "category": "Heritage & Forts",
          "description": "Striking Indo-Islamic mausoleum with unique spiral minarets.",
          "imageUrl": "/landmarks/mahabat-maqbara.jpg"
        },
        {
          "id": "gj-40",
          "name": "Junagadh Buddhist Caves",
          "slug": "junagadh-buddhist-caves",
          "state": "Gujarat",
          "city": "Junagadh",
          "category": "Heritage & Forts",
          "description": "Ancient rock-cut Buddhist monastic chambers.",
          "imageUrl": "/landmarks/junagadh-buddhist-caves.png"
        },
        {
          "id": "gj-41",
          "name": "Sakkarbaug Zoo",
          "slug": "sakkarbaug-zoo-junagadh",
          "state": "Gujarat",
          "city": "Junagadh",
          "category": "Nature & Wildlife",
          "description": "Historic zoo specializing in Asiatic lion breeding.",
          "imageUrl": "/landmarks/sakkarbaug-zoo.jpg"
        },
        {
          "id": "gj-42",
          "name": "Damodar Kund",
          "slug": "damodar-kund-junagadh",
          "state": "Gujarat",
          "city": "Junagadh",
          "category": "Pilgrimage & Temples",
          "description": "Sacred bathing ghat at the base of Girnar Mountain.",
          "imageUrl": "/landmarks/damodar-kund-junagadh.jpg"
        }
      ]
    },
    {
      "city": "Surat",
      "icon": "💎",
      "places": [
        {
          "id": "gj-43",
          "name": "Dumas Beach",
          "slug": "dumas-beach-surat",
          "state": "Gujarat",
          "city": "Surat",
          "category": "Beaches & Coast",
          "description": "Urban black-sand beach famous for street food.",
          "imageUrl": "/landmarks/dumas-beach-surat.png"
        },
        {
          "id": "gj-44",
          "name": "Suvali Beach",
          "slug": "suvali-beach-surat",
          "state": "Gujarat",
          "city": "Surat",
          "category": "Beaches & Coast",
          "description": "Historic quiet beach site of 1612 naval battle.",
          "imageUrl": "/landmarks/suvali-beach-surat.png"
        },
        {
          "id": "gj-45",
          "name": "Dutch Garden",
          "slug": "dutch-garden-surat",
          "state": "Gujarat",
          "city": "Surat",
          "category": "Heritage & Forts",
          "description": "17th-century European colonial mausoleums & garden.",
          "imageUrl": "/landmarks/dutch-garden-surat.png"
        },
        {
          "id": "gj-46",
          "name": "Surat Castle",
          "slug": "surat-castle",
          "state": "Gujarat",
          "city": "Surat",
          "category": "Heritage & Forts",
          "description": "16th-century riverfront fortress on Tapi River.",
          "imageUrl": "/landmarks/surat-castle.png"
        },
        {
          "id": "gj-47",
          "name": "Sarthana Nature Park",
          "slug": "sarthana-nature-park-surat",
          "state": "Gujarat",
          "city": "Surat",
          "category": "Nature & Wildlife",
          "description": "Lush riverside nature park and zoo in Surat.",
          "imageUrl": "/landmarks/sarthana-nature-park.jpg"
        },
        {
          "id": "gj-48",
          "name": "Gopi Talav",
          "slug": "gopi-talav-surat",
          "state": "Gujarat",
          "city": "Surat",
          "category": "Modern & Cultural",
          "description": "Restored historic urban lake and recreational park.",
          "imageUrl": "/landmarks/gopi-talav-surat.jpg"
        }
      ]
    },
    {
      "city": "Vadodara",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-49",
          "name": "Laxmi Vilas Palace",
          "slug": "laxmi-vilas-palace-vadodara",
          "state": "Gujarat",
          "city": "Vadodara",
          "category": "Heritage & Forts",
          "description": "Colossal Indo-Saracenic royal residence of Gaekwads.",
          "imageUrl": "/landmarks/laxmi-vilas-palace.jpg"
        },
        {
          "id": "gj-50",
          "name": "Sayaji Garden",
          "slug": "sayaji-garden-vadodara",
          "state": "Gujarat",
          "city": "Vadodara",
          "category": "Nature & Wildlife",
          "description": "113-acre royal park with toy train and planetarium.",
          "imageUrl": "/landmarks/sayaji-garden.jpg"
        },
        {
          "id": "gj-51",
          "name": "Baroda Museum",
          "slug": "baroda-museum-vadodara",
          "state": "Gujarat",
          "city": "Vadodara",
          "category": "Heritage & Forts",
          "description": "Royal museum housing Egyptian mummy & blue whale skeleton.",
          "imageUrl": "/landmarks/baroda-museum.jpg"
        },
        {
          "id": "gj-52",
          "name": "Kirti Mandir",
          "slug": "kirti-mandir-vadodara",
          "state": "Gujarat",
          "city": "Vadodara",
          "category": "Heritage & Forts",
          "description": "Royal cenotaph complex of the Gaekwad rulers.",
          "imageUrl": "/landmarks/kirti-mandir-vadodara.jpg"
        },
        {
          "id": "gj-53",
          "name": "EME Temple",
          "slug": "eme-temple-vadodara",
          "state": "Gujarat",
          "city": "Vadodara",
          "category": "Pilgrimage & Temples",
          "description": "Unique aluminum-clad geodesic temple run by Indian Army.",
          "imageUrl": "/landmarks/eme-temple.jpg"
        },
        {
          "id": "gj-54",
          "name": "Sursagar Lake",
          "slug": "sursagar-lake-vadodara",
          "state": "Gujarat",
          "city": "Vadodara",
          "category": "Modern & Cultural",
          "description": "Historic lake with towering 111-ft Lord Shiva statue.",
          "imageUrl": "/landmarks/sursagar-lake.jpg"
        }
      ]
    },
    {
      "city": "Narmada",
      "icon": "🗽",
      "places": [
        {
          "id": "gj-55",
          "name": "Statue of Unity",
          "slug": "statue-of-unity",
          "state": "Gujarat",
          "city": "Narmada",
          "category": "Modern & Cultural",
          "description": "World's tallest monument (182m) with 153m viewing gallery.",
          "imageUrl": "/landmarks/statue-of-unity.jpg"
        },
        {
          "id": "gj-56",
          "name": "Valley of Flowers",
          "slug": "valley-of-flowers-narmada",
          "state": "Gujarat",
          "city": "Narmada",
          "category": "Nature & Wildlife",
          "description": "17-km vibrant floral garden trail at Narmada Dam.",
          "imageUrl": "/landmarks/valley-of-flowers.jpg"
        },
        {
          "id": "gj-57",
          "name": "Ekta Nagar Eco-Tourism",
          "slug": "ekta-nagar-kevadiya",
          "state": "Gujarat",
          "city": "Narmada",
          "category": "Modern & Cultural",
          "description": "Eco-tourism haven with glow garden, maze & Narmada river cruise.",
          "imageUrl": "/landmarks/statue-of-unity.jpg"
        },
        {
          "id": "gj-58",
          "name": "Zarwani Waterfall",
          "slug": "zarwani-waterfall-narmada",
          "state": "Gujarat",
          "city": "Narmada",
          "category": "Nature & Wildlife",
          "description": "Cascading waterfall nestled in Shoolpaneshwar forest.",
          "imageUrl": "/landmarks/zarwani-waterfall.jpg"
        },
        {
          "id": "gj-59",
          "name": "Shoolpaneshwar Wildlife Sanctuary",
          "slug": "shoolpaneshwar-wildlife-sanctuary",
          "state": "Gujarat",
          "city": "Narmada",
          "category": "Nature & Wildlife",
          "description": "Dense teak forest sanctuary along Narmada River.",
          "imageUrl": "/landmarks/shoolpaneshwar-wildlife-sanctuary.jpg"
        },
        {
          "id": "gj-60",
          "name": "Cactus Garden",
          "slug": "cactus-garden-narmada",
          "state": "Gujarat",
          "city": "Narmada",
          "category": "Nature & Wildlife",
          "description": "Architectural conservatory with 500+ exotic cactus species.",
          "imageUrl": "/landmarks/cactus-garden.jpg"
        },
        {
          "id": "gj-61",
          "name": "Jungle Safari (Ekta Nagar)",
          "slug": "jungle-safari-ekta-nagar",
          "state": "Gujarat",
          "city": "Narmada",
          "category": "Nature & Wildlife",
          "description": "Open-air zoological park featuring 170+ animal species.",
          "imageUrl": "/landmarks/jungle-safari.jpg"
        }
      ]
    },
    {
      "city": "Banaskantha",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-62",
          "name": "Ambaji Temple",
          "slug": "ambaji-temple-banaskantha",
          "state": "Gujarat",
          "city": "Banaskantha",
          "category": "Pilgrimage & Temples",
          "description": "Revered 51 Shakti Peeth shrine worshipping sacred Yantra.",
          "imageUrl": "/landmarks/ambaji-temple.jpg"
        },
        {
          "id": "gj-63",
          "name": "Gabbar Hill",
          "slug": "gabbar-hill-ambaji",
          "state": "Gujarat",
          "city": "Banaskantha",
          "category": "Pilgrimage & Temples",
          "description": "Holy hilltop reached by ropeway with 51 Shaktipeeth circuit.",
          "imageUrl": "/landmarks/gabbar-hill.png"
        },
        {
          "id": "gj-64",
          "name": "Balaram Palace",
          "slug": "balaram-palace-banaskantha",
          "state": "Gujarat",
          "city": "Banaskantha",
          "category": "Heritage & Forts",
          "description": "Heritage neoclassical palace resort of Palanpur Nawabs.",
          "imageUrl": "/landmarks/balaram-palace.jpg"
        },
        {
          "id": "gj-65",
          "name": "Balaram Wildlife Sanctuary",
          "slug": "balaram-wildlife-sanctuary",
          "state": "Gujarat",
          "city": "Banaskantha",
          "category": "Nature & Wildlife",
          "description": "Aravalli forest sanctuary protecting leopards and sloth bears.",
          "imageUrl": "/landmarks/balaram-wildlife-sanctuary.jpg"
        },
        {
          "id": "gj-66",
          "name": "Jessore Sloth Bear Sanctuary",
          "slug": "jessore-sloth-bear-sanctuary",
          "state": "Gujarat",
          "city": "Banaskantha",
          "category": "Nature & Wildlife",
          "description": "Dedicated sloth bear conservation reserve in Aravalli hills.",
          "imageUrl": "/landmarks/jessore-sloth-bear-sanctuary.avif"
        }
      ]
    },
    {
      "city": "Patan",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-67",
          "name": "Rani Ki Vav",
          "slug": "rani-ki-vav-patan",
          "state": "Gujarat",
          "city": "Patan",
          "category": "Heritage & Forts",
          "description": "UNESCO World Heritage 7-storey carved inverted stepwell.",
          "imageUrl": "/landmarks/rani-ki-vav.jpg"
        },
        {
          "id": "gj-68",
          "name": "Patola Heritage Museum",
          "slug": "patola-heritage-museum-patan",
          "state": "Gujarat",
          "city": "Patan",
          "category": "Modern & Cultural",
          "description": "Master weaving workshop of double-Ikat Patola silk.",
          "imageUrl": "/landmarks/patola-heritage-museum.jpg"
        },
        {
          "id": "gj-69",
          "name": "Sahastralinga Talav",
          "slug": "sahastralinga-talav-patan",
          "state": "Gujarat",
          "city": "Patan",
          "category": "Heritage & Forts",
          "description": "Medieval water tank featuring ruins of 1,000 Shiva shrines.",
          "imageUrl": "/landmarks/sahastralinga-talav.jpg"
        },
        {
          "id": "gj-70",
          "name": "Modhera Sun Temple (Patan Circuit)",
          "slug": "modhera-sun-temple-patan",
          "state": "Gujarat",
          "city": "Patan",
          "category": "Heritage & Forts",
          "description": "Architectural Solanki Sun Temple near Patan.",
          "imageUrl": "/landmarks/modhera-sun-temple-patan.jpg"
        }
      ]
    },
    {
      "city": "Mehsana",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-71",
          "name": "Modhera Sun Temple",
          "slug": "modhera-sun-temple",
          "state": "Gujarat",
          "city": "Mehsana",
          "category": "Heritage & Forts",
          "description": "11th-century Solanki Sun Temple with stepwell Surya Kund.",
          "imageUrl": "/landmarks/modhera-sun-temple-patan.jpg"
        },
        {
          "id": "gj-72",
          "name": "Shankus Water Park",
          "slug": "shankus-water-park-mehsana",
          "state": "Gujarat",
          "city": "Mehsana",
          "category": "Modern & Cultural",
          "description": "Popular water theme park and holiday resort.",
          "imageUrl": "/landmarks/shankus-water-park.jpg"
        },
        {
          "id": "gj-73",
          "name": "Taranga Hill",
          "slug": "taranga-hill",
          "state": "Gujarat",
          "city": "Mehsana",
          "category": "Pilgrimage & Temples",
          "description": "Sacred Jain pilgrimage hill with 12th-century Ajitnath temple.",
          "imageUrl": "/landmarks/taranga-hill.jpg"
        },
        {
          "id": "gj-74",
          "name": "Vadnagar Heritage Town",
          "slug": "vadnagar-heritage-town",
          "state": "Gujarat",
          "city": "Mehsana",
          "category": "Heritage & Forts",
          "description": "2,500-year-old living heritage town with Buddhist excavations.",
          "imageUrl": "/landmarks/vadnagar.avif"
        },
        {
          "id": "gj-75",
          "name": "Kirti Toran",
          "slug": "kirti-toran-vadnagar",
          "state": "Gujarat",
          "city": "Mehsana",
          "category": "Heritage & Forts",
          "description": "40-ft Solanki red sandstone victory gateway arches.",
          "imageUrl": "/landmarks/kirti-toran.jpg"
        }
      ]
    },
    {
      "city": "Sabarkantha",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-76",
          "name": "Polo Forest",
          "slug": "polo-forest-sabarkantha",
          "state": "Gujarat",
          "city": "Sabarkantha",
          "category": "Nature & Wildlife",
          "description": "15th-century temple ruins surrounded by lush mountain forests.",
          "imageUrl": "/landmarks/polo-forest-sabarkantha.jpg"
        },
        {
          "id": "gj-77",
          "name": "Idar Fort",
          "slug": "idar-fort-sabarkantha",
          "state": "Gujarat",
          "city": "Sabarkantha",
          "category": "Heritage & Forts",
          "description": "Granite hill fortress famous for traditional wooden craft toys.",
          "imageUrl": "/landmarks/idar-fort.jpg"
        },
        {
          "id": "gj-78",
          "name": "Shamlaji Temple",
          "slug": "shamlaji-temple-sabarkantha",
          "state": "Gujarat",
          "city": "Sabarkantha",
          "category": "Pilgrimage & Temples",
          "description": "11th-century carved Vishnu shrine on Meshwo riverbank.",
          "imageUrl": "/landmarks/shamlaji-temple.jpg"
        },
        {
          "id": "gj-79",
          "name": "Vijaynagar Forest",
          "slug": "vijaynagar-forest-sabarkantha",
          "state": "Gujarat",
          "city": "Sabarkantha",
          "category": "Nature & Wildlife",
          "description": "Lush woodland reserve with streams and historical ruins.",
          "imageUrl": "/landmarks/vijaynagar-forest.jpg"
        }
      ]
    },
    {
      "city": "Aravalli",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-80",
          "name": "Shamlaji Temple (Aravalli Region)",
          "slug": "shamlaji-temple-aravalli",
          "state": "Gujarat",
          "city": "Aravalli",
          "category": "Pilgrimage & Temples",
          "description": "Historic Lord Vishnu shrine hosting the annual Shamlaji fair.",
          "imageUrl": "/landmarks/shamlaji-temple.jpg"
        },
        {
          "id": "gj-81",
          "name": "Poshina Tribal Village",
          "slug": "poshina-tribal-village",
          "state": "Gujarat",
          "city": "Aravalli",
          "category": "Modern & Cultural",
          "description": "Authentic tribal village renowned for terracotta votive horses.",
          "imageUrl": "/landmarks/polo-forest-sabarkantha.jpg"
        },
        {
          "id": "gj-82",
          "name": "Dev Ni Mori",
          "slug": "dev-ni-mori-aravalli",
          "state": "Gujarat",
          "city": "Aravalli",
          "category": "Heritage & Forts",
          "description": "Historic 3rd-century Buddhist stupa excavation site.",
          "imageUrl": "/landmarks/shamlaji-temple.jpg"
        },
        {
          "id": "gj-83",
          "name": "Ratanpur Border Hills",
          "slug": "ratanpur-forest-aravalli",
          "state": "Gujarat",
          "city": "Aravalli",
          "category": "Nature & Wildlife",
          "description": "Scenic Aravalli border hills along Rajasthan boundary.",
          "imageUrl": "/landmarks/ratanpur.jpg"
        }
      ]
    },
    {
      "city": "Dang",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-84",
          "name": "Saputara Hill Station",
          "slug": "saputara-hill-station",
          "state": "Gujarat",
          "city": "Dang",
          "category": "Nature & Wildlife",
          "description": "Cool mountain resort in Sahyadri Ghats with lake & ropeway.",
          "imageUrl": "/landmarks/saputara.jpg"
        },
        {
          "id": "gj-85",
          "name": "Gira Waterfall",
          "slug": "gira-waterfall-dang",
          "state": "Gujarat",
          "city": "Dang",
          "category": "Nature & Wildlife",
          "description": "Spectacular 30m waterfall in Dang forest reserve.",
          "imageUrl": "/landmarks/gira-waterfall.jpg"
        },
        {
          "id": "gj-86",
          "name": "Vansda National Park",
          "slug": "vansda-national-park-dang",
          "state": "Gujarat",
          "city": "Dang",
          "category": "Nature & Wildlife",
          "description": "Dense rainforest park with giant bamboo groves & wildlife.",
          "imageUrl": "/landmarks/vansda-national-park.jpg"
        },
        {
          "id": "gj-87",
          "name": "Purna Wildlife Sanctuary",
          "slug": "purna-wildlife-sanctuary-dang",
          "state": "Gujarat",
          "city": "Dang",
          "category": "Nature & Wildlife",
          "description": "Dense bamboo forest sanctuary in Mahal Dang.",
          "imageUrl": "/landmarks/vansda-national-park.jpg"
        },
        {
          "id": "gj-88",
          "name": "Saputara Lake",
          "slug": "saputara-lake-dang",
          "state": "Gujarat",
          "city": "Dang",
          "category": "Nature & Wildlife",
          "description": "Serene hill lake offering pedal boating and walks.",
          "imageUrl": "/landmarks/saputara.jpg"
        },
        {
          "id": "gj-89",
          "name": "Sunset Point Saputara",
          "slug": "sunset-point-saputara-dang",
          "state": "Gujarat",
          "city": "Dang",
          "category": "Nature & Wildlife",
          "description": "Panoramic peak accessible by ropeway overlooking valleys.",
          "imageUrl": "/landmarks/sunset-point-saputara.jpg"
        }
      ]
    },
    {
      "city": "Navsari",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-90",
          "name": "Dandi Beach",
          "slug": "dandi-beach-navsari",
          "state": "Gujarat",
          "city": "Navsari",
          "category": "Beaches & Coast",
          "description": "Historic beach site of Mahatma Gandhi's 1930 Salt March.",
          "imageUrl": "/landmarks/dandi-beach.jpg"
        },
        {
          "id": "gj-91",
          "name": "National Salt Satyagraha Memorial Dandi",
          "slug": "dandi-memorial-navsari",
          "state": "Gujarat",
          "city": "Navsari",
          "category": "Heritage & Forts",
          "description": "Grand national monument celebrating the Dandi Salt March.",
          "imageUrl": "/landmarks/dandi-memorial.jpg"
        },
        {
          "id": "gj-92",
          "name": "Vansda Park (Navsari Circuit)",
          "slug": "vansda-park-navsari",
          "state": "Gujarat",
          "city": "Navsari",
          "category": "Nature & Wildlife",
          "description": "Forest sanctuary border circuit in Navsari.",
          "imageUrl": "/landmarks/vansda-national-park.jpg"
        },
        {
          "id": "gj-93",
          "name": "Unai Hot Springs",
          "slug": "unai-hot-springs-navsari",
          "state": "Gujarat",
          "city": "Navsari",
          "category": "Pilgrimage & Temples",
          "description": "Sacred sulfur thermal springs & Unai Mata temple.",
          "imageUrl": "/landmarks/unai-hot-springs.jpg"
        }
      ]
    },
    {
      "city": "Bharuch",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-94",
          "name": "Kabirvad",
          "slug": "kabirvad-banyan-tree-bharuch",
          "state": "Gujarat",
          "city": "Bharuch",
          "category": "Nature & Wildlife",
          "description": "Massive centuries-old banyan tree river island in Narmada.",
          "imageUrl": "/landmarks/kabirvad.jpg"
        },
        {
          "id": "gj-95",
          "name": "Golden Bridge",
          "slug": "golden-bridge-bharuch",
          "state": "Gujarat",
          "city": "Bharuch",
          "category": "Heritage & Forts",
          "description": "1881 historic British iron bridge across Narmada.",
          "imageUrl": "/landmarks/golden-bridge.jpg"
        },
        {
          "id": "gj-96",
          "name": "Shuklatirth",
          "slug": "shuklatirth-bharuch",
          "state": "Gujarat",
          "city": "Bharuch",
          "category": "Pilgrimage & Temples",
          "description": "Ancient sacred riverbank pilgrimage center on Narmada.",
          "imageUrl": "/landmarks/shuklatirth.jpg"
        }
      ]
    },
    {
      "city": "Panchmahal",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-97",
          "name": "Pavagadh Hill",
          "slug": "pavagadh-hill-panchmahal",
          "state": "Gujarat",
          "city": "Panchmahal",
          "category": "Pilgrimage & Temples",
          "description": "Volcanic peak with ropeway to Kalika Mata temple.",
          "imageUrl": "/landmarks/pavagadh-hill.jpg"
        },
        {
          "id": "gj-98",
          "name": "Kalika Mata Temple Pavagadh",
          "slug": "kalika-mata-temple-pavagadh",
          "state": "Gujarat",
          "city": "Panchmahal",
          "category": "Pilgrimage & Temples",
          "description": "Sacred hilltop Shakti Peeth shrine on Pavagadh.",
          "imageUrl": "/landmarks/kalika-mata-temple.jpg"
        },
        {
          "id": "gj-99",
          "name": "Champaner Archaeological Park",
          "slug": "champaner-archaeological-park",
          "state": "Gujarat",
          "city": "Panchmahal",
          "category": "Heritage & Forts",
          "description": "UNESCO World Heritage medieval Sultanate fortress & mosques.",
          "imageUrl": "/places/champaner-pavagadh.jpg"
        }
      ]
    },
    {
      "city": "Rajkot",
      "icon": "🏛️",
      "places": [
        {
          "id": "gj-100",
          "name": "Watson Museum & Jubilee Garden",
          "slug": "watson-museum-jubilee-garden-rajkot",
          "state": "Gujarat",
          "city": "Rajkot",
          "category": "Heritage & Forts",
          "description": "Colonial museum in Jubilee Garden with rare Saurashtra artifacts.",
          "imageUrl": "/landmarks/watson-museum.jpg"
        }
      ]
    }
  ]
},
  {
    "state": "Assam",
    "flag": "🇦🇸",
    "regions": [
      {
        "city": "Guwahati & Around",
        "icon": "🍀",
        "places": [
          {
            "id": "ind-1001",
            "name": "Guwahati",
            "slug": "guwahati",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Modern & Cultural",
            "description": "Gateway to Northeast India and vibrant Brahmaputra river port city",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1002",
            "name": "Kamakhya Temple",
            "slug": "kamakhya-temple",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Pilgrimage & Temples",
            "description": "Famous 51 Shakti Peeth shrine atop Nilachal Hill in Guwahati",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1003",
            "name": "Umananda Island & Temple",
            "slug": "umananda-island-temple",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Pilgrimage & Temples",
            "description": "World's smallest inhabited river island in the Brahmaputra dedicated to Lord Shiva",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1004",
            "name": "Assam State Museum",
            "slug": "assam-state-museum",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Heritage & Forts",
            "description": "Premier cultural museum showcasing ancient Ahom artifacts and tribal heritage",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1005",
            "name": "Deepor Beel",
            "slug": "deepor-beel",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Nature & Wildlife",
            "description": "Major Ramsar wetland sanctuary famous for migratory birds and wild elephants",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1006",
            "name": "Basistha Ashram",
            "slug": "basistha-ashram",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Pilgrimage & Temples",
            "description": "Historic Vedic sage ashram nestled in lush green hills with mountain streams",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1007",
            "name": "Navagraha Temple",
            "slug": "navagraha-temple",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Pilgrimage & Temples",
            "description": "Ancient temple of nine celestial planets atop Chitrasal Hill",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1008",
            "name": "Pobitora Wildlife Sanctuary",
            "slug": "pobitora-wildlife-sanctuary",
            "state": "Assam",
            "city": "Guwahati & Around",
            "category": "Nature & Wildlife",
            "description": "Sanctuary with the highest density of one-horned rhinoceros in the world",
            "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Upper Assam",
        "icon": "🌿",
        "places": [
          {
            "id": "ind-1009",
            "name": "Kaziranga",
            "slug": "kaziranga",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Nature & Wildlife",
            "description": "World-famous UNESCO wildlife destination known for one-horned rhinos",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1010",
            "name": "Kaziranga National Park",
            "slug": "kaziranga-national-park",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Nature & Wildlife",
            "description": "Iconic national park home to rhinos, tigers, wild water buffaloes & elephants",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1011",
            "name": "Jorhat",
            "slug": "jorhat",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Nature & Wildlife",
            "description": "Tea capital of Assam surrounded by historic heritage tea estates",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1012",
            "name": "Majuli",
            "slug": "majuli",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Modern & Cultural",
            "description": "World's largest river island in Brahmaputra, center of Neo-Vaishnavite culture",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1013",
            "name": "Sivasagar",
            "slug": "sivasagar",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Heritage & Forts",
            "description": "Historic royal capital of the Ahom Kingdom filled with 600-year monuments",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1014",
            "name": "Dibrugarh",
            "slug": "dibrugarh",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Nature & Wildlife",
            "description": "Tea gardens and scenic Brahmaputra riverfront landscapes",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1015",
            "name": "Tinsukia",
            "slug": "tinsukia",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Nature & Wildlife",
            "description": "Commercial hub near Dibru-Saikhowa National Park and tea estates",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1016",
            "name": "Digboi",
            "slug": "digboi",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Heritage & Forts",
            "description": "Historic oil town featuring Asia's oldest operating oil refinery & museum",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1017",
            "name": "Namrup",
            "slug": "namrup",
            "state": "Assam",
            "city": "Upper Assam",
            "category": "Nature & Wildlife",
            "description": "Industrial township surrounded by dense rainforests and tea hills",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Hills & Nature",
        "icon": "🌄",
        "places": [
          {
            "id": "ind-1018",
            "name": "Haflong",
            "slug": "haflong",
            "state": "Assam",
            "city": "Hills & Nature",
            "category": "Nature & Wildlife",
            "description": "Assam's only hill station featuring misty blue hills and Haflong Lake",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1019",
            "name": "Maibong",
            "slug": "maibong",
            "state": "Assam",
            "city": "Hills & Nature",
            "category": "Heritage & Forts",
            "description": "Ancient capital of Kachari Kingdom with historical stone ruins along Mahur River",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1020",
            "name": "Umrangso",
            "slug": "umrangso",
            "state": "Assam",
            "city": "Hills & Nature",
            "category": "Nature & Wildlife",
            "description": "Scenic hill township featuring natural hot springs and Golf Course lake",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1021",
            "name": "Panimur Waterfall",
            "slug": "panimur-waterfall",
            "state": "Assam",
            "city": "Hills & Nature",
            "category": "Nature & Wildlife",
            "description": "Niagara of Assam — roaring turquoise waterfall on Kopili River",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1022",
            "name": "Chandubi Lake",
            "slug": "chandubi-lake",
            "state": "Assam",
            "city": "Hills & Nature",
            "category": "Nature & Wildlife",
            "description": "Natural earthquake-formed lake nestled at the foot of Garo hills",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1023",
            "name": "Kakochang Waterfall",
            "slug": "kakochang-waterfall",
            "state": "Assam",
            "city": "Hills & Nature",
            "category": "Nature & Wildlife",
            "description": "Picturesque forest waterfall cascading near Kaziranga tea gardens",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Wildlife & Nature",
        "icon": "🐘",
        "places": [
          {
            "id": "ind-1024",
            "name": "Manas National Park",
            "slug": "manas-national-park",
            "state": "Assam",
            "city": "Wildlife & Nature",
            "category": "Nature & Wildlife",
            "description": "UNESCO World Heritage biosphere reserve & tiger project along Bhutan border",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1025",
            "name": "Orang National Park",
            "slug": "orang-national-park",
            "state": "Assam",
            "city": "Wildlife & Nature",
            "category": "Nature & Wildlife",
            "description": "Mini Kaziranga habitat on the north bank of Brahmaputra River",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1026",
            "name": "Nameri National Park",
            "slug": "nameri-national-park",
            "state": "Assam",
            "city": "Wildlife & Nature",
            "category": "Nature & Wildlife",
            "description": "Foothill Himalayan wilderness famous for Jia Bhoroli river rafting & golden mahseer",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1027",
            "name": "Dibru-Saikhowa National Park",
            "slug": "dibru-saikhowa-national-park",
            "state": "Assam",
            "city": "Wildlife & Nature",
            "category": "Nature & Wildlife",
            "description": "Island biosphere reserve known for feral horses and rare white-winged wood ducks",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1028",
            "name": "Hoollongapar Gibbon Wildlife Sanctuary",
            "slug": "hoollongapar-gibbon-wildlife-sanctuary",
            "state": "Assam",
            "city": "Wildlife & Nature",
            "category": "Nature & Wildlife",
            "description": "India's only sanctuary dedicated to the endangered Hoolock Gibbon ape",
            "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Culture & Heritage",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1029",
            "name": "Sivasagar Sivadol",
            "slug": "sivasagar-sivadol",
            "state": "Assam",
            "city": "Culture & Heritage",
            "category": "Heritage & Forts",
            "description": "Tallest Shiva temple tower in India on the banks of Sivasagar Lake",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1030",
            "name": "Rang Ghar",
            "slug": "rang-ghar",
            "state": "Assam",
            "city": "Culture & Heritage",
            "category": "Heritage & Forts",
            "description": "Two-storied royal amphitheater used by Ahom Kings for sports & festivals",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1031",
            "name": "Talatal Ghar",
            "slug": "talatal-ghar",
            "state": "Assam",
            "city": "Culture & Heritage",
            "category": "Heritage & Forts",
            "description": "7-storey royal Ahom palace featuring secret underground tunnels",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1032",
            "name": "Charaideo Maidams",
            "slug": "charaideo-maidams",
            "state": "Assam",
            "city": "Culture & Heritage",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage royal burial mounds of the Ahom dynasty",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1033",
            "name": "Majuli Satras",
            "slug": "majuli-satras",
            "state": "Assam",
            "city": "Culture & Heritage",
            "category": "Modern & Cultural",
            "description": "500-year-old monastic centers of classical Assamese dance, drama & mask-making",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Bihar",
    "flag": "🇮🇳",
    "regions": [
      {
        "city": "Buddhist Circuit",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1034",
            "name": "Bodh Gaya",
            "slug": "bodh-gaya",
            "state": "Bihar",
            "city": "Buddhist Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Major global Buddhist pilgrimage center where Lord Buddha attained Enlightenment",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1035",
            "name": "Mahabodhi Temple",
            "slug": "mahabodhi-temple",
            "state": "Bihar",
            "city": "Buddhist Circuit",
            "category": "Pilgrimage & Temples",
            "description": "UNESCO World Heritage Site housing the sacred Bodhi Tree and Vajrasana seat",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1036",
            "name": "Rajgir",
            "slug": "rajgir",
            "state": "Bihar",
            "city": "Buddhist Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Ancient spiritual valley surrounded by 7 hills, Vishwa Shanti Stupa & hot springs",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1037",
            "name": "Nalanda",
            "slug": "nalanda",
            "state": "Bihar",
            "city": "Buddhist Circuit",
            "category": "Heritage & Forts",
            "description": "World's ancient monastic university center of learning and philosophy",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1038",
            "name": "Nalanda University Ruins",
            "slug": "nalanda-university-ruins",
            "state": "Bihar",
            "city": "Buddhist Circuit",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage red-brick monastic university ruins from 5th century CE",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1039",
            "name": "Vaishali",
            "slug": "vaishali",
            "state": "Bihar",
            "city": "Buddhist Circuit",
            "category": "Heritage & Forts",
            "description": "Historic democracy birthplace, Lord Mahavira birthplace & Ashoka Pillar site",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1040",
            "name": "Pawapuri",
            "slug": "pawapuri",
            "state": "Bihar",
            "city": "Buddhist Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Sacred Jain holy site where Lord Mahavira attained Moksha at Jal Mandir",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Patna & Around",
        "icon": "🏛️",
        "places": [
          {
            "id": "ind-1041",
            "name": "Patna",
            "slug": "patna",
            "state": "Bihar",
            "city": "Patna & Around",
            "category": "Modern & Cultural",
            "description": "Capital city of Bihar on the banks of holy River Ganga",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1042",
            "name": "Golghar",
            "slug": "golghar",
            "state": "Bihar",
            "city": "Patna & Around",
            "category": "Heritage & Forts",
            "description": "Granary building offering 360° panoramic views of Patna city & Ganga",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1043",
            "name": "Patna Museum",
            "slug": "patna-museum",
            "state": "Bihar",
            "city": "Patna & Around",
            "category": "Heritage & Forts",
            "description": "Historic museum housing Didarganj Yakshi and ancient bronze sculptures",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1044",
            "name": "Bihar Museum",
            "slug": "bihar-museum",
            "state": "Bihar",
            "city": "Patna & Around",
            "category": "Modern & Cultural",
            "description": "State-of-the-art international museum showcasing 10,000 years of Bihar heritage",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1045",
            "name": "Gandhi Maidan",
            "slug": "gandhi-maidan",
            "state": "Bihar",
            "city": "Patna & Around",
            "category": "Modern & Cultural",
            "description": "Historic historic city park venue of major national independence rallies",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1046",
            "name": "Takht Sri Patna Sahib",
            "slug": "takht-sri-patna-sahib",
            "state": "Bihar",
            "city": "Patna & Around",
            "category": "Pilgrimage & Temples",
            "description": "Birthplace of 10th Sikh Guru, Sri Guru Gobind Singh Ji",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1047",
            "name": "Agam Kuan",
            "slug": "agam-kuan",
            "state": "Bihar",
            "city": "Patna & Around",
            "category": "Heritage & Forts",
            "description": "Ancient unmeasurable well dating back to Emperor Ashoka's reign",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Nature & Wildlife",
        "icon": "🌿",
        "places": [
          {
            "id": "ind-1048",
            "name": "Valmiki National Park",
            "slug": "valmiki-national-park",
            "state": "Bihar",
            "city": "Nature & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Dense Sal forest tiger reserve on Indo-Nepal border along Gandak River",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1049",
            "name": "Valmiki Tiger Reserve",
            "slug": "valmiki-tiger-reserve",
            "state": "Bihar",
            "city": "Nature & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Protected Himalayan foothills tiger habitat with rich biodiversity",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1050",
            "name": "Vikramshila Gangetic Dolphin Sanctuary",
            "slug": "vikramshila-gangetic-dolphin-sanctuary",
            "state": "Bihar",
            "city": "Nature & Wildlife",
            "category": "Nature & Wildlife",
            "description": "India's only protected aquatic sanctuary for endangered Gangetic river dolphins",
            "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1051",
            "name": "Kaimur Hills",
            "slug": "kaimur-hills",
            "state": "Bihar",
            "city": "Nature & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Scenic plateau range featuring ancient cave paintings and roaring waterfalls",
            "imageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1052",
            "name": "Kakolat Waterfall",
            "slug": "kakolat-waterfall",
            "state": "Bihar",
            "city": "Nature & Wildlife",
            "category": "Nature & Wildlife",
            "description": "160-feet cold spring water stream in Nawada surrounded by lush forest",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Heritage & Culture",
        "icon": "🕌",
        "places": [
          {
            "id": "ind-1053",
            "name": "Sher Shah Suri Tomb, Sasaram",
            "slug": "sher-shah-suri-tomb-sasaram",
            "state": "Bihar",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "Majestic red-sandstone mausoleum standing in the middle of an artificial lake",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1054",
            "name": "Barabar Caves",
            "slug": "barabar-caves",
            "state": "Bihar",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "Oldest surviving rock-cut caves in India with polished granite finish from Mauryan era",
            "imageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1055",
            "name": "Maner Sharif",
            "slug": "maner-sharif",
            "state": "Bihar",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "Historic Sufi mausoleum center of Sufism featuring ornate Mughal architecture",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1056",
            "name": "Kesaria Stupa",
            "slug": "kesaria-stupa",
            "state": "Bihar",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "World's tallest Buddhist stupa rising 104 feet in East Champaran",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1057",
            "name": "Mundeshwari Temple",
            "slug": "mundeshwari-temple",
            "state": "Bihar",
            "city": "Heritage & Culture",
            "category": "Pilgrimage & Temples",
            "description": "One of the oldest functional Hindu temples in India dating back to 108 CE",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Chhattisgarh",
    "flag": "🇮🇳",
    "regions": [
      {
        "city": "Bastar Region",
        "icon": "🌿",
        "places": [
          {
            "id": "ind-1058",
            "name": "Jagdalpur",
            "slug": "jagdalpur",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Modern & Cultural",
            "description": "Cultural capital and gateway to Bastar tribal art & waterfalls",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1059",
            "name": "Chitrakote Waterfall",
            "slug": "chitrakote-waterfall",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Nature & Wildlife",
            "description": "Niagara Falls of India — 300m wide horseshoe waterfall on Indravati River",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1060",
            "name": "Tirathgarh Waterfall",
            "slug": "tirathgarh-waterfall",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Nature & Wildlife",
            "description": "300-feet 3-tiered cascading waterfall inside Kanger Valley forest",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1061",
            "name": "Kanger Valley National Park",
            "slug": "kanger-valley-national-park",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Nature & Wildlife",
            "description": "Dense virgin forest reserve home to hill mynas, subterranean caves & gorges",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1062",
            "name": "Kutumsar Caves",
            "slug": "kutumsar-caves",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Nature & Wildlife",
            "description": "Subterranean limestone cave with blind fish species and stalactites",
            "imageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1063",
            "name": "Kailash Caves",
            "slug": "kailash-caves",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Nature & Wildlife",
            "description": "Natural underground cave complex featuring acoustic limestone formations",
            "imageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1064",
            "name": "Bastar Palace",
            "slug": "bastar-palace",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Heritage & Forts",
            "description": "Historical palace of the Kakatiya rulers of Bastar",
            "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1065",
            "name": "Dalpat Sagar",
            "slug": "dalpat-sagar",
            "state": "Chhattisgarh",
            "city": "Bastar Region",
            "category": "Nature & Wildlife",
            "description": "Largest artificial lake in Chhattisgarh built 400 years ago for water harvesting",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Northern Chhattisgarh",
        "icon": "🌄",
        "places": [
          {
            "id": "ind-1066",
            "name": "Mainpat",
            "slug": "mainpat",
            "state": "Chhattisgarh",
            "city": "Northern Chhattisgarh",
            "category": "Nature & Wildlife",
            "description": "Shimla of Chhattisgarh — scenic hill station and Tibetan refugee settlement",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1067",
            "name": "Ambikapur",
            "slug": "ambikapur",
            "state": "Chhattisgarh",
            "city": "Northern Chhattisgarh",
            "category": "Modern & Cultural",
            "description": "Cleanest city hub near Mahamaya Temple and Surguja hill range",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1068",
            "name": "Surguja Forests",
            "slug": "surguja-forests",
            "state": "Chhattisgarh",
            "city": "Northern Chhattisgarh",
            "category": "Nature & Wildlife",
            "description": "Lush green Sal forests, springs and hills around Ambikapur",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1069",
            "name": "Tiger Point, Mainpat",
            "slug": "tiger-point-mainpat",
            "state": "Chhattisgarh",
            "city": "Northern Chhattisgarh",
            "category": "Nature & Wildlife",
            "description": "High-altitude waterfall surrounded by evergreen mountain forests",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1070",
            "name": "Machali Point",
            "slug": "machali-point",
            "state": "Chhattisgarh",
            "city": "Northern Chhattisgarh",
            "category": "Nature & Wildlife",
            "description": "Serene stream valley in Mainpat famous for fish and mountain views",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Raipur & Central",
        "icon": "🏙️",
        "places": [
          {
            "id": "ind-1071",
            "name": "Raipur",
            "slug": "raipur",
            "state": "Chhattisgarh",
            "city": "Raipur & Central",
            "category": "Modern & Cultural",
            "description": "Vibrant capital city of Chhattisgarh on Mahanadi river basin",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1072",
            "name": "Nandan Van Jungle Safari",
            "slug": "nandan-van-jungle-safari",
            "state": "Chhattisgarh",
            "city": "Raipur & Central",
            "category": "Nature & Wildlife",
            "description": "Asia's largest man-made jungle safari park in Naya Raipur",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1073",
            "name": "Purkhauti Muktangan",
            "slug": "purkhauti-muktangan",
            "state": "Chhattisgarh",
            "city": "Raipur & Central",
            "category": "Modern & Cultural",
            "description": "Open-air garden museum celebrating tribal art, architecture and culture",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1074",
            "name": "Sirpur",
            "slug": "sirpur",
            "state": "Chhattisgarh",
            "city": "Raipur & Central",
            "category": "Heritage & Forts",
            "description": "Ancient 5th-century archaeological complex of Laxman Temple & Buddhist Viharas",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1075",
            "name": "Barnawapara Wildlife Sanctuary",
            "slug": "barnawapara-wildlife-sanctuary",
            "state": "Chhattisgarh",
            "city": "Raipur & Central",
            "category": "Nature & Wildlife",
            "description": "Lush wildlife sanctuary home to leopards, wild bison (Gaur) and sloth bears",
            "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Heritage & Tribal Culture",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1076",
            "name": "Bhoramdeo Temple",
            "slug": "bhoramdeo-temple",
            "state": "Chhattisgarh",
            "city": "Heritage & Tribal Culture",
            "category": "Heritage & Forts",
            "description": "Khajuraho of Chhattisgarh — 11th-century carved stone Shiva temple in Maikal hills",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1077",
            "name": "Sirpur Archaeological Sites",
            "slug": "sirpur-archaeological-sites",
            "state": "Chhattisgarh",
            "city": "Heritage & Tribal Culture",
            "category": "Heritage & Forts",
            "description": "Excavated Buddhist monasteries and brick temples along Mahanadi",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1078",
            "name": "Bastar Tribal Villages",
            "slug": "bastar-tribal-villages",
            "state": "Chhattisgarh",
            "city": "Heritage & Tribal Culture",
            "category": "Modern & Cultural",
            "description": "Authentic villages producing Dhokra bell-metal, ironcraft and terracotta art",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1079",
            "name": "Danteshwari Temple",
            "slug": "danteshwari-temple",
            "state": "Chhattisgarh",
            "city": "Heritage & Tribal Culture",
            "category": "Pilgrimage & Temples",
            "description": "Ancient 51 Shakti Peeth shrine dedicated to Goddess Danteshwari in Dantewada",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Goa",
    "flag": "🇮🇳",
    "regions": [
      {
        "city": "North Goa",
        "icon": "🏖️",
        "places": [
          {
            "id": "ind-1080",
            "name": "Panaji",
            "slug": "panaji",
            "state": "Goa",
            "city": "North Goa",
            "category": "Modern & Cultural",
            "description": "Charming capital city along Mandovi River with Latin Quarter architecture",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1081",
            "name": "Calangute Beach",
            "slug": "calangute-beach",
            "state": "Goa",
            "city": "North Goa",
            "category": "Beaches & Coast",
            "description": "Queen of Beaches — famous golden sand beach with water sports and shacks",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1082",
            "name": "Baga Beach",
            "slug": "baga-beach",
            "state": "Goa",
            "city": "North Goa",
            "category": "Beaches & Coast",
            "description": "Vibrant beach famous for nightlife, beach clubs, and water sports",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1083",
            "name": "Anjuna Beach",
            "slug": "anjuna-beach",
            "state": "Goa",
            "city": "North Goa",
            "category": "Beaches & Coast",
            "description": "Bohemian beach featuring Rocky cliff sunset views and Wednesday flea markets",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1084",
            "name": "Vagator Beach",
            "slug": "vagator-beach",
            "state": "Goa",
            "city": "North Goa",
            "category": "Beaches & Coast",
            "description": "Dramatic red cliff beach below Chapora Fort with seaside lounges",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1085",
            "name": "Candolim Beach",
            "slug": "candolim-beach",
            "state": "Goa",
            "city": "North Goa",
            "category": "Beaches & Coast",
            "description": "Serene sand stretch lined with dunes, luxury resorts and quiet beach shacks",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1086",
            "name": "Sinquerim Beach",
            "slug": "sinquerim-beach",
            "state": "Goa",
            "city": "North Goa",
            "category": "Beaches & Coast",
            "description": "Pristine beach adjoining Aguada Fort, famous for jet-skiing and dolphin trips",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1087",
            "name": "Chapora Fort",
            "slug": "chapora-fort",
            "state": "Goa",
            "city": "North Goa",
            "category": "Heritage & Forts",
            "description": "17th-century hilltop Portuguese fort offering panoramic views of Dil Chahta Hai point",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1088",
            "name": "Aguada Fort",
            "slug": "aguada-fort",
            "state": "Goa",
            "city": "North Goa",
            "category": "Heritage & Forts",
            "description": "17th-century Portuguese lighthouse fort standing at the confluence of Mandovi river",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1089",
            "name": "Reis Magos Fort",
            "slug": "reis-magos-fort",
            "state": "Goa",
            "city": "North Goa",
            "category": "Heritage & Forts",
            "description": "Restored 16th-century fortress overlooking Panaji and Mandovi estuary",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "South Goa",
        "icon": "🌊",
        "places": [
          {
            "id": "ind-1090",
            "name": "Colva Beach",
            "slug": "colva-beach",
            "state": "Goa",
            "city": "South Goa",
            "category": "Beaches & Coast",
            "description": "White sand coastal stretch lined with coconut palms in South Goa",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1091",
            "name": "Benaulim Beach",
            "slug": "benaulim-beach",
            "state": "Goa",
            "city": "South Goa",
            "category": "Beaches & Coast",
            "description": "Quiet fishing beach offering dolphin sighting trips and seafood dining",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1092",
            "name": "Palolem Beach",
            "slug": "palolem-beach",
            "state": "Goa",
            "city": "South Goa",
            "category": "Beaches & Coast",
            "description": "Crescent-shaped paradise beach with calm waters, colorful huts & silent discos",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1093",
            "name": "Agonda Beach",
            "slug": "agonda-beach",
            "state": "Goa",
            "city": "South Goa",
            "category": "Beaches & Coast",
            "description": "Pristine turtle nesting beach offering tranquility and yoga retreats",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1094",
            "name": "Varca Beach",
            "slug": "varca-beach",
            "state": "Goa",
            "city": "South Goa",
            "category": "Beaches & Coast",
            "description": "Ultra-clean white sand luxury resort beach",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1095",
            "name": "Cavelossim Beach",
            "slug": "cavelossim-beach",
            "state": "Goa",
            "city": "South Goa",
            "category": "Beaches & Coast",
            "description": "Scenic spot where Sal River meets the Arabian Sea",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1096",
            "name": "Cabo de Rama",
            "slug": "cabo-de-rama",
            "state": "Goa",
            "city": "South Goa",
            "category": "Heritage & Forts",
            "description": "Historic cape fortress with dramatic sea cliff views and secluded beach cove",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Heritage & Culture",
        "icon": "⛪",
        "places": [
          {
            "id": "ind-1097",
            "name": "Old Goa",
            "slug": "old-goa",
            "state": "Goa",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage former capital of Portuguese India filled with grand cathedrals",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1098",
            "name": "Basilica of Bom Jesus",
            "slug": "basilica-of-bom-jesus",
            "state": "Goa",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "Baroque church housing the sacred mortal remains of St. Francis Xavier",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1099",
            "name": "Sé Cathedral",
            "slug": "s-cathedral",
            "state": "Goa",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "One of the largest churches in Asia featuring 5 bells including Golden Bell",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1100",
            "name": "Church of St. Francis of Assisi",
            "slug": "church-of-st-francis-of-assisi",
            "state": "Goa",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "1661 convent church with Tuscan facade and Manueline carvings",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1101",
            "name": "Fontainhas",
            "slug": "fontainhas",
            "state": "Goa",
            "city": "Heritage & Culture",
            "category": "Modern & Cultural",
            "description": "UNESCO heritage Latin Quarter with vibrant Mediterranean-style colorful houses",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1102",
            "name": "Goa State Museum",
            "slug": "goa-state-museum",
            "state": "Goa",
            "city": "Heritage & Culture",
            "category": "Heritage & Forts",
            "description": "Museum housing Goan antiquities, sculptures, coins and Christian art",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Nature & Adventure",
        "icon": "🌿",
        "places": [
          {
            "id": "ind-1103",
            "name": "Dudhsagar Waterfalls",
            "slug": "dudhsagar-waterfalls",
            "state": "Goa",
            "city": "Nature & Adventure",
            "category": "Nature & Wildlife",
            "description": "Spectacular 4-tiered 310m milky white waterfall inside Bhagwan Mahavir Sanctuary",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1104",
            "name": "Bhagwan Mahavir Wildlife Sanctuary",
            "slug": "bhagwan-mahavir-wildlife-sanctuary",
            "state": "Goa",
            "city": "Nature & Adventure",
            "category": "Nature & Wildlife",
            "description": "Largest protected wildlife area in Western Ghats evergreen forest",
            "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1105",
            "name": "Mollem National Park",
            "slug": "mollem-national-park",
            "state": "Goa",
            "city": "Nature & Adventure",
            "category": "Nature & Wildlife",
            "description": "Dense forest national park home to black panthers, hornbills and Dudhsagar trek",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1106",
            "name": "Salim Ali Bird Sanctuary",
            "slug": "salim-ali-bird-sanctuary",
            "state": "Goa",
            "city": "Nature & Adventure",
            "category": "Nature & Wildlife",
            "description": "Mangrove swamp bird sanctuary on Chorao Island accessible by ferry",
            "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1107",
            "name": "Netravali Wildlife Sanctuary",
            "slug": "netravali-wildlife-sanctuary",
            "state": "Goa",
            "city": "Nature & Adventure",
            "category": "Nature & Wildlife",
            "description": "Bio-diverse forest sanctuary featuring bubbling lake (Budbud Lake) and waterfalls",
            "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Himachal Pradesh",
    "flag": "🏔️",
    "regions": [
      {
        "city": "Shimla & Around",
        "icon": "🏔️",
        "places": [
          {
            "id": "ind-1108",
            "name": "Shimla",
            "slug": "shimla",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Nature & Wildlife",
            "description": "Queen of Hills — capital of Himachal with colonial Mall Road & Ridge promenade",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1109",
            "name": "Kufri",
            "slug": "kufri",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Nature & Wildlife",
            "description": "High-altitude winter sports destination with yak rides and Himalayan Zoo",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1110",
            "name": "Chail",
            "slug": "chail",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Heritage & Forts",
            "description": "Royal retreat featuring world's highest cricket ground and Chail Palace",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1111",
            "name": "Mashobra",
            "slug": "mashobra",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Nature & Wildlife",
            "description": "Serene pine-forested hamlet home to President's retreat (The Retreat)",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1112",
            "name": "Naldehra",
            "slug": "naldehra",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Nature & Wildlife",
            "description": "18-hole cedar-forested alpine golf course established by Lord Curzon",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1113",
            "name": "Jakhu Temple",
            "slug": "jakhu-temple",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Pilgrimage & Temples",
            "description": "Sacred hilltop Hanuman temple featuring colossal 108-foot statue",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1114",
            "name": "The Ridge",
            "slug": "the-ridge",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Modern & Cultural",
            "description": "Open pedestrian plaza in Shimla offering panoramic views of snowcapped peaks",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1115",
            "name": "Mall Road",
            "slug": "mall-road",
            "state": "Himachal Pradesh",
            "city": "Shimla & Around",
            "category": "Modern & Cultural",
            "description": "Vibrant pedestrian shopping avenue lined with colonial cafes and shops",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Manali & Kullu",
        "icon": "❄️",
        "places": [
          {
            "id": "ind-1116",
            "name": "Manali",
            "slug": "manali",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Nature & Wildlife",
            "description": "Popular Himalayan resort town on Beas River, gateway to Solang & Rohtang",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1117",
            "name": "Old Manali",
            "slug": "old-manali",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Modern & Cultural",
            "description": "Rustic bohemian village with wooden houses, cafes and Hadimba Temple",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1118",
            "name": "Solang Valley",
            "slug": "solang-valley",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Nature & Wildlife",
            "description": "Adventure sports hub for paragliding, zorbing, cable car and winter skiing",
            "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1119",
            "name": "Rohtang Pass",
            "slug": "rohtang-pass",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Nature & Wildlife",
            "description": "High mountain pass at 3,978m offering snow views and gateway to Lahaul",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1120",
            "name": "Kasol",
            "slug": "kasol",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Nature & Wildlife",
            "description": "Mini Israel of India — Parvati Valley riverside hamlet famous for treks",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1121",
            "name": "Manikaran",
            "slug": "manikaran",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Pilgrimage & Temples",
            "description": "Sacred hot springs, Gurudwara and Shiva temple in Parvati Valley",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1122",
            "name": "Kullu",
            "slug": "kullu",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Nature & Wildlife",
            "description": "Valley of Gods famous for Dussehra festival, Beas river rafting & shawls",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1123",
            "name": "Naggar",
            "slug": "naggar",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Heritage & Forts",
            "description": "Historic capital featuring 500-year Naggar Castle and Roerich Art Gallery",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1124",
            "name": "Tosh",
            "slug": "tosh",
            "state": "Himachal Pradesh",
            "city": "Manali & Kullu",
            "category": "Nature & Wildlife",
            "description": "Scenic alpine village at the end of Parvati Valley with glacier views",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Kangra & Dharamshala",
        "icon": "🏞️",
        "places": [
          {
            "id": "ind-1125",
            "name": "Dharamshala",
            "slug": "dharamshala",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Nature & Wildlife",
            "description": "Picturesque hill city against Dhauladhar range, home of HPCA stadium",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1126",
            "name": "McLeod Ganj",
            "slug": "mcleod-ganj",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Modern & Cultural",
            "description": "Little Lhasa — residence of H.H. Dalai Lama and Tibetan Government-in-Exile",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1127",
            "name": "Triund",
            "slug": "triund",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Nature & Wildlife",
            "description": "Popular ridge trek offering 180° views of snowbound Dhauladhar wall",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1128",
            "name": "Bhagsu Waterfall",
            "slug": "bhagsu-waterfall",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Nature & Wildlife",
            "description": "Forest waterfall near Bhagsunag Temple in McLeod Ganj",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1129",
            "name": "Dal Lake, Dharamshala",
            "slug": "dal-lake-dharamshala",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Nature & Wildlife",
            "description": "Deodar-lined sacred mountain lake near Naddi village",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1130",
            "name": "Kangra Fort",
            "slug": "kangra-fort",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Heritage & Forts",
            "description": "Oldest fort in India and largest in Himalayas dating back to Trigarta Kingdom",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1131",
            "name": "Palampur",
            "slug": "palampur",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Nature & Wildlife",
            "description": "Tea capital of North India with sprawling tea gardens and Dhauladhar backdrop",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1132",
            "name": "Bir Billing",
            "slug": "bir-billing",
            "state": "Himachal Pradesh",
            "city": "Kangra & Dharamshala",
            "category": "Nature & Wildlife",
            "description": "Paragliding capital of India & World Cup venue with Tibetan monasteries",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Spiti & Lahaul",
        "icon": "🏔️",
        "places": [
          {
            "id": "ind-1133",
            "name": "Spiti Valley",
            "slug": "spiti-valley",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Nature & Wildlife",
            "description": "Cold mountain desert valley filled with ancient monasteries and high passes",
            "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1134",
            "name": "Kaza",
            "slug": "kaza",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Nature & Wildlife",
            "description": "Sub-divisional headquarters of Spiti Valley along Spiti River",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1135",
            "name": "Key Monastery",
            "slug": "key-monastery",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Pilgrimage & Temples",
            "description": "1,000-year-old fortress-like Tibetan Buddhist monastery perched on a hill",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1136",
            "name": "Chandratal Lake",
            "slug": "chandratal-lake",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Nature & Wildlife",
            "description": "Crescent-shaped high-altitude Moon Lake in Lahaul Spiti at 4,300m",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1137",
            "name": "Tabo",
            "slug": "tabo",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Heritage & Forts",
            "description": "UNESCO Ajanta of the Himalayas — 996 CE mud monastery with murals",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1138",
            "name": "Dhankar",
            "slug": "dhankar",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Heritage & Forts",
            "description": "Cliffside monastery and fort overlooking the confluence of Spiti & Pin rivers",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1139",
            "name": "Pin Valley",
            "slug": "pin-valley",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Nature & Wildlife",
            "description": "National park home to snow leopards, ibex and Buchen lama tradition",
            "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1140",
            "name": "Kibber",
            "slug": "kibber",
            "state": "Himachal Pradesh",
            "city": "Spiti & Lahaul",
            "category": "Nature & Wildlife",
            "description": "Highest inhabited village connected by motorable road at 4,270m",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Karnataka",
    "flag": "🇮🇳",
    "regions": [
      {
        "city": "Bengaluru & Around",
        "icon": "🏙️",
        "places": [
          {
            "id": "ind-1141",
            "name": "Bengaluru",
            "slug": "bengaluru",
            "state": "Karnataka",
            "city": "Bengaluru & Around",
            "category": "Modern & Cultural",
            "description": "Silicon Valley of India — vibrant garden city & tech capital",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1142",
            "name": "Bangalore Palace",
            "slug": "bangalore-palace",
            "state": "Karnataka",
            "city": "Bengaluru & Around",
            "category": "Heritage & Forts",
            "description": "Tudor-style royal palace inspired by Windsor Castle built by Wodeyars",
            "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1143",
            "name": "Lalbagh Botanical Garden",
            "slug": "lalbagh-botanical-garden",
            "state": "Karnataka",
            "city": "Bengaluru & Around",
            "category": "Nature & Wildlife",
            "description": "240-acre botanical garden with glass house built by Hyder Ali & Tipu Sultan",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1144",
            "name": "Cubbon Park",
            "slug": "cubbon-park",
            "state": "Karnataka",
            "city": "Bengaluru & Around",
            "category": "Nature & Wildlife",
            "description": "300-acre green lung park in central Bangalore housing Bamboo groves & Bandstand",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1145",
            "name": "Vidhana Soudha",
            "slug": "vidhana-soudha",
            "state": "Karnataka",
            "city": "Bengaluru & Around",
            "category": "Heritage & Forts",
            "description": "Neo-Dravidian granite legislative assembly building illuminated at night",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1146",
            "name": "Nandi Hills",
            "slug": "nandi-hills",
            "state": "Karnataka",
            "city": "Bengaluru & Around",
            "category": "Nature & Wildlife",
            "description": "Ancient hill fortress famous for sunrise viewpoints, Tipu's Drop and temples",
            "imageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1147",
            "name": "Bannerghatta National Park",
            "slug": "bannerghatta-national-park",
            "state": "Karnataka",
            "city": "Bengaluru & Around",
            "category": "Nature & Wildlife",
            "description": "Biological park featuring tiger safari, lion safari & butterfly park",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Heritage Karnataka",
        "icon": "🏛️",
        "places": [
          {
            "id": "ind-1148",
            "name": "Hampi",
            "slug": "hampi",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage Site — sprawling boulder landscape of Vijayanagara Empire ruins",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1149",
            "name": "Mysuru",
            "slug": "mysuru",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Modern & Cultural",
            "description": "Royal city of palaces, silk sarees, sandalwood, and grand Dussehra celebrations",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1150",
            "name": "Mysore Palace",
            "slug": "mysore-palace",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "Indo-Saracenic masterpiece palace illuminated with 100,000 light bulbs",
            "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1151",
            "name": "Srirangapatna",
            "slug": "srirangapatna",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "Island fortress capital of Tipu Sultan on Kaveri river",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1152",
            "name": "Badami",
            "slug": "badami",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "6th-century Chalukya rock-cut cave temples carved into red sandstone cliffs",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1153",
            "name": "Aihole",
            "slug": "aihole",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "Cradle of Indian temple architecture featuring 120 stone temples",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1154",
            "name": "Pattadakal",
            "slug": "pattadakal",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage complex of Chalukya temples on Malaprabha river",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1155",
            "name": "Belur",
            "slug": "belur",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "12th-century Chennakeshava Hoysala temple with intricate stone sculptures",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1156",
            "name": "Halebidu",
            "slug": "halebidu",
            "state": "Karnataka",
            "city": "Heritage Karnataka",
            "category": "Heritage & Forts",
            "description": "Hoysaleswara temple complex showcasing master artisan soapstone carvings",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Coastal Karnataka",
        "icon": "🏖️",
        "places": [
          {
            "id": "ind-1157",
            "name": "Mangaluru",
            "slug": "mangaluru",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Beaches & Coast",
            "description": "Coastal port city known for pristine beaches, temples, and Mangalorean cuisine",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1158",
            "name": "Udupi",
            "slug": "udupi",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Pilgrimage & Temples",
            "description": "Temple town famous for Krishna Temple, Mattu Gulla and Udupi cuisine",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1159",
            "name": "Gokarna",
            "slug": "gokarna",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Beaches & Coast",
            "description": "Holy temple town and pristine beach haven (Om Beach, Kudle Beach)",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1160",
            "name": "Murudeshwar",
            "slug": "murudeshwar",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Pilgrimage & Temples",
            "description": "Colossal 123-ft Shiva statue and 20-storey Gopuram by the Arabian Sea",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1161",
            "name": "Karwar",
            "slug": "karwar",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Beaches & Coast",
            "description": "Picturesque port city with Kali River estuary, Rabindranath Tagore beach & seafood",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1162",
            "name": "Maravanthe",
            "slug": "maravanthe",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Beaches & Coast",
            "description": "Scenic Highway stretch with Arabian Sea on one side and Souparnika River on the other",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1163",
            "name": "St. Mary's Island",
            "slug": "st-mary-s-island",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Beaches & Coast",
            "description": "Geological monument of unique hexagonal basaltic rock formations",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1164",
            "name": "Malpe Beach",
            "slug": "malpe-beach",
            "state": "Karnataka",
            "city": "Coastal Karnataka",
            "category": "Beaches & Coast",
            "description": "Popular beach near Udupi featuring sea walk, water sports & boat rides",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Hill Stations & Nature",
        "icon": "🌿",
        "places": [
          {
            "id": "ind-1165",
            "name": "Coorg / Madikeri",
            "slug": "coorg-madikeri",
            "state": "Karnataka",
            "city": "Hill Stations & Nature",
            "category": "Nature & Wildlife",
            "description": "Scotland of India — coffee plantation hills, misty waterfalls & Kodava culture",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1166",
            "name": "Chikmagalur",
            "slug": "chikmagalur",
            "state": "Karnataka",
            "city": "Hill Stations & Nature",
            "category": "Nature & Wildlife",
            "description": "Coffee birthplace of India featuring Mullayanagiri peak & Baba Budangiri",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1167",
            "name": "Sakleshpur",
            "slug": "sakleshpur",
            "state": "Karnataka",
            "city": "Hill Stations & Nature",
            "category": "Nature & Wildlife",
            "description": "Lush Western Ghats hill station famous for star-shaped Manjarabad Fort & treks",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1168",
            "name": "Agumbe",
            "slug": "agumbe",
            "state": "Karnataka",
            "city": "Hill Stations & Nature",
            "category": "Nature & Wildlife",
            "description": "Cherrapunji of the South — rainforest biodiversity center & King Cobra capital",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1169",
            "name": "Kudremukh",
            "slug": "kudremukh",
            "state": "Karnataka",
            "city": "Hill Stations & Nature",
            "category": "Nature & Wildlife",
            "description": "Horse-face shaped peak inside Kudremukh National Park rainforest",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1170",
            "name": "Jog Falls",
            "slug": "jog-falls",
            "state": "Karnataka",
            "city": "Hill Stations & Nature",
            "category": "Nature & Wildlife",
            "description": "253-meter 2nd highest plunge waterfall in India created by Sharavathi River",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Kerala",
    "flag": "🌴",
    "regions": [
      {
        "city": "Kochi & Central",
        "icon": "🌿",
        "places": [
          {
            "id": "ind-1171",
            "name": "Kochi",
            "slug": "kochi",
            "state": "Kerala",
            "city": "Kochi & Central",
            "category": "Modern & Cultural",
            "description": "Queen of the Arabian Sea — historic port city blending Portuguese, Dutch & British heritage",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1172",
            "name": "Fort Kochi",
            "slug": "fort-kochi",
            "state": "Kerala",
            "city": "Kochi & Central",
            "category": "Heritage & Forts",
            "description": "Colonial beach quarter filled with heritage bungalows, art cafes & spice markets",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1173",
            "name": "Mattancherry",
            "slug": "mattancherry",
            "state": "Kerala",
            "city": "Kochi & Central",
            "category": "Heritage & Forts",
            "description": "Historic Jew Town area housing Paradesi Synagogue and Dutch Palace",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1174",
            "name": "Chinese Fishing Nets",
            "slug": "chinese-fishing-nets",
            "state": "Kerala",
            "city": "Kochi & Central",
            "category": "Beaches & Coast",
            "description": "Iconic cantilevered fishing structures operating along Fort Kochi waterfront",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1175",
            "name": "Marine Drive",
            "slug": "marine-drive",
            "state": "Kerala",
            "city": "Kochi & Central",
            "category": "Modern & Cultural",
            "description": "Popular promenade in Ernakulam overlooking backwaters & rainbow bridge",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1176",
            "name": "Athirappilly Waterfalls",
            "slug": "athirappilly-waterfalls",
            "state": "Kerala",
            "city": "Kochi & Central",
            "category": "Nature & Wildlife",
            "description": "Niagara of India — 80-feet wide roaring waterfall in Sholayar forest",
            "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Hill Stations",
        "icon": "🏔️",
        "places": [
          {
            "id": "ind-1177",
            "name": "Munnar",
            "slug": "munnar",
            "state": "Kerala",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Idyllic hill station with rolling tea gardens, Anamudi peak & Neelakurinji blooms",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1178",
            "name": "Thekkady",
            "slug": "thekkady",
            "state": "Kerala",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Sprawling spice plantation hill center adjacent to Periyar Tiger Reserve lake",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1179",
            "name": "Wayanad",
            "slug": "wayanad",
            "state": "Kerala",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Green paradise hill district with Edakkal Caves, Banasura Dam & tea hills",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1180",
            "name": "Vagamon",
            "slug": "vagamon",
            "state": "Kerala",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Pine forests, tea estates, green meadows and misty valleys",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1181",
            "name": "Ponmudi",
            "slug": "ponmudi",
            "state": "Kerala",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Golden Peak hill station near Thiruvananthapuram with winding hairpin roads",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1182",
            "name": "Vythiri",
            "slug": "vythiri",
            "state": "Kerala",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Lush rainforest resort hamlet in Wayanad with treehouses & streams",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Backwaters",
        "icon": "🛶",
        "places": [
          {
            "id": "ind-1183",
            "name": "Alleppey / Alappuzha",
            "slug": "alleppey-alappuzha",
            "state": "Kerala",
            "city": "Backwaters",
            "category": "Beaches & Coast",
            "description": "Venice of the East — world famous network of tranquil canals, lagoons & houseboats",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1184",
            "name": "Kumarakom",
            "slug": "kumarakom",
            "state": "Kerala",
            "city": "Backwaters",
            "category": "Nature & Wildlife",
            "description": "Vembanad Lake backwater sanctuary & bird haven",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1185",
            "name": "Kollam",
            "slug": "kollam",
            "state": "Kerala",
            "city": "Backwaters",
            "category": "Beaches & Coast",
            "description": "Gateway to backwaters on Ashtamudi Lake with historic cashew trade port",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1186",
            "name": "Ashtamudi Lake",
            "slug": "ashtamudi-lake",
            "state": "Kerala",
            "city": "Backwaters",
            "category": "Nature & Wildlife",
            "description": "8-armed palm-shaped backwater lake featuring scenic canoe & boat cruises",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1187",
            "name": "Kuttanad",
            "slug": "kuttanad",
            "state": "Kerala",
            "city": "Backwaters",
            "category": "Nature & Wildlife",
            "description": "Rice Bowl of Kerala — unique below-sea-level farming land",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1188",
            "name": "Houseboat Experiences",
            "slug": "houseboat-experiences",
            "state": "Kerala",
            "city": "Backwaters",
            "category": "Modern & Cultural",
            "description": "Kettuvalam luxury traditional boat stay cruising palm-fringed canals",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Beaches",
        "icon": "🏖️",
        "places": [
          {
            "id": "ind-1189",
            "name": "Kovalam",
            "slug": "kovalam",
            "state": "Kerala",
            "city": "Beaches",
            "category": "Beaches & Coast",
            "description": "Iconic crescent beach featuring red-and-white striped Lighthouse & surf waves",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1190",
            "name": "Varkala",
            "slug": "varkala",
            "state": "Kerala",
            "city": "Beaches",
            "category": "Beaches & Coast",
            "description": "Red cliffside beach overlooking the Arabian Sea with mineral springs & cafes",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1191",
            "name": "Marari",
            "slug": "marari",
            "state": "Kerala",
            "city": "Beaches",
            "category": "Beaches & Coast",
            "description": "Quiet coconut grove fishing village beach near Alleppey",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1192",
            "name": "Bekal",
            "slug": "bekal",
            "state": "Kerala",
            "city": "Beaches",
            "category": "Heritage & Forts",
            "description": "Giant keyhole-shaped seaside fort & pristine beach in Kasaragod",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1193",
            "name": "Cherai",
            "slug": "cherai",
            "state": "Kerala",
            "city": "Beaches",
            "category": "Beaches & Coast",
            "description": "Vypin island beach with calm shallow water and backwater confluence",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1194",
            "name": "Kannur",
            "slug": "kannur",
            "state": "Kerala",
            "city": "Beaches",
            "category": "Beaches & Coast",
            "description": "Drive-in beach (Muzhappilangad) and Theyyam ritual dance heritage coast",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Madhya Pradesh",
    "flag": "🇮🇳",
    "regions": [
      {
        "city": "Bhopal & Around",
        "icon": "🏙️",
        "places": [
          {
            "id": "ind-1195",
            "name": "Bhopal",
            "slug": "bhopal",
            "state": "Madhya Pradesh",
            "city": "Bhopal & Around",
            "category": "Modern & Cultural",
            "description": "City of Lakes — capital city blending heritage Nawabi mosques with modern lakes",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1196",
            "name": "Upper Lake",
            "slug": "upper-lake",
            "state": "Madhya Pradesh",
            "city": "Bhopal & Around",
            "category": "Nature & Wildlife",
            "description": "Oldest man-made lake in India (Bhojtal) offering boating and sunset views",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1197",
            "name": "Sanchi",
            "slug": "sanchi",
            "state": "Madhya Pradesh",
            "city": "Bhopal & Around",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage Site featuring Great Stupa built by Emperor Ashoka",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1198",
            "name": "Bhimbetka",
            "slug": "bhimbetka",
            "state": "Madhya Pradesh",
            "city": "Bhopal & Around",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage prehistoric rock shelters with 30,000-year-old paintings",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1199",
            "name": "Bhojpur Temple",
            "slug": "bhojpur-temple",
            "state": "Madhya Pradesh",
            "city": "Bhopal & Around",
            "category": "Heritage & Forts",
            "description": "Unfinished 11th-century temple housing world's largest monolithic Shiva Lingam",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1200",
            "name": "Udayagiri Caves",
            "slug": "udayagiri-caves",
            "state": "Madhya Pradesh",
            "city": "Bhopal & Around",
            "category": "Heritage & Forts",
            "description": "20 rock-cut Gupta-period cave sanctuaries with Varaha avatar relief",
            "imageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Khajuraho & Bundelkhand",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1201",
            "name": "Khajuraho",
            "slug": "khajuraho",
            "state": "Madhya Pradesh",
            "city": "Khajuraho & Bundelkhand",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage architectural marvel of Chandela Dynasty temples",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1202",
            "name": "Khajuraho Temples",
            "slug": "khajuraho-temples",
            "state": "Madhya Pradesh",
            "city": "Khajuraho & Bundelkhand",
            "category": "Heritage & Forts",
            "description": "Western & Eastern temple complex famous for erotic & spiritual stone carvings",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1203",
            "name": "Orchha",
            "slug": "orchha",
            "state": "Madhya Pradesh",
            "city": "Khajuraho & Bundelkhand",
            "category": "Heritage & Forts",
            "description": "Medieval palace town along Betwa River featuring Jahangir Mahal & cenotaphs",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1204",
            "name": "Orchha Fort",
            "slug": "orchha-fort",
            "state": "Madhya Pradesh",
            "city": "Khajuraho & Bundelkhand",
            "category": "Heritage & Forts",
            "description": "Grand fort complex housing Raja Mahal, Sheesh Mahal and light show",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1205",
            "name": "Ram Raja Temple",
            "slug": "ram-raja-temple",
            "state": "Madhya Pradesh",
            "city": "Khajuraho & Bundelkhand",
            "category": "Pilgrimage & Temples",
            "description": "Unique temple where Lord Rama is worshipped as a reigning King",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1206",
            "name": "Datia Palace",
            "slug": "datia-palace",
            "state": "Madhya Pradesh",
            "city": "Khajuraho & Bundelkhand",
            "category": "Heritage & Forts",
            "description": "7-storey 1614 Rajput architectural palace (Bir Singh Palace)",
            "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Wildlife",
        "icon": "🐯",
        "places": [
          {
            "id": "ind-1207",
            "name": "Kanha National Park",
            "slug": "kanha-national-park",
            "state": "Madhya Pradesh",
            "city": "Wildlife",
            "category": "Nature & Wildlife",
            "description": "Inspiration for Kipling's Jungle Book — prime tiger habitat & Hardground Barasingha",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1208",
            "name": "Bandhavgarh National Park",
            "slug": "bandhavgarh-national-park",
            "state": "Madhya Pradesh",
            "city": "Wildlife",
            "category": "Nature & Wildlife",
            "description": "Highest Bengal tiger density reserve with ancient Bandhavgarh fort hill",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1209",
            "name": "Pench National Park",
            "slug": "pench-national-park",
            "state": "Madhya Pradesh",
            "city": "Wildlife",
            "category": "Nature & Wildlife",
            "description": "Straddling MP & Maharashtra border, famous for tiger & leopard safaris",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1210",
            "name": "Satpura National Park",
            "slug": "satpura-national-park",
            "state": "Madhya Pradesh",
            "city": "Wildlife",
            "category": "Nature & Wildlife",
            "description": "Rugged sandstone terrain offering walking safaris, canoe trips & leopard sightings",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1211",
            "name": "Panna National Park",
            "slug": "panna-national-park",
            "state": "Madhya Pradesh",
            "city": "Wildlife",
            "category": "Nature & Wildlife",
            "description": "Tiger reserve along Ken River famous for gharials and Ken Boating",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1212",
            "name": "Madhav National Park",
            "slug": "madhav-national-park",
            "state": "Madhya Pradesh",
            "city": "Wildlife",
            "category": "Nature & Wildlife",
            "description": "Historic hunting reserve of Scindias with George Castle & Sakhya Sagar",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Spiritual & Other MP",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1213",
            "name": "Ujjain",
            "slug": "ujjain",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Pilgrimage & Temples",
            "description": "Ancient holy city on Shipra river, site of Kumbh Mela & Mahakaleshwar",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1214",
            "name": "Mahakaleshwar Jyotirlinga",
            "slug": "mahakaleshwar-jyotirlinga",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Pilgrimage & Temples",
            "description": "Sacred South-facing Shiva Jyotirlinga famous for early morning Bhasma Aarti",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1215",
            "name": "Omkareshwar",
            "slug": "omkareshwar",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Pilgrimage & Temples",
            "description": "Om-shaped island Jyotirlinga shrine on Narmada River",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1216",
            "name": "Maheshwar",
            "slug": "maheshwar",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Heritage & Forts",
            "description": "Holkar capital built by Ahilyabai Holkar on Narmada banks, famed for Maheshwari sarees",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1217",
            "name": "Indore",
            "slug": "indore",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Modern & Cultural",
            "description": "Cleanest city of India & street food capital (Sarafa Bazaar & Rajwada)",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1218",
            "name": "Mandu",
            "slug": "mandu",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Heritage & Forts",
            "description": "City of Joy — hilltop fortress featuring Jahaz Mahal, Roopmati Pavilion & Afghan architecture",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1219",
            "name": "Pachmarhi",
            "slug": "pachmarhi",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Nature & Wildlife",
            "description": "Queen of Satpura — hill station with Bee Falls, Pandav Caves & Dhoopgarh peak",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1220",
            "name": "Jabalpur Bhedaghat",
            "slug": "jabalpur-bhedaghat",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Nature & Wildlife",
            "description": "Colossal white Marble Rocks gorge on Narmada River & Dhuandhar Waterfalls",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1221",
            "name": "Gwalior Fort",
            "slug": "gwalior-fort",
            "state": "Madhya Pradesh",
            "city": "Spiritual & Other MP",
            "category": "Heritage & Forts",
            "description": "Pearl in the necklace of Indian forts, housing Man Singh Palace & Saas Bahu Temple",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Tamil Nadu",
    "flag": "🇮🇳",
    "regions": [
      {
        "city": "Chennai & Around",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1222",
            "name": "Chennai",
            "slug": "chennai",
            "state": "Tamil Nadu",
            "city": "Chennai & Around",
            "category": "Modern & Cultural",
            "description": "Cultural capital of South India, famous for Carnatic music, beaches & temples",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1223",
            "name": "Marina Beach",
            "slug": "marina-beach",
            "state": "Tamil Nadu",
            "city": "Chennai & Around",
            "category": "Beaches & Coast",
            "description": "World's 2nd longest natural urban beach along Coromandel Coast",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1224",
            "name": "Kapaleeshwarar Temple",
            "slug": "kapaleeshwarar-temple",
            "state": "Tamil Nadu",
            "city": "Chennai & Around",
            "category": "Pilgrimage & Temples",
            "description": "Dravidian architectural Shiva temple with colorful Gopuram in Mylapore",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1225",
            "name": "Fort St. George",
            "slug": "fort-st-george",
            "state": "Tamil Nadu",
            "city": "Chennai & Around",
            "category": "Heritage & Forts",
            "description": "First British fortress in India built in 1640 housing museum & St. Mary's Church",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1226",
            "name": "Mahabalipuram",
            "slug": "mahabalipuram",
            "state": "Tamil Nadu",
            "city": "Chennai & Around",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage Pallava rock-cut Shore Temple, Pancha Rathas & Reliefs",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1227",
            "name": "Shore Temple",
            "slug": "shore-temple",
            "state": "Tamil Nadu",
            "city": "Chennai & Around",
            "category": "Heritage & Forts",
            "description": "8th-century granite structural temple overlooking Bay of Bengal waves",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Temple Circuit",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1228",
            "name": "Madurai",
            "slug": "madurai",
            "state": "Tamil Nadu",
            "city": "Temple Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Lotus City of India dominated by colossal towers of Meenakshi Amman Temple",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1229",
            "name": "Meenakshi Amman Temple",
            "slug": "meenakshi-amman-temple",
            "state": "Tamil Nadu",
            "city": "Temple Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Architectural wonder featuring 14 soaring rainbow Gopurams and 1,000-pillar hall",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1230",
            "name": "Thanjavur",
            "slug": "thanjavur",
            "state": "Tamil Nadu",
            "city": "Temple Circuit",
            "category": "Heritage & Forts",
            "description": "Chola dynasty capital home to Brihadisvara Temple, Tanjore paintings & veena art",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1231",
            "name": "Brihadisvara Temple",
            "slug": "brihadisvara-temple",
            "state": "Tamil Nadu",
            "city": "Temple Circuit",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage Great Living Chola temple with 216-ft granite Vimana tower",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1232",
            "name": "Trichy",
            "slug": "trichy",
            "state": "Tamil Nadu",
            "city": "Temple Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Historic city featuring Rockfort Temple rising on an ancient 83-meter rock outcrop",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1233",
            "name": "Srirangam",
            "slug": "srirangam",
            "state": "Tamil Nadu",
            "city": "Temple Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Largest functioning Hindu temple complex in the world dedicated to Ranganatha",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1234",
            "name": "Rameswaram",
            "slug": "rameswaram",
            "state": "Tamil Nadu",
            "city": "Temple Circuit",
            "category": "Pilgrimage & Temples",
            "description": "Char Dham island pilgrimage site with Ramanathaswamy 1,200m carved pillared corridor",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Hill Stations",
        "icon": "🌴",
        "places": [
          {
            "id": "ind-1235",
            "name": "Ooty",
            "slug": "ooty",
            "state": "Tamil Nadu",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Queen of Hill Stations — Nilgiri mountain resort with tea gardens & UNESCO Toy Train",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1236",
            "name": "Coonoor",
            "slug": "coonoor",
            "state": "Tamil Nadu",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Picturesque Nilgiri hill station famous for Sim's Park & tea factories",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1237",
            "name": "Kodaikanal",
            "slug": "kodaikanal",
            "state": "Tamil Nadu",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Princess of Hill Stations — star-shaped lake, Pillar Rocks & pine forests",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1238",
            "name": "Yercaud",
            "slug": "yercaud",
            "state": "Tamil Nadu",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Jewel of the Shevaroy Hills with coffee estates & Yercaud Lake",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1239",
            "name": "Kotagiri",
            "slug": "kotagiri",
            "state": "Tamil Nadu",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Quiet Nilgiri hill village surrounded by tea estates & Catherine Falls",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1240",
            "name": "Valparai",
            "slug": "valparai",
            "state": "Tamil Nadu",
            "city": "Hill Stations",
            "category": "Nature & Wildlife",
            "description": "Anamalai hill station famous for tea estates, lion-tailed macaques & hornbills",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Uttar Pradesh",
    "flag": "🕌",
    "regions": [
      {
        "city": "Agra & Around",
        "icon": "🕌",
        "places": [
          {
            "id": "ind-1241",
            "name": "Agra",
            "slug": "agra",
            "state": "Uttar Pradesh",
            "city": "Agra & Around",
            "category": "Heritage & Forts",
            "description": "City of Taj — historic Mughal capital on Yamuna banks",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1242",
            "name": "Taj Mahal",
            "slug": "taj-mahal",
            "state": "Uttar Pradesh",
            "city": "Agra & Around",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage Site & 7th Wonder of World — white marble monument of love",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1243",
            "name": "Agra Fort",
            "slug": "agra-fort",
            "state": "Uttar Pradesh",
            "city": "Agra & Around",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage red sandstone imperial Mughal fortress of Shah Jahan",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1244",
            "name": "Fatehpur Sikri",
            "slug": "fatehpur-sikri",
            "state": "Uttar Pradesh",
            "city": "Agra & Around",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage red sandstone ghost city built by Emperor Akbar",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1245",
            "name": "Itmad-ud-Daulah Tomb",
            "slug": "itmad-ud-daulah-tomb",
            "state": "Uttar Pradesh",
            "city": "Agra & Around",
            "category": "Heritage & Forts",
            "description": "Baby Taj — delicate white marble mausoleum with pietra dura inlay",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1246",
            "name": "Mehtab Bagh",
            "slug": "mehtab-bagh",
            "state": "Uttar Pradesh",
            "city": "Agra & Around",
            "category": "Heritage & Forts",
            "description": "Moonlight charbagh garden offering iconic sunset views of Taj Mahal",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Varanasi & Ayodhya",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1247",
            "name": "Varanasi",
            "slug": "varanasi",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Pilgrimage & Temples",
            "description": "Spiritual capital of India — 3,000-year-old living city on holy Ganga",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1248",
            "name": "Kashi Vishwanath Temple",
            "slug": "kashi-vishwanath-temple",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Pilgrimage & Temples",
            "description": "Golden Temple of Lord Shiva along the newly constructed Kashi Vishwanath Corridor",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1249",
            "name": "Dashashwamedh Ghat",
            "slug": "dashashwamedh-ghat",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Pilgrimage & Temples",
            "description": "Main riverfront ghat famous for spectacular evening Ganga Aarti ceremony",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1250",
            "name": "Sarnath",
            "slug": "sarnath",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Heritage & Forts",
            "description": "Sacred site where Lord Buddha delivered his first sermon (Dharmachakra Pravartana)",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1251",
            "name": "Ayodhya",
            "slug": "ayodhya",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Pilgrimage & Temples",
            "description": "Sacred birthplace of Lord Rama along the holy Saryu River",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1252",
            "name": "Ram Mandir",
            "slug": "ram-mandir",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Pilgrimage & Temples",
            "description": "Grand traditional Nagara-style stone temple dedicated to Shri Ram Lalla",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1253",
            "name": "Mathura",
            "slug": "mathura",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Pilgrimage & Temples",
            "description": "Sacred birthplace of Lord Krishna on Yamuna riverbanks",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1254",
            "name": "Vrindavan",
            "slug": "vrindavan",
            "state": "Uttar Pradesh",
            "city": "Varanasi & Ayodhya",
            "category": "Pilgrimage & Temples",
            "description": "Holy town of 5,000 temples dedicated to Radha Krishna (Bankey Bihari & Prem Mandir)",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Lucknow & Heritage",
        "icon": "🏛️",
        "places": [
          {
            "id": "ind-1255",
            "name": "Lucknow",
            "slug": "lucknow",
            "state": "Uttar Pradesh",
            "city": "Lucknow & Heritage",
            "category": "Modern & Cultural",
            "description": "City of Nawabs — famed for Awadhi kebabs, Chikankari embroidery & architecture",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1256",
            "name": "Bara Imambara",
            "slug": "bara-imambara",
            "state": "Uttar Pradesh",
            "city": "Lucknow & Heritage",
            "category": "Heritage & Forts",
            "description": "Architectural marvel with unsupported arched hall and intricate Bhulbhulaiya maze",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1257",
            "name": "Chota Imambara",
            "slug": "chota-imambara",
            "state": "Uttar Pradesh",
            "city": "Lucknow & Heritage",
            "category": "Heritage & Forts",
            "description": "Palace of Lights adorned with Belgian chandeliers and golden domes",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1258",
            "name": "Rumi Darwaza",
            "slug": "rumi-darwaza",
            "state": "Uttar Pradesh",
            "city": "Lucknow & Heritage",
            "category": "Heritage & Forts",
            "description": "60-foot grand Turkish gateway monument of Awadhi architecture",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1259",
            "name": "Dudhwa National Park",
            "slug": "dudhwa-national-park",
            "state": "Uttar Pradesh",
            "city": "Lucknow & Heritage",
            "category": "Nature & Wildlife",
            "description": "Terai belt tiger reserve home to rhinos, tigers & swamp deer (Barasingha)",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Uttarakhand",
    "flag": "🏔️",
    "regions": [
      {
        "city": "Char Dham",
        "icon": "🛕",
        "places": [
          {
            "id": "ind-1260",
            "name": "Yamunotri",
            "slug": "yamunotri",
            "state": "Uttarakhand",
            "city": "Char Dham",
            "category": "Pilgrimage & Temples",
            "description": "Source of holy River Yamuna in Garhwal Himalayas with Surya Kund hot spring",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1261",
            "name": "Gangotri",
            "slug": "gangotri",
            "state": "Uttarakhand",
            "city": "Char Dham",
            "category": "Pilgrimage & Temples",
            "description": "Origin shrine of holy River Ganga (Bhagirathi) surrounded by snow peaks",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1262",
            "name": "Kedarnath",
            "slug": "kedarnath",
            "state": "Uttarakhand",
            "city": "Char Dham",
            "category": "Pilgrimage & Temples",
            "description": "Highest among 12 Jyotirlingas nestled at 3,583m below Kedarnath peak wall",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1263",
            "name": "Badrinath",
            "slug": "badrinath",
            "state": "Uttarakhand",
            "city": "Char Dham",
            "category": "Pilgrimage & Temples",
            "description": "Sacred Char Dham Lord Vishnu temple situated between Nar & Narayan peaks",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Garhwal",
        "icon": "🏔️",
        "places": [
          {
            "id": "ind-1264",
            "name": "Rishikesh",
            "slug": "rishikesh",
            "state": "Uttarakhand",
            "city": "Garhwal",
            "category": "Pilgrimage & Temples",
            "description": "Yoga Capital of World — Ganga rafting, Laxman Jhula & Parmarth Niketan Aarti",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1265",
            "name": "Haridwar",
            "slug": "haridwar",
            "state": "Uttarakhand",
            "city": "Garhwal",
            "category": "Pilgrimage & Temples",
            "description": "Gateway to Gods — Har Ki Pauri Ganga Aarti & Kumbh Mela site",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1266",
            "name": "Mussoorie",
            "slug": "mussoorie",
            "state": "Uttarakhand",
            "city": "Garhwal",
            "category": "Nature & Wildlife",
            "description": "Queen of Hills — Mall Road, Kempty Falls, Gun Hill & Doon Valley views",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1267",
            "name": "Dhanaulti",
            "slug": "dhanaulti",
            "state": "Uttarakhand",
            "city": "Garhwal",
            "category": "Nature & Wildlife",
            "description": "Quiet eco-park pine hill retreat near Mussoorie",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1268",
            "name": "Auli",
            "slug": "auli",
            "state": "Uttarakhand",
            "city": "Garhwal",
            "category": "Nature & Wildlife",
            "description": "Premier Himalayan skiing resort with cable car ride & views of Nanda Devi",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1269",
            "name": "Chopta",
            "slug": "chopta",
            "state": "Uttarakhand",
            "city": "Garhwal",
            "category": "Nature & Wildlife",
            "description": "Mini Switzerland of India — base camp for Tungnath (highest Shiva temple) & Chandrashila",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1270",
            "name": "Valley of Flowers",
            "slug": "valley-of-flowers",
            "state": "Uttarakhand",
            "city": "Garhwal",
            "category": "Nature & Wildlife",
            "description": "UNESCO World Heritage alpine flower valley with endemic flora & waterfalls",
            "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Kumaon & Wildlife",
        "icon": "🏞️",
        "places": [
          {
            "id": "ind-1271",
            "name": "Nainital",
            "slug": "nainital",
            "state": "Uttarakhand",
            "city": "Kumaon & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Lake District of India — Naini Lake yachting, Mall Road & Naina Peak",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1272",
            "name": "Ranikhet",
            "slug": "ranikhet",
            "state": "Uttarakhand",
            "city": "Kumaon & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Queen's Meadow — pine forests, Kumaon Regimental center & Himalayan views",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1273",
            "name": "Almora",
            "slug": "almora",
            "state": "Uttarakhand",
            "city": "Kumaon & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Cultural heart of Kumaon famous for Bal Mithai, Bright End Corner & Kasar Devi",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1274",
            "name": "Mukteshwar",
            "slug": "mukteshwar",
            "state": "Uttarakhand",
            "city": "Kumaon & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Scenic apple orchard ridge offering 180° views of Nanda Devi & Trishul",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1275",
            "name": "Kausani",
            "slug": "kausani",
            "state": "Uttarakhand",
            "city": "Kumaon & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Switzerland of India — panoramic 300km Himalayan snow peak views",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1276",
            "name": "Jim Corbett National Park",
            "slug": "jim-corbett-national-park",
            "state": "Uttarakhand",
            "city": "Kumaon & Wildlife",
            "category": "Nature & Wildlife",
            "description": "Oldest national park in India famous for Bengal Tigers & Ramganga River safaris",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "West Bengal",
    "flag": "🏙️",
    "regions": [
      {
        "city": "Kolkata & Around",
        "icon": "🏙️",
        "places": [
          {
            "id": "ind-1277",
            "name": "Kolkata",
            "slug": "kolkata",
            "state": "West Bengal",
            "city": "Kolkata & Around",
            "category": "Modern & Cultural",
            "description": "City of Joy — cultural capital famous for Durga Puja, Victoria Memorial & tramways",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1278",
            "name": "Victoria Memorial",
            "slug": "victoria-memorial",
            "state": "West Bengal",
            "city": "Kolkata & Around",
            "category": "Heritage & Forts",
            "description": "Grand white marble queen's palace museum set in 64 acres of gardens",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1279",
            "name": "Howrah Bridge",
            "slug": "howrah-bridge",
            "state": "West Bengal",
            "city": "Kolkata & Around",
            "category": "Heritage & Forts",
            "description": "Iconic cantilever steel bridge spanning Hooghly River",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1280",
            "name": "Indian Museum",
            "slug": "indian-museum",
            "state": "West Bengal",
            "city": "Kolkata & Around",
            "category": "Heritage & Forts",
            "description": "Oldest and largest multi-purpose museum in Asia (est. 1814)",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1281",
            "name": "Dakshineswar Kali Temple",
            "slug": "dakshineswar-kali-temple",
            "state": "West Bengal",
            "city": "Kolkata & Around",
            "category": "Pilgrimage & Temples",
            "description": "19th-century Navaratna temple associated with Sri Ramakrishna Paramahamsa",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1282",
            "name": "Kalighat Temple",
            "slug": "kalighat-temple",
            "state": "West Bengal",
            "city": "Kolkata & Around",
            "category": "Pilgrimage & Temples",
            "description": "Famous 51 Shakti Peeth temple dedicated to Goddess Kali on Adi Ganga",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Darjeeling Himalayas",
        "icon": "🏔️",
        "places": [
          {
            "id": "ind-1283",
            "name": "Darjeeling",
            "slug": "darjeeling",
            "state": "West Bengal",
            "city": "Darjeeling Himalayas",
            "category": "Nature & Wildlife",
            "description": "Queen of Hills — world famous Darjeeling tea, Kanchenjunga views & Toy Train",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1284",
            "name": "Tiger Hill",
            "slug": "tiger-hill",
            "state": "West Bengal",
            "city": "Darjeeling Himalayas",
            "category": "Nature & Wildlife",
            "description": "Famous sunrise point offering golden light view over Kanchenjunga & Mt. Everest",
            "imageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1285",
            "name": "Darjeeling Himalayan Railway",
            "slug": "darjeeling-himalayan-railway",
            "state": "West Bengal",
            "city": "Darjeeling Himalayas",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage narrow gauge steam toy train",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1286",
            "name": "Batasia Loop",
            "slug": "batasia-loop",
            "state": "West Bengal",
            "city": "Darjeeling Himalayas",
            "category": "Nature & Wildlife",
            "description": "Spiral railway loop with Gorkha War Memorial garden overlooking Kanchenjunga",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1287",
            "name": "Kalimpong",
            "slug": "kalimpong",
            "state": "West Bengal",
            "city": "Darjeeling Himalayas",
            "category": "Nature & Wildlife",
            "description": "Himalayan hill station famous for orchid nurseries & Zang Dhok Palri monastery",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1288",
            "name": "Sandakphu",
            "slug": "sandakphu",
            "state": "West Bengal",
            "city": "Darjeeling Himalayas",
            "category": "Nature & Wildlife",
            "description": "Highest peak in West Bengal at 3,636m offering views of Sleeping Buddha & Everest",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Sundarbans & Heritage",
        "icon": "🌿",
        "places": [
          {
            "id": "ind-1289",
            "name": "Sundarbans National Park",
            "slug": "sundarbans-national-park",
            "state": "West Bengal",
            "city": "Sundarbans & Heritage",
            "category": "Nature & Wildlife",
            "description": "UNESCO World Heritage mangrove forest biosphere reserve & Royal Bengal Tiger domain",
            "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1290",
            "name": "Bishnupur",
            "slug": "bishnupur",
            "state": "West Bengal",
            "city": "Sundarbans & Heritage",
            "category": "Heritage & Forts",
            "description": "Heritage terracotta temple city famous for Malla kingdom brick architecture & Baluchari sarees",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1291",
            "name": "Shantiniketan",
            "slug": "shantiniketan",
            "state": "West Bengal",
            "city": "Sundarbans & Heritage",
            "category": "Modern & Cultural",
            "description": "UNESCO World Heritage cultural town founded by Rabindranath Tagore (Visva-Bharati)",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1292",
            "name": "Murshidabad",
            "slug": "murshidabad",
            "state": "West Bengal",
            "city": "Sundarbans & Heritage",
            "category": "Heritage & Forts",
            "description": "Nawab capital along Hooghly river featuring Hazarduari Palace with 1,000 doors",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  },
  {
    "state": "Delhi & UTs",
    "flag": "🏛️",
    "regions": [
      {
        "city": "Delhi",
        "icon": "🏛️",
        "places": [
          {
            "id": "ind-1293",
            "name": "Red Fort",
            "slug": "red-fort",
            "state": "Delhi & UTs",
            "city": "Delhi",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage Mughal red sandstone fortress built by Shah Jahan",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1294",
            "name": "India Gate",
            "slug": "india-gate",
            "state": "Delhi & UTs",
            "city": "Delhi",
            "category": "Heritage & Forts",
            "description": "73m high war memorial arch honouring Indian soldiers, with Amar Jawan Jyoti",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1295",
            "name": "Qutub Minar",
            "slug": "qutub-minar",
            "state": "Delhi & UTs",
            "city": "Delhi",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage 73m red sandstone victory tower built in 1193 CE",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1296",
            "name": "Humayun's Tomb",
            "slug": "humayun-s-tomb",
            "state": "Delhi & UTs",
            "city": "Delhi",
            "category": "Heritage & Forts",
            "description": "UNESCO World Heritage Mughal garden tomb precursor to Taj Mahal",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1297",
            "name": "Lotus Temple",
            "slug": "lotus-temple",
            "state": "Delhi & UTs",
            "city": "Delhi",
            "category": "Modern & Cultural",
            "description": "Iconic lotus-shaped Bahá'í House of Worship with 27 marble petals",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1298",
            "name": "Akshardham Temple Delhi",
            "slug": "akshardham-temple-delhi",
            "state": "Delhi & UTs",
            "city": "Delhi",
            "category": "Pilgrimage & Temples",
            "description": "Colossal pink sandstone & marble temple showcasing Indian culture & light show",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1299",
            "name": "Gurudwara Bangla Sahib",
            "slug": "gurudwara-bangla-sahib",
            "state": "Delhi & UTs",
            "city": "Delhi",
            "category": "Pilgrimage & Temples",
            "description": "Prominent Sikh house of worship with golden dome & holy Sarovar lake",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Jammu & Kashmir",
        "icon": "🏔️",
        "places": [
          {
            "id": "ind-1300",
            "name": "Srinagar",
            "slug": "srinagar",
            "state": "Delhi & UTs",
            "city": "Jammu & Kashmir",
            "category": "Nature & Wildlife",
            "description": "Summer capital of J&K famous for Dal Lake, houseboats, Shikara & Mughal Gardens",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1301",
            "name": "Dal Lake",
            "slug": "dal-lake",
            "state": "Delhi & UTs",
            "city": "Jammu & Kashmir",
            "category": "Nature & Wildlife",
            "description": "Jewel in the crown of Kashmir — floating markets, Shikaras & wooden houseboats",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1302",
            "name": "Gulmarg",
            "slug": "gulmarg",
            "state": "Delhi & UTs",
            "city": "Jammu & Kashmir",
            "category": "Nature & Wildlife",
            "description": "Meadow of Flowers — premier ski resort & world's highest Gondola cable car",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1303",
            "name": "Pahalgam",
            "slug": "pahalgam",
            "state": "Delhi & UTs",
            "city": "Jammu & Kashmir",
            "category": "Nature & Wildlife",
            "description": "Valley of Shepherds — Betaab Valley, Aru Valley & Amarnath Yatra base",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1304",
            "name": "Sonamarg",
            "slug": "sonamarg",
            "state": "Delhi & UTs",
            "city": "Jammu & Kashmir",
            "category": "Nature & Wildlife",
            "description": "Meadow of Gold — Thajiwas Glacier treks & Sindh river rafting",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1305",
            "name": "Vaishno Devi",
            "slug": "vaishno-devi",
            "state": "Delhi & UTs",
            "city": "Jammu & Kashmir",
            "category": "Pilgrimage & Temples",
            "description": "Holy hilltop shrine of Goddess Vaishno Devi in Trikuta Mountains near Katra",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Ladakh",
        "icon": "🏔️",
        "places": [
          {
            "id": "ind-1306",
            "name": "Leh",
            "slug": "leh",
            "state": "Delhi & UTs",
            "city": "Ladakh",
            "category": "Heritage & Forts",
            "description": "High-altitude capital of Ladakh with 17th-century Leh Palace & Shanti Stupa",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1307",
            "name": "Pangong Lake",
            "slug": "pangong-lake",
            "state": "Delhi & UTs",
            "city": "Ladakh",
            "category": "Nature & Wildlife",
            "description": "Colossal 134km high-altitude turquoise lake changing colors with sunlight",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1308",
            "name": "Nubra Valley",
            "slug": "nubra-valley",
            "state": "Delhi & UTs",
            "city": "Ladakh",
            "category": "Nature & Wildlife",
            "description": "High cold desert famous for double-humped Bactrian camels & Hunder dunes",
            "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1309",
            "name": "Diskit Monastery",
            "slug": "diskit-monastery",
            "state": "Delhi & UTs",
            "city": "Ladakh",
            "category": "Pilgrimage & Temples",
            "description": "Oldest monastery in Nubra featuring 32m giant Maitreya Buddha statue",
            "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1310",
            "name": "Khardung La",
            "slug": "khardung-la",
            "state": "Delhi & UTs",
            "city": "Ladakh",
            "category": "Nature & Wildlife",
            "description": "Iconic high mountain pass at 5,359m elevation",
            "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      },
      {
        "city": "Puducherry & Andaman",
        "icon": "🌊",
        "places": [
          {
            "id": "ind-1311",
            "name": "Puducherry",
            "slug": "puducherry",
            "state": "Delhi & UTs",
            "city": "Puducherry & Andaman",
            "category": "Beaches & Coast",
            "description": "French Riviera of the East — cobblestone streets, mustard-yellow villas & beaches",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1312",
            "name": "Auroville",
            "slug": "auroville",
            "state": "Delhi & UTs",
            "city": "Puducherry & Andaman",
            "category": "Modern & Cultural",
            "description": "Experimental universal township featuring golden Matrimandir sphere",
            "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1313",
            "name": "Port Blair",
            "slug": "port-blair",
            "state": "Delhi & UTs",
            "city": "Puducherry & Andaman",
            "category": "Heritage & Forts",
            "description": "Capital of Andaman Islands famous for Cellular Jail national memorial",
            "imageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80"
          },
          {
            "id": "ind-1314",
            "name": "Havelock Island (Swaraj Dweep)",
            "slug": "havelock-island-swaraj-dweep",
            "state": "Delhi & UTs",
            "city": "Puducherry & Andaman",
            "category": "Beaches & Coast",
            "description": "World famous Radhanagar Beach, scuba diving & coral reefs",
            "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          }
        ]
      }
    ]
  }
];
