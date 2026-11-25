// Group 1: Product Based Business Categories
const PRODUCT_CATEGORIES = [
  { id: 'retail_general', label: 'Retail and General Trading', desc: 'Department stores, retail outlets, supermarkets & merchandise trade' },
  { id: 'wholesale_dist', label: 'Wholesale and Distribution', desc: 'B2B stockists, bulk trade, import/export & regional distributorship' },
  { id: 'food_beverage', label: 'Food and Beverage Products', desc: 'Packaged foods, beverages, bakery, dairy, agro & culinary goods' },
  { id: 'clothing_fashion', label: 'Clothing, Fashion and Lifestyle', desc: 'Apparel, footwear, jewelry, beauty, cosmetics, accessories & fabrics' },
  { id: 'electronics_appliances', label: 'Electronics, Electrical and Appliances', desc: 'Smart electronics, home appliances, electrical equipment & hardware' },
  { id: 'home_furniture', label: 'Home, Furniture and Consumer Goods', desc: 'Furniture, home decor, kitchenware & domestic consumer essentials' },
  { id: 'automobile_parts', label: 'Automobile and Spare Parts', desc: 'Automotive components, mechanical spares, lubricants & tires' },
  { id: 'manufacturing_prod', label: 'Manufacturing and Production', desc: 'Production units, factories, assembly lines & custom fabrication' },
  { id: 'industrial_construction', label: 'Industrial, Construction and Specialized Supplies', desc: 'Building materials, hardware, plumbing, sanitary & specialized tools' }
];

// Group 2: Service Based Business Categories
const SERVICE_CATEGORIES = [
  { id: 'prof_business_srv', label: 'Professional and Business Service', desc: 'Legal, accounting, financial auditing, tax advisory & consulting' },
  { id: 'it_tech_srv', label: 'IT and Technology Service', desc: 'Software development, cloud solutions, cybersecurity, IT support & SaaS' },
  { id: 'creative_media_srv', label: 'Creative, Design and Media Service', desc: 'Graphic design, UI/UX, video production, photography & content creation' },
  { id: 'marketing_promo_srv', label: 'Marketing, Advertising and Promotion Service', desc: 'Digital marketing, SEO, social media management, PR & brand campaigns' },
  { id: 'home_personal_srv', label: 'Home and Personal Service', desc: 'Cleaning, housekeeping, salon & spa, personal fitness & domestic assistance' },
  { id: 'construction_prop_srv', label: 'Construction, Architecture and Property Service', desc: 'Architectural planning, interior design, civil contracting & real estate' },
  { id: 'auto_transport_srv', label: 'Automobile and Transport Service', desc: 'Vehicle maintenance, fleet logistics, car rentals, courier & transport' },
  { id: 'events_hospitality_srv', label: 'Events and Hospitality Service', desc: 'Event planning, catering, conference coordination & hospitality' },
  { id: 'repair_maint_srv', label: 'Repair, Maintenance and Technical Service', desc: 'Equipment servicing, appliance repair, electrical, HVAC & plumbing' }
];

// Group 3: Product & Service Based Business Categories
const BOTH_CATEGORIES = [
  { id: 'food_hospitality', label: 'Food and Hospitality Business', desc: 'Restaurants, cafes, catering, cloud kitchens, hotels & hospitality services' },
  { id: 'automobile_sales_service', label: 'Automobile Sales and Service Business', desc: 'Dealerships, workshops, spare parts sales, vehicle detailing & service centers' },
  { id: 'electronics_sales_service', label: 'Electronics Sales and Service Business', desc: 'Gadget retail, appliances, repair services, installation & AMC contracts' },
  { id: 'beauty_fashion_lifestyle', label: 'Beauty, Fashion and Lifestyle Business', desc: 'Salons, wellness spas, cosmetics retail, boutique styling & tailoring' },
  { id: 'healthcare_retail_service', label: 'Healthcare Retail and Service Business', desc: 'Pharmacies, medical clinics, optical retail, lab diagnostics & wellness equipment' },
  { id: 'agri_farming_business', label: 'Agriculture and Farming Business', desc: 'Agro retail, seeds, fertilizers, farming equipment, nursery & consultation' },
  { id: 'construction_building_business', label: 'Construction and Building Business', desc: 'Building material supply, interior contracting, civil work & renovation services' },
  { id: 'education_training_business', label: 'Education and Training Business', desc: 'Coaching centers, training academies, bookstores, study material & courses' },
  { id: 'rental_trading_support', label: 'Rental, Trading and Business Support', desc: 'Equipment leasing, trade supplies, event equipment hire & commercial logistics' }
];

