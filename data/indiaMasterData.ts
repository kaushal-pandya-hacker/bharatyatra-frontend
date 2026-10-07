// Automatically generated master dataset for all States & UTs in India

export interface DestinationItem {
  id?: string;
  name: string;
  slug: string;
  state: string;
  city?: string;
  district?: string;
  category: string;
  subCategory?: string;
  description: string;
  shortDescription?: string;
  primaryImageUrl: string;
  rating?: number;
  totalReviews?: number;
  recommendedDays?: number;
  estimatedBudget?: number;
  entryFee?: number;
  currency?: string;
  bestTimeToVisit?: string;
  isUNESCO?: boolean;
  isHeritage?: boolean;
  isReligious?: boolean;
  isWildlife?: boolean;
  isNature?: boolean;
  isAdventure?: boolean;
  isBeach?: boolean;
  isCulture?: boolean;
  permitRequired?: boolean;
  permitType?: string;
  aliases?: string[];
  isFeatured?: boolean;
}

export const MASTER_INDIA_DATA = {
  "version": "1.1.0",
  "generatedAt": "2026-09-19T05:51:20.260Z",
  "country": "India",
  "states": [
    {
      "name": "Andhra Pradesh",
      "slug": "andhra-pradesh",
      "code": "AP",
      "type": "STATE",
      "capital": "Amaravati",
      "description": "Known for Tirupati Balaji shrine, coastal beauty, Grand Canyon of India (Gandikota), Srisailam Jyotirlinga, and Araku Valley.",
      "latitude": 15.9129,
      "longitude": 79.74,
      "coverImage": "/state-images/Andhra_Pradesh/Andhra_Pradesh_Cover_Page.jpg",
      "cities": [
        {
          "name": "Tirupati",
          "slug": "tirupati"
        },
        {
          "name": "Visakhapatnam",
          "slug": "visakhapatnam"
        },
        {
          "name": "Vijayawada",
          "slug": "vijayawada"
        },
        {
          "name": "Gandikota",
          "slug": "gandikota"
        },
        {
          "name": "Lepakshi",
          "slug": "lepakshi"
        },
        {
          "name": "Srisailam",
          "slug": "srisailam"
        }
      ],
      "destinations": [
        {
          "name": "Tirupati & Tirumala Venkateswara Temple",
          "slug": "tirupati-venkateswara-temple",
          "city": "Tirupati",
          "category": "Spiritual",
          "subCategory": "Temple",
          "description": "World-famous sacred hilltop shrine dedicated to Lord Venkateswara Balaji atop Seshachalam Hills.",
          "shortDescription": "World-renowned sacred hilltop temple of Lord Venkateswara Balaji.",
          "latitude": 13.6833,
          "longitude": 79.35,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to March",
          "recommendedDays": 2,
          "entryFee": 300,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Tirupati Balaji",
            "Tirumala Temple"
          ]
        },
        {
          "name": "Srisailam Mallikarjuna Jyotirlinga",
          "slug": "srisailam-mallikarjuna-temple",
          "city": "Srisailam",
          "category": "Spiritual",
          "subCategory": "Jyotirlinga Temple",
          "description": "Sacred 12 Jyotirlinga and Shakti Peeth shrine perched on Nallamala hills along Krishna river.",
          "shortDescription": "Sacred Jyotirlinga and Shakti Peeth shrine on Nallamala hills.",
          "latitude": 16.0748,
          "longitude": 78.8687,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Srisailam Temple"
          ]
        },
        {
          "name": "Araku Valley & Borra Caves",
          "slug": "araku-valley",
          "city": "Visakhapatnam",
          "category": "Nature",
          "subCategory": "Hill Station & Caves",
          "description": "Scenic hill station in the Eastern Ghats famous for coffee plantations, tribal culture, and million-year-old Borra limestone caves.",
          "shortDescription": "Lush hill station with coffee plantations, waterfalls, and ancient caves.",
          "latitude": 18.3273,
          "longitude": 82.8775,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isNature": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Araku",
            "Vizag Hills"
          ]
        },
        {
          "name": "Gandikota Fort & Canyon",
          "slug": "gandikota-fort-canyon",
          "city": "Gandikota",
          "category": "Heritage",
          "subCategory": "Fort & Canyon",
          "description": "Known as the Grand Canyon of India, featuring a spectacular gorge cut through Erramala hills by Penna River.",
          "shortDescription": "The majestic Grand Canyon of India overlooking Penna River gorge.",
          "latitude": 14.8152,
          "longitude": 78.2862,
          "primaryImageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to February",
          "recommendedDays": 2,
          "isHeritage": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Grand Canyon of India"
          ]
        },
        {
          "name": "Lepakshi Veerabhadra Temple",
          "slug": "lepakshi-veerabhadra-temple",
          "city": "Lepakshi",
          "category": "Heritage",
          "subCategory": "Temple & Architecture",
          "description": "16th-century Vijayanagara architectural marvel famous for its hanging pillar, monolithic Nandi, and intricate stone carvings.",
          "shortDescription": "Vijayanagara era temple renowned for its hanging pillar and monolithic Nandi.",
          "latitude": 13.8018,
          "longitude": 77.6083,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isHeritage": true,
          "isReligious": true,
          "aliases": [
            "Lepakshi Temple"
          ]
        },
        {
          "name": "Rishikonda Beach (Visakhapatnam)",
          "slug": "rishikonda-beach",
          "city": "Visakhapatnam",
          "category": "Beach & Coastal",
          "subCategory": "Blue Flag Beach",
          "description": "Pristine Blue Flag certified beach along the Bay of Bengal ideal for surfing, watersports, and coastal leisure.",
          "shortDescription": "Blue Flag certified beach popular for watersports in Vizag.",
          "latitude": 17.7833,
          "longitude": 83.3833,
          "primaryImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isBeach": true,
          "isAdventure": true
        }
      ]
    },
    {
      "name": "Arunachal Pradesh",
      "slug": "arunachal-pradesh",
      "code": "AR",
      "type": "STATE",
      "capital": "Itanagar",
      "description": "Land of the Dawn-Lit Mountains, featuring Tawang Monastery, Sela Pass, Namdapha Tiger Reserve, and Ziro Valley.",
      "latitude": 28.218,
      "longitude": 94.7278,
      "coverImage": "/state-images/Arunachal_Pradesh/Arunachal_Pradesh_Cover_Page.png",
      "cities": [
        {
          "name": "Tawang",
          "slug": "tawang"
        },
        {
          "name": "Ziro",
          "slug": "ziro"
        },
        {
          "name": "Itanagar",
          "slug": "itanagar"
        },
        {
          "name": "Miao (Namdapha)",
          "slug": "miao"
        },
        {
          "name": "Pasighat",
          "slug": "pasighat"
        }
      ],
      "destinations": [
        {
          "name": "Tawang Monastery",
          "slug": "tawang-monastery",
          "city": "Tawang",
          "category": "Spiritual",
          "subCategory": "Monastery",
          "description": "India's largest Buddhist monastery standing at 10,000 feet in the Eastern Himalayas, founded in 1680.",
          "shortDescription": "India's largest Buddhist monastery perched high in the Himalayas.",
          "latitude": 27.586,
          "longitude": 91.8594,
          "primaryImageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "March to October",
          "recommendedDays": 3,
          "permitRequired": true,
          "permitType": "Inner Line Permit (ILP)",
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Galden Namgey Lhatse"
          ]
        },
        {
          "name": "Sela Pass & Sela Lake",
          "slug": "sela-pass-lake",
          "city": "Tawang",
          "category": "Nature",
          "subCategory": "Mountain Pass & Lake",
          "description": "Snow-covered high-altitude mountain pass and sacred lake at 13,700 feet on the highway to Tawang.",
          "shortDescription": "Breathtaking high-altitude Himalayan mountain pass and frozen lake.",
          "latitude": 27.5024,
          "longitude": 92.1039,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "March to November",
          "recommendedDays": 1,
          "permitRequired": true,
          "permitType": "ILP",
          "isNature": true,
          "isAdventure": true
        },
        {
          "name": "Ziro Valley & Apatani Heritage",
          "slug": "ziro-valley",
          "city": "Ziro",
          "category": "Culture",
          "subCategory": "Tribal Valley",
          "description": "Picturesque UNESCO tentative list valley home to the Apatani tribe known for sustainable paddy-fish farming and Ziro Music Festival.",
          "shortDescription": "Scenic pine valley famous for Apatani tribal culture and Ziro Music Festival.",
          "latitude": 27.5445,
          "longitude": 93.8197,
          "primaryImageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to November",
          "recommendedDays": 2,
          "permitRequired": true,
          "permitType": "ILP",
          "isCulture": true,
          "isNature": true,
          "isFeatured": true
        },
        {
          "name": "Namdapha National Park",
          "slug": "namdapha-national-park",
          "city": "Miao (Namdapha)",
          "category": "Wildlife",
          "subCategory": "National Park & Rainforest",
          "description": "Easternmost tiger reserve featuring dense biodiversity rainforests housing snow leopards, clouded leopards, tigers, and hoolock gibbons.",
          "shortDescription": "Vast biodiverse rainforest national park in Eastern Himalayas.",
          "latitude": 27.4916,
          "longitude": 96.3855,
          "primaryImageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to April",
          "recommendedDays": 3,
          "permitRequired": true,
          "permitType": "ILP",
          "isWildlife": true,
          "isNature": true,
          "isAdventure": true
        }
      ]
    },
    {
      "name": "Assam",
      "slug": "assam",
      "code": "AS",
      "type": "STATE",
      "capital": "Dispur",
      "description": "Gateway to the North East, famous for Kaziranga rhinos, Kamakhya Temple, Brahmaputra river island Majuli, and tea gardens.",
      "latitude": 26.2006,
      "longitude": 92.9376,
      "coverImage": "/state-images/Assam/Assam_Cover_Pag.jpg",
      "cities": [
        {
          "name": "Guwahati",
          "slug": "guwahati"
        },
        {
          "name": "Kohora (Kaziranga)",
          "slug": "kaziranga"
        },
        {
          "name": "Garmur (Majuli)",
          "slug": "majuli"
        },
        {
          "name": "Sivasagar",
          "slug": "sivasagar"
        },
        {
          "name": "Jorhat",
          "slug": "jorhat"
        }
      ],
      "destinations": [
        {
          "name": "Kaziranga National Park",
          "slug": "kaziranga-national-park",
          "city": "Kohora (Kaziranga)",
          "category": "Wildlife",
          "subCategory": "National Park",
          "description": "UNESCO World Heritage sanctuary protecting two-thirds of the world's great one-horned rhinoceroses and wild water buffaloes.",
          "shortDescription": "UNESCO World Heritage home of the great one-horned rhinoceros.",
          "latitude": 26.5775,
          "longitude": 93.1711,
          "primaryImageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "November to April",
          "recommendedDays": 2,
          "entryFee": 250,
          "isUNESCO": true,
          "isWildlife": true,
          "isNature": true,
          "isFeatured": true,
          "aliases": [
            "Kaziranga Rhino Sanctuary"
          ]
        },
        {
          "name": "Kamakhya Temple",
          "slug": "kamakhya-temple",
          "city": "Guwahati",
          "category": "Spiritual",
          "subCategory": "Shakti Peeth Temple",
          "description": "Ancient 51 Shakti Peeth shrine atop Nilachal Hill overlooking Brahmaputra River, famous for Ambubachi Mela festival.",
          "shortDescription": "Sacred ancient Shakti Peeth shrine on Nilachal Hill in Guwahati.",
          "latitude": 26.1664,
          "longitude": 91.7061,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to April",
          "recommendedDays": 1,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Kamakhya Devi"
          ]
        },
        {
          "name": "Majuli Island",
          "slug": "majuli-island",
          "city": "Garmur (Majuli)",
          "category": "Culture",
          "subCategory": "River Island & Neo-Vaishnavite Satras",
          "description": "World's largest inhabited river island on the Brahmaputra River, famous for Neo-Vaishnavite Satras and traditional mask making.",
          "shortDescription": "World's largest river island rich in Neo-Vaishnavite art & culture.",
          "latitude": 26.95,
          "longitude": 94.1667,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isCulture": true,
          "isNature": true,
          "isReligious": true
        },
        {
          "name": "Sivasagar Ahom Monuments",
          "slug": "sivasagar-ahom-monuments",
          "city": "Sivasagar",
          "category": "Heritage",
          "subCategory": "Historical Palaces & Amphitheatre",
          "description": "Historical capital of the 600-year Ahom Kingdom featuring Rang Ghar, Talatal Ghar, and massive man-made tanks.",
          "shortDescription": "600-year Ahom royal palaces, amphitheatre, and temples.",
          "latitude": 26.9833,
          "longitude": 94.6333,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isHeritage": true
        }
      ]
    },
    {
      "name": "Bihar",
      "slug": "bihar",
      "code": "BR",
      "type": "STATE",
      "capital": "Patna",
      "description": "Land of Enlightenment, featuring Bodh Gaya Mahabodhi Temple, Nalanda University ruins, Rajgir, and Vaishali.",
      "latitude": 25.0961,
      "longitude": 85.3131,
      "coverImage": "/state-images/Bihar/Bihar_Cover_Page.png",
      "cities": [
        {
          "name": "Bodh Gaya",
          "slug": "bodh-gaya"
        },
        {
          "name": "Rajgir",
          "slug": "rajgir"
        },
        {
          "name": "Nalanda",
          "slug": "nalanda"
        },
        {
          "name": "Patna",
          "slug": "patna"
        },
        {
          "name": "Vaishali",
          "slug": "vaishali"
        }
      ],
      "destinations": [
        {
          "name": "Mahabodhi Temple Complex",
          "slug": "mahabodhi-temple-bodh-gaya",
          "city": "Bodh Gaya",
          "category": "Spiritual",
          "subCategory": "Buddhist World Shrine",
          "description": "UNESCO World Heritage sacred site marking Lord Buddha's enlightenment under the Bodhi Tree in 528 BCE.",
          "shortDescription": "UNESCO sacred site of Lord Buddha's enlightenment under the Bodhi Tree.",
          "latitude": 24.696,
          "longitude": 84.9914,
          "primaryImageUrl": "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isUNESCO": true,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Bodh Gaya Temple",
            "Bodhi Tree"
          ]
        },
        {
          "name": "Nalanda University Ruins",
          "slug": "nalanda-university-ruins",
          "city": "Nalanda",
          "category": "Heritage",
          "subCategory": "Archaeological Site",
          "description": "5th-century UNESCO World Heritage ruins of the ancient international monastic university that taught 10,000 students from Asia.",
          "shortDescription": "5th-century UNESCO ruins of the ancient international university.",
          "latitude": 25.1357,
          "longitude": 85.4439,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isUNESCO": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Nalanda Mahavihara"
          ]
        },
        {
          "name": "Vishwa Shanti Stupa & Rajgir Ropeway",
          "slug": "rajgir-vishwa-shanti-stupa",
          "city": "Rajgir",
          "category": "Spiritual",
          "subCategory": "Peace Pagoda & Springs",
          "description": "Sacred white World Peace Pagoda atop Ratnagiri Hill reached by aerial ropeway, plus ancient hot springs of Rajgir.",
          "shortDescription": "White World Peace Pagoda atop Ratnagiri Hill with hot springs.",
          "latitude": 25.03,
          "longitude": 85.42,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isNature": true
        }
      ]
    },
    {
      "name": "Chhattisgarh",
      "slug": "chhattisgarh",
      "code": "CG",
      "type": "STATE",
      "capital": "Raipur",
      "description": "Heartland of waterfalls, featuring Chitrakote Falls (Niagara of India), Sirpur heritage complex, and Kanger Valley National Park.",
      "latitude": 21.2787,
      "longitude": 81.8661,
      "coverImage": "/state-images/Chhattisgarh/Chhattisgarh_Cover_Page.jpg",
      "cities": [
        {
          "name": "Jagdalpur (Bastar)",
          "slug": "jagdalpur"
        },
        {
          "name": "Sirpur",
          "slug": "sirpur"
        },
        {
          "name": "Raipur",
          "slug": "raipur"
        },
        {
          "name": "Dantewada",
          "slug": "dantewada"
        }
      ],
      "destinations": [
        {
          "name": "Chitrakote Falls",
          "slug": "chitrakote-falls",
          "city": "Jagdalpur (Bastar)",
          "category": "Nature",
          "subCategory": "Waterfall",
          "description": "Widest horseshoe waterfall in India, dubbed the Niagara of India on the Indravati River in Bastar.",
          "shortDescription": "The majestic Niagara of India on Indravati River in Bastar.",
          "latitude": 19.2,
          "longitude": 81.7,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "July to February",
          "recommendedDays": 2,
          "isNature": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Niagara of India"
          ]
        },
        {
          "name": "Sirpur Group of Monuments",
          "slug": "sirpur-monuments",
          "city": "Sirpur",
          "category": "Heritage",
          "subCategory": "Brick Temple Complex",
          "description": "7th-century archaeological complex along Mahanadi featuring Lakshmana brick temple, Buddhist monasteries, and Jain stupas.",
          "shortDescription": "7th-century brick temple and Buddhist archaeological ruins.",
          "latitude": 21.3411,
          "longitude": 82.175,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isHeritage": true,
          "isReligious": true
        },
        {
          "name": "Danteshwari Temple (Dantewada)",
          "slug": "danteshwari-temple",
          "city": "Dantewada",
          "category": "Spiritual",
          "subCategory": "Shakti Peeth Temple",
          "description": "Ancient 52 Shakti Peeth temple dedicated to Goddess Danteshwari, venerated by Bastar tribes for 600 years.",
          "shortDescription": "Sacred 600-year Shakti Peeth shrine in tribal Bastar region.",
          "latitude": 18.9,
          "longitude": 81.35,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isCulture": true
        }
      ]
    },
    {
      "name": "Goa",
      "slug": "goa",
      "code": "GA",
      "type": "STATE",
      "capital": "Panaji",
      "description": "India's premier sun, sand, and heritage destination with golden beaches, UNESCO churches of Old Goa, and Dudhsagar Falls.",
      "latitude": 15.2993,
      "longitude": 74.124,
      "coverImage": "/state-images/Goa/Goa_Cover_Page.jpg",
      "cities": [
        {
          "name": "Panaji",
          "slug": "panaji"
        },
        {
          "name": "Calangute & Baga",
          "slug": "baga-calangute"
        },
        {
          "name": "Palolem & Canacona",
          "slug": "palolem"
        },
        {
          "name": "Old Goa",
          "slug": "old-goa"
        },
        {
          "name": "Colva",
          "slug": "colva"
        }
      ],
      "destinations": [
        {
          "name": "Baga & Calangute Beach",
          "slug": "baga-calangute-beach",
          "city": "Calangute & Baga",
          "category": "Beach & Coastal",
          "subCategory": "Beach & Watersports",
          "description": "North Goa's premier beach stretch offering shacks, parasailing, jet skis, and vibrant nightlife.",
          "shortDescription": "North Goa's most famous beach for watersports and nightlife.",
          "latitude": 15.5553,
          "longitude": 73.7517,
          "primaryImageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "November to February",
          "recommendedDays": 2,
          "isBeach": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Baga Beach",
            "Calangute Beach"
          ]
        },
        {
          "name": "Basilica of Bom Jesus & Old Goa",
          "slug": "basilica-of-bom-jesus-old-goa",
          "city": "Old Goa",
          "category": "Heritage",
          "subCategory": "UNESCO Cathedral",
          "description": "16th-century UNESCO World Heritage baroque basilica housing the sacred preserved relics of St. Francis Xavier.",
          "shortDescription": "16th-century UNESCO baroque basilica holding St. Francis Xavier's relics.",
          "latitude": 15.5008,
          "longitude": 73.9116,
          "primaryImageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Bom Jesus Basilica",
            "Old Goa Churches"
          ]
        },
        {
          "name": "Palolem & Agonda Beach",
          "slug": "palolem-agonda-beach",
          "city": "Palolem & Canacona",
          "category": "Beach & Coastal",
          "subCategory": "Crescent Beach",
          "description": "South Goa's serene crescent beach surrounded by coconut palms, calm waters, and dolphin spotting cruises.",
          "shortDescription": "Picturesque crescent bay in South Goa famous for calm waters and sunsets.",
          "latitude": 15.01,
          "longitude": 74.02,
          "primaryImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "November to March",
          "recommendedDays": 2,
          "isBeach": true,
          "isNature": true
        },
        {
          "name": "Dudhsagar Waterfalls",
          "slug": "dudhsagar-waterfalls",
          "city": "Panaji",
          "category": "Nature",
          "subCategory": "Tiered Waterfall",
          "description": "Four-tiered 310-meter mountain waterfall on the Mandovi River along the Bhagwan Mahaveer Sanctuary forest railway route.",
          "shortDescription": "Four-tiered 310m milky white mountain waterfall in Western Ghats.",
          "latitude": 15.3144,
          "longitude": 74.3144,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to May",
          "recommendedDays": 1,
          "isNature": true,
          "isAdventure": true
        },
        {
          "name": "Shanta Durga & Mangueshi Temples",
          "slug": "shanta-durga-mangueshi-temples",
          "city": "Ponda",
          "category": "Spiritual",
          "subCategory": "Temple",
          "description": "Historic 18th-century Goan Hindu temples with unique Indo-Portuguese architectural styles and tall Deepastambhas.",
          "shortDescription": "Historic 18th-century Goan temples blending Hindu & Portuguese styles.",
          "latitude": 15.4,
          "longitude": 73.98,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isHeritage": true
        }
      ]
    },
    {
      "name": "Gujarat",
      "slug": "gujarat",
      "code": "GJ",
      "type": "STATE",
      "capital": "Gandhinagar",
      "description": "Land of legends, home to 12th Jyotirlinga Somnath, ancient Dwarka kingdom, Statue of Unity, Asiatic Lions, and White Rann of Kutch.",
      "latitude": 22.2587,
      "longitude": 71.1924,
      "coverImage": "/state-images/Gujarat/Gujrat_Cover_Page.jpg",
      "cities": [
        {
          "name": "Ahmedabad",
          "slug": "ahmedabad"
        },
        {
          "name": "Gandhinagar",
          "slug": "gandhinagar"
        },
        {
          "name": "Kutch",
          "slug": "kutch"
        },
        {
          "name": "Gir Somnath",
          "slug": "gir-somnath"
        },
        {
          "name": "Devbhumi Dwarka",
          "slug": "devbhumi-dwarka"
        },
        {
          "name": "Junagadh",
          "slug": "junagadh"
        },
        {
          "name": "Surat",
          "slug": "surat"
        },
        {
          "name": "Vadodara",
          "slug": "vadodara"
        },
        {
          "name": "Narmada",
          "slug": "narmada"
        },
        {
          "name": "Banaskantha",
          "slug": "banaskantha"
        },
        {
          "name": "Patan",
          "slug": "patan"
        },
        {
          "name": "Mehsana",
          "slug": "mehsana"
        },
        {
          "name": "Sabarkantha",
          "slug": "sabarkantha"
        },
        {
          "name": "Aravalli",
          "slug": "aravalli"
        },
        {
          "name": "Dang",
          "slug": "dang"
        },
        {
          "name": "Navsari",
          "slug": "navsari"
        },
        {
          "name": "Bharuch",
          "slug": "bharuch"
        },
        {
          "name": "Panchmahal",
          "slug": "panchmahal"
        },
        {
          "name": "Rajkot",
          "slug": "rajkot"
        }
      ],
      "destinations": [
        {
          "name": "Sabarmati Ashram",
          "slug": "sabarmati-ashram-ahmedabad",
          "city": "Ahmedabad",
          "category": "Heritage",
          "subCategory": "Ashram & Museum",
          "description": "Historic headquarters of Mahatma Gandhi's freedom movement on Sabarmati River.",
          "shortDescription": "Mahatma Gandhi's iconic freedom movement ashram and museum.",
          "latitude": 23.0605,
          "longitude": 72.5807,
          "primaryImageUrl": "/landmarks/sabarmati-ashram.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Gandhi Ashram",
            "Sabarmati Ashram"
          ]
        },
        {
          "name": "Sabarmati Riverfront",
          "slug": "sabarmati-riverfront-ahmedabad",
          "city": "Ahmedabad",
          "category": "Culture",
          "subCategory": "Riverfront Promenade",
          "description": "World-class urban promenade with parks, walkways, flower gardens, and boating.",
          "shortDescription": "Modern riverside urban promenade with boating and parks.",
          "latitude": 23.03,
          "longitude": 72.57,
          "primaryImageUrl": "/landmarks/sabarmati-riverfront.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isCulture": true,
          "isFeatured": true
        },
        {
          "name": "Kankaria Lake",
          "slug": "kankaria-lake-ahmedabad",
          "city": "Ahmedabad",
          "category": "Culture",
          "subCategory": "Lake & Theme Park",
          "description": "Centuries-old circular lake featuring Nagina Wadi island, zoo, balloon ride, and toy train.",
          "shortDescription": "Vibrant circular lake with Nagina Wadi, zoo, and train ride.",
          "latitude": 23.0064,
          "longitude": 72.6014,
          "primaryImageUrl": "/landmarks/kankaria-lake.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 20,
          "isCulture": true,
          "isNature": true
        },
        {
          "name": "Adalaj Stepwell",
          "slug": "adalaj-stepwell-ahmedabad",
          "city": "Ahmedabad",
          "category": "Heritage",
          "subCategory": "Stepwell Architecture",
          "description": "15th-century intricate 5-storey Solanki-style sandstone stepwell (Vav).",
          "shortDescription": "15th-century Solanki style sandstone subterranean stepwell.",
          "latitude": 23.1667,
          "longitude": 72.58,
          "primaryImageUrl": "/landmarks/adalaj-stepwell-real.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Adalaj Ni Vav"
          ]
        },
        {
          "name": "Sidi Saiyyed Mosque",
          "slug": "sidi-saiyyed-mosque-ahmedabad",
          "city": "Ahmedabad",
          "category": "Heritage",
          "subCategory": "Mosque & Jali",
          "description": "Famous 16th-century mosque renowned for its delicate stone Tree of Life jali.",
          "shortDescription": "Iconic 16th-century mosque with delicate Tree of Life stone jalis.",
          "latitude": 23.0267,
          "longitude": 72.581,
          "primaryImageUrl": "/landmarks/jama-masjid-ahmedabad.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true,
          "isReligious": true
        },
        {
          "name": "Science City",
          "slug": "science-city-ahmedabad",
          "city": "Ahmedabad",
          "category": "Culture",
          "subCategory": "Science & Aquarium",
          "description": "Immersive robotics gallery, aquatic gallery, IMAX, and science exhibits.",
          "shortDescription": "High-tech science park with aquatic gallery and robotics gallery.",
          "latitude": 23.0769,
          "longitude": 72.4975,
          "primaryImageUrl": "/landmarks/science-city-ahmedabad.jpg",
          "bestTimeToVisit": "All Year",
          "recommendedDays": 1,
          "entryFee": 50,
          "isCulture": true
        },
        {
          "name": "Atal Bridge",
          "slug": "atal-bridge-ahmedabad",
          "city": "Ahmedabad",
          "category": "Culture",
          "subCategory": "Pedestrian Bridge",
          "description": "Iconic pedestrian glass-floor bridge across Sabarmati River inspired by kites.",
          "shortDescription": "Stunning kite-inspired pedestrian glass bridge over Sabarmati.",
          "latitude": 23.025,
          "longitude": 72.571,
          "primaryImageUrl": "/landmarks/atal-bridge-riverfront.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 30,
          "isCulture": true
        },
        {
          "name": "Akshardham Temple",
          "slug": "akshardham-temple-gandhinagar",
          "city": "Gandhinagar",
          "category": "Spiritual",
          "subCategory": "Temple Complex",
          "description": "Grand pink sandstone complex dedicated to Swaminarayan with water light show.",
          "shortDescription": "Grand Swaminarayan sandstone temple complex with Sat-Chit-Anand water show.",
          "latitude": 23.2289,
          "longitude": 72.6743,
          "primaryImageUrl": "/landmarks/akshardham-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true
        },
        {
          "name": "Indroda Nature Park",
          "slug": "indroda-nature-park-gandhinagar",
          "city": "Gandhinagar",
          "category": "Wildlife",
          "subCategory": "Dinosaur & Fossil Park",
          "description": "India's Jurassic Park featuring fossilized dinosaur eggs and nature trail.",
          "shortDescription": "India's premier dinosaur fossil park and botanical zoo.",
          "latitude": 23.2,
          "longitude": 72.65,
          "primaryImageUrl": "/landmarks/punit-van-gandhinagar.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 30,
          "isWildlife": true,
          "isNature": true
        },
        {
          "name": "Adalaj Stepwell (Gandhinagar Circuit)",
          "slug": "adalaj-stepwell-gandhinagar",
          "city": "Gandhinagar",
          "category": "Heritage",
          "subCategory": "Stepwell",
          "description": "15th-century heritage stepwell located at the border of Gandhinagar.",
          "shortDescription": "Intricate Solanki stepwell bordering Gandhinagar.",
          "latitude": 23.1667,
          "longitude": 72.58,
          "primaryImageUrl": "/landmarks/adalaj-stepwell-real.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Sarita Udyan",
          "slug": "sarita-udyan-gandhinagar",
          "city": "Gandhinagar",
          "category": "Nature",
          "subCategory": "Riverside Park",
          "description": "Lush riverside botanical park along Sabarmati River with grand entrance arch.",
          "shortDescription": "Lush botanical park along Sabarmati River in Gandhinagar.",
          "latitude": 23.215,
          "longitude": 72.66,
          "primaryImageUrl": "/landmarks/sarita-udyan.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isNature": true
        },
        {
          "name": "Dandi Kutir",
          "slug": "dandi-kutir-gandhinagar",
          "city": "Gandhinagar",
          "category": "Heritage",
          "subCategory": "Museum",
          "description": "World's largest salt-mound museum dedicated to Mahatma Gandhi's life.",
          "shortDescription": "World's largest salt-mound museum celebrating Mahatma Gandhi.",
          "latitude": 23.22,
          "longitude": 72.64,
          "primaryImageUrl": "/landmarks/dandi-kutir.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 10,
          "isHeritage": true,
          "isCulture": true
        },
        {
          "name": "Rann of Kutch (White Desert)",
          "slug": "rann-of-kutch-white-desert",
          "city": "Kutch",
          "category": "Nature",
          "subCategory": "Salt Desert",
          "description": "World's largest white salt desert famous for full-moon magic and Rann Utsav.",
          "shortDescription": "Endless white salt desert world-famous for full-moon Rann Utsav.",
          "latitude": 23.7844,
          "longitude": 69.8597,
          "primaryImageUrl": "/bhuj-kutch-bg.jpg",
          "bestTimeToVisit": "November to February",
          "recommendedDays": 3,
          "entryFee": 100,
          "permitRequired": true,
          "permitType": "White Rann BSF Entry Permit",
          "isNature": true,
          "isFeatured": true,
          "aliases": [
            "White Rann",
            "Rann Utsav Dhordo"
          ]
        },
        {
          "name": "Kala Dungar",
          "slug": "kala-dungar-kutch",
          "city": "Kutch",
          "category": "Nature",
          "subCategory": "Black Hill",
          "description": "Highest point in Kutch offering 360° panoramic views of the Great Rann and Dattatreya Temple.",
          "shortDescription": "Highest peak in Kutch with panoramic views of Great Rann.",
          "latitude": 23.9213,
          "longitude": 69.8166,
          "primaryImageUrl": "/landmarks/kala-dungar.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isNature": true,
          "isAdventure": true
        },
        {
          "name": "Mandvi Beach",
          "slug": "mandvi-beach-kutch",
          "city": "Kutch",
          "category": "Beach & Coastal",
          "subCategory": "Beach",
          "description": "Pristine golden beach with wind turbines, camel rides, and water sports.",
          "shortDescription": "Golden sand beach with windmills and sunset camel rides.",
          "latitude": 22.8256,
          "longitude": 69.3497,
          "primaryImageUrl": "/places/mandvi-beach.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isBeach": true,
          "isFeatured": true
        },
        {
          "name": "Vijay Vilas Palace",
          "slug": "vijay-vilas-palace-kutch",
          "city": "Kutch",
          "category": "Heritage",
          "subCategory": "Palace",
          "description": "Royal Rajput sea palace carved in red sandstone at Mandvi.",
          "shortDescription": "Royal red sandstone palace on Mandvi coastline.",
          "latitude": 22.8333,
          "longitude": 69.35,
          "primaryImageUrl": "/places/vijay-vilas-palace.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 70,
          "isHeritage": true
        },
        {
          "name": "Dholavira Harappan Metropolis",
          "slug": "dholavira-harappan-metropolis",
          "city": "Kutch",
          "category": "Heritage",
          "subCategory": "Harappan Ruins",
          "description": "UNESCO World Heritage Indus Valley Harappan metropolis dating back 4,500 years.",
          "shortDescription": "UNESCO World Heritage ancient Indus Valley metropolis.",
          "latitude": 23.8863,
          "longitude": 70.2177,
          "primaryImageUrl": "/places/dholavira.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 0,
          "isHeritage": true,
          "isUNESCO": true,
          "isFeatured": true
        },
        {
          "name": "Bhujodi Craft Village",
          "slug": "bhujodi-handicraft-village",
          "city": "Kutch",
          "category": "Culture",
          "subCategory": "Craft Village",
          "description": "World-famous handicraft weaving village of Kutchi artisans.",
          "shortDescription": "Renowned Kutchi artisan weaving and handicraft hamlet.",
          "latitude": 23.2333,
          "longitude": 69.7333,
          "primaryImageUrl": "/landmarks/bhujodi-craft-village.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isCulture": true
        },
        {
          "name": "Aina Mahal",
          "slug": "aina-mahal-bhuj",
          "city": "Kutch",
          "category": "Heritage",
          "subCategory": "Palace",
          "description": "18th-century Hall of Mirrors palace built by Ram Singh Malam.",
          "shortDescription": "18th-century palace of mirrors and Venetian glass chandeliers.",
          "latitude": 23.2546,
          "longitude": 69.6672,
          "primaryImageUrl": "/places/aina-mahal.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 20,
          "isHeritage": true
        },
        {
          "name": "Prag Mahal",
          "slug": "prag-mahal-bhuj",
          "city": "Kutch",
          "category": "Heritage",
          "subCategory": "Palace",
          "description": "Gothic-revival sandstone palace with 45-meter clock tower.",
          "shortDescription": "Gothic sandstone palace with 45-meter bell tower.",
          "latitude": 23.255,
          "longitude": 69.6675,
          "primaryImageUrl": "/places/prag-mahal.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 40,
          "isHeritage": true
        },
        {
          "name": "Kutch Museum",
          "slug": "kutch-museum-bhuj",
          "city": "Kutch",
          "category": "Heritage",
          "subCategory": "Museum",
          "description": "Oldest museum in Gujarat (est. 1877) displaying ancient tribal artifacts.",
          "shortDescription": "Gujarat's oldest museum with ancient Kutchi artifacts.",
          "latitude": 23.25,
          "longitude": 69.67,
          "primaryImageUrl": "/places/kutch-museum.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 10,
          "isHeritage": true
        },
        {
          "name": "Narayan Sarovar",
          "slug": "narayan-sarovar-kutch",
          "city": "Kutch",
          "category": "Spiritual",
          "subCategory": "Sacred Lake",
          "description": "One of Hinduism's 5 sacred holy lakes on the western border.",
          "shortDescription": "One of Hinduism's 5 sacred holy lakes on Arabian Sea border.",
          "latitude": 23.676,
          "longitude": 68.536,
          "primaryImageUrl": "/landmarks/narayan-sarovar.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Koteshwar Temple",
          "slug": "koteshwar-temple-kutch",
          "city": "Kutch",
          "category": "Spiritual",
          "subCategory": "Shiva Temple",
          "description": "Ancient coastal Lord Shiva temple overlooking the Arabian Sea.",
          "shortDescription": "Ancient Lord Shiva coastal shrine at India's western tip.",
          "latitude": 23.689,
          "longitude": 68.528,
          "primaryImageUrl": "/landmarks/koteshwar-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Mata No Madh",
          "slug": "mata-no-madh-kutch",
          "city": "Kutch",
          "category": "Spiritual",
          "subCategory": "Shrine",
          "description": "Historic 1200-year-old shrine of Ashapura Mata, patron deity of Kutch.",
          "shortDescription": "Revered 1200-year-old Ashapura Mata pilgrimage shrine.",
          "latitude": 23.541,
          "longitude": 68.96,
          "primaryImageUrl": "/landmarks/mata-no-madh.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Somnath Temple",
          "slug": "somnath-temple",
          "city": "Gir Somnath",
          "category": "Spiritual",
          "subCategory": "Jyotirlinga Temple",
          "description": "First among the 12 sacred Shiva Jyotirlingas on the ocean coast.",
          "shortDescription": "First among 12 holy Shiva Jyotirlingas on Arabian Sea shore.",
          "latitude": 20.888,
          "longitude": 70.401,
          "primaryImageUrl": "/landmarks/somnath-temple-real.png",
          "bestTimeToVisit": "September to March",
          "recommendedDays": 2,
          "entryFee": 0,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Prabhas Patan",
            "Somnath Jyotirlinga"
          ]
        },
        {
          "name": "Somnath Beach",
          "slug": "somnath-beach",
          "city": "Gir Somnath",
          "category": "Beach & Coastal",
          "subCategory": "Coastal Walk",
          "description": "Scenic coastal promenade with sea breeze and sunset views.",
          "shortDescription": "Coastal oceanfront promenade adjacent to Somnath Temple.",
          "latitude": 20.885,
          "longitude": 70.4,
          "primaryImageUrl": "/landmarks/somnath-beach.png",
          "bestTimeToVisit": "September to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isBeach": true
        },
        {
          "name": "Bhalka Tirth",
          "slug": "bhalka-tirth-somnath",
          "city": "Gir Somnath",
          "category": "Spiritual",
          "subCategory": "Shrine",
          "description": "Sacred spot where Lord Krishna concluded his earthly journey.",
          "shortDescription": "Sacred shrine where Lord Krishna concluded his earthly avatar.",
          "latitude": 20.903,
          "longitude": 70.383,
          "primaryImageUrl": "/places/bhalka-tirth.jpg",
          "bestTimeToVisit": "September to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Triveni Sangam",
          "slug": "triveni-sangam-somnath",
          "city": "Gir Somnath",
          "category": "Spiritual",
          "subCategory": "River Confluence",
          "description": "Holy confluence of Hiran, Kapila, and Saraswati rivers into the sea.",
          "shortDescription": "Sacred confluence of three holy rivers entering the Arabian Sea.",
          "latitude": 20.895,
          "longitude": 70.408,
          "primaryImageUrl": "/landmarks/triveni-sangam-somnath.png",
          "bestTimeToVisit": "September to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Gir National Park",
          "slug": "gir-national-park",
          "city": "Gir Somnath",
          "category": "Wildlife",
          "subCategory": "National Park",
          "description": "Exclusive global sanctuary of the wild Asiatic Lion.",
          "shortDescription": "Sole natural sanctuary of wild Asiatic Lions on earth.",
          "latitude": 21.1243,
          "longitude": 70.8242,
          "primaryImageUrl": "/places/sasan-gir-wildlife-sanctuary.jpg",
          "bestTimeToVisit": "December to March",
          "recommendedDays": 2,
          "entryFee": 1000,
          "permitRequired": true,
          "permitType": "Gir Jungle Safari Permit",
          "isWildlife": true,
          "isFeatured": true,
          "aliases": [
            "Sasan Gir",
            "Gir Lion Sanctuary"
          ]
        },
        {
          "name": "Devalia Safari Park",
          "slug": "devalia-safari-park-gir",
          "city": "Gir Somnath",
          "category": "Wildlife",
          "subCategory": "Interpretation Zone",
          "description": "Gir interpretation zone for guaranteed lion and leopard sightings.",
          "shortDescription": "Gir lion interpretation zone with bus and jeep safaris.",
          "latitude": 21.15,
          "longitude": 70.78,
          "primaryImageUrl": "/places/sasan-gir-safari.webp",
          "bestTimeToVisit": "October to May",
          "recommendedDays": 1,
          "entryFee": 200,
          "isWildlife": true
        },
        {
          "name": "Dwarkadhish Temple",
          "slug": "dwarkadhish-temple-dwarka",
          "city": "Devbhumi Dwarka",
          "category": "Spiritual",
          "subCategory": "Char Dham Temple",
          "description": "Char Dham Jagat Mandir spire towering over Gomti Ghat.",
          "shortDescription": "Sacred 16th-century Char Dham temple of Lord Krishna.",
          "latitude": 22.2378,
          "longitude": 68.9676,
          "primaryImageUrl": "/places/dwarkadhish-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 0,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Jagat Mandir",
            "Dwarka Temple"
          ]
        },
        {
          "name": "Dwarka Beach",
          "slug": "dwarka-beach",
          "city": "Devbhumi Dwarka",
          "category": "Beach & Coastal",
          "subCategory": "Beach",
          "description": "Coastal promenade near Bhadkeshwar Mahadev sunset shrine.",
          "shortDescription": "Pristine coast near Bhadkeshwar Mahadev sea shrine.",
          "latitude": 22.24,
          "longitude": 68.96,
          "primaryImageUrl": "/landmarks/dwarka-beach.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isBeach": true
        },
        {
          "name": "Bet Dwarka Island",
          "slug": "bet-dwarka-island",
          "city": "Devbhumi Dwarka",
          "category": "Spiritual",
          "subCategory": "Island Shrine",
          "description": "Island residence of Lord Krishna accessed by scenic ferry across the Gulf of Kutch.",
          "shortDescription": "Sacred island residence of Lord Krishna via boat ferry.",
          "latitude": 22.44,
          "longitude": 69.11,
          "primaryImageUrl": "/places/bet-dwarka.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 30,
          "isReligious": true,
          "isBeach": true,
          "isFeatured": true,
          "aliases": [
            "Beyt Dwarka",
            "Bet Dwarka"
          ]
        },
        {
          "name": "Nageshwar Jyotirlinga",
          "slug": "nageshwar-jyotirlinga-dwarka",
          "city": "Devbhumi Dwarka",
          "category": "Spiritual",
          "subCategory": "Jyotirlinga Temple",
          "description": "One of the 12 sacred Jyotirlingas featuring a colossal 85-ft Shiva statue.",
          "shortDescription": "Sacred Shiva Jyotirlinga featuring colossal 85-ft statue.",
          "latitude": 22.3333,
          "longitude": 69.0833,
          "primaryImageUrl": "/places/nageshwar-jyotirlinga.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true,
          "isFeatured": true
        },
        {
          "name": "Shivrajpur Beach",
          "slug": "shivrajpur-beach-dwarka",
          "city": "Devbhumi Dwarka",
          "category": "Beach & Coastal",
          "subCategory": "Blue Flag Beach",
          "description": "Blue Flag certified clear-water beach with scuba diving & dolphins.",
          "shortDescription": "Pristine Blue Flag certified beach for scuba diving & dolphins.",
          "latitude": 22.33,
          "longitude": 68.95,
          "primaryImageUrl": "/landmarks/shivrajpur-beach-real.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 30,
          "isBeach": true,
          "isAdventure": true,
          "isFeatured": true
        },
        {
          "name": "Rukmini Temple",
          "slug": "rukmini-temple-dwarka",
          "city": "Devbhumi Dwarka",
          "category": "Spiritual",
          "subCategory": "Temple",
          "description": "12th-century stone temple dedicated to Lord Krishna's consort.",
          "shortDescription": "12th-century stone temple of Devi Rukmini.",
          "latitude": 22.26,
          "longitude": 68.97,
          "primaryImageUrl": "/landmarks/rukmini-temple-dwarka.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true,
          "isHeritage": true
        },
        {
          "name": "Girnar Hill",
          "slug": "girnar-hill-junagadh",
          "city": "Junagadh",
          "category": "Spiritual",
          "subCategory": "Sacred Mountain",
          "description": "Sacred 9,999-step mountain peak with ropeway to Dattatreya & Jain temples.",
          "shortDescription": "Sacred mountain peak with Asia's longest ropeway & Jain temples.",
          "latitude": 21.5273,
          "longitude": 70.5312,
          "primaryImageUrl": "/places/girnar-hill.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 0,
          "isReligious": true,
          "isAdventure": true,
          "isFeatured": true
        },
        {
          "name": "Uparkot Fort",
          "slug": "uparkot-fort-junagadh",
          "city": "Junagadh",
          "category": "Heritage",
          "subCategory": "Fort",
          "description": "2,300-year-old citadel with Adi Kadi Vav stepwell & Buddhist caves.",
          "shortDescription": "Ancient 2,300-year-old Mauryan citadel with stepwells & cannons.",
          "latitude": 21.52,
          "longitude": 70.47,
          "primaryImageUrl": "/landmarks/uparkot-fort-junagadh.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isHeritage": true
        },
        {
          "name": "Mahabat Maqbara",
          "slug": "mahabat-maqbara-junagadh",
          "city": "Junagadh",
          "category": "Heritage",
          "subCategory": "Mausoleum",
          "description": "Gothic-Indo-Islamic mausoleum with spiral minarets.",
          "shortDescription": "Striking Indo-Islamic mausoleum with unique spiral minarets.",
          "latitude": 21.523,
          "longitude": 70.457,
          "primaryImageUrl": "/landmarks/mahabat-maqbara.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Junagadh Buddhist Caves",
          "slug": "junagadh-buddhist-caves",
          "city": "Junagadh",
          "category": "Heritage",
          "subCategory": "Rock-cut Caves",
          "description": "Rock-cut Buddhist monastic chambers dating back to Emperor Ashoka.",
          "shortDescription": "Ancient rock-cut Buddhist monastic chambers.",
          "latitude": 21.522,
          "longitude": 70.468,
          "primaryImageUrl": "/landmarks/junagadh-buddhist-caves.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 25,
          "isHeritage": true
        },
        {
          "name": "Sakkarbaug Zoo",
          "slug": "sakkarbaug-zoo-junagadh",
          "city": "Junagadh",
          "category": "Wildlife",
          "subCategory": "Zoo",
          "description": "India's 2nd oldest zoo specializing in breeding Asiatic lions.",
          "shortDescription": "Historic zoo specializing in Asiatic lion breeding.",
          "latitude": 21.53,
          "longitude": 70.46,
          "primaryImageUrl": "/landmarks/sakkarbaug-zoo.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 30,
          "isWildlife": true
        },
        {
          "name": "Damodar Kund",
          "slug": "damodar-kund-junagadh",
          "city": "Junagadh",
          "category": "Spiritual",
          "subCategory": "Sacred Tank",
          "description": "Holy bathing ghat at the foot of Girnar sacred to Poet Narsinh Mehta.",
          "shortDescription": "Sacred bathing ghat at the base of Girnar Mountain.",
          "latitude": 21.525,
          "longitude": 70.485,
          "primaryImageUrl": "/landmarks/damodar-kund-junagadh.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Dumas Beach",
          "slug": "dumas-beach-surat",
          "city": "Surat",
          "category": "Beach & Coastal",
          "subCategory": "Black Sand Beach",
          "description": "Black-sand urban beach famous for local street food and sunsets.",
          "shortDescription": "Urban black-sand beach famous for street food.",
          "latitude": 21.085,
          "longitude": 72.715,
          "primaryImageUrl": "/landmarks/dumas-beach-surat.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isBeach": true
        },
        {
          "name": "Suvali Beach",
          "slug": "suvali-beach-surat",
          "city": "Surat",
          "category": "Beach & Coastal",
          "subCategory": "Beach",
          "description": "Quiet coastal stretch historic for the 1612 Battle of Swally.",
          "shortDescription": "Historic quiet beach site of 1612 naval battle.",
          "latitude": 21.16,
          "longitude": 72.63,
          "primaryImageUrl": "/landmarks/suvali-beach-surat.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isBeach": true
        },
        {
          "name": "Dutch Garden",
          "slug": "dutch-garden-surat",
          "city": "Surat",
          "category": "Heritage",
          "subCategory": "Colonial Cemetery",
          "description": "Colonial 17th-century European cemetery and manicured park.",
          "shortDescription": "17th-century European colonial mausoleums & garden.",
          "latitude": 21.198,
          "longitude": 72.815,
          "primaryImageUrl": "/landmarks/dutch-garden-surat.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Surat Castle",
          "slug": "surat-castle",
          "city": "Surat",
          "category": "Heritage",
          "subCategory": "Fortress",
          "description": "16th-century fortress on Tapi river built by Khudawand Khan.",
          "shortDescription": "16th-century riverfront fortress on Tapi River.",
          "latitude": 21.196,
          "longitude": 72.814,
          "primaryImageUrl": "/landmarks/surat-castle.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 20,
          "isHeritage": true
        },
        {
          "name": "Sarthana Nature Park",
          "slug": "sarthana-nature-park-surat",
          "city": "Surat",
          "category": "Wildlife",
          "subCategory": "Zoo & Park",
          "description": "Zoo and botanical park on the banks of the Tapi River.",
          "shortDescription": "Lush riverside nature park and zoo in Surat.",
          "latitude": 21.23,
          "longitude": 72.91,
          "primaryImageUrl": "/landmarks/sarthana-nature-park.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 30,
          "isWildlife": true
        },
        {
          "name": "Gopi Talav",
          "slug": "gopi-talav-surat",
          "city": "Surat",
          "category": "Culture",
          "subCategory": "Urban Lake",
          "description": "Historic urban lake and recreation garden in central Surat.",
          "shortDescription": "Restored historic urban lake and recreational park.",
          "latitude": 21.19,
          "longitude": 72.83,
          "primaryImageUrl": "/landmarks/gopi-talav-surat.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 20,
          "isCulture": true
        },
        {
          "name": "Laxmi Vilas Palace",
          "slug": "laxmi-vilas-palace-vadodara",
          "city": "Vadodara",
          "category": "Heritage",
          "subCategory": "Royal Palace",
          "description": "4x size of Buckingham Palace, grand Indo-Saracenic home of Gaekwads.",
          "shortDescription": "Colossal Indo-Saracenic royal residence of Gaekwads.",
          "latitude": 22.2936,
          "longitude": 73.1914,
          "primaryImageUrl": "/landmarks/laxmi-vilas-palace.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 250,
          "isHeritage": true,
          "isFeatured": true
        },
        {
          "name": "Sayaji Garden",
          "slug": "sayaji-garden-vadodara",
          "city": "Vadodara",
          "category": "Nature",
          "subCategory": "Royal Park",
          "description": "113-acre royal park with toy train, planetarium, and zoo.",
          "shortDescription": "113-acre royal park with toy train and planetarium.",
          "latitude": 22.31,
          "longitude": 73.18,
          "primaryImageUrl": "/landmarks/sayaji-garden.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isNature": true
        },
        {
          "name": "Baroda Museum",
          "slug": "baroda-museum-vadodara",
          "city": "Vadodara",
          "category": "Heritage",
          "subCategory": "Museum",
          "description": "Famous for blue whale skeleton, Egyptian mummy, and European art.",
          "shortDescription": "Royal museum housing Egyptian mummy & blue whale skeleton.",
          "latitude": 22.312,
          "longitude": 73.182,
          "primaryImageUrl": "/landmarks/baroda-museum.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 10,
          "isHeritage": true
        },
        {
          "name": "Kirti Mandir",
          "slug": "kirti-mandir-vadodara",
          "city": "Vadodara",
          "category": "Heritage",
          "subCategory": "Cenotaph",
          "description": "Royal cenotaph complex of the Gaekwad dynasty.",
          "shortDescription": "Royal cenotaph complex of the Gaekwad rulers.",
          "latitude": 22.3,
          "longitude": 73.2,
          "primaryImageUrl": "/landmarks/kirti-mandir-vadodara.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "EME Temple",
          "slug": "eme-temple-vadodara",
          "city": "Vadodara",
          "category": "Spiritual",
          "subCategory": "Aluminum Temple",
          "description": "Unique aluminum-clad geodesic dome temple maintained by Indian Army.",
          "shortDescription": "Unique aluminum-clad geodesic temple run by Indian Army.",
          "latitude": 22.33,
          "longitude": 73.19,
          "primaryImageUrl": "/landmarks/eme-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Sursagar Lake",
          "slug": "sursagar-lake-vadodara",
          "city": "Vadodara",
          "category": "Culture",
          "subCategory": "Lake & Statue",
          "description": "Historic lake featuring a 111-ft tall standing Lord Shiva statue.",
          "shortDescription": "Historic lake with towering 111-ft Lord Shiva statue.",
          "latitude": 22.3,
          "longitude": 73.205,
          "primaryImageUrl": "/landmarks/sursagar-lake.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isCulture": true,
          "isReligious": true
        },
        {
          "name": "Statue of Unity",
          "slug": "statue-of-unity",
          "city": "Narmada",
          "category": "Culture",
          "subCategory": "World Monument",
          "description": "World's tallest 182m statue of Sardar Patel in Ekta Nagar.",
          "shortDescription": "World's tallest monument (182m) with 153m viewing gallery.",
          "latitude": 21.838,
          "longitude": 73.7191,
          "primaryImageUrl": "/landmarks/statue-of-unity.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 380,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Ekta Nagar",
            "Kevadia Statue"
          ]
        },
        {
          "name": "Valley of Flowers",
          "slug": "valley-of-flowers-narmada",
          "city": "Narmada",
          "category": "Nature",
          "subCategory": "Botanical Garden",
          "description": "17-kilometer colorful botanical trail along Narmada Dam.",
          "shortDescription": "17-km vibrant floral garden trail at Narmada Dam.",
          "latitude": 21.83,
          "longitude": 73.72,
          "primaryImageUrl": "/landmarks/valley-of-flowers.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isNature": true
        },
        {
          "name": "Ekta Nagar Eco-Tourism",
          "slug": "ekta-nagar-kevadiya",
          "city": "Narmada",
          "category": "Culture",
          "subCategory": "Eco-Tourism City",
          "description": "World-class eco-tourism city with river cruise, glow garden & maze.",
          "shortDescription": "Eco-tourism haven with glow garden, maze & Narmada river cruise.",
          "latitude": 21.84,
          "longitude": 73.71,
          "primaryImageUrl": "/landmarks/statue-of-unity.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isCulture": true
        },
        {
          "name": "Zarwani Waterfall",
          "slug": "zarwani-waterfall-narmada",
          "city": "Narmada",
          "category": "Nature",
          "subCategory": "Waterfall",
          "description": "Scenic forest waterfall deep inside Shoolpaneshwar Sanctuary.",
          "shortDescription": "Cascading waterfall nestled in Shoolpaneshwar forest.",
          "latitude": 21.88,
          "longitude": 73.75,
          "primaryImageUrl": "/landmarks/zarwani-waterfall.jpg",
          "bestTimeToVisit": "July to February",
          "recommendedDays": 1,
          "entryFee": 0,
          "isNature": true
        },
        {
          "name": "Shoolpaneshwar Wildlife Sanctuary",
          "slug": "shoolpaneshwar-wildlife-sanctuary",
          "city": "Narmada",
          "category": "Wildlife",
          "subCategory": "Sanctuary",
          "description": "Dense deciduous teak forest and biodiversity hotspot.",
          "shortDescription": "Dense teak forest sanctuary along Narmada River.",
          "latitude": 21.75,
          "longitude": 73.7,
          "primaryImageUrl": "/landmarks/shoolpaneshwar-wildlife-sanctuary.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isWildlife": true
        },
        {
          "name": "Cactus Garden",
          "slug": "cactus-garden-narmada",
          "city": "Narmada",
          "category": "Nature",
          "subCategory": "Conservatory",
          "description": "Architectural conservatory featuring 500+ desert cactus species.",
          "shortDescription": "Architectural conservatory with 500+ exotic cactus species.",
          "latitude": 21.835,
          "longitude": 73.715,
          "primaryImageUrl": "/landmarks/cactus-garden.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 60,
          "isNature": true
        },
        {
          "name": "Jungle Safari (Ekta Nagar)",
          "slug": "jungle-safari-ekta-nagar",
          "city": "Narmada",
          "category": "Wildlife",
          "subCategory": "Zoo Safari",
          "description": "Open-air zoological park with 170+ exotic animal species.",
          "shortDescription": "Open-air zoological park featuring 170+ animal species.",
          "latitude": 21.842,
          "longitude": 73.722,
          "primaryImageUrl": "/landmarks/jungle-safari.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 200,
          "isWildlife": true
        },
        {
          "name": "Ambaji Temple",
          "slug": "ambaji-temple-banaskantha",
          "city": "Banaskantha",
          "category": "Spiritual",
          "subCategory": "Shakti Peeth",
          "description": "Major 51 Shakti Peeth shrine worshipping Viso Yantra.",
          "shortDescription": "Revered 51 Shakti Peeth shrine worshipping sacred Yantra.",
          "latitude": 24.3333,
          "longitude": 72.85,
          "primaryImageUrl": "/landmarks/ambaji-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true,
          "isFeatured": true
        },
        {
          "name": "Gabbar Hill",
          "slug": "gabbar-hill-ambaji",
          "city": "Banaskantha",
          "category": "Spiritual",
          "subCategory": "Hillside Shrine",
          "description": "Holy hilltop reached by ropeway with 51 Shaktipeeth replica circuit.",
          "shortDescription": "Holy hilltop reached by ropeway with 51 Shaktipeeth circuit.",
          "latitude": 24.35,
          "longitude": 72.86,
          "primaryImageUrl": "/landmarks/gabbar-hill.png",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Balaram Palace",
          "slug": "balaram-palace-banaskantha",
          "city": "Banaskantha",
          "category": "Heritage",
          "subCategory": "Palace Resort",
          "description": "Neoclassical heritage palace resort of the Nawabs of Palanpur.",
          "shortDescription": "Heritage neoclassical palace resort of Palanpur Nawabs.",
          "latitude": 24.28,
          "longitude": 72.52,
          "primaryImageUrl": "/landmarks/balaram-palace.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Balaram Wildlife Sanctuary",
          "slug": "balaram-wildlife-sanctuary",
          "city": "Banaskantha",
          "category": "Wildlife",
          "subCategory": "Sanctuary",
          "description": "Hilly sanctuary protecting leopards, sloth bears, and striped hyenas.",
          "shortDescription": "Aravalli forest sanctuary protecting leopards and sloth bears.",
          "latitude": 24.3,
          "longitude": 72.6,
          "primaryImageUrl": "/landmarks/balaram-wildlife-sanctuary.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isWildlife": true
        },
        {
          "name": "Jessore Sloth Bear Sanctuary",
          "slug": "jessore-sloth-bear-sanctuary",
          "city": "Banaskantha",
          "category": "Wildlife",
          "subCategory": "Sanctuary",
          "description": "Aravalli mountain reserve dedicated to sloth bear conservation.",
          "shortDescription": "Dedicated sloth bear conservation reserve in Aravalli hills.",
          "latitude": 24.42,
          "longitude": 72.45,
          "primaryImageUrl": "/landmarks/jessore-sloth-bear-sanctuary.avif",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isWildlife": true
        },
        {
          "name": "Rani Ki Vav",
          "slug": "rani-ki-vav-patan",
          "city": "Patan",
          "category": "Heritage",
          "subCategory": "Stepwell",
          "description": "UNESCO World Heritage 7-storey inverted stepwell depicting Lord Vishnu.",
          "shortDescription": "UNESCO World Heritage 7-storey carved inverted stepwell.",
          "latitude": 23.8589,
          "longitude": 72.1018,
          "primaryImageUrl": "/landmarks/rani-ki-vav.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 40,
          "isHeritage": true,
          "isUNESCO": true,
          "isFeatured": true
        },
        {
          "name": "Patola Heritage Museum",
          "slug": "patola-heritage-museum-patan",
          "city": "Patan",
          "category": "Culture",
          "subCategory": "Weaving Workshop",
          "description": "Live workshop of double-Ikat Patola silk weaving masters.",
          "shortDescription": "Master weaving workshop of double-Ikat Patola silk.",
          "latitude": 23.85,
          "longitude": 72.12,
          "primaryImageUrl": "/landmarks/patola-heritage-museum.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isCulture": true
        },
        {
          "name": "Sahastralinga Talav",
          "slug": "sahastralinga-talav-patan",
          "city": "Patan",
          "category": "Heritage",
          "subCategory": "Medieval Lake",
          "description": "Medieval water reservoir featuring 1,000 Shiva shrines.",
          "shortDescription": "Medieval water tank featuring ruins of 1,000 Shiva shrines.",
          "latitude": 23.86,
          "longitude": 72.1,
          "primaryImageUrl": "/landmarks/sahastralinga-talav.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Modhera Sun Temple (Patan Circuit)",
          "slug": "modhera-sun-temple-patan",
          "city": "Patan",
          "category": "Heritage",
          "subCategory": "Sun Temple",
          "description": "Solanki-era architectural masterpiece on Pushpavati River.",
          "shortDescription": "Architectural Solanki Sun Temple near Patan.",
          "latitude": 23.5836,
          "longitude": 72.1333,
          "primaryImageUrl": "/landmarks/modhera-sun-temple-patan.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 25,
          "isHeritage": true
        },
        {
          "name": "Modhera Sun Temple",
          "slug": "modhera-sun-temple",
          "city": "Mehsana",
          "category": "Heritage",
          "subCategory": "Sun Temple",
          "description": "11th-century Sun God temple with Surya Kund stepwell.",
          "shortDescription": "11th-century Solanki Sun Temple with stepwell Surya Kund.",
          "latitude": 23.5836,
          "longitude": 72.1333,
          "primaryImageUrl": "/landmarks/modhera-sun-temple-patan.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 25,
          "isHeritage": true,
          "isFeatured": true
        },
        {
          "name": "Shankus Water Park",
          "slug": "shankus-water-park-mehsana",
          "city": "Mehsana",
          "category": "Culture",
          "subCategory": "Water Park",
          "description": "Pioneer water theme park resort near Ahmedabad-Mehsana highway.",
          "shortDescription": "Popular water theme park and holiday resort.",
          "latitude": 23.45,
          "longitude": 72.35,
          "primaryImageUrl": "/landmarks/shankus-water-park.jpg",
          "bestTimeToVisit": "March to July",
          "recommendedDays": 1,
          "entryFee": 600,
          "isCulture": true
        },
        {
          "name": "Taranga Hill",
          "slug": "taranga-hill",
          "city": "Mehsana",
          "category": "Spiritual",
          "subCategory": "Jain Pilgrimage",
          "description": "Ancient Jain pilgrimage hill featuring 12th-century Ajitnath temple.",
          "shortDescription": "Sacred Jain pilgrimage hill with 12th-century Ajitnath temple.",
          "latitude": 23.95,
          "longitude": 72.7667,
          "primaryImageUrl": "/landmarks/taranga-hill.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Vadnagar Heritage Town",
          "slug": "vadnagar-heritage-town",
          "city": "Mehsana",
          "category": "Heritage",
          "subCategory": "Heritage Town",
          "description": "2,500-year-old living heritage town with Buddhist monastery excavations.",
          "shortDescription": "2,500-year-old living heritage town with Buddhist excavations.",
          "latitude": 23.7833,
          "longitude": 72.6333,
          "primaryImageUrl": "/landmarks/vadnagar.avif",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Kirti Toran",
          "slug": "kirti-toran-vadnagar",
          "city": "Mehsana",
          "category": "Heritage",
          "subCategory": "Victory Arch",
          "description": "40-ft red sandstone victory arches in Vadnagar.",
          "shortDescription": "40-ft Solanki red sandstone victory gateway arches.",
          "latitude": 23.784,
          "longitude": 72.634,
          "primaryImageUrl": "/landmarks/kirti-toran.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Polo Forest",
          "slug": "polo-forest-sabarkantha",
          "city": "Sabarkantha",
          "category": "Nature",
          "subCategory": "Ancient Forest & Ruins",
          "description": "Ancient 15th-century temple ruins nestled in Vijaynagar hills.",
          "shortDescription": "15th-century temple ruins surrounded by lush mountain forests.",
          "latitude": 23.96,
          "longitude": 73.29,
          "primaryImageUrl": "/landmarks/polo-forest-sabarkantha.jpg",
          "bestTimeToVisit": "August to March",
          "recommendedDays": 2,
          "entryFee": 0,
          "isNature": true,
          "isHeritage": true,
          "isFeatured": true
        },
        {
          "name": "Idar Fort",
          "slug": "idar-fort-sabarkantha",
          "city": "Sabarkantha",
          "category": "Heritage",
          "subCategory": "Hill Fort",
          "description": "Hilltop fort fortress on granite boulders known for wooden toys.",
          "shortDescription": "Granite hill fortress famous for traditional wooden craft toys.",
          "latitude": 23.83,
          "longitude": 73,
          "primaryImageUrl": "/landmarks/idar-fort.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Shamlaji Temple",
          "slug": "shamlaji-temple-sabarkantha",
          "city": "Sabarkantha",
          "category": "Spiritual",
          "subCategory": "Vishnu Temple",
          "description": "11th-century Vishnu temple on Meshwo River bank.",
          "shortDescription": "11th-century carved Vishnu shrine on Meshwo riverbank.",
          "latitude": 23.68,
          "longitude": 73.38,
          "primaryImageUrl": "/landmarks/shamlaji-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Vijaynagar Forest",
          "slug": "vijaynagar-forest-sabarkantha",
          "city": "Sabarkantha",
          "category": "Nature",
          "subCategory": "Forest Reserve",
          "description": "Lush forest reserve with river streams and ancient ruins.",
          "shortDescription": "Lush woodland reserve with streams and historical ruins.",
          "latitude": 23.97,
          "longitude": 73.28,
          "primaryImageUrl": "/landmarks/vijaynagar-forest.jpg",
          "bestTimeToVisit": "August to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isNature": true
        },
        {
          "name": "Shamlaji Temple (Aravalli Region)",
          "slug": "shamlaji-temple-aravalli",
          "city": "Aravalli",
          "category": "Spiritual",
          "subCategory": "Pilgrimage Site",
          "description": "Historic pilgrimage site hosting annual Shamlaji fair.",
          "shortDescription": "Historic Lord Vishnu shrine hosting the annual Shamlaji fair.",
          "latitude": 23.683,
          "longitude": 73.383,
          "primaryImageUrl": "/landmarks/shamlaji-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Poshina Tribal Village",
          "slug": "poshina-tribal-village",
          "city": "Aravalli",
          "category": "Culture",
          "subCategory": "Tribal Village",
          "description": "Tribal village famous for terracotta horse shrines.",
          "shortDescription": "Authentic tribal village renowned for terracotta votive horses.",
          "latitude": 24.2,
          "longitude": 73.1,
          "primaryImageUrl": "/landmarks/polo-forest-sabarkantha.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isCulture": true
        },
        {
          "name": "Dev Ni Mori",
          "slug": "dev-ni-mori-aravalli",
          "city": "Aravalli",
          "category": "Heritage",
          "subCategory": "Buddhist Stupa",
          "description": "Important Buddhist stupa and monastery excavation site.",
          "shortDescription": "Historic 3rd-century Buddhist stupa excavation site.",
          "latitude": 23.66,
          "longitude": 73.4,
          "primaryImageUrl": "/landmarks/shamlaji-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Ratanpur Border Hills",
          "slug": "ratanpur-forest-aravalli",
          "city": "Aravalli",
          "category": "Nature",
          "subCategory": "Border Hills",
          "description": "Border forest hills along Rajasthan line.",
          "shortDescription": "Scenic Aravalli border hills along Rajasthan boundary.",
          "latitude": 23.75,
          "longitude": 73.45,
          "primaryImageUrl": "/landmarks/ratanpur.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isNature": true
        },
        {
          "name": "Saputara Hill Station",
          "slug": "saputara-hill-station",
          "city": "Dang",
          "category": "Nature",
          "subCategory": "Hill Station",
          "description": "Gujarat's premiere hill station in the Sahyadri Western Ghats.",
          "shortDescription": "Cool mountain resort in Sahyadri Ghats with lake & ropeway.",
          "latitude": 20.582,
          "longitude": 73.748,
          "primaryImageUrl": "/landmarks/saputara.jpg",
          "bestTimeToVisit": "July to March",
          "recommendedDays": 2,
          "entryFee": 0,
          "isNature": true,
          "isFeatured": true
        },
        {
          "name": "Gira Waterfall",
          "slug": "gira-waterfall-dang",
          "city": "Dang",
          "category": "Nature",
          "subCategory": "Waterfall",
          "description": "30-meter roaring waterfall near Waghai in Dang forest.",
          "shortDescription": "Spectacular 30m waterfall in Dang forest reserve.",
          "latitude": 20.76,
          "longitude": 73.6,
          "primaryImageUrl": "/landmarks/gira-waterfall.jpg",
          "bestTimeToVisit": "July to December",
          "recommendedDays": 1,
          "entryFee": 0,
          "isNature": true
        },
        {
          "name": "Vansda National Park",
          "slug": "vansda-national-park-dang",
          "city": "Dang",
          "category": "Nature",
          "subCategory": "National Park",
          "description": "Dense tropical rainforest with giant bamboo and leopards.",
          "shortDescription": "Dense rainforest park with giant bamboo groves & wildlife.",
          "latitude": 20.768,
          "longitude": 73.483,
          "primaryImageUrl": "/landmarks/vansda-national-park.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isNature": true,
          "isWildlife": true
        },
        {
          "name": "Purna Wildlife Sanctuary",
          "slug": "purna-wildlife-sanctuary-dang",
          "city": "Dang",
          "category": "Wildlife",
          "subCategory": "Sanctuary",
          "description": "Dense bamboo forests and wildlife reserve in Mahal, Dang.",
          "shortDescription": "Dense bamboo forest sanctuary in Mahal Dang.",
          "latitude": 20.9,
          "longitude": 73.7,
          "primaryImageUrl": "/landmarks/vansda-national-park.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isWildlife": true
        },
        {
          "name": "Saputara Lake",
          "slug": "saputara-lake-dang",
          "city": "Dang",
          "category": "Nature",
          "subCategory": "Mountain Lake",
          "description": "Picturesque mountain lake offering boating and lakefront gardens.",
          "shortDescription": "Serene hill lake offering pedal boating and walks.",
          "latitude": 20.58,
          "longitude": 73.75,
          "primaryImageUrl": "/landmarks/saputara.jpg",
          "bestTimeToVisit": "July to March",
          "recommendedDays": 1,
          "entryFee": 100,
          "isNature": true
        },
        {
          "name": "Sunset Point Saputara",
          "slug": "sunset-point-saputara-dang",
          "city": "Dang",
          "category": "Nature",
          "subCategory": "Viewpoint",
          "description": "Panoramic peak overlooking the Dang forest valleys at sunset.",
          "shortDescription": "Panoramic peak accessible by ropeway overlooking valleys.",
          "latitude": 20.585,
          "longitude": 73.752,
          "primaryImageUrl": "/landmarks/sunset-point-saputara.jpg",
          "bestTimeToVisit": "July to March",
          "recommendedDays": 1,
          "entryFee": 70,
          "isNature": true
        },
        {
          "name": "Dandi Beach",
          "slug": "dandi-beach-navsari",
          "city": "Navsari",
          "category": "Beach & Coastal",
          "subCategory": "Historic Beach",
          "description": "Historic coastal beach where Mahatma Gandhi concluded the Dandi Salt March.",
          "shortDescription": "Historic beach site of Mahatma Gandhi's 1930 Salt March.",
          "latitude": 20.88,
          "longitude": 72.8,
          "primaryImageUrl": "/landmarks/dandi-beach.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isBeach": true,
          "isHeritage": true
        },
        {
          "name": "National Salt Satyagraha Memorial Dandi",
          "slug": "dandi-memorial-navsari",
          "city": "Navsari",
          "category": "Heritage",
          "subCategory": "National Memorial",
          "description": "Grand national memorial honoring Mahatma Gandhi and 80 Marchers.",
          "shortDescription": "Grand national monument celebrating the Dandi Salt March.",
          "latitude": 20.882,
          "longitude": 72.802,
          "primaryImageUrl": "/landmarks/dandi-memorial.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Vansda Park (Navsari Circuit)",
          "slug": "vansda-park-navsari",
          "city": "Navsari",
          "category": "Nature",
          "subCategory": "Protected Forest",
          "description": "Protected forest reserve bordering Navsari and Dang districts.",
          "shortDescription": "Forest sanctuary border circuit in Navsari.",
          "latitude": 20.8,
          "longitude": 73.4,
          "primaryImageUrl": "/landmarks/vansda-national-park.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isNature": true
        },
        {
          "name": "Unai Hot Springs",
          "slug": "unai-hot-springs-navsari",
          "city": "Navsari",
          "category": "Spiritual",
          "subCategory": "Thermal Springs",
          "description": "Sacred natural thermal sulfur hot springs and Unai Mata Temple.",
          "shortDescription": "Sacred sulfur thermal springs & Unai Mata temple.",
          "latitude": 20.84,
          "longitude": 73.33,
          "primaryImageUrl": "/landmarks/unai-hot-springs.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true,
          "isNature": true
        },
        {
          "name": "Kabirvad",
          "slug": "kabirvad-banyan-tree-bharuch",
          "city": "Bharuch",
          "category": "Nature",
          "subCategory": "Banyan Island",
          "description": "Massive several-hundred-year-old banyan tree island on Narmada River.",
          "shortDescription": "Massive centuries-old banyan tree river island in Narmada.",
          "latitude": 21.75,
          "longitude": 73.1,
          "primaryImageUrl": "/landmarks/kabirvad.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 30,
          "isNature": true
        },
        {
          "name": "Golden Bridge",
          "slug": "golden-bridge-bharuch",
          "city": "Bharuch",
          "category": "Heritage",
          "subCategory": "Historic Iron Bridge",
          "description": "1881 historic iron bridge across Narmada River connecting Ankleshwar & Bharuch.",
          "shortDescription": "1881 historic British iron bridge across Narmada.",
          "latitude": 21.69,
          "longitude": 73,
          "primaryImageUrl": "/landmarks/golden-bridge.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isHeritage": true
        },
        {
          "name": "Shuklatirth",
          "slug": "shuklatirth-bharuch",
          "city": "Bharuch",
          "category": "Spiritual",
          "subCategory": "Pilgrimage Site",
          "description": "Ancient holy pilgrimage center on the banks of Narmada River.",
          "shortDescription": "Ancient sacred riverbank pilgrimage center on Narmada.",
          "latitude": 21.74,
          "longitude": 73.07,
          "primaryImageUrl": "/landmarks/shuklatirth.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Pavagadh Hill",
          "slug": "pavagadh-hill-panchmahal",
          "city": "Panchmahal",
          "category": "Spiritual",
          "subCategory": "Volcanic Peak",
          "description": "Volcanic hill peak featuring Kalika Mata temple and ropeway ride.",
          "shortDescription": "Volcanic peak with ropeway to Kalika Mata temple.",
          "latitude": 22.46,
          "longitude": 73.52,
          "primaryImageUrl": "/landmarks/pavagadh-hill.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true,
          "isAdventure": true
        },
        {
          "name": "Kalika Mata Temple Pavagadh",
          "slug": "kalika-mata-temple-pavagadh",
          "city": "Panchmahal",
          "category": "Spiritual",
          "subCategory": "Shakti Peeth",
          "description": "Revered Shakti Peeth shrine perched atop Pavagadh peak.",
          "shortDescription": "Sacred hilltop Shakti Peeth shrine on Pavagadh.",
          "latitude": 22.465,
          "longitude": 73.522,
          "primaryImageUrl": "/landmarks/kalika-mata-temple.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 0,
          "isReligious": true
        },
        {
          "name": "Champaner Archaeological Park",
          "slug": "champaner-archaeological-park",
          "city": "Panchmahal",
          "category": "Heritage",
          "subCategory": "Sultanate Ruins",
          "description": "UNESCO World Heritage site with medieval Sultanate mosques and fort ruins.",
          "shortDescription": "UNESCO World Heritage medieval Sultanate fortress & mosques.",
          "latitude": 22.4833,
          "longitude": 73.5333,
          "primaryImageUrl": "/places/champaner-pavagadh.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 40,
          "isHeritage": true,
          "isUNESCO": true,
          "isFeatured": true
        },
        {
          "name": "Watson Museum & Jubilee Garden",
          "slug": "watson-museum-jubilee-garden-rajkot",
          "city": "Rajkot",
          "category": "Heritage",
          "subCategory": "Museum & Garden",
          "description": "Colonial museum in Jubilee Garden housing rare Saurashtra artifacts.",
          "shortDescription": "Colonial museum in Jubilee Garden with rare Saurashtra artifacts.",
          "latitude": 22.3,
          "longitude": 70.8,
          "primaryImageUrl": "/landmarks/watson-museum.jpg",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 20,
          "isHeritage": true,
          "isCulture": true
        }
      ]
    },
    {
      "name": "Haryana",
      "slug": "haryana",
      "code": "HR",
      "type": "STATE",
      "capital": "Chandigarh",
      "description": "Land of Mahabharata & Wildlife, featuring Kurukshetra Brahma Sarovar, Sultanpur National Park, and Pinjore Gardens.",
      "latitude": 29.0588,
      "longitude": 76.0856,
      "coverImage": "/state-images/Haryana/Haryana_Cover_Page.jpg",
      "cities": [
        {
          "name": "Kurukshetra",
          "slug": "kurukshetra"
        },
        {
          "name": "Gurugram (Sultanpur)",
          "slug": "gurugram"
        },
        {
          "name": "Panchkula",
          "slug": "panchkula"
        }
      ],
      "destinations": [
        {
          "name": "Kurukshetra & Brahma Sarovar",
          "slug": "kurukshetra-brahma-sarovar",
          "city": "Kurukshetra",
          "category": "Spiritual",
          "subCategory": "Mahabharata Holy Tank",
          "description": "Sacred site of the Mahabharata war and land where Lord Krishna delivered the Bhagavad Gita at Jyotisar.",
          "shortDescription": "Sacred Mahabharata battlefield and land of Bhagavad Gita preaching.",
          "latitude": 29.9695,
          "longitude": 76.8783,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isHeritage": true,
          "aliases": [
            "Jyotisar",
            "Brahma Sarovar"
          ]
        },
        {
          "name": "Sultanpur National Park",
          "slug": "sultanpur-national-park",
          "city": "Gurugram (Sultanpur)",
          "category": "Wildlife",
          "subCategory": "Ramsar Bird Sanctuary",
          "description": "Ramsar wetland sanctuary hosting over 250 species of migratory birds from Siberia, Europe, and Central Asia.",
          "shortDescription": "Ramsar wetland haven for Siberian and European migratory birds.",
          "latitude": 28.4622,
          "longitude": 76.8925,
          "primaryImageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "November to March",
          "recommendedDays": 1,
          "entryFee": 15,
          "isWildlife": true,
          "isNature": true
        }
      ]
    },
    {
      "name": "Himachal Pradesh",
      "slug": "himachal-pradesh",
      "code": "HP",
      "type": "STATE",
      "capital": "Shimla",
      "description": "Devbhoomi (Land of Gods), featuring Manali, Spiti Valley, Dalai Lama Temple in Dharamshala, Kasol Manikaran Sahib, Jakhu Temple, and Shimla.",
      "latitude": 31.1048,
      "longitude": 77.1734,
      "coverImage": "/state-images/Himachal_Pradesh/Cover Page.jpg",
      "cities": [
        {
          "name": "Shimla",
          "slug": "shimla"
        },
        {
          "name": "Manali",
          "slug": "manali"
        },
        {
          "name": "Dharamshala & McLeod Ganj",
          "slug": "dharamshala"
        },
        {
          "name": "Kaza (Spiti)",
          "slug": "kaza"
        },
        {
          "name": "Kasol & Manikaran",
          "slug": "kasol-manikaran"
        },
        {
          "name": "Kangra",
          "slug": "kangra"
        }
      ],
      "destinations": [
        {
          "name": "Dharamshala & Dalai Lama Temple",
          "slug": "dharamshala-mcleod-ganj",
          "city": "Dharamshala & McLeod Ganj",
          "category": "Spiritual",
          "subCategory": "Tibetan Monastery",
          "description": "Residency of His Holiness Dalai Lama, Tsuglagkhang Monastery, and Dhauladhar mountain views.",
          "shortDescription": "Home of H.H. Dalai Lama nestled below Dhauladhar ranges.",
          "latitude": 32.2426,
          "longitude": 76.3213,
          "primaryImageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to June",
          "recommendedDays": 3,
          "isReligious": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "McLeod Ganj",
            "Dalai Lama Monastery"
          ]
        },
        {
          "name": "Hadimba Temple & Vashisht Springs (Manali)",
          "slug": "hadimba-temple-manali",
          "city": "Manali",
          "category": "Spiritual",
          "subCategory": "Temple & Springs",
          "description": "16th-century wooden pagoda temple amid cedar forest, paired with natural sulfur hot springs of Vashisht.",
          "shortDescription": "Historic 16th-century pagoda temple amidst deodar pine forests.",
          "latitude": 32.2486,
          "longitude": 77.1804,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to June",
          "recommendedDays": 1,
          "isReligious": true,
          "isHeritage": true,
          "aliases": [
            "Hadimba Devi Temple"
          ]
        },
        {
          "name": "Manikaran Sahib Gurudwara & Hot Springs",
          "slug": "manikaran-sahib-gurudwara",
          "city": "Kasol & Manikaran",
          "category": "Spiritual",
          "subCategory": "Gurudwara & Geothermal Springs",
          "description": "Sacred pilgrimage site in Parvati Valley famous for its miraculous geothermal hot springs and historic Gurudwara.",
          "shortDescription": "Sacred Sikh & Hindu hot springs shrine in Parvati Valley.",
          "latitude": 32.027,
          "longitude": 77.346,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to June",
          "recommendedDays": 1,
          "isReligious": true,
          "isNature": true,
          "aliases": [
            "Manikaran Hot Springs"
          ]
        },
        {
          "name": "Jakhu Temple & Shimla Ridge",
          "slug": "jakhu-temple-shimla-ridge",
          "city": "Shimla",
          "category": "Spiritual",
          "subCategory": "Hilltop Temple",
          "description": "Ancient Hanuman shrine atop Jakhu Hill with a giant 108ft statue overlooking Shimla Mall Road and colonial ridge.",
          "shortDescription": "Hilltop Hanuman temple with a giant 108ft statue above Shimla.",
          "latitude": 31.1048,
          "longitude": 77.1734,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to June",
          "recommendedDays": 2,
          "isReligious": true,
          "isHeritage": true,
          "aliases": [
            "Jakhoo Temple"
          ]
        },
        {
          "name": "Manali & Solang Valley",
          "slug": "manali-solang-valley",
          "city": "Manali",
          "category": "Adventure",
          "subCategory": "Hill Station & Snow Sports",
          "description": "Premier Himalayan resort town famous for paragliding, skiing in Solang, ziplining, and Atal Tunnel Rohtang.",
          "shortDescription": "Premier Himalayan hill resort famous for adventure sports and snow passes.",
          "latitude": 32.2432,
          "longitude": 77.1892,
          "primaryImageUrl": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to June",
          "recommendedDays": 4,
          "isAdventure": true,
          "isNature": true,
          "isFeatured": true,
          "aliases": [
            "Solang Valley",
            "Rohtang Pass"
          ]
        },
        {
          "name": "Spiti Valley & Key Monastery",
          "slug": "spiti-valley-key-monastery",
          "city": "Kaza (Spiti)",
          "category": "Nature",
          "subCategory": "Monastery & High Desert",
          "description": "Remote Himalayan cold desert valley at 12,500 ft featuring 1,000-year-old Key Monastery, Pin Valley, and Chandratal Lake.",
          "shortDescription": "Breathtaking Himalayan cold desert and 1,000-year-old Key Monastery.",
          "latitude": 32.2461,
          "longitude": 78.0349,
          "primaryImageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "May to October",
          "recommendedDays": 5,
          "isReligious": true,
          "isNature": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Kee Monastery",
            "Spiti"
          ]
        }
      ]
    },
    {
      "name": "Jharkhand",
      "slug": "jharkhand",
      "code": "JH",
      "type": "STATE",
      "capital": "Ranchi",
      "description": "Land of Waterfalls & Deoghar Jyotirlinga, featuring Baba Baidyanath Dham, Hundru Falls, and Betla National Park.",
      "latitude": 23.6102,
      "longitude": 85.2799,
      "coverImage": "/state-images/Jharkhand/Jharkhand_Cover_Page.jpg",
      "cities": [
        {
          "name": "Deoghar",
          "slug": "deoghar"
        },
        {
          "name": "Ranchi",
          "slug": "ranchi"
        },
        {
          "name": "Latehar (Betla)",
          "slug": "latehar"
        }
      ],
      "destinations": [
        {
          "name": "Baidyanath Jyotirlinga Dham (Deoghar)",
          "slug": "baidyanath-dham-deoghar",
          "city": "Deoghar",
          "category": "Spiritual",
          "subCategory": "Jyotirlinga Temple",
          "description": "One of the 12 sacred Shiva Jyotirlingas, famous for the annual month-long Shravani Mela Kanwar Yatra.",
          "shortDescription": "Sacred 12 Shiva Jyotirlinga shrine hosting the annual Kanwar Yatra.",
          "latitude": 24.4925,
          "longitude": 86.6997,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Deoghar Temple",
            "Baba Dham"
          ]
        },
        {
          "name": "Hundru & Dassam Waterfalls",
          "slug": "hundru-dassam-falls",
          "city": "Ranchi",
          "category": "Nature",
          "subCategory": "Waterfalls",
          "description": "Spectacular 98-meter cascades created by the Subarnarekha River cut into rocky plateau terrain.",
          "shortDescription": "98m cascading waterfall surrounded by lush rocky plateau forest.",
          "latitude": 23.4475,
          "longitude": 85.656,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "July to February",
          "recommendedDays": 1,
          "isNature": true
        }
      ]
    },
    {
      "name": "Karnataka",
      "slug": "karnataka",
      "code": "KA",
      "type": "STATE",
      "capital": "Bengaluru",
      "description": "One State, Many Worlds: featuring Hampi UNESCO ruins, Mysore Palace, Coorg coffee hills, Gokarna beaches, and Murudeshwar.",
      "latitude": 15.3173,
      "longitude": 75.7139,
      "coverImage": "/state-images/Karnataka/Karnataka_Cover_Page.jpg",
      "cities": [
        {
          "name": "Hampi",
          "slug": "hampi"
        },
        {
          "name": "Mysuru",
          "slug": "mysuru"
        },
        {
          "name": "Madikeri (Coorg)",
          "slug": "coorg"
        },
        {
          "name": "Gokarna",
          "slug": "gokarna"
        },
        {
          "name": "Bengaluru",
          "slug": "bengaluru"
        },
        {
          "name": "Murudeshwar",
          "slug": "murudeshwar"
        }
      ],
      "destinations": [
        {
          "name": "Hampi UNESCO World Heritage Complex",
          "slug": "hampi-unesco-complex",
          "city": "Hampi",
          "category": "Heritage",
          "subCategory": "UNESCO Ruins & Temples",
          "description": "Spectacular 14th-century Vijayanagara empire stone ruins, Virupaksha Temple, and iconic Stone Chariot at Vittala Temple.",
          "shortDescription": "14th-century Vijayanagara empire stone ruins and Stone Chariot.",
          "latitude": 15.335,
          "longitude": 76.46,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 3,
          "entryFee": 40,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Vijayanagara Empire",
            "Vittala Temple"
          ]
        },
        {
          "name": "Mysore Palace (Amba Vilas)",
          "slug": "mysore-palace",
          "city": "Mysuru",
          "category": "Heritage",
          "subCategory": "Royal Palace",
          "description": "Opulent royal palace of the Wodeyar dynasty illuminated by nearly 100,000 golden bulbs during Dussehra.",
          "shortDescription": "Opulent Wodeyar royal palace illuminated by 100,000 golden lights.",
          "latitude": 12.3052,
          "longitude": 76.6552,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 100,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Amba Vilas Palace"
          ]
        },
        {
          "name": "Murudeshwar Shiva Temple & Beach",
          "slug": "murudeshwar-temple-beach",
          "city": "Murudeshwar",
          "category": "Spiritual",
          "subCategory": "Giant Statue & Coast",
          "description": "World's second-tallest Lord Shiva statue (123ft) standing directly on the Arabian coast with 20-story Gopuram.",
          "shortDescription": "World's 2nd tallest Lord Shiva statue (123ft) on Arabian coast.",
          "latitude": 14.0942,
          "longitude": 74.4897,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isBeach": true,
          "isFeatured": true,
          "aliases": [
            "Murudeshwar Statue"
          ]
        },
        {
          "name": "Coorg (Madikeri) Coffee Hills",
          "slug": "coorg-madikeri-coffee-hills",
          "city": "Madikeri (Coorg)",
          "category": "Nature",
          "subCategory": "Hill Station",
          "description": "Misty Western Ghats district famous for aroma coffee plantations, Abbey Falls, and Raja's Seat sunset.",
          "shortDescription": "Scotland of India with misty coffee plantations and waterfalls.",
          "latitude": 12.4244,
          "longitude": 75.7382,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to April",
          "recommendedDays": 3,
          "isNature": true
        }
      ]
    },
    {
      "name": "Kerala",
      "slug": "kerala",
      "code": "KL",
      "type": "STATE",
      "capital": "Thiruvananthapuram",
      "description": "God's Own Country: featuring Alleppey backwater houseboats, Munnar tea estates, Sabarimala, Padmanabhaswamy, and Varkala cliff beach.",
      "latitude": 10.8505,
      "longitude": 76.2711,
      "coverImage": "/state-images/Kerala/cover page.jpg",
      "cities": [
        {
          "name": "Alleppey (Alappuzha)",
          "slug": "alleppey"
        },
        {
          "name": "Munnar",
          "slug": "munnar"
        },
        {
          "name": "Kochi",
          "slug": "kochi"
        },
        {
          "name": "Wayanad",
          "slug": "wayanad"
        },
        {
          "name": "Varkala",
          "slug": "varkala"
        },
        {
          "name": "Thiruvananthapuram",
          "slug": "thiruvananthapuram"
        }
      ],
      "destinations": [
        {
          "name": "Alleppey Backwaters & Houseboat",
          "slug": "alleppey-backwaters-houseboat",
          "city": "Alleppey (Alappuzha)",
          "category": "Beach & Coastal",
          "subCategory": "Backwaters & Houseboat",
          "description": "Venice of the East backwater network navigated in traditional luxury Kettuvallam houseboats amidst coconut groves.",
          "shortDescription": "Venice of the East backwater network in traditional houseboats.",
          "latitude": 9.4981,
          "longitude": 76.3388,
          "primaryImageUrl": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to March",
          "recommendedDays": 2,
          "isNature": true,
          "isBeach": true,
          "isFeatured": true,
          "aliases": [
            "Alappuzha Backwaters",
            "Kettuvallam"
          ]
        },
        {
          "name": "Padmanabhaswamy Temple & Trivandrum",
          "slug": "padmanabhaswamy-temple",
          "city": "Thiruvananthapuram",
          "category": "Spiritual",
          "subCategory": "Dravidian Temple",
          "description": "Sacred 108 Divya Desam shrine dedicated to Lord Vishnu in Anantha Sayanam posture, famous for Dravidian gopuram.",
          "shortDescription": "Sacred Divya Desam shrine of Lord Vishnu in Trivandrum.",
          "latitude": 8.483,
          "longitude": 76.9436,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Trivandrum Temple"
          ]
        },
        {
          "name": "Munnar Tea Gardens & Anamudi",
          "slug": "munnar-tea-gardens",
          "city": "Munnar",
          "category": "Nature",
          "subCategory": "Tea Estates & Peak",
          "description": "Misty hill station surrounded by carpeted green tea estates and Eravikulam National Park housing Nilgiri Tahr.",
          "shortDescription": "Misty hill station covered in rolling green tea plantations.",
          "latitude": 10.0889,
          "longitude": 77.0595,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to May",
          "recommendedDays": 3,
          "isNature": true,
          "isFeatured": true
        }
      ]
    },
    {
      "name": "Madhya Pradesh",
      "slug": "madhya-pradesh",
      "code": "MP",
      "type": "STATE",
      "capital": "Bhopal",
      "description": "Heart of Incredible India: featuring Khajuraho monuments, Mahakaleshwar Jyotirlinga (Ujjain), Sanchi Stupa, Kanha & Bandhavgarh tigers.",
      "latitude": 22.9734,
      "longitude": 78.6569,
      "coverImage": "/state-images/Madhya_Pradesh/Cover Page.jpg",
      "cities": [
        {
          "name": "Ujjain",
          "slug": "ujjain"
        },
        {
          "name": "Khajuraho",
          "slug": "khajuraho"
        },
        {
          "name": "Khatia (Kanha)",
          "slug": "kanha"
        },
        {
          "name": "Bhopal (Sanchi)",
          "slug": "bhopal"
        },
        {
          "name": "Orchha",
          "slug": "orchha"
        },
        {
          "name": "Gwalior",
          "slug": "gwalior"
        }
      ],
      "destinations": [
        {
          "name": "Mahakaleshwar Jyotirlinga (Ujjain)",
          "slug": "mahakaleshwar-ujjain",
          "city": "Ujjain",
          "category": "Spiritual",
          "subCategory": "Jyotirlinga Temple",
          "description": "Sacred South-facing (Dakshinamurti) Shiva Jyotirlinga along Shipra river, famous for Bhasma Aarti and Simhastha Kumbh Mela.",
          "shortDescription": "Sacred South-facing Shiva Jyotirlinga world-famous for Bhasma Aarti.",
          "latitude": 23.1827,
          "longitude": 75.7682,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Ujjain Temple",
            "Mahakal"
          ]
        },
        {
          "name": "Khajuraho Group of Temples",
          "slug": "khajuraho-temples",
          "city": "Khajuraho",
          "category": "Heritage",
          "subCategory": "UNESCO Temples",
          "description": "10th-century UNESCO World Heritage stone temples built by Chandela dynasty, famous for Nagara architecture and exquisite sculptures.",
          "shortDescription": "10th-century UNESCO Nagara stone temples with intricate sculptures.",
          "latitude": 24.8318,
          "longitude": 79.9199,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 40,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Khajuraho Monuments"
          ]
        },
        {
          "name": "Sanchi Stupa Complex",
          "slug": "sanchi-stupa-complex",
          "city": "Bhopal (Sanchi)",
          "category": "Heritage",
          "subCategory": "UNESCO Buddhist Stupa",
          "description": "3rd-century BCE UNESCO World Heritage Great Stupa built by Emperor Ashoka, featuring carved Torana gateways.",
          "shortDescription": "3rd-century BCE UNESCO Great Stupa built by Emperor Ashoka.",
          "latitude": 23.4793,
          "longitude": 77.7397,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 40,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true
        }
      ]
    },
    {
      "name": "Maharashtra",
      "slug": "maharashtra",
      "code": "MH",
      "type": "STATE",
      "capital": "Mumbai",
      "description": "Gateway to India: featuring Shirdi Sai Baba, Trimbakeshwar Jyotirlinga, Ajanta & Ellora Caves, Gateway of India, Lonavala, and Mahabaleshwar.",
      "latitude": 19.7515,
      "longitude": 75.7139,
      "coverImage": "/state-images/Maharashtra/Maharastra_Cover_Page.jpg",
      "cities": [
        {
          "name": "Mumbai",
          "slug": "mumbai"
        },
        {
          "name": "Shirdi",
          "slug": "shirdi"
        },
        {
          "name": "Nashik & Trimbak",
          "slug": "nashik"
        },
        {
          "name": "Chhatrapati Sambhajinagar (Aurangabad)",
          "slug": "aurangabad"
        },
        {
          "name": "Lonavala & Khandala",
          "slug": "lonavala"
        },
        {
          "name": "Pune",
          "slug": "pune"
        }
      ],
      "destinations": [
        {
          "name": "Shirdi Sai Baba Samadhi Mandir",
          "slug": "shirdi-sai-baba-temple",
          "city": "Shirdi",
          "category": "Spiritual",
          "subCategory": "Global Pilgrimage Shrine",
          "description": "World-renowned holy shrine housing the Samadhi of revered saint Sai Baba of Shirdi.",
          "shortDescription": "World-renowned holy pilgrimage shrine of Sai Baba of Shirdi.",
          "latitude": 19.7667,
          "longitude": 74.4767,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "Year-round",
          "recommendedDays": 2,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Shirdi Temple",
            "Sai Baba Shrine"
          ]
        },
        {
          "name": "Trimbakeshwar Jyotirlinga (Nashik)",
          "slug": "trimbakeshwar-jyotirlinga",
          "city": "Nashik & Trimbak",
          "category": "Spiritual",
          "subCategory": "Jyotirlinga Temple",
          "description": "Sacred Jyotirlinga at the source of Godavari River featuring a three-faced lingam representing Brahma, Vishnu, and Shiva.",
          "shortDescription": "Sacred Jyotirlinga at the source of Godavari River with three-faced lingam.",
          "latitude": 19.9317,
          "longitude": 73.5303,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "aliases": [
            "Trimbak Temple"
          ]
        },
        {
          "name": "Gateway of India & Marine Drive",
          "slug": "gateway-of-india-marine-drive",
          "city": "Mumbai",
          "category": "Heritage",
          "subCategory": "Monuments & Waterfront",
          "description": "Mumbai's iconic 1924 basalt arch overlooking Mumbai harbour, paired with Queen's Necklace promenade on Marine Drive.",
          "shortDescription": "Iconic 1924 basalt arch monument and Queen's Necklace promenade.",
          "latitude": 18.922,
          "longitude": 72.8347,
          "primaryImageUrl": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Bombay Gateway",
            "Marine Drive",
            "Bombay"
          ]
        },
        {
          "name": "Ajanta & Ellora UNESCO Caves",
          "slug": "ajanta-ellora-caves",
          "city": "Chhatrapati Sambhajinagar (Aurangabad)",
          "category": "Heritage",
          "subCategory": "UNESCO Rock-Cut Caves",
          "description": "UNESCO rock-cut cave monuments featuring ancient Buddhist murals at Ajanta and monolithic Kailasa Temple cut out of single rock at Ellora.",
          "shortDescription": "UNESCO rock-cut caves housing the monolithic Kailasa Temple.",
          "latitude": 20.0268,
          "longitude": 75.1781,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 40,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Ellora Kailasa Temple",
            "Ajanta Caves"
          ]
        }
      ]
    },
    {
      "name": "Manipur",
      "slug": "manipur",
      "code": "MN",
      "type": "STATE",
      "capital": "Imphal",
      "description": "Jewel of India, featuring Loktak Floating Lake, Keibul Lamjao National Park (Sangai deer), and Kangla Fort.",
      "latitude": 24.6637,
      "longitude": 93.9063,
      "coverImage": "/state-images/Manipur/Manipur_Cover_Page.jpg",
      "cities": [
        {
          "name": "Imphal",
          "slug": "imphal"
        },
        {
          "name": "Moirang (Loktak)",
          "slug": "moirang"
        }
      ],
      "destinations": [
        {
          "name": "Loktak Lake & Keibul Lamjao Park",
          "slug": "loktak-lake-keibul-lamjao",
          "city": "Moirang (Loktak)",
          "category": "Nature",
          "subCategory": "Floating Lake & Park",
          "description": "Northeast India's largest freshwater lake famous for floating phumdis and the world's only floating national park protecting Sangai dancing deer.",
          "shortDescription": "World's only floating national park protecting dancing Sangai deer.",
          "latitude": 24.55,
          "longitude": 93.8,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to April",
          "recommendedDays": 2,
          "isNature": true,
          "isWildlife": true,
          "isFeatured": true,
          "aliases": [
            "Floating Lake",
            "Sangai Deer Reserve"
          ]
        },
        {
          "name": "Kangla Fort & Govindajee Temple",
          "slug": "kangla-fort-imphal",
          "city": "Imphal",
          "category": "Heritage",
          "subCategory": "Royal Fort & Palace",
          "description": "Ancient royal seat of the Meitei kingdom along Imphal River housing sacred Govindajee temple and coronation halls.",
          "shortDescription": "Ancient royal palace citadel of Meitei kings in Imphal.",
          "latitude": 24.81,
          "longitude": 93.94,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isHeritage": true,
          "isReligious": true
        }
      ]
    },
    {
      "name": "Meghalaya",
      "slug": "meghalaya",
      "code": "ML",
      "type": "STATE",
      "capital": "Shillong",
      "description": "Abode of Clouds, famous for Cherrapunji root bridges, Dawki crystal river, Shillong peak, and Nohkalikai falls.",
      "latitude": 25.467,
      "longitude": 91.3662,
      "coverImage": "/state-images/Meghalaya/Meghalaya_Cover_Page.jpg",
      "cities": [
        {
          "name": "Shillong",
          "slug": "shillong"
        },
        {
          "name": "Sohra (Cherrapunji)",
          "slug": "cherrapunji"
        },
        {
          "name": "Dawki",
          "slug": "dawki"
        }
      ],
      "destinations": [
        {
          "name": "Cherrapunji Double Decker Living Root Bridge",
          "slug": "cherrapunji-living-root-bridge",
          "city": "Sohra (Cherrapunji)",
          "category": "Nature",
          "subCategory": "Bio-engineering wonder",
          "description": "Unique UNESCO tentative list bio-engineering marvel grown over centuries by Khasi tribes from Indian rubber tree roots.",
          "shortDescription": "Centuries-old bio-engineered living tree root bridge grown by Khasi tribe.",
          "latitude": 25.275,
          "longitude": 91.732,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to May",
          "recommendedDays": 2,
          "isNature": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Nongriat Root Bridge"
          ]
        },
        {
          "name": "Dawki Umngot River & Crystal Waters",
          "slug": "dawki-umngot-river",
          "city": "Dawki",
          "category": "Nature",
          "subCategory": "Transparent River",
          "description": "Famed crystal-clear transparent river along India-Bangladesh border where boats appear floating in mid-air.",
          "shortDescription": "Crystal-clear glass river where boats appear floating in mid-air.",
          "latitude": 25.185,
          "longitude": 92.018,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "November to April",
          "recommendedDays": 1,
          "isNature": true,
          "isAdventure": true
        }
      ]
    },
    {
      "name": "Mizoram",
      "slug": "mizoram",
      "code": "MZ",
      "type": "STATE",
      "capital": "Aizawl",
      "description": "Land of Lush Hills, featuring Solomon's Temple in Aizawl, Reiek Peak, and Phawngpui Blue Mountain.",
      "latitude": 23.1645,
      "longitude": 92.9376,
      "coverImage": "/state-images/Mizoram/Mizoram_Cover_Page.jpg",
      "cities": [
        {
          "name": "Aizawl",
          "slug": "aizawl"
        },
        {
          "name": "Reiek",
          "slug": "reiek"
        }
      ],
      "destinations": [
        {
          "name": "Solomon's Temple (Aizawl)",
          "slug": "solomons-temple-aizawl",
          "city": "Aizawl",
          "category": "Spiritual",
          "subCategory": "Grand Cathedral",
          "description": "Majestic white marble church with 4 towers built over 20 years by Kohhran Thianghlim church.",
          "shortDescription": "Majestic white marble Cathedral with 4 towers in Aizawl.",
          "latitude": 23.7271,
          "longitude": 92.7176,
          "primaryImageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true
        },
        {
          "name": "Reiek Heritage Village & Peak",
          "slug": "reiek-peak",
          "city": "Reiek",
          "category": "Nature",
          "subCategory": "Mountain Peak & Mizo Village",
          "description": "High mountain peak offering panoramic views of Aizawl hills alongside traditional Mizo chieftain village huts.",
          "shortDescription": "Scenic mountain peak overlooking traditional Mizo heritage huts.",
          "latitude": 23.7,
          "longitude": 92.6,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to April",
          "recommendedDays": 1,
          "isNature": true,
          "isCulture": true
        }
      ]
    },
    {
      "name": "Nagaland",
      "slug": "nagaland",
      "code": "NL",
      "type": "STATE",
      "capital": "Kohima",
      "description": "Land of Festivals, featuring Hornbill Festival (Kisama), Kohima War Cemetery, Dzukou Valley, and Dimapur ruins.",
      "latitude": 26.1584,
      "longitude": 94.5624,
      "coverImage": "/state-images/Nagaland/Nagaland_Cover_Page.jpg",
      "cities": [
        {
          "name": "Kohima (Kisama)",
          "slug": "kohima"
        },
        {
          "name": "Dimapur",
          "slug": "dimapur"
        }
      ],
      "destinations": [
        {
          "name": "Kisama Heritage Village (Hornbill Festival)",
          "slug": "kisama-hornbill-festival",
          "city": "Kohima (Kisama)",
          "category": "Culture",
          "subCategory": "Tribal Festival Arena",
          "description": "Venue of the annual December Hornbill Festival showcasing songs, dances, food, and crafts of 17 Naga tribes.",
          "shortDescription": "Host venue of the famous annual Hornbill Festival celebrating 17 Naga tribes.",
          "latitude": 25.6,
          "longitude": 94.11,
          "primaryImageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "November to December",
          "recommendedDays": 2,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Hornbill Festival Ground"
          ]
        },
        {
          "name": "Dzukou Valley & Lily Trails",
          "slug": "dzukou-valley",
          "city": "Kohima (Kisama)",
          "category": "Nature",
          "subCategory": "Trekking Valley",
          "description": "Emerald-green undulating valley at 2,452m famous for rare Dzukou lilies and scenic mountain trekking trails.",
          "shortDescription": "Stunning emerald-green high-altitude trekking valley.",
          "latitude": 25.55,
          "longitude": 94.07,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "June to September",
          "recommendedDays": 2,
          "isNature": true,
          "isAdventure": true
        }
      ]
    },
    {
      "name": "Odisha",
      "slug": "odisha",
      "code": "OR",
      "type": "STATE",
      "capital": "Bhubaneswar",
      "description": "Soul of Incredible India: featuring Puri Jagannath Dham, Konark Sun Temple, Chilika Lake, and Lingaraj Temple.",
      "latitude": 20.9517,
      "longitude": 85.0985,
      "coverImage": "/state-images/Odisha/Odisha_Cover_Page.jpg",
      "cities": [
        {
          "name": "Puri",
          "slug": "puri"
        },
        {
          "name": "Konark",
          "slug": "konark"
        },
        {
          "name": "Bhubaneswar",
          "slug": "bhubaneswar"
        },
        {
          "name": "Chilika",
          "slug": "chilika"
        }
      ],
      "destinations": [
        {
          "name": "Puri Jagannath Temple & Golden Beach",
          "slug": "puri-jagannath-temple",
          "city": "Puri",
          "category": "Spiritual",
          "subCategory": "Char Dham Temple",
          "description": "12th-century Char Dham temple dedicated to Lord Jagannath, Balabhadra, and Subhadra, famous for Ratha Yatra.",
          "shortDescription": "12th-century Char Dham temple of Lord Jagannath famous for Ratha Yatra.",
          "latitude": 19.8047,
          "longitude": 85.818,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isHeritage": true,
          "isBeach": true,
          "isFeatured": true,
          "aliases": [
            "Jagannath Dham",
            "Puri Temple"
          ]
        },
        {
          "name": "Konark Sun Temple",
          "slug": "konark-sun-temple",
          "city": "Konark",
          "category": "Heritage",
          "subCategory": "UNESCO Stone Chariot",
          "description": "13th-century UNESCO World Heritage monumental stone chariot of Sun God Surya carved with 24 intricate wheels.",
          "shortDescription": "13th-century UNESCO World Heritage colossal stone chariot of Sun God.",
          "latitude": 19.8876,
          "longitude": 86.0945,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 40,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Black Pagoda"
          ]
        },
        {
          "name": "Chilika Lake & Irrawaddy Dolphins",
          "slug": "chilika-lake-dolphins",
          "city": "Chilika",
          "category": "Wildlife",
          "subCategory": "Ramsar Lagoon",
          "description": "Asia's largest brackish water lagoon hosting rare Irrawaddy dolphins and 160 species of migratory birds at Nalabana sanctuary.",
          "shortDescription": "Asia's largest brackish lagoon home to Irrawaddy dolphins.",
          "latitude": 19.7,
          "longitude": 85.3167,
          "primaryImageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "November to February",
          "recommendedDays": 1,
          "isWildlife": true,
          "isNature": true
        }
      ]
    },
    {
      "name": "Punjab",
      "slug": "punjab",
      "code": "PB",
      "type": "STATE",
      "capital": "Chandigarh",
      "description": "Land of 5 Rivers & Golden Temple, featuring Golden Temple (Sri Harmandir Sahib), Wagah Border, and Anandpur Sahib.",
      "latitude": 31.1471,
      "longitude": 75.3412,
      "coverImage": "/state-images/Punjab/Punjab_Cover_Page.jpg",
      "cities": [
        {
          "name": "Amritsar",
          "slug": "amritsar"
        },
        {
          "name": "Anandpur Sahib",
          "slug": "anandpur-sahib"
        },
        {
          "name": "Patiala",
          "slug": "patiala"
        }
      ],
      "destinations": [
        {
          "name": "Sri Harmandir Sahib (Golden Temple)",
          "slug": "golden-temple-amritsar",
          "city": "Amritsar",
          "category": "Spiritual",
          "subCategory": "Global Sikh Shrine",
          "description": "The holiest Sikh shrine in the world clad in gold foil, featuring Amrit Sarovar holy pool and world's largest free Langar kitchen.",
          "shortDescription": "Holiest global Sikh shrine covered in gold foil with 24/7 free Langar.",
          "latitude": 31.62,
          "longitude": 74.8765,
          "primaryImageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Golden Temple",
            "Harmandir Sahib"
          ]
        },
        {
          "name": "Wagah Border Beating Retreat Ceremony",
          "slug": "wagah-border-ceremony",
          "city": "Amritsar",
          "category": "Heritage",
          "subCategory": "Patriotic Ceremony",
          "description": "Electrifying daily military ceremony performed jointly by BSF and Pakistan Rangers at the Attari-Wagah border checkpoint.",
          "shortDescription": "Electrifying daily joint military parade at India-Pakistan border.",
          "latitude": 31.6042,
          "longitude": 74.5706,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isHeritage": true,
          "isCulture": true
        },
        {
          "name": "Takht Sri Keshgarh Sahib (Anandpur)",
          "slug": "takht-keshgarh-sahib",
          "city": "Anandpur Sahib",
          "category": "Spiritual",
          "subCategory": "Sikh Takht Shrine",
          "description": "Birthplace of the Khalsa Panth founded by Guru Gobind Singh Ji in 1699, host of the vibrant Hola Mohalla martial festival.",
          "shortDescription": "Birthplace of the Khalsa founded by Guru Gobind Singh Ji in 1699.",
          "latitude": 31.235,
          "longitude": 76.5,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isCulture": true
        }
      ]
    },
    {
      "name": "Rajasthan",
      "slug": "rajasthan",
      "code": "RJ",
      "type": "STATE",
      "capital": "Jaipur",
      "description": "Land of Kings: featuring Jaipur Amber Fort, Hawa Mahal, Udaipur City Palace, Jaisalmer Fort, Pushkar Brahma Temple, and Ranthambore.",
      "latitude": 27.0238,
      "longitude": 74.2179,
      "coverImage": "/state-images/Rajasthan/Rajsthan_Cover _Page.png",
      "cities": [
        {
          "name": "Jaipur",
          "slug": "jaipur"
        },
        {
          "name": "Udaipur",
          "slug": "udaipur"
        },
        {
          "name": "Jaisalmer",
          "slug": "jaisalmer"
        },
        {
          "name": "Jodhpur",
          "slug": "jodhpur"
        },
        {
          "name": "Pushkar",
          "slug": "pushkar"
        },
        {
          "name": "Sawai Madhopur (Ranthambore)",
          "slug": "ranthambore"
        }
      ],
      "destinations": [
        {
          "name": "Pushkar Brahma Temple & Holy Lake",
          "slug": "pushkar-brahma-temple-lake",
          "city": "Pushkar",
          "category": "Spiritual",
          "subCategory": "Brahma Temple & Sacred Sarovar",
          "description": "One of the world's rare temples dedicated to Lord Brahma, situated on sacred Pushkar Sarovar with 52 bathing ghats.",
          "shortDescription": "Rare Lord Brahma temple situated on sacred 52-ghat Pushkar Lake.",
          "latitude": 26.4886,
          "longitude": 74.5509,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Pushkar Lake",
            "Brahma Temple"
          ]
        },
        {
          "name": "Amber Fort & Hawa Mahal (Jaipur)",
          "slug": "amber-fort-hawa-mahal-jaipur",
          "city": "Jaipur",
          "category": "Heritage",
          "subCategory": "UNESCO Hill Fort & Palace",
          "description": "Rajput hillfort architectural marvel overlooking Maota Lake, paired with iconic 953-windowed Hawa Mahal pink sandstone facade.",
          "shortDescription": "UNESCO hillfort palace and iconic 953-window honeycomb Hawa Mahal.",
          "latitude": 26.9855,
          "longitude": 75.8513,
          "primaryImageUrl": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 3,
          "entryFee": 100,
          "isUNESCO": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Pink City Jaipur",
            "Amer Fort",
            "Hawa Mahal"
          ]
        },
        {
          "name": "Udaipur City Palace & Lake Pichola",
          "slug": "udaipur-city-palace-lake-pichola",
          "city": "Udaipur",
          "category": "Heritage",
          "subCategory": "Royal Palace & Lake",
          "description": "City of Lakes flagship royal palace complex blending Rajput and Mughal architecture, with boat cruises past Jag Mandir.",
          "shortDescription": "Majestic City of Lakes royal palace complex on Lake Pichola.",
          "latitude": 24.5764,
          "longitude": 73.6835,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 300,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "City Palace Udaipur",
            "Lake Pichola"
          ]
        },
        {
          "name": "Jaisalmer Golden Fort & Thar Desert",
          "slug": "jaisalmer-fort-sam-dunes",
          "city": "Jaisalmer",
          "category": "Heritage",
          "subCategory": "UNESCO Living Fort",
          "description": "UNESCO World Heritage living golden sandstone fort housing a quarter of the city population, with camel safaris at Sam dunes.",
          "shortDescription": "UNESCO living golden sandstone fort and Thar desert camel safari.",
          "latitude": 26.9124,
          "longitude": 70.9126,
          "primaryImageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 3,
          "isUNESCO": true,
          "isHeritage": true,
          "isAdventure": true
        }
      ]
    },
    {
      "name": "Sikkim",
      "slug": "sikkim",
      "code": "SK",
      "type": "STATE",
      "capital": "Gangtok",
      "description": "Organic Himalayan Paradise, featuring Nathula Pass, Tsomgo Lake, Rumtek Monastery, and Kanchenjunga national park.",
      "latitude": 27.533,
      "longitude": 88.5122,
      "coverImage": "/state-images/Sikkim/Sikkim_Cover_Page.jpg",
      "cities": [
        {
          "name": "Gangtok",
          "slug": "gangtok"
        },
        {
          "name": "Pelling",
          "slug": "pelling"
        },
        {
          "name": "Lachen & Lachung",
          "slug": "yumthang"
        }
      ],
      "destinations": [
        {
          "name": "Rumtek Monastery (Dharma Chakra Centre)",
          "slug": "rumtek-monastery",
          "city": "Gangtok",
          "category": "Spiritual",
          "subCategory": "Tibetan Monastery",
          "description": "Seat of His Holiness the Gyalwang Karmapa, largest monastery in Sikkim housing golden stupas and sacred relics.",
          "shortDescription": "Largest Himalayan monastery in Sikkim housing sacred golden stupas.",
          "latitude": 27.3,
          "longitude": 88.56,
          "primaryImageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "March to June, Sept to Nov",
          "recommendedDays": 2,
          "isReligious": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Dharma Chakra Centre"
          ]
        },
        {
          "name": "Tsomgo Lake & Nathula Pass",
          "slug": "tsomgo-lake-nathula-pass",
          "city": "Gangtok",
          "category": "Nature",
          "subCategory": "Glacial Lake & Indo-China Border",
          "description": "Sacred glacial lake at 12,310ft reflecting snowy peaks, paired with historic Silk Route border pass at 14,140ft.",
          "shortDescription": "High-altitude glacial lake (12,310ft) and Indo-China Silk Route pass.",
          "latitude": 27.38,
          "longitude": 88.76,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "March to May, Oct to Dec",
          "recommendedDays": 1,
          "permitRequired": true,
          "permitType": "Protected Area Permit (PAP)",
          "isNature": true,
          "isAdventure": true
        }
      ]
    },
    {
      "name": "Tamil Nadu",
      "slug": "tamil-nadu",
      "code": "TN",
      "type": "STATE",
      "capital": "Chennai",
      "description": "Land of Temples: featuring Madurai Meenakshi, Rameswaram Ramanathaswamy, Mahabalipuram UNESCO relief, Thanjavur Brihadisvara, and Ooty.",
      "latitude": 11.1271,
      "longitude": 78.6569,
      "coverImage": "/state-images/Tamil_Nadu/Tamil_Nadu_Cover_Page.jpg",
      "cities": [
        {
          "name": "Madurai",
          "slug": "madurai"
        },
        {
          "name": "Rameswaram",
          "slug": "rameswaram"
        },
        {
          "name": "Thanjavur",
          "slug": "thanjavur"
        },
        {
          "name": "Mamallapuram (Mahabalipuram)",
          "slug": "mahabalipuram"
        },
        {
          "name": "Ooty (Udhagamandalam)",
          "slug": "ooty"
        },
        {
          "name": "Chennai",
          "slug": "chennai"
        }
      ],
      "destinations": [
        {
          "name": "Madurai Meenakshi Amman Temple",
          "slug": "madurai-meenakshi-temple",
          "city": "Madurai",
          "category": "Spiritual",
          "subCategory": "Dravidian Masterpiece Temple",
          "description": "Dravidian architectural masterwork with 14 colorful sculpted gopuram towers housing 33,000 stone statues.",
          "shortDescription": "Dravidian architectural masterpiece with 14 towering sculpted gopurams.",
          "latitude": 9.9195,
          "longitude": 78.1193,
          "primaryImageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Meenakshi Amman"
          ]
        },
        {
          "name": "Rameswaram Ramanathaswamy Temple",
          "slug": "rameswaram-temple",
          "city": "Rameswaram",
          "category": "Spiritual",
          "subCategory": "Char Dham & Jyotirlinga Temple",
          "description": "Sacred Char Dham and Jyotirlinga temple famous for its 1,200m carved pillared corridor and 22 holy bathing wells.",
          "shortDescription": "Sacred Char Dham & Jyotirlinga shrine with world's longest pillared corridor.",
          "latitude": 9.2881,
          "longitude": 79.3174,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Rameswaram Jyotirlinga",
            "Pamban Bridge"
          ]
        },
        {
          "name": "Thanjavur Brihadisvara Temple",
          "slug": "thanjavur-brihadisvara-temple",
          "city": "Thanjavur",
          "category": "Heritage",
          "subCategory": "UNESCO Chola Great Temple",
          "description": "1,000-year-old UNESCO World Heritage Chola granite temple featuring a 66-meter Vimana tower carved from single granite block.",
          "shortDescription": "1,000-year-old UNESCO Chola temple carved from massive granite blocks.",
          "latitude": 10.7828,
          "longitude": 79.1318,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "entryFee": 50,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true,
          "aliases": [
            "Big Temple Thanjavur"
          ]
        }
      ]
    },
    {
      "name": "Telangana",
      "slug": "telangana",
      "code": "TS",
      "type": "STATE",
      "capital": "Hyderabad",
      "description": "City of Pearls & Kakatiya Heritage: featuring Charminar, Golconda Fort, Ramappa UNESCO temple, and Yadadri.",
      "latitude": 18.1124,
      "longitude": 79.0193,
      "coverImage": "/state-images/Telangana/Telangana_Cover_Page.jpg",
      "cities": [
        {
          "name": "Hyderabad",
          "slug": "hyderabad"
        },
        {
          "name": "Warangal",
          "slug": "warangal"
        },
        {
          "name": "Yadadri",
          "slug": "yadadri"
        },
        {
          "name": "Palampet (Ramappa)",
          "slug": "ramappa"
        }
      ],
      "destinations": [
        {
          "name": "Yadadri Lakshmi Narasimha Swamy Temple",
          "slug": "yadadri-narasimha-temple",
          "city": "Yadadri",
          "category": "Spiritual",
          "subCategory": "Cave & Mega Temple",
          "description": "Sacred cave temple of Lord Narasimha reconstructed as a monolithic black granite architectural miracle.",
          "shortDescription": "Sacred monolithic black granite hill shrine of Lord Narasimha.",
          "latitude": 17.589,
          "longitude": 78.948,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Yadagirigutta"
          ]
        },
        {
          "name": "Charminar & Golconda Fort (Hyderabad)",
          "slug": "charminar-golconda-hyderabad",
          "city": "Hyderabad",
          "category": "Heritage",
          "subCategory": "Qutb Shahi Monuments",
          "description": "1591 CE iconic 4-minaret monument paired with medieval diamond-trading acoustic fortress of Golconda.",
          "shortDescription": "1591 CE iconic 4-minaret mosque arch and acoustic Golconda fort.",
          "latitude": 17.3616,
          "longitude": 78.4747,
          "primaryImageUrl": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 25,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Charminar",
            "Golconda"
          ]
        },
        {
          "name": "Ramappa UNESCO Temple (Palampet)",
          "slug": "ramappa-unesco-temple",
          "city": "Palampet (Ramappa)",
          "category": "Heritage",
          "subCategory": "UNESCO Kakatiya Temple",
          "description": "13th-century UNESCO World Heritage Kakatiya temple built with floating bricks and intricately carved granite pillars.",
          "shortDescription": "13th-century UNESCO Kakatiya temple built with lightweight floating bricks.",
          "latitude": 18.257,
          "longitude": 79.943,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isUNESCO": true,
          "isHeritage": true,
          "isReligious": true
        }
      ]
    },
    {
      "name": "Tripura",
      "slug": "tripura",
      "code": "TR",
      "type": "STATE",
      "capital": "Agartala",
      "description": "Land of Palaces & Rock Sculptures, featuring Tripura Sundari Temple, Ujjayanta Palace, and Unakoti rock carvings.",
      "latitude": 23.9408,
      "longitude": 91.9882,
      "coverImage": "/state-images/Tripura/Tripura_Cover_Page.jpg",
      "cities": [
        {
          "name": "Agartala",
          "slug": "agartala"
        },
        {
          "name": "Udaipur (Tripura)",
          "slug": "udaipur-tripura"
        },
        {
          "name": "Kailashahar (Unakoti)",
          "slug": "unakoti"
        }
      ],
      "destinations": [
        {
          "name": "Tripura Sundari Temple (Matabari)",
          "slug": "tripura-sundari-temple",
          "city": "Udaipur (Tripura)",
          "category": "Spiritual",
          "subCategory": "Shakti Peeth Temple",
          "description": "500-year-old 51 Shakti Peeth shrine shaped like a tortoise (Kurma Pitha), highly revered in Eastern Tantric tradition.",
          "shortDescription": "500-year-old Shakti Peeth shrine shaped like a tortoise in Matabari.",
          "latitude": 23.53,
          "longitude": 91.49,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Matabari Temple"
          ]
        },
        {
          "name": "Unakoti Rock-Cut Bas-Reliefs",
          "slug": "unakoti-rock-sculptures",
          "city": "Kailashahar (Unakoti)",
          "category": "Heritage",
          "subCategory": "Rock Carvings",
          "description": "7th-9th century Shiva pilgrimage site featuring giant rock carvings carved into forest hillsides.",
          "shortDescription": "Colossal 7th-century forest rock carvings of Lord Shiva.",
          "latitude": 24.32,
          "longitude": 92.08,
          "primaryImageUrl": "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isHeritage": true,
          "isReligious": true
        }
      ]
    },
    {
      "name": "Uttar Pradesh",
      "slug": "uttar-pradesh",
      "code": "UP",
      "type": "STATE",
      "capital": "Lucknow",
      "description": "Heartland of Faith & Heritage: featuring Ayodhya Ram Mandir, Varanasi Kashi Vishwanath, Taj Mahal, Mathura Vrindavan, and Sarnath.",
      "latitude": 26.8467,
      "longitude": 80.9462,
      "coverImage": "/state-images/Uttar_Pradesh/Uttar_Pradesh_Cover_Page.jpg",
      "cities": [
        {
          "name": "Varanasi",
          "slug": "varanasi"
        },
        {
          "name": "Ayodhya",
          "slug": "ayodhya"
        },
        {
          "name": "Agra",
          "slug": "agra"
        },
        {
          "name": "Mathura & Vrindavan",
          "slug": "mathura-vrindavan"
        },
        {
          "name": "Lucknow",
          "slug": "lucknow"
        },
        {
          "name": "Prayagraj",
          "slug": "prayagraj"
        }
      ],
      "destinations": [
        {
          "name": "Varanasi Ghats & Kashi Vishwanath",
          "slug": "varanasi-ghats-kashi-vishwanath",
          "city": "Varanasi",
          "category": "Spiritual",
          "subCategory": "Jyotirlinga & Holy Ghats",
          "description": "Spiritual capital of India famous for sacred Ganga Aarti at Dashashwamedh Ghat and golden-spired Kashi Vishwanath Jyotirlinga.",
          "shortDescription": "Spiritual capital of India famous for Ganga Aarti and Kashi Vishwanath.",
          "latitude": 25.3176,
          "longitude": 82.9739,
          "primaryImageUrl": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 3,
          "isReligious": true,
          "isHeritage": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Kashi",
            "Banaras",
            "Vishwanath Temple"
          ]
        },
        {
          "name": "Ayodhya Shri Ram Janmabhoomi Mandir",
          "slug": "ayodhya-ram-mandir",
          "city": "Ayodhya",
          "category": "Spiritual",
          "subCategory": "Grand Ram Mandir",
          "description": "Sacred birthplace shrine of Lord Ram along Saryu riverfront, featuring monumental Nagara architecture and Ram Ki Paidi.",
          "shortDescription": "Sacred birthplace shrine of Lord Ram along Saryu riverfront.",
          "latitude": 26.7956,
          "longitude": 82.1943,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Ram Mandir Ayodhya",
            "Ram Janmabhoomi"
          ]
        },
        {
          "name": "Mathura Vrindavan Banke Bihari Temple",
          "slug": "mathura-vrindavan-temple",
          "city": "Mathura & Vrindavan",
          "category": "Spiritual",
          "subCategory": "Krishna Janmabhoomi & Temples",
          "description": "Birthplace of Lord Krishna at Shri Krishna Janmabhoomi, plus Banke Bihari and Prem Mandir in Vrindavan.",
          "shortDescription": "Birthplace of Lord Krishna & sacred Vrindavan Banke Bihari shrine.",
          "latitude": 27.4924,
          "longitude": 77.6737,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Vrindavan",
            "Prem Mandir"
          ]
        },
        {
          "name": "Taj Mahal & Agra Fort",
          "slug": "taj-mahal-agra-fort",
          "city": "Agra",
          "category": "Heritage",
          "subCategory": "UNESCO Wonder of the World",
          "description": "Universal wonder of the world and UNESCO white marble monument to love, paired with red sandstone Agra Fort.",
          "shortDescription": "Universal wonder of the world and UNESCO white marble monument.",
          "latitude": 27.1751,
          "longitude": 78.0421,
          "primaryImageUrl": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 50,
          "isUNESCO": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Taj Mahal"
          ]
        }
      ]
    },
    {
      "name": "Uttarakhand",
      "slug": "uttarakhand",
      "code": "UK",
      "type": "STATE",
      "capital": "Dehradun",
      "description": "Devbhoomi (Land of Gods): featuring Kedarnath Dham, Badrinath Dham, Rishikesh, Haridwar Ganga Aarti, Nainital, and Jim Corbett National Park.",
      "latitude": 30.0668,
      "longitude": 79.0193,
      "coverImage": "/state-images/Uttarakhand/Uttarakhand_Cover_Page.jpg",
      "cities": [
        {
          "name": "Kedarnath",
          "slug": "kedarnath"
        },
        {
          "name": "Badrinath",
          "slug": "badrinath"
        },
        {
          "name": "Rishikesh",
          "slug": "rishikesh"
        },
        {
          "name": "Haridwar",
          "slug": "haridwar"
        },
        {
          "name": "Nainital",
          "slug": "nainital"
        },
        {
          "name": "Ramnagar (Corbett)",
          "slug": "corbett"
        }
      ],
      "destinations": [
        {
          "name": "Kedarnath Dham Temple",
          "slug": "kedarnath-dham-temple",
          "city": "Kedarnath",
          "category": "Spiritual",
          "subCategory": "Char Dham & Jyotirlinga",
          "description": "Sacred 8th-century Lord Shiva Char Dham and Jyotirlinga temple standing at 11,755 ft set against snowy Himalayan peaks.",
          "shortDescription": "Sacred 8th-century Shiva Char Dham & Jyotirlinga temple at 11,755 ft.",
          "latitude": 30.7352,
          "longitude": 79.0669,
          "primaryImageUrl": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "May to October",
          "recommendedDays": 3,
          "isReligious": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Kedarnath Temple",
            "Kedar Dham"
          ]
        },
        {
          "name": "Badrinath Dham Temple",
          "slug": "badrinath-dham-temple",
          "city": "Badrinath",
          "category": "Spiritual",
          "subCategory": "Char Dham Temple",
          "description": "Sacred Char Dham shrine of Lord Vishnu nestled between Nar and Narayan mountain ranges along Alaknanda river.",
          "shortDescription": "Sacred Char Dham Vishnu shrine nestled between Nar & Narayan peaks.",
          "latitude": 30.7433,
          "longitude": 79.4938,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "May to October",
          "recommendedDays": 2,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Badrinath Temple"
          ]
        },
        {
          "name": "Haridwar Har Ki Pauri & Ganga Aarti",
          "slug": "haridwar-har-ki-pauri",
          "city": "Haridwar",
          "category": "Spiritual",
          "subCategory": "Holy Ganga Ghat",
          "description": "Gateway to Gods on the banks of Ganges, famous for the magical evening Ganga Aarti at Har Ki Pauri ghat.",
          "shortDescription": "Sacred Ganges ghat famous for world-renowned evening Ganga Aarti.",
          "latitude": 29.956,
          "longitude": 78.17,
          "primaryImageUrl": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to May",
          "recommendedDays": 2,
          "isReligious": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Har Ki Pauri"
          ]
        },
        {
          "name": "Rishikesh Yoga & Ganges Rafting Capital",
          "slug": "rishikesh-yoga-rafting",
          "city": "Rishikesh",
          "category": "Adventure",
          "subCategory": "Yoga & River Rafting",
          "description": "World Yoga Capital featuring iconic Laxman Jhula, Ganges white-water river rafting, and Beatles Ashram.",
          "shortDescription": "World Yoga Capital famous for Ganges river rafting and ashrams.",
          "latitude": 30.0869,
          "longitude": 78.2676,
          "primaryImageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "September to May",
          "recommendedDays": 3,
          "isAdventure": true,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Laxman Jhula",
            "Rishikesh Rafting"
          ]
        }
      ]
    },
    {
      "name": "West Bengal",
      "slug": "west-bengal",
      "code": "WB",
      "type": "STATE",
      "capital": "Kolkata",
      "description": "Cultural Capital: featuring Kalighat & Dakshineswar Kali temples, Victoria Memorial, Darjeeling toy train, and Sundarbans tigers.",
      "latitude": 22.9868,
      "longitude": 87.855,
      "coverImage": "/state-images/West_Bengal/West_Bengal_Cover_Page.jpg",
      "cities": [
        {
          "name": "Kolkata",
          "slug": "kolkata"
        },
        {
          "name": "Darjeeling",
          "slug": "darjeeling"
        },
        {
          "name": "Gosaba (Sundarbans)",
          "slug": "sundarbans"
        }
      ],
      "destinations": [
        {
          "name": "Dakshineswar & Kalighat Kali Temples",
          "slug": "dakshineswar-kalighat-temples",
          "city": "Kolkata",
          "category": "Spiritual",
          "subCategory": "Shakti Peeth Temples",
          "description": "Sacred 51 Shakti Peeth at Kalighat and historic 19th-century Navaratna Dakshineswar Kali temple on Hooghly river.",
          "shortDescription": "Sacred 51 Shakti Peeth and historic Ramakrishna-associated Kali temple.",
          "latitude": 22.655,
          "longitude": 88.357,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Dakshineswar Temple",
            "Kalighat"
          ]
        },
        {
          "name": "Victoria Memorial & Howrah Bridge (Kolkata)",
          "slug": "victoria-memorial-howrah-bridge-kolkata",
          "city": "Kolkata",
          "category": "Heritage",
          "subCategory": "Colonial Marble Palace & Bridge",
          "description": "Colonial white marble palace museum set in lush gardens, paired with the iconic engineering cantilever Howrah Bridge.",
          "shortDescription": "Colonial white marble palace museum and iconic Howrah Bridge.",
          "latitude": 22.5448,
          "longitude": 88.3426,
          "primaryImageUrl": "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 3,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Calcutta",
            "Howrah Bridge"
          ]
        },
        {
          "name": "Darjeeling Himalayan Railway & Tiger Hill",
          "slug": "darjeeling-himalayan-railway-tiger-hill",
          "city": "Darjeeling",
          "category": "Nature",
          "subCategory": "UNESCO Toy Train & Hill Station",
          "description": "UNESCO World Heritage steam toy train and spectacular sunrise views of Kanchenjunga peaks over tea gardens.",
          "shortDescription": "UNESCO steam toy train and sunrise over Kanchenjunga peaks.",
          "latitude": 27.041,
          "longitude": 88.2663,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to May",
          "recommendedDays": 3,
          "isUNESCO": true,
          "isNature": true,
          "isFeatured": true
        }
      ]
    },
    {
      "name": "Andaman & Nicobar Islands",
      "slug": "andaman-nicobar-islands",
      "code": "AN",
      "type": "UNION_TERRITORY",
      "capital": "Port Blair",
      "description": "Tropical Island Paradise: featuring Radhanagar Beach, Cellular Jail, Havelock Scuba Diving, and Neil Island.",
      "latitude": 11.7401,
      "longitude": 92.6586,
      "coverImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "cities": [
        {
          "name": "Port Blair",
          "slug": "port-blair"
        },
        {
          "name": "Havelock Island (Swaraj Dweep)",
          "slug": "havelock"
        },
        {
          "name": "Neil Island (Shaheed Dweep)",
          "slug": "neil-island"
        }
      ],
      "destinations": [
        {
          "name": "Radhanagar Beach & Havelock Scuba",
          "slug": "radhanagar-beach-havelock",
          "city": "Havelock Island (Swaraj Dweep)",
          "category": "Beach & Coastal",
          "subCategory": "Tropical Beach & Scuba",
          "description": "Voted Asia's best beach with turquoise waters and white sand, premier destination for coral reef scuba diving.",
          "shortDescription": "Voted Asia's best turquoise beach with world-class scuba diving.",
          "latitude": 11.98,
          "longitude": 92.95,
          "primaryImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to May",
          "recommendedDays": 3,
          "isBeach": true,
          "isAdventure": true,
          "isFeatured": true,
          "aliases": [
            "Havelock Island",
            "Radhanagar Beach"
          ]
        },
        {
          "name": "Cellular Jail National Memorial (Port Blair)",
          "slug": "cellular-jail-port-blair",
          "city": "Port Blair",
          "category": "Heritage",
          "subCategory": "National Memorial",
          "description": "Historic 1906 colonial prison memorial where Indian freedom fighters were exiled, famous for sound & light show.",
          "shortDescription": "Historic 1906 national freedom memorial prison in Port Blair.",
          "latitude": 11.6738,
          "longitude": 92.7473,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to May",
          "recommendedDays": 1,
          "isHeritage": true
        }
      ]
    },
    {
      "name": "Chandigarh",
      "slug": "chandigarh",
      "code": "CH",
      "type": "UNION_TERRITORY",
      "capital": "Chandigarh",
      "description": "The City Beautiful: featuring Nek Chand's Rock Garden, Sukhna Lake, and Capitol Complex UNESCO heritage.",
      "latitude": 30.7333,
      "longitude": 76.7794,
      "coverImage": "/state-images/Chandigarh/Chandigarh_Cover_Page.png",
      "cities": [
        {
          "name": "Chandigarh",
          "slug": "chandigarh"
        }
      ],
      "destinations": [
        {
          "name": "Nek Chand Rock Garden & Sukhna Lake",
          "slug": "rock-garden-sukhna-lake",
          "city": "Chandigarh",
          "category": "Heritage",
          "subCategory": "Sculpture Garden & Lake",
          "description": "20-acre eco-friendly sculpture garden created entirely from industrial waste materials, paired with picturesque Sukhna Lake.",
          "shortDescription": "Unique 20-acre sculpture garden crafted entirely from recycled waste.",
          "latitude": 30.7525,
          "longitude": 76.8066,
          "primaryImageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isHeritage": true,
          "isNature": true,
          "isFeatured": true
        }
      ]
    },
    {
      "name": "Dadra & Nagar Haveli and Daman & Diu",
      "slug": "dadra-nagar-haveli-daman-diu",
      "code": "DN",
      "type": "UNION_TERRITORY",
      "capital": "Daman",
      "description": "Coastal Portuguese enclave: featuring Diu Fort, Naida Caves, Devka Beach, and Moti Daman Fort.",
      "latitude": 20.4283,
      "longitude": 72.8397,
      "coverImage": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      "cities": [
        {
          "name": "Daman",
          "slug": "daman"
        },
        {
          "name": "Diu",
          "slug": "diu"
        },
        {
          "name": "Silvassa",
          "slug": "silvassa"
        }
      ],
      "destinations": [
        {
          "name": "Diu Fort & Naida Caves",
          "slug": "diu-fort-naida-caves",
          "city": "Diu",
          "category": "Heritage",
          "subCategory": "Portuguese Fort & Sea Caves",
          "description": "1535 CE Portuguese sea fort surrounded by ocean water on 3 sides, featuring labyrinthine rock-cut Naida Caves.",
          "shortDescription": "1535 Portuguese ocean fort and labyrinthine rock-cut Naida Caves.",
          "latitude": 20.7144,
          "longitude": 70.9875,
          "primaryImageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isHeritage": true,
          "isBeach": true,
          "isFeatured": true
        }
      ]
    },
    {
      "name": "Delhi",
      "slug": "delhi",
      "code": "DL",
      "type": "UNION_TERRITORY",
      "capital": "New Delhi",
      "description": "Capital City of India: featuring Akshardham Temple, Red Fort, Qutub Minar, India Gate, Lotus Temple, and Chandni Chowk.",
      "latitude": 28.6139,
      "longitude": 77.209,
      "coverImage": "/state-images/Delhi/Delhi_Cover_Page.png",
      "cities": [
        {
          "name": "New Delhi",
          "slug": "new-delhi"
        },
        {
          "name": "Old Delhi",
          "slug": "old-delhi"
        }
      ],
      "destinations": [
        {
          "name": "Swaminarayan Akshardham Temple (Delhi)",
          "slug": "swaminarayan-akshardham-delhi",
          "city": "New Delhi",
          "category": "Spiritual",
          "subCategory": "Vast Cultural Complex",
          "description": "World's largest comprehensive Hindu temple complex built from pink sandstone and marble along Yamuna River.",
          "shortDescription": "World's largest carved sandstone Hindu temple complex on Yamuna bank.",
          "latitude": 28.6127,
          "longitude": 77.2773,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 1,
          "isReligious": true,
          "isHeritage": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Delhi Akshardham"
          ]
        },
        {
          "name": "Red Fort & India Gate",
          "slug": "red-fort-india-gate-delhi",
          "city": "New Delhi",
          "category": "Heritage",
          "subCategory": "UNESCO Mughal Fort & Memorial",
          "description": "UNESCO red sandstone Mughal citadel paired with national war memorial arch and Kartavya Path boulevard.",
          "shortDescription": "UNESCO red sandstone Mughal fort and national war memorial.",
          "latitude": 28.6562,
          "longitude": 77.241,
          "primaryImageUrl": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "entryFee": 50,
          "isUNESCO": true,
          "isHeritage": true,
          "isFeatured": true,
          "aliases": [
            "Lal Qila",
            "India Gate"
          ]
        }
      ]
    },
    {
      "name": "Jammu & Kashmir",
      "slug": "jammu-kashmir",
      "code": "JK",
      "type": "UNION_TERRITORY",
      "capital": "Srinagar",
      "description": "Paradise on Earth: featuring Vaishno Devi Dham, Dal Lake Srinagar, Gulmarg Gondola skiing, and Pahalgam.",
      "latitude": 33.7782,
      "longitude": 76.5762,
      "coverImage": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
      "cities": [
        {
          "name": "Srinagar",
          "slug": "srinagar"
        },
        {
          "name": "Gulmarg",
          "slug": "gulmarg"
        },
        {
          "name": "Katra (Vaishno Devi)",
          "slug": "katra"
        },
        {
          "name": "Pahalgam",
          "slug": "pahalgam"
        }
      ],
      "destinations": [
        {
          "name": "Shri Mata Vaishno Devi Shrine (Katra)",
          "slug": "mata-vaishno-devi-katra",
          "city": "Katra (Vaishno Devi)",
          "category": "Spiritual",
          "subCategory": "Holy Cave Shrine",
          "description": "Sacred holy cave shrine dedicated to Mata Vaishno Devi at 5,200 ft in Trikuta Mountains, visited by millions annually.",
          "shortDescription": "Sacred holy cave shrine in Trikuta Mountains drawing millions of pilgrims.",
          "latitude": 33.0308,
          "longitude": 74.949,
          "primaryImageUrl": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "Year-round",
          "recommendedDays": 2,
          "isReligious": true,
          "isFeatured": true,
          "aliases": [
            "Vaishno Devi",
            "Katra Shrine"
          ]
        },
        {
          "name": "Dal Lake & Houseboats (Srinagar)",
          "slug": "dal-lake-srinagar",
          "city": "Srinagar",
          "category": "Nature",
          "subCategory": "Alpine Lake & Shikara",
          "description": "Iconic Himalayan lake famous for wooden Shikara boat rides, floating vegetable markets, and Mughal gardens.",
          "shortDescription": "Iconic Himalayan lake famous for Shikara rides and floating markets.",
          "latitude": 34.11,
          "longitude": 74.87,
          "primaryImageUrl": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "April to October",
          "recommendedDays": 3,
          "isNature": true,
          "isFeatured": true,
          "aliases": [
            "Srinagar Lake",
            "Shikara Ride"
          ]
        }
      ]
    },
    {
      "name": "Ladakh",
      "slug": "ladakh",
      "code": "LA",
      "type": "UNION_TERRITORY",
      "capital": "Leh",
      "description": "Land of High Passes: featuring Pangong Tso, Nubra Valley, Hemis Monastery, Khardung La, and Magnetic Hill.",
      "latitude": 34.1526,
      "longitude": 77.5771,
      "coverImage": "/state-images/Ladakh/Ladakh_Cover_Page.jpg",
      "cities": [
        {
          "name": "Leh",
          "slug": "leh"
        },
        {
          "name": "Diskit (Nubra)",
          "slug": "diskit"
        },
        {
          "name": "Kargil",
          "slug": "kargil"
        }
      ],
      "destinations": [
        {
          "name": "Hemis & Thiksey Monasteries",
          "slug": "hemis-thiksey-monasteries",
          "city": "Leh",
          "category": "Spiritual",
          "subCategory": "Himalayan Monasteries",
          "description": "17th-century Drukpa lineage Hemis monastery hosting the annual Hemis festival, paired with 12-story Thiksey gompa.",
          "shortDescription": "Iconic 12-story Himalayan Buddhist monasteries overlooking Leh valley.",
          "latitude": 33.9125,
          "longitude": 77.7019,
          "primaryImageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "May to September",
          "recommendedDays": 2,
          "isReligious": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Hemis Gompa",
            "Thiksey Monastery"
          ]
        },
        {
          "name": "Pangong Tso Lake & Nubra Valley",
          "slug": "pangong-tso-lake",
          "city": "Leh",
          "category": "Nature",
          "subCategory": "High Altitude Lake & Pass",
          "description": "Stunning high-altitude brackish lake at 13,862 ft shifting through turquoise blue shades, reached via Khardung La pass.",
          "shortDescription": "Stunning high-altitude lake at 13,862 ft known for shifting blue shades.",
          "latitude": 33.7595,
          "longitude": 78.6674,
          "primaryImageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "May to September",
          "recommendedDays": 3,
          "permitRequired": true,
          "permitType": "Inner Line Permit",
          "isNature": true,
          "isAdventure": true,
          "isFeatured": true
        }
      ]
    },
    {
      "name": "Lakshadweep",
      "slug": "lakshadweep",
      "code": "LD",
      "type": "UNION_TERRITORY",
      "capital": "Kavaratti",
      "description": "Coral Paradise of India: featuring Bangaram Atoll, Agatti Island, Kavaratti lagoon, and coral diving.",
      "latitude": 10.5667,
      "longitude": 72.6417,
      "coverImage": "/state-images/Lakshadweep/Lakshadweep_Cover_Page.jpg",
      "cities": [
        {
          "name": "Kavaratti",
          "slug": "kavaratti"
        },
        {
          "name": "Bangaram Island",
          "slug": "bangaram"
        },
        {
          "name": "Agatti Island",
          "slug": "agatti"
        }
      ],
      "destinations": [
        {
          "name": "Bangaram Island Coral Atoll",
          "slug": "bangaram-island-coral-atoll",
          "city": "Bangaram Island",
          "category": "Beach & Coastal",
          "subCategory": "Uninhabited Coral Atoll",
          "description": "Tear-drop shaped uninhabited island lagoon enclosed by coral reefs, bioluminescent sea waters, and scuba diving reefs.",
          "shortDescription": "Uninhabited coral island lagoon with bioluminescent waters and scuba reefs.",
          "latitude": 10.9333,
          "longitude": 72.2833,
          "primaryImageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to May",
          "recommendedDays": 3,
          "permitRequired": true,
          "permitType": "Lakshadweep Entry Permit",
          "isBeach": true,
          "isNature": true,
          "isAdventure": true,
          "isFeatured": true
        }
      ]
    },
    {
      "name": "Puducherry",
      "slug": "puducherry",
      "code": "PY",
      "type": "UNION_TERRITORY",
      "capital": "Puducherry",
      "description": "French Riviera of the East: featuring Auroville Matrimandir, Promenade Beach, French Quarter (White Town), and Sri Aurobindo Ashram.",
      "latitude": 11.9416,
      "longitude": 79.8083,
      "coverImage": "/state-images/Puducherry/Puducherry_Cover_Page.jpg",
      "cities": [
        {
          "name": "Puducherry",
          "slug": "puducherry"
        },
        {
          "name": "Auroville",
          "slug": "auroville"
        }
      ],
      "destinations": [
        {
          "name": "Auroville Matrimandir & French Quarter",
          "slug": "auroville-matrimandir-french-quarter",
          "city": "Auroville",
          "category": "Spiritual",
          "subCategory": "Universal Town & Golden Globe",
          "description": "Universal experimental township featuring the golden metallic Matrimandir globe, Sri Aurobindo Ashram, and yellow French colonial villas.",
          "shortDescription": "Universal experimental township with golden Matrimandir globe & French quarter.",
          "latitude": 12.0069,
          "longitude": 79.8106,
          "primaryImageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
          "bestTimeToVisit": "October to March",
          "recommendedDays": 2,
          "isReligious": true,
          "isHeritage": true,
          "isCulture": true,
          "isFeatured": true,
          "aliases": [
            "Matrimandir",
            "Pondicherry French Town"
          ]
        }
      ]
    }
  ]
};

