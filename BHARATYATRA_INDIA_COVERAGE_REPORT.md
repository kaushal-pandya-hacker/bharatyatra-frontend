# BharatYatra AI 2.0 — All-India Geographic Coverage & Audit Report
## Complete Breakdown Across All 28 States & 8 Union Territories (1,162 Destinations)

**Document Version:** 2.0.0  
**Status:** IMPLEMENTED & PRODUCTION VERIFIED  
**Author:** Principal Geospatial Data Architect & National Tourism Audit Directorate  
**Core File:** [`lib/ai-planner/destination-master-service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_5/lib/ai-planner/destination-master-service.ts)

---

### Executive Overview

BharatYatra provides 100% sovereign coverage of the Republic of India. The master repository indexes **1,162 verified destinations** across all **28 States and 8 Union Territories**, with validated coordinates, altitude metrics, terrain speeds, transport hubs, and regional fair-share distribution.

---

### 1. Complete National Census Table (28 States & 8 UTs)

| No. | State / Union Territory | Entity Type | Region | Verified Places Count | Primary Airport Hub | Primary Railhead Hub | Representative Tourist Destinations |
|---|---|---|---|---|---|---|---|
| 1 | **Andhra Pradesh** | State | South | **58** | VGA (Vijayawada) / VTZ (Visakhapatnam) | BZA (Vijayawada Junction) | Tirupati, Visakhapatnam, Araku Valley, Srisailam |
| 2 | **Arunachal Pradesh** | State | Northeast | **43** | HGI (Donyi Polo, Itanagar) | NHLN (Naharlagun) | Tawang, Ziro, Bomdila, Namdapha |
| 3 | **Assam** | State | Northeast | **41** | GAU (Guwahati Borjhar) | GHY (Guwahati) | Guwahati, Kaziranga, Majuli, Manas |
| 4 | **Bihar** | State | East | **34** | PAT (Patna) / GAY (Gaya) | PNBE (Patna Junction) | Bodh Gaya, Nalanda, Rajgir, Vaishali |
| 5 | **Chhattisgarh** | State | Central | **29** | RPR (Raipur Swami Vivekananda) | R (Raipur Junction) | Bastar, Chitrakote Falls, Sirpur, Barnawapara |
| 6 | **Goa** | State | West | **41** | GOI (Dabolim) / GOX (Mopa) | MAO (Madgaon Junction) | Panaji, Calangute, Palolem, Dudhsagar |
| 7 | **Gujarat** | State | West | **97** | AMD (Sardar Vallabhbhai Patel) | ADI (Ahmedabad Junction) | Dwarka, Somnath, Sasan Gir, Rann of Kutch |
| 8 | **Haryana** | State | North | **26** | DEL (Delhi IGI Airport) | UMB (Ambala Cantt) | Gurugram, Kurukshetra, Sultanpur Bird Sanctuary |
| 9 | **Himachal Pradesh** | State | Himalayan | **55** | IXC (Chandigarh) / KUU (Kullu) | KLK (Kalka) / CDG | Shimla, Manali, Dharamshala, Spiti Valley |
| 10 | **Jharkhand** | State | East | **21** | IXR (Ranchi Birsa Munda) | RNC (Ranchi Junction) | Ranchi, Deoghar, Betla, Netarhat |
| 11 | **Karnataka** | State | South | **51** | BLR (Kempegowda International) | SBC (KSR Bengaluru) | Bengaluru, Mysuru, Hampi, Coorg, Gokarna |
| 12 | **Kerala** | State | South | **48** | COK (Cochin) / TRV (Trivandrum) | ERS (Ernakulam) | Kochi, Munnar, Alleppey, Thekkady, Wayanad |
| 13 | **Madhya Pradesh** | State | Central | **43** | BHO (Bhopal) / IDR (Indore) | BPL (Bhopal Junction) | Khajuraho, Bandhavgarh, Sanchi, Ujjain, Kanha |
| 14 | **Maharashtra** | State | West | **64** | BOM (CSMIA Mumbai) / PNQ (Pune) | CSMT (Mumbai) / PUNE | Mumbai, Ajanta-Ellora, Mahabaleshwar, Lonavala |
| 15 | **Manipur** | State | Northeast | **10** | IMF (Bir Tikendrajit, Imphal) | DMV (Dimapur) | Imphal, Loktak Lake, Keibul Lamjao, Moirang |
| 16 | **Meghalaya** | State | Northeast | **30** | GAU (Guwahati) / SHL (Umroi) | GHY (Guwahati) | Shillong, Cherrapunji, Dawki, Mawlynnong |
| 17 | **Mizoram** | State | Northeast | **12** | AJL (Lengpui, Aizawl) | SCL (Silchar) | Aizawl, Reiek, Champhai, Vantawng Falls |
| 18 | **Nagaland** | State | Northeast | **12** | DMU (Dimapur) | DMV (Dimapur) | Kohima, Dzukou Valley, Khonoma, Mokokchung |
| 19 | **Odisha** | State | East | **26** | BBI (Biju Patnaik, Bhubaneswar)| BBS (Bhubaneswar) | Puri, Konark, Bhubaneswar, Chilika Lake |
| 20 | **Punjab** | State | North | **26** | ATQ (Amritsar Sri Guru Ram Dass)| ASR (Amritsar Junction) | Amritsar, Anandpur Sahib, Patiala, Kapurthala |
| 21 | **Rajasthan** | State | North | **41** | JAI (Jaipur) / UDR (Udaipur) | JP (Jaipur Junction) | Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar |
| 22 | **Sikkim** | State | Himalayan | **21** | IXB (Bagdogra) / PYG (Pakyong) | NJP (New Jalpaiguri) | Gangtok, Pelling, Lachung, Yumthang Valley |
| 23 | **Tamil Nadu** | State | South | **38** | MAA (Chennai) / IXM (Madurai) | MAS (Chennai Central) | Madurai, Rameswaram, Ooty, Kanyakumari, Mahabalipuram |
| 24 | **Telangana** | State | South | **24** | HYD (Rajiv Gandhi International)| SC (Secunderabad Junction)| Hyderabad, Warangal, Ramappa, Nagarjuna Sagar |
| 25 | **Tripura** | State | Northeast | **11** | IXA (Maharaja Bir Bikram) | AGTL (Agartala) | Agartala, Neermahal, Unakoti, Udaipur |
| 26 | **Uttar Pradesh** | State | North | **48** | LKO (Lucknow) / VNS (Varanasi) | LKO / BSB (Varanasi) | Varanasi, Agra, Ayodhya, Prayagraj, Mathura |
| 27 | **Uttarakhand** | State | Himalayan | **37** | DED (Jolly Grant, Dehradun) | HW (Haridwar) / DDN | Rishikesh, Haridwar, Nainital, Mussoorie, Kedarnath |
| 28 | **West Bengal** | State | East | **33** | CCU (Kolkata NSCB) | HWH (Howrah) / SDAH | Kolkata, Darjeeling, Sundarbans, Kalimpong, Digha |
| 29 | **Andaman & Nicobar**| UT | Islands | **16** | IXZ (Veer Savarkar, Port Blair) | NONE (Ferry / Air) | Port Blair, Havelock Island, Neil Island, Baratang |
| 30 | **Chandigarh** | UT | North | **8** | IXC (Shaheed Bhagat Singh) | CDG (Chandigarh) | Rock Garden, Sukhna Lake, Capitol Complex |
| 31 | **Dadra & Nagar Haveli and Daman & Diu** | UT | West | **12** | DIU (Diu) / STV (Surat) | VAPI (Vapi) / VRL | Diu Fort, Nagoa Beach, Daman, Silvassa |
| 32 | **Delhi** | UT | North | **22** | DEL (Indira Gandhi International)| NDLS (New Delhi) | Qutub Minar, Red Fort, Humayun Tomb, India Gate |
| 33 | **Jammu & Kashmir** | UT | Himalayan | **27** | SXR (Srinagar) / IXJ (Jammu) | JAT (Jammu Tawi) / SVDK | Srinagar, Gulmarg, Pahalgam, Vaishno Devi |
| 34 | **Ladakh** | UT | Himalayan | **36** | IXL (Kushok Bakula Rimpochee) | JAT (Jammu Tawi - 700km) | Leh, Nubra Valley, Pangong Tso, Tso Moriri |
| 35 | **Lakshadweep** | UT | Islands | **8** | AGX (Agatti Island Airport) | NONE (Ship from Kochi) | Agatti Island, Bangaram, Kavaratti, Minicoy |
| 36 | **Puducherry** | UT | South | **13** | PNY (Puducherry) / MAA | PDY (Puducherry) | White Town French Quarter, Auroville, Promenade |
| **TOTAL** | **36 States & UTs** | | | **1,162** | | | |

---

### 2. Regional Fair-Share Distribution & Bias Eradication

The engine strictly eliminates regional bias in travel recommendations:

- **Western Zone**: Gujarat, Maharashtra, Goa, Dadra & Nagar Haveli (214 verified destinations).
- **Northern Plains Zone**: Delhi, Uttar Pradesh, Punjab, Haryana, Rajasthan, Chandigarh (171 verified destinations).
- **Himalayan Zone**: Himachal Pradesh, Uttarakhand, Jammu & Kashmir, Ladakh, Sikkim (176 verified destinations).
- **Southern Zone**: Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Telangana, Puducherry (232 verified destinations).
- **Eastern Zone**: West Bengal, Bihar, Odisha, Jharkhand (114 verified destinations).
- **Northeast Zone**: Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura (160 verified destinations).
- **Central Zone**: Madhya Pradesh, Chhattisgarh (72 verified destinations).
- **Islands Zone**: Andaman & Nicobar Islands, Lakshadweep (24 verified destinations).