// Group 4: Institution and Organization Categories
const INSTITUTION_CATEGORIES = [
  { id: 'education_training_inst', label: 'Education and Training Institution', desc: 'Schools, colleges, universities, skill development centers & coaching academies' },
  { id: 'healthcare_medical_inst', label: 'Healthcare and Medical Institution', desc: 'Hospitals, nursing homes, diagnostic clinics, wellness institutes & health trusts' },
  { id: 'religious_spiritual_inst', label: 'Religious and Spiritual Institution', desc: 'Temples, churches, mosques, gurudwaras, spiritual retreats & ashrams' },
  { id: 'ngo_trust_charity', label: "NGO's, Charitable Trust and Social Organisation", desc: 'Non-profit entities, social welfare foundations, relief societies & public trusts' },
  { id: 'media_broadcasting_org', label: 'Media and Broadcasting Organisation', desc: 'News agencies, TV/radio broadcasting networks, digital publications & press houses' },
  { id: 'film_entertainment_prod', label: 'Film, Entertainment and Production House', desc: 'Film studios, production houses, music labels, theatrical groups & creative arts' },
  { id: 'govt_public_sector_org', label: 'Government and Public Sector Organisation', desc: 'Government agencies, municipal bodies, statutory authorities & PSU enterprises' },
  { id: 'club_association_org', label: 'Club, Association and Membership Organisation', desc: 'Trade associations, social clubs, sports academies, alumni bodies & chambers of commerce' },
  { id: 'research_dev_inst', label: 'Research and Development Institution', desc: 'Scientific laboratories, technology institutes, policy think tanks & research centers' }
];