export const ALL_STATES: string[] = [
  'All States',
  ...MASTER_INDIA_DATA.states.map((s) => s.name)
];

export const STATE_CITIES_MAP: Record<string, string[]> = {
  ...Object.fromEntries(
    MASTER_INDIA_DATA.states.map((s) => [
      s.name,
      ['All Cities', ...s.cities.map((c) => c.name)]
    ])
  )
};

export const MASTER_DESTINATIONS: DestinationItem[] = MASTER_INDIA_DATA.states.flatMap(
  (s) =>
    s.destinations.map((d) => ({
      ...d,
      state: s.name,
      currency: 'INR'
    }))
);

export const CATEGORIES = [
  'All Categories',
  'Spiritual',
  'Heritage',
  'Nature',
  'Wildlife',
  'Beach & Coastal',
  'Adventure',
  'Culture',
] as const;

export function isCategoryMatch(dest: DestinationItem, selectedCategory: string): boolean {
  if (!selectedCategory || selectedCategory === 'All Categories') return true;
  const catLower = selectedCategory.toLowerCase().trim();

  // 1. Direct category match
  if (dest.category?.toLowerCase() === catLower || dest.category?.toLowerCase().includes(catLower)) {
    return true;
  }

  // 2. SubCategory match
  if (dest.subCategory?.toLowerCase().includes(catLower)) {
    return true;
  }

  // 3. Flag and key pattern matching
  if (catLower === 'spiritual') {
    return (
      !!dest.isReligious ||
      /spiritual|temple|monastery|gurudwara|shrine|jyotirlinga|dham|darshan|church|cathedral|mosque|yatra|ashram/i.test(
        `${dest.name} ${dest.category} ${dest.subCategory || ''} ${dest.description}`
      )
    );
  }

  if (catLower === 'heritage') {
    return (
      !!dest.isHeritage ||
      !!dest.isUNESCO ||
      /heritage|fort|palace|ruins|archaeological|monument|museum|stepwell|vav|caves|tomb|gopuram|chariot/i.test(
        `${dest.name} ${dest.category} ${dest.subCategory || ''} ${dest.description}`
      )
    );
  }

  if (catLower === 'nature') {
    return (
      !!dest.isNature ||
      /nature|hill|valley|lake|waterfall|peak|pass|forest|river|desert|atoll|lagoon|spring/i.test(
        `${dest.name} ${dest.category} ${dest.subCategory || ''} ${dest.description}`
      )
    );
  }

  if (catLower === 'wildlife') {
    return (
      !!dest.isWildlife ||
      /wildlife|national park|sanctuary|tiger|lion|rhino|zoo|safari|biodiversity|birds|deer/i.test(
        `${dest.name} ${dest.category} ${dest.subCategory || ''} ${dest.description}`
      )
    );
  }

  if (catLower.includes('beach') || catLower.includes('coastal')) {
    return (
      !!dest.isBeach ||
      /beach|coastal|coast|island|sea|ocean|backwater|port|lagoon|atoll|blue flag/i.test(
        `${dest.name} ${dest.category} ${dest.subCategory || ''} ${dest.description}`
      )
    );
  }

  if (catLower === 'adventure') {
    return (
      !!dest.isAdventure ||
      /adventure|rafting|trek|paragliding|skiing|scuba|safari|canyon|pass|watersports/i.test(
        `${dest.name} ${dest.category} ${dest.subCategory || ''} ${dest.description}`
      )
    );
  }

  if (catLower === 'culture') {
    return (
      !!dest.isCulture ||
      /culture|tribal|tribe|festival|utsav|art|craft|bazaar|market|handicraft|heritage/i.test(
        `${dest.name} ${dest.category} ${dest.subCategory || ''} ${dest.description}`
      )
    );
  }

  return false;
}