const CATEGORY_SUBCATEGORIES_MAP = {
  // 1. Product Based Categories
  'retail and general trading': [
    'Grocery & Kirana Stores', 'General Stores', 'Convenience Stores', 'Mini Marts',
    'Supermarkets', 'Hypermarkets', 'Departmental Stores', 'Variety Stores',
    'Multi-Brand Retail Stores', 'Franchise Retail Stores', 'Online Product Retail Stores'
  ],
  'wholesale and distribution': [
    'General Wholesale Traders', 'FMCG Wholesalers', 'Product Distributors',
    'Stockists & Dealers', 'Super Stockists', 'B2B Product Suppliers',
    'Import Businesses', 'Export Businesses', 'Import & Export Trading Businesses'
  ],
  'food and beverage products': [
    'Packaged Food Stores', 'Fruits & Vegetables Stores', 'Meat & Fish Stores',
    'Dairy Products Stores', 'Bakery Product Stores', 'Sweets & Snacks Stores',
    'Frozen Food Stores', 'Organic Food Stores', 'Beverage & Soft Drink Stores', 'Bottled Water Stores'
  ],
  'clothing, fashion and lifestyle': [
    'Clothing & Garment Stores', 'Textile & Fabric Stores', 'Saree Stores',
    'Footwear Stores', 'Jewellery Stores', 'Imitation Jewellery Stores', 'Watch Stores',
    'Cosmetics & Beauty Product Stores', 'Bags & Luggage Stores', 'Fashion Accessories Stores', 'Tailoring Material Stores'
  ],
  'electronics, electrical and appliances': [
    'Mobile Phone Stores', 'Computer & Laptop Stores', 'Consumer Electronics Stores',
    'Electrical Goods Stores', 'Home Appliance Stores', 'Television & Audio Equipment Stores',
    'Lighting & LED Stores', 'CCTV & Security Equipment Stores', 'Electronic Components Stores', 'Solar Equipment Stores'
  ],
  'home, furniture and consumer goods': [
    'Furniture Stores', 'Home Decor Stores', 'Kitchenware Stores', 'Household Goods Stores',
    'Mattress & Bedding Stores', 'Gift & Novelty Stores', 'Toys & Games Stores',
    'Sports Goods Stores', 'Stationery & Book Stores', 'Musical Instrument Stores', 'Pet Product Stores'
  ],
  'automobile and spare parts': [
    'Two-Wheeler Dealers', 'Four-Wheeler Dealers', 'Commercial Vehicle Dealers',
    'Electric Vehicle Dealers', 'Used Vehicle Dealers', 'Automobile Spare Parts Stores',
    'Tyre & Battery Stores', 'Automobile Accessories Stores', 'Auto Electrical Parts Stores', 'Automobile Lubricants & Oil Stores'
  ],
  'manufacturing and production': [
    'Food Processing Units', 'Bakery & Confectionery Manufacturers', 'Dairy Product Manufacturers',
    'Beverage Manufacturers', 'Textile & Garment Manufacturers', 'Furniture Manufacturers',
    'Plastic Product Manufacturers', 'Paper Product Manufacturers', 'Packaging Material Manufacturers',
    'Chemical Product Manufacturers', 'Pharmaceutical Manufacturers', 'Electronics Manufacturers',
    'Metal Product Manufacturers', 'Machinery Manufacturers', 'Automobile Parts Manufacturers',
    'Printing & Printed Product Manufacturers', 'Building Material Manufacturers'
  ],
  'industrial, construction and specialized supplies': [
    'Building Material Suppliers', 'Cement & Steel Suppliers', 'Plumbing Material Suppliers',
    'Construction Electrical Material Suppliers', 'Industrial Machinery Suppliers', 'Tools & Equipment Suppliers',
    'Safety Equipment Suppliers', 'Medical Equipment Suppliers', 'Office Supplies Suppliers',
    'Packaging Material Suppliers', 'Industrial Raw Material Suppliers', 'Agricultural Equipment Suppliers',
    'Paint & Coating Material Suppliers', 'Laboratory Equipment Suppliers', 'Hotel & Restaurant Equipment Suppliers'
  ],

  // 2. Service Based Categories
  'professional and business service': [
    'Business Consultancy', 'Management Consultancy', 'Financial Consultancy', 'Tax Consultancy',
    'Accounting & Bookkeeping', 'Chartered Accountant Services', 'Legal Consultancy', 'Advocates & Law Firms',
    'Company Registration Services', 'HR Consultancy', 'Recruitment & Placement Agencies', 'Market Research Agencies'
  ],
  'it and technology service': [
    'Software Development', 'Website Development', 'Mobile App Development', 'IT Support & Maintenance',
    'Computer Repair Services', 'Networking & Server Support', 'Cloud Computing Services',
    'Cybersecurity Services', 'Data Entry Services', 'IT Consultancy', 'Software Testing Services', 'UI/UX Design Agencies'
  ],
  'creative, design and media service': [
    'Graphic Design Agencies', 'Logo Design Services', 'Video Editing Services', 'Animation Studios',
    'Photography Studios', 'Videography Services', 'Audio Recording Studios', 'Content Writing Services',
    'Copywriting Services', 'Printing Design Services', 'Interior Design Services'
  ],
  'marketing, advertising and promotion service': [
    'Digital Marketing Agencies', 'Advertising Agencies', 'Branding & Marketing Consultancy',
    'Social Media Management', 'SEO Services', 'Google Ads Management', 'Facebook & Instagram Ads Services',
    'Influencer Marketing Agencies', 'Lead Generation Agencies', 'Public Relations Agencies'
  ],
  'home and personal service': [
    'Electrician Services', 'Plumbing Services', 'Carpentry Services', 'Painting Services',
    'Home Cleaning Services', 'Pest Control Services', 'Appliance Repair Services', 'AC Repair & Maintenance',
    'Laundry Services', 'Dry Cleaning Services', 'Beauty Parlours', 'Salons & Spa Services', 'Makeup Artists', 'Home Maintenance Services'
  ],
  'construction, architecture and property service': [
    'Civil Contractors', 'Building Contractors', 'Electrical Contractors', 'Plumbing Contractors',
    'Interior Contractors', 'Architecture Firms', 'Structural Design Consultants', 'Surveying Services',
    'Property Management Services', 'Real Estate Consultancy', 'Property Valuation Services', 'Construction Project Management'
  ],
  'automobile and transport service': [
    'Automobile Service Centres', 'Vehicle Repair Garages', 'Two-Wheeler Repair Centres',
    'Car Wash & Detailing Centres', 'Vehicle Painting Services', 'Vehicle Towing Services',
    'Vehicle Rental Services', 'Taxi & Cab Services', 'Travel & Tour Operators', 'Driving Schools',
    'Logistics Services', 'Transport Contractors', 'Courier & Delivery Services'
  ],
  'events and hospitality service': [
    'Event Management Companies', 'Wedding Planners', 'Catering Services', 'Decoration Services',
    'Event Photography Services', 'Event Videography Services', 'Sound & Lighting Services',
    'DJ Services', 'Tent & Event Setup Services', 'Travel Agencies', 'Hospitality Consultancy'
  ],
  'repair, maintenance and technical service': [
    'Electrical Equipment Repair', 'Electronic Equipment Repair', 'Computer & Laptop Repair',
    'Mobile Phone Repair', 'Machinery Repair & Maintenance', 'Industrial Equipment Maintenance',
    'Welding Services', 'Fabrication Services', 'Plumbing Equipment Maintenance', 'Solar System Maintenance',
    'CCTV Installation & Maintenance', 'Lift & Elevator Maintenance'
  ],

  // 3. Both (Product & Service) Categories
  'food and hospitality business': [
    'Restaurants', 'Hotels', 'Cafes & Coffee Shops', 'Bakeries with Food Service',
    'Sweet Shops with Catering', 'Fast Food Outlets', 'Juice & Beverage Shops',
    'Ice Cream Parlours', 'Food Trucks', 'Cloud Kitchens', 'Catering & Food Supply Businesses'
  ],
  'automobile sales and service business': [
    'Automobile Dealerships with Service Centres', 'Two-Wheeler Sales & Service Centres',
    'Four-Wheeler Sales & Service Centres', 'Electric Vehicle Sales & Service Centres',
    'Used Vehicle Sales & Service Businesses', 'Tyre Sales & Fitting Centres',
    'Battery Sales & Service Centres', 'Automobile Accessories & Installation Centres'
  ],
  'electronics sales and service business': [
    'Mobile Sales & Repair Stores', 'Computer Sales & Repair Stores', 'Laptop Sales & Repair Stores',
    'Electronics Sales & Repair Stores', 'Home Appliance Sales & Repair Stores',
    'CCTV Sales & Installation Businesses', 'Solar Equipment Sales & Installation Businesses',
    'Electrical Goods Sales & Installation Businesses'
  ],
  'beauty, fashion and lifestyle business': [
    'Beauty Salons with Product Sales', 'Cosmetics Stores with Beauty Services',
    'Bridal Makeup & Product Businesses', 'Jewellery Stores with Repair Services',
    'Optical Stores with Eye Testing', 'Tailoring & Fabric Stores',
    'Boutique Stores with Custom Stitching', 'Footwear Stores with Repair Services'
  ],
  'healthcare retail and service business': [
    'Medical Stores with Healthcare Services', 'Pharmacy & Consultation Centres',
    'Optical Stores with Eye Testing', 'Medical Equipment Sales & Rental Businesses',
    'Surgical Product Sales & Support Businesses', 'Healthcare Product Stores with Related Services'
  ],
  'agriculture and farming business': [
    'Seed & Fertiliser Stores with Farm Advisory', 'Pesticide Stores with Crop Advisory',
    'Agricultural Equipment Sales & Rental', 'Tractor Sales & Service Centres',
    'Dairy Farming & Milk Product Businesses', 'Poultry Farming & Product Businesses',
    'Nursery & Plant Sales with Landscaping', 'Irrigation Equipment Sales & Installation'
  ],
  'construction and building business': [
    'Building Material Sales & Installation', 'Cement & Steel Sales with Construction Services',
    'Tiles & Sanitaryware Sales with Fitting', 'Furniture Sales with Installation',
    'Modular Kitchen Sales & Installation', 'Paint Sales with Painting Services',
    'Solar Products Sales & Installation', 'Doors & Windows Sales with Installation'
  ],
  'education and training business': [
    'Bookstores with Learning Services', 'Computer Sales with Training Services',
    'Musical Instrument Sales with Music Classes', 'Sports Goods Sales with Coaching',
    'Art Material Stores with Art Classes', 'Educational Product Sales with Training',
    'Online Learning Product & Service Businesses'
  ],
  'rental, trading and business support': [
    'Machinery Sales & Rental', 'Equipment Sales & Rental', 'Furniture Sales & Rental',
    'Event Equipment Sales & Rental', 'Construction Equipment Sales & Rental',
    'Vehicle Sales & Rental', 'Office Equipment Sales & Maintenance', 'Packaging Supply & Customisation Businesses'
  ],

  // 4. Institutions & Organisations
  'education and training institution': [
    'Play Schools', 'Pre-Schools', 'Primary Schools', 'High Schools', 'Colleges', 'Universities',
    'Coaching Institutes', 'Competitive Exam Institutes', 'Professional Training Institutes',
    'Skill Development Centres', 'Vocational Training Institutes', 'Special Education Institutions'
  ],
  'healthcare and medical institution': [
    'Multi-Speciality Hospitals', 'General Hospitals', 'Specialty Hospitals', 'General Clinics',
    'Dental Clinics', 'Eye Hospitals & Clinics', 'Diagnostic Centres & Labs', 'Pathology Laboratories',
    'Radiology & Imaging Centres', 'Ayurvedic Hospitals & Centres', 'Homeopathic Clinics', 'Physiotherapy & Rehabilitation Centres'
  ],
  'religious and spiritual institution': [
    'Temples', 'Churches', 'Mosques', 'Gurudwaras', 'Jain Temples', 'Buddhist Monasteries',
    'Spiritual Centres & Ashrams', 'Meditation & Yoga Centres', 'Religious Trusts & Boards'
  ],
  "ngo's, charitable trust and social organisation": [
    'Charitable Trusts', 'Non-Profit Organisations (NGOs)', 'Social Welfare Societies',
    'Child Welfare Organisations', 'Women Empowerment Organisations', 'Old Age Homes & Senior Care Trusts',
    'Animal Welfare Organisations', 'Environmental & Conservation NGOs', 'Disaster Relief Organisations'
  ],
  'media and broadcasting organisation': [
    'Television Channels', 'Radio Stations', 'Community Radio Stations', 'Newspaper Organisations',
    'Magazine Publishers', 'Digital Media Houses', 'YouTube Channels', 'Podcast Networks', 'Online News Platforms'
  ],
  'film, entertainment and production house': [
    'Film Production Houses', 'Television Production Houses', 'Music Production Houses',
    'Animation Production Studios', 'Documentary Production Houses', 'OTT Content Production Houses',
    'Theatre Organisations', 'Entertainment Companies'
  ],
  'government and public sector organisation': [
    'Government Departments', 'Municipal Corporations', 'Government Offices',
    'Public Sector Undertakings (PSUs)', 'Autonomous Government Bodies', 'Government Development Authorities'
  ],
  'club, association and membership organisation': [
    'Sports Clubs', 'Social Clubs', 'Trade Associations', 'Business Associations',
    'Professional Associations', "Residents' Welfare Associations (RWAs)", 'Cultural Associations',
    'Cooperative Societies', 'Community Organisations'
  ],
  'research and development institution': [
    'Scientific Research Centres', 'Industrial Research Centres', 'Agricultural Research Institutions',
    'Medical Research Institutions', 'Technology Research Centres',
    'Innovation & Incubation Centres (Start-up Incubators)', 'Environmental Research Organisations', 'Educational Research Institutions'
  ]
};

const normalizeCategoryKey = (catName) => {
  if (!catName) return '';
  return catName
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\s+&\s+/g, ' and ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getSubCategoriesForCategory = (catName) => {
  if (!catName) return [];
  const targetNorm = normalizeCategoryKey(catName);
  if (CATEGORY_SUBCATEGORIES_MAP[targetNorm]) {
    return CATEGORY_SUBCATEGORIES_MAP[targetNorm];
  }
  for (const [key, list] of Object.entries(CATEGORY_SUBCATEGORIES_MAP)) {
    if (normalizeCategoryKey(key) === targetNorm) {
      return list;
    }
  }
  for (const [key, list] of Object.entries(CATEGORY_SUBCATEGORIES_MAP)) {
    const keyNorm = normalizeCategoryKey(key);
    if (keyNorm.includes(targetNorm) || targetNorm.includes(keyNorm)) {
      return list;
    }
  }
  return [];
};

const isSubcategoryBelongingToCategory = (subName, catName) => {
  if (!subName || !catName) return false;
  const list = getSubCategoriesForCategory(catName);
  if (list.length === 0) return true; // fallback if unknown custom category
  const normSub = normalizeCategoryKey(subName);
  return list.some(item => normalizeCategoryKey(item) === normSub || item.toLowerCase().trim() === subName.toLowerCase().trim());
};

module.exports = {
  PRODUCT_CATEGORIES,
  SERVICE_CATEGORIES,
  BOTH_CATEGORIES,
  INSTITUTION_CATEGORIES,
  CATEGORY_SUBCATEGORIES_MAP,
  normalizeCategoryKey,
  getSubCategoriesForCategory,
  isSubcategoryBelongingToCategory
};
