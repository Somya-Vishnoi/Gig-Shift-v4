// GigShift v4 — All shared types, constants, and i18n
// Rule: everything shared lives here. No type scattered across files.

// ─── ROLES ─────────────────────────────────────────────────────────────────
export type UserRole = 'rider' | 'platform' | 'admin' | 'gs_employee'

// ─── CITIES & ZONES ─────────────────────────────────────────────────────────
export const CITIES: Record<string, string[]> = {
  Bangalore: ['Koramangala', 'Indiranagar', 'MG Road', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Bannerghatta', 'Electronic City'],
  Hyderabad: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'HITEC City', 'Secunderabad', 'Kukatpally'],
  Pune: ['Koregaon Park', 'Hinjewadi', 'Kothrud', 'Viman Nagar', 'Wakad', 'Aundh'],
  Mumbai: ['Andheri', 'Bandra', 'Powai', 'Malad', 'Thane', 'Navi Mumbai'],
  Delhi: ['Connaught Place', 'Saket', 'Noida', 'Gurgaon', 'Dwarka', 'Lajpat Nagar'],
}

export const ZONES = CITIES['Bangalore'] // default, overridden by city selection

// ─── PLATFORMS ───────────────────────────────────────────────────────────────
export const PLATFORMS = [
  { id: 'swiggy', name: 'Swiggy', basePPD: 38 },
  { id: 'zomato', name: 'Zomato', basePPD: 36 },
  { id: 'dunzo', name: 'Dunzo', basePPD: 34 },
  { id: 'blinkit', name: 'Blinkit', basePPD: 40 },
  { id: 'zepto', name: 'Zepto', basePPD: 37 },
  { id: 'instamart', name: 'Instamart', basePPD: 35 },
  { id: 'bigbasket', name: 'BigBasket Now', basePPD: 33 },
  { id: 'jiomart', name: 'JioMart Express', basePPD: 32 },
  { id: 'flipkart', name: 'Flipkart Quick', basePPD: 36 },
  { id: 'amazon', name: 'Amazon Fresh', basePPD: 39 },
]

// ─── TIERS ───────────────────────────────────────────────────────────────────
export const TIERS = {
  basic: { label: 'Basic', minRiders: 1, maxRiders: 10, basePPD: 35, notice: '2hr+' },
  standard: { label: 'Standard', minRiders: 11, maxRiders: 50, basePPD: 42, notice: '1hr+' },
  surge: { label: 'Surge', minRiders: 51, maxRiders: 200, basePPD: 55, notice: 'Instant' },
} as const

export type TierKey = keyof typeof TIERS

// ─── ZONE MULTIPLIERS ────────────────────────────────────────────────────────
export const ZONE_MULTIPLIERS: Record<string, number> = {
  'MG Road': 1.18,
  'Koramangala': 1.15,
  'Indiranagar': 1.12,
  'HSR Layout': 1.10,
  'Whitefield': 1.08,
  'Jayanagar': 1.05,
  'Bannerghatta': 1.03,
  'Electronic City': 1.03,
  // Hyderabad
  'Banjara Hills': 1.16,
  'Jubilee Hills': 1.14,
  'Gachibowli': 1.10,
  'HITEC City': 1.12,
  'Secunderabad': 1.06,
  'Kukatpally': 1.04,
}

// ─── VEHICLE TYPES ───────────────────────────────────────────────────────────
export const VEHICLE_TYPES = ['Bicycle', '2-Wheeler', '3-Wheeler', 'Car', 'E-Bike'] as const
export type VehicleType = typeof VEHICLE_TYPES[number]

// ─── RIDER ───────────────────────────────────────────────────────────────────
export interface Rider {
  id: string
  name: string
  email: string
  mobile: string
  zone: string
  preferred_zones: string[]
  vehicle_type: VehicleType
  language: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  status: 'active' | 'inactive' | 'suspended'
  profile_photo?: string
  city: string
  dark_mode: boolean
  last_login?: string
  is_online: boolean
  latitude?: number
  longitude?: number
  total_earnings: number
  rating: number
  total_deliveries: number
  created_at: string
}

// ─── PLATFORM ─────────────────────────────────────────────────────────────────
export interface Platform {
  id: string
  company_name: string
  email: string
  mobile: string
  contact_name: string
  expected_volume: number
  zones: string[]
  status: 'active' | 'pending' | 'suspended'
  employee_id: string
  gst_number?: string
  pan_number?: string
  business_type?: string
  city: string
  address?: string
  pincode?: string
  state?: string
  website?: string
  language: string
  dark_mode: boolean
  last_login?: string
  latitude?: number
  longitude?: number
  logo_url?: string
  sla_target_minutes: number
  created_at: string
}

// ─── ORDER ────────────────────────────────────────────────────────────────────
export interface Order {
  id: string
  platform_id: string | null
  platform_name: string
  zone: string
  riders_requested: number
  riders_confirmed: number
  tier: TierKey
  ppd: number
  total_cost: number
  status: 'pending' | 'active' | 'fulfilled' | 'cancelled'
  created_at: string
}

// ─── RIDER EARNINGS ───────────────────────────────────────────────────────────
export interface RiderEarning {
  id: string
  rider_id: string
  platform_id?: string
  platform_name: string
  zone: string
  ppd: number
  date: string
  shift_start?: string
  shift_end?: string
  deliveries_count: number
  status: 'completed' | 'cancelled' | 'in_progress'
  created_at: string
}

// ─── DISPATCH EVENT ───────────────────────────────────────────────────────────
export interface DispatchEvent {
  id: string
  order_id: string
  rider_id?: string
  platform_id?: string
  event_type: 'assigned' | 'picked_up' | 'en_route' | 'delivered' | 'cancelled'
  otp?: string
  otp_verified: boolean
  pickup_lat?: number
  pickup_lng?: number
  dropoff_lat?: number
  dropoff_lng?: number
  rider_lat?: number
  rider_lng?: number
  estimated_minutes?: number
  created_at: string
}

// ─── GS EMPLOYEE ─────────────────────────────────────────────────────────────
export interface GSEmployee {
  id: string
  name: string
  email: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  role: 'super_admin' | 'ops_manager' | 'support' | 'finance' | 'tech'
  department?: string
  pan_id?: string
  aadhaar_masked?: string
  profile_photo?: string
  employee_code?: string
  date_joined: string
  last_login?: string
  is_active: boolean
  created_at: string
}

// ─── ZONE INCENTIVE ──────────────────────────────────────────────────────────
export interface ZoneIncentive {
  id: string
  zone: string
  city: string
  bonus_ppd: number
  reason?: string
  active: boolean
  expires_at?: string
  created_at: string
}

// ─── PRICING OVERRIDE ────────────────────────────────────────────────────────
export interface PricingOverride {
  id: string
  tier?: TierKey
  zone?: string
  override_multiplier: number
  reason?: string
  active: boolean
  expires_at?: string
  created_at: string
}

// ─── LANGUAGE / I18N ─────────────────────────────────────────────────────────
export type LangCode = 
  | 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml' | 'mr' | 'gu' | 'pa' | 'bn'
  | 'or' | 'as' | 'ur' | 'ne' | 'kok' | 'mai' | 'bho' | 'sat' | 'ks' | 'doi'
  | 'mni' | 'sd' | 'bo' | 'sa'

export const LANGUAGES: { code: LangCode; name: string; native: string; region: string }[] = [
  // North
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'North' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'North' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'North' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر', region: 'North' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', region: 'North' },
  // East
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'East' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'East' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'East' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', region: 'East' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', region: 'Northeast' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'East' },
  // South
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'South' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'South' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'South' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'South' },
  // West
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'West' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'West' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', region: 'West' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', region: 'West' },
  // Central
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी', region: 'Central' },
  // Northeast
  { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'Northeast' },
  // Classical / Other
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', region: 'Classical' },
  { code: 'bo', name: 'Bodo', native: 'बड़ो', region: 'Northeast' },
  // English always last
  { code: 'en', name: 'English', native: 'English', region: 'International' },
]

// ─── UI STRINGS ──────────────────────────────────────────────────────────────
export const UI_STRINGS: Record<LangCode, Record<string, string>> = {
  en: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    earnings: 'Earnings',
    slots: 'Slots',
    zone: 'Zone',
    city: 'City',
    riders: 'Riders',
    orders: 'Orders',
    platforms: 'Platforms',
    welcome: 'Welcome to GigShift',
    select_role: 'Select your role',
    rider: 'Rider',
    platform: 'Platform',
    admin: 'Admin',
    email: 'Email',
    mobile: 'Mobile',
    continue: 'Continue',
    back: 'Back',
    submit: 'Submit',
    name: 'Full Name',
    vehicle: 'Vehicle Type',
    language: 'Language',
    settings: 'Settings',
    profile: 'Profile',
    dark_mode: 'Dark Mode',
    live: 'Live',
    online: 'Online',
    offline: 'Offline',
    today: 'Today',
    week: 'This Week',
    total: 'Total',
  },
  hi: {
    login: 'लॉगिन',
    register: 'पंजीकरण',
    logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड',
    earnings: 'कमाई',
    slots: 'स्लॉट',
    zone: 'क्षेत्र',
    city: 'शहर',
    riders: 'राइडर',
    orders: 'ऑर्डर',
    platforms: 'प्लेटफॉर्म',
    welcome: 'गिगशिफ्ट में आपका स्वागत है',
    select_role: 'अपनी भूमिका चुनें',
    rider: 'राइडर',
    platform: 'प्लेटफॉर्म',
    admin: 'एडमिन',
    email: 'ईमेल',
    mobile: 'मोबाइल',
    continue: 'जारी रखें',
    back: 'वापस',
    submit: 'सबमिट',
    name: 'पूरा नाम',
    vehicle: 'वाहन प्रकार',
    language: 'भाषा',
    settings: 'सेटिंग्स',
    profile: 'प्रोफाइल',
    dark_mode: 'डार्क मोड',
    live: 'लाइव',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    today: 'आज',
    week: 'इस सप्ताह',
    total: 'कुल',
  },
  kn: {
    login: 'ಲಾಗಿನ್',
    register: 'ನೋಂದಣಿ',
    logout: 'ಲಾಗ್ ಔಟ್',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    earnings: 'ಗಳಿಕೆ',
    slots: 'ಸ್ಲಾಟ್',
    zone: 'ವಲಯ',
    city: 'ನಗರ',
    riders: 'ರೈಡರ್',
    orders: 'ಆರ್ಡರ್',
    platforms: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    welcome: 'GigShift ಗೆ ಸ್ವಾಗತ',
    select_role: 'ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ',
    rider: 'ರೈಡರ್',
    platform: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    admin: 'ಅಡ್ಮಿನ್',
    email: 'ಇಮೇಲ್',
    mobile: 'ಮೊಬೈಲ್',
    continue: 'ಮುಂದುವರಿಯಿರಿ',
    back: 'ಹಿಂದೆ',
    submit: 'ಸಲ್ಲಿಸಿ',
    name: 'ಪೂರ್ಣ ಹೆಸರು',
    vehicle: 'ವಾಹನ ಪ್ರಕಾರ',
    language: 'ಭಾಷೆ',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    profile: 'ಪ್ರೊಫೈಲ್',
    dark_mode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    live: 'ಲೈವ್',
    online: 'ಆನ್‌ಲೈನ್',
    offline: 'ಆಫ್‌ಲೈನ್',
    today: 'ಇಂದು',
    week: 'ಈ ವಾರ',
    total: 'ಒಟ್ಟು',
  },
  te: {
    login: 'లాగిన్',
    register: 'నమోదు',
    logout: 'లాగ్ అవుట్',
    dashboard: 'డాష్‌బోర్డ్',
    earnings: 'సంపాదన',
    slots: 'స్లాట్లు',
    zone: 'జోన్',
    city: 'నగరం',
    riders: 'రైడర్లు',
    orders: 'ఆర్డర్లు',
    platforms: 'ప్లాట్‌ఫారమ్‌లు',
    welcome: 'GigShift కి స్వాగతం',
    select_role: 'మీ పాత్ర ఎంచుకోండి',
    rider: 'రైడర్',
    platform: 'ప్లాట్‌ఫారమ్',
    admin: 'అడ్మిన్',
    email: 'ఇమెయిల్',
    mobile: 'మొబైల్',
    continue: 'కొనసాగించు',
    back: 'వెనక్కి',
    submit: 'సమర్పించు',
    name: 'పూర్తి పేరు',
    vehicle: 'వాహన రకం',
    language: 'భాష',
    settings: 'సెట్టింగ్‌లు',
    profile: 'ప్రొఫైల్',
    dark_mode: 'డార్క్ మోడ్',
    live: 'లైవ్',
    online: 'ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్',
    today: 'ఈరోజు',
    week: 'ఈ వారం',
    total: 'మొత్తం',
  },
  ta: {
    login: 'உள்நுழை',
    register: 'பதிவு',
    logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு',
    earnings: 'வருவாய்',
    slots: 'ஸ்லாட்கள்',
    zone: 'மண்டலம்',
    city: 'நகரம்',
    riders: 'ரைடர்கள்',
    orders: 'ஆர்டர்கள்',
    platforms: 'பிளாட்ஃபார்ம்கள்',
    welcome: 'GigShift-க்கு வரவேற்கிறோம்',
    select_role: 'உங்கள் பாத்திரத்தை தேர்ந்தெடுக்கவும்',
    rider: 'ரைடர்',
    platform: 'பிளாட்ஃபார்ம்',
    admin: 'நிர்வாகி',
    email: 'மின்னஞ்சல்',
    mobile: 'மொபைல்',
    continue: 'தொடரவும்',
    back: 'திரும்பு',
    submit: 'சமர்ப்பி',
    name: 'முழு பெயர்',
    vehicle: 'வாகன வகை',
    language: 'மொழி',
    settings: 'அமைப்புகள்',
    profile: 'சுயவிவரம்',
    dark_mode: 'இருண்ட பயன்முறை',
    live: 'நேரடி',
    online: 'நிகழ்நிலை',
    offline: 'இல்லாநிலை',
    today: 'இன்று',
    week: 'இந்த வாரம்',
    total: 'மொத்தம்',
  },
  ml: { login: 'ലോഗിൻ', register: 'രജിസ്റ്റർ', logout: 'ലോഗ് ഔട്ട്', dashboard: 'ഡാഷ്ബോർഡ്', earnings: 'വരുമാനം', slots: 'സ്ലോട്ടുകൾ', zone: 'സോൺ', city: 'നഗരം', riders: 'റൈഡേഴ്സ്', orders: 'ഓർഡറുകൾ', platforms: 'പ്ലാറ്റ്‌ഫോമുകൾ', welcome: 'GigShift-ലേക്ക് സ്വാഗതം', select_role: 'നിങ്ങളുടെ റോൾ തിരഞ്ഞെടുക്കുക', rider: 'റൈഡർ', platform: 'പ്ലാറ്റ്‌ഫോം', admin: 'അഡ്മിൻ', email: 'ഇമെയിൽ', mobile: 'മൊബൈൽ', continue: 'തുടരുക', back: 'തിരിച്ച്', submit: 'സമർപ്പിക്കുക', name: 'പൂർണ്ണ നാമം', vehicle: 'വാഹന തരം', language: 'ഭാഷ', settings: 'ക്രമീകരണങ്ങൾ', profile: 'പ്രൊഫൈൽ', dark_mode: 'ഡാർക്ക് മോഡ്', live: 'തത്സമയം', online: 'ഓൺലൈൻ', offline: 'ഓഫ്‌ലൈൻ', today: 'ഇന്ന്', week: 'ഈ ആഴ്ച', total: 'മൊത്തം' },
  mr: { login: 'लॉगिन', register: 'नोंदणी', logout: 'लॉगआउट', dashboard: 'डॅशबोर्ड', earnings: 'कमाई', slots: 'स्लॉट', zone: 'क्षेत्र', city: 'शहर', riders: 'रायडर', orders: 'ऑर्डर', platforms: 'प्लॅटफॉर्म', welcome: 'GigShift मध्ये आपले स्वागत आहे', select_role: 'आपली भूमिका निवडा', rider: 'रायडर', platform: 'प्लॅटफॉर्म', admin: 'प्रशासक', email: 'ईमेल', mobile: 'मोबाइल', continue: 'सुरू ठेवा', back: 'मागे', submit: 'सबमिट', name: 'पूर्ण नाव', vehicle: 'वाहन प्रकार', language: 'भाषा', settings: 'सेटिंग्ज', profile: 'प्रोफाइल', dark_mode: 'डार्क मोड', live: 'थेट', online: 'ऑनलाइन', offline: 'ऑफलाइन', today: 'आज', week: 'या आठवड्यात', total: 'एकूण' },
  gu: { login: 'લૉગિન', register: 'નોંધણી', logout: 'લૉગ આઉટ', dashboard: 'ડૅશબોર્ડ', earnings: 'કમાણી', slots: 'સ્લૉટ', zone: 'ઝોન', city: 'શહેર', riders: 'રાઇડર', orders: 'ઓર્ડર', platforms: 'પ્લૅટફૉર્મ', welcome: 'GigShift માં આપનું સ્વાગત છે', select_role: 'તમારી ભૂમિકા પસંદ કરો', rider: 'રાઇડર', platform: 'પ્લૅટફૉર્મ', admin: 'એડ્મિન', email: 'ઇ-મેઇલ', mobile: 'મોબાઇલ', continue: 'ચાલુ રાખો', back: 'પાછા', submit: 'સબમિટ', name: 'પૂરું નામ', vehicle: 'વાહન પ્રકાર', language: 'ભાષા', settings: 'સેટિંગ', profile: 'પ્રોફાઇલ', dark_mode: 'ડાર્ક મોડ', live: 'લાઇવ', online: 'ઑનલાઇન', offline: 'ઑફલાઇન', today: 'આજે', week: 'આ સપ્તાહ', total: 'કુલ' },
  pa: { login: 'ਲਾਗਇਨ', register: 'ਰਜਿਸਟਰ', logout: 'ਲਾਗ ਆਉਟ', dashboard: 'ਡੈਸ਼ਬੋਰਡ', earnings: 'ਕਮਾਈ', slots: 'ਸਲਾਟ', zone: 'ਜ਼ੋਨ', city: 'ਸ਼ਹਿਰ', riders: 'ਰਾਈਡਰ', orders: 'ਆਰਡਰ', platforms: 'ਪਲੇਟਫਾਰਮ', welcome: 'GigShift ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ', select_role: 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ', rider: 'ਰਾਈਡਰ', platform: 'ਪਲੇਟਫਾਰਮ', admin: 'ਐਡਮਿਨ', email: 'ਈਮੇਲ', mobile: 'ਮੋਬਾਈਲ', continue: 'ਜਾਰੀ ਰੱਖੋ', back: 'ਵਾਪਸ', submit: 'ਜਮਾਂ ਕਰੋ', name: 'ਪੂਰਾ ਨਾਮ', vehicle: 'ਵਾਹਨ ਕਿਸਮ', language: 'ਭਾਸ਼ਾ', settings: 'ਸੈਟਿੰਗਾਂ', profile: 'ਪ੍ਰੋਫਾਈਲ', dark_mode: 'ਡਾਰਕ ਮੋਡ', live: 'ਲਾਈਵ', online: 'ਔਨਲਾਈਨ', offline: 'ਔਫਲਾਈਨ', today: 'ਅੱਜ', week: 'ਇਸ ਹਫ਼ਤੇ', total: 'ਕੁੱਲ' },
  bn: { login: 'লগইন', register: 'নিবন্ধন', logout: 'লগআউট', dashboard: 'ড্যাশবোর্ড', earnings: 'আয়', slots: 'স্লট', zone: 'জোন', city: 'শহর', riders: 'রাইডার', orders: 'অর্ডার', platforms: 'প্ল্যাটফর্ম', welcome: 'GigShift-এ স্বাগতম', select_role: 'আপনার ভূমিকা বেছে নিন', rider: 'রাইডার', platform: 'প্ল্যাটফর্ম', admin: 'অ্যাডমিন', email: 'ইমেইল', mobile: 'মোবাইল', continue: 'চালিয়ে যান', back: 'পিছে', submit: 'জমা দিন', name: 'পুরো নাম', vehicle: 'যানবাহনের ধরন', language: 'ভাষা', settings: 'সেটিংস', profile: 'প্রোফাইল', dark_mode: 'ডার্ক মোড', live: 'লাইভ', online: 'অনলাইন', offline: 'অফলাইন', today: 'আজ', week: 'এই সপ্তাহ', total: 'মোট' },
  or: { login: 'ଲଗଇନ', register: 'ପଞ୍ଜୀକରଣ', logout: 'ଲଗ ଆଉଟ', dashboard: 'ଡ୍ୟାଶବୋର୍ଡ', earnings: 'ଆୟ', slots: 'ସ୍ଲଟ', zone: 'ଜୋନ', city: 'ସହର', riders: 'ରାଇଡର', orders: 'ଅର୍ଡର', platforms: 'ପ୍ଲାଟଫର୍ମ', welcome: 'GigShift ରେ ସ୍ୱାଗତ', select_role: 'ଆପଣଙ୍କ ଭୂମିକା ବଛନ୍ତୁ', rider: 'ରାଇଡର', platform: 'ପ୍ଲାଟଫର୍ମ', admin: 'ଆଡମିନ', email: 'ଇମେଲ', mobile: 'ମୋବାଇଲ', continue: 'ଜାରି ରଖ', back: 'ପଛକୁ', submit: 'ଦାଖଲ', name: 'ପୂର୍ଣ ନାମ', vehicle: 'ଯାନ ପ୍ରକାର', language: 'ଭାଷା', settings: 'ସେଟିଂ', profile: 'ପ୍ରୋଫାଇଲ', dark_mode: 'ଡାର୍କ ମୋଡ', live: 'ଲାଇଭ', online: 'ଅନ୍ଲାଇନ', offline: 'ଅଫଲାଇନ', today: 'ଆଜି', week: 'ଏ ସପ୍ତାହ', total: 'ମୋଟ' },
  as: { login: 'লগইন', register: 'পঞ্জীয়ন', logout: 'লগ আউট', dashboard: 'ডেশ্বোর্ড', earnings: 'উপাৰ্জন', slots: 'স্লট', zone: 'জ\'ন', city: 'চহৰ', riders: 'ৰাইডাৰ', orders: 'অৰ্ডাৰ', platforms: 'প্লেটফৰ্ম', welcome: 'GigShift লৈ স্বাগতম', select_role: 'আপোনাৰ ভূমিকা বাছক', rider: 'ৰাইডাৰ', platform: 'প্লেটফৰ্ম', admin: 'এডমিন', email: 'ইমেইল', mobile: 'মোবাইল', continue: 'অব্যাহত ৰাখক', back: 'উভতি যাওক', submit: 'দাখিল কৰক', name: 'সম্পূৰ্ণ নাম', vehicle: 'বাহনৰ প্ৰকাৰ', language: 'ভাষা', settings: 'ছেটিং', profile: 'প্ৰফাইল', dark_mode: 'ডাৰ্ক মোড', live: 'লাইভ', online: 'অনলাইন', offline: 'অফলাইন', today: 'আজি', week: 'এই সপ্তাহ', total: 'মুঠ' },
  ur: { login: 'لاگ ان', register: 'رجسٹر', logout: 'لاگ آؤٹ', dashboard: 'ڈیش بورڈ', earnings: 'کمائی', slots: 'سلاٹ', zone: 'زون', city: 'شہر', riders: 'رائیڈر', orders: 'آرڈر', platforms: 'پلیٹ فارم', welcome: 'GigShift میں خوش آمدید', select_role: 'اپنا کردار منتخب کریں', rider: 'رائیڈر', platform: 'پلیٹ فارم', admin: 'ایڈمن', email: 'ای میل', mobile: 'موبائل', continue: 'جاری رکھیں', back: 'واپس', submit: 'جمع کریں', name: 'پورا نام', vehicle: 'گاڑی کی قسم', language: 'زبان', settings: 'ترتیبات', profile: 'پروفائل', dark_mode: 'ڈارک موڈ', live: 'لائیو', online: 'آن لائن', offline: 'آف لائن', today: 'آج', week: 'اس ہفتے', total: 'کل' },
  ne: { login: 'लगइन', register: 'दर्ता', logout: 'लगआउट', dashboard: 'ड्यासबोर्ड', earnings: 'कमाइ', slots: 'स्लट', zone: 'जोन', city: 'सहर', riders: 'राइडर', orders: 'अर्डर', platforms: 'प्लेटफर्म', welcome: 'GigShift मा स्वागत छ', select_role: 'आफ्नो भूमिका छान्नुहोस्', rider: 'राइडर', platform: 'प्लेटफर्म', admin: 'एडमिन', email: 'इमेल', mobile: 'मोबाइल', continue: 'जारी राख्नुहोस्', back: 'पछाडि', submit: 'पेश गर्नुहोस्', name: 'पूरा नाम', vehicle: 'सवारी साधन', language: 'भाषा', settings: 'सेटिङ', profile: 'प्रोफाइल', dark_mode: 'डार्क मोड', live: 'लाइभ', online: 'अनलाइन', offline: 'अफलाइन', today: 'आज', week: 'यो हप्ता', total: 'जम्मा' },
  kok: { login: 'लॉगिन', register: 'नोंदणी', logout: 'लॉगआउट', dashboard: 'डॅशबोर्ड', earnings: 'मिळकत', slots: 'स्लॉट', zone: 'झोन', city: 'शार', riders: 'रायडर', orders: 'ऑर्डर', platforms: 'प्लॅटफॉर्म', welcome: 'GigShift ह्यात आपले स्वागत', select_role: 'तुमची भूमिका निवडा', rider: 'रायडर', platform: 'प्लॅटफॉर्म', admin: 'एडमिन', email: 'इमेल', mobile: 'मोबाइल', continue: 'फुडें वच', back: 'फाटीं', submit: 'सादर करा', name: 'पुराय नाव', vehicle: 'वाहन प्रकार', language: 'भाशा', settings: 'सेटिंग', profile: 'प्रोफाइल', dark_mode: 'डार्क मोड', live: 'थेट', online: 'ऑनलाइन', offline: 'ऑफलाइन', today: 'आयज', week: 'ह्या सप्टाकांत', total: 'एकूण' },
  mai: { login: 'लॉगिन', register: 'पंजीकरण', logout: 'लॉगआउट', dashboard: 'डैशबोर्ड', earnings: 'कमाई', slots: 'स्लॉट', zone: 'क्षेत्र', city: 'शहर', riders: 'राइडर', orders: 'ऑर्डर', platforms: 'प्लेटफार्म', welcome: 'GigShift मे अहाँक स्वागत अछि', select_role: 'अपन भूमिका चुनू', rider: 'राइडर', platform: 'प्लेटफार्म', admin: 'एडमिन', email: 'ईमेल', mobile: 'मोबाइल', continue: 'जारी राखू', back: 'पाछाँ', submit: 'सबमिट', name: 'पूरा नाम', vehicle: 'वाहन प्रकार', language: 'भाषा', settings: 'सेटिंग्स', profile: 'प्रोफाइल', dark_mode: 'डार्क मोड', live: 'लाइव', online: 'ऑनलाइन', offline: 'ऑफलाइन', today: 'आइ', week: 'एहि सप्ताह', total: 'कुल' },
  bho: { login: 'लॉगिन', register: 'रजिस्टर', logout: 'लॉगआउट', dashboard: 'डैशबोर्ड', earnings: 'कमाई', slots: 'स्लॉट', zone: 'जोन', city: 'शहर', riders: 'राइडर', orders: 'ऑर्डर', platforms: 'प्लेटफॉर्म', welcome: 'GigShift में रउवा के स्वागत बा', select_role: 'आपन भूमिका चुनीं', rider: 'राइडर', platform: 'प्लेटफॉर्म', admin: 'एडमिन', email: 'ईमेल', mobile: 'मोबाइल', continue: 'जारी राखीं', back: 'पाछे', submit: 'सबमिट करीं', name: 'पूरा नाम', vehicle: 'गाड़ी के प्रकार', language: 'भाषा', settings: 'सेटिंग', profile: 'प्रोफाइल', dark_mode: 'डार्क मोड', live: 'लाइव', online: 'ऑनलाइन', offline: 'ऑफलाइन', today: 'आज', week: 'एह हफ्ता', total: 'कुल' },
  sat: { login: 'ᱞᱳᱜᱤᱱ', register: 'ᱨᱮᱡᱤᱥᱴᱟᱨ', logout: 'ᱞᱳᱜ ᱟᱣᱴ', dashboard: 'ᱫᱟᱥᱚᱵᱚᱨᱫ', earnings: 'ᱢᱟᱦᱟ', slots: 'ᱥᱞᱚᱴ', zone: 'ᱡᱳᱱ', city: 'ᱥᱦᱚᱨ', riders: 'ᱨᱟᱭᱫᱟᱨ', orders: 'ᱟᱨᱫᱟᱨ', platforms: 'ᱯᱞᱮᱴᱯᱷᱚᱨᱢ', welcome: 'GigShift ᱨᱮ ᱥᱟᱣᱟᱜ', select_role: 'ᱟᱯᱱᱟᱨ ᱢᱩᱥᱟᱶ ᱵᱷᱟᱸᱡ', rider: 'ᱨᱟᱭᱫᱟᱨ', platform: 'ᱯᱞᱮᱴᱯᱷᱚᱨᱢ', admin: 'ᱮᱫᱢᱤᱱ', email: 'ᱤᱢᱮᱞ', mobile: 'ᱢᱳᱵᱟᱭᱞ', continue: 'ᱡᱟᱨᱤ', back: 'ᱦᱚᱸ', submit: 'ᱫᱟᱠᱷᱤᱞ', name: 'ᱪᱮᱫ ᱜᱮ ᱧᱤᱛᱤ', vehicle: 'ᱜᱟᱲᱤ', language: 'ᱯᱷᱩᱞᱟ', settings: 'ᱥᱮᱴᱤᱝ', profile: 'ᱯᱨᱳᱯᱷᱟᱭᱞ', dark_mode: 'ᱫᱟᱨᱠ ᱢᱳᱫ', live: 'ᱞᱟᱭᱵ', online: 'ᱟᱱᱞᱟᱭᱱ', offline: 'ᱟᱯᱷᱞᱟᱭᱱ', today: 'ᱱᱤᱛ', week: 'ᱱᱤᱛ ᱵᱟᱬᱟᱭ', total: 'ᱡᱚᱲᱟ' },
  ks: { login: 'لاگ اِن', register: 'رجِسٹر', logout: 'لاگ آوٗٹ', dashboard: 'ڈیشبورڈ', earnings: 'کمایی', slots: 'سلاٹ', zone: 'زون', city: 'شہر', riders: 'رایڈر', orders: 'آرڈر', platforms: 'پلیٹفارم', welcome: 'GigShift مَنز خوش آمدید', select_role: 'اپنٕ کِردار ییلٕ', rider: 'رایڈر', platform: 'پلیٹفارم', admin: 'ایڈمِن', email: 'ای میل', mobile: 'موبایل', continue: 'آگاہ رٔزنٕ', back: 'واپٕس', submit: 'دٔریافت کٔرٕ', name: 'پورٕ ناو', vehicle: 'سواری', language: 'زٲن', settings: 'سیٹنگ', profile: 'پرٔپھایل', dark_mode: 'ڈارک موڈ', live: 'لایو', online: 'آنلاین', offline: 'آوٗٹلاین', today: 'اَز', week: 'یہ ہفتہ', total: 'جملہ' },
  doi: { login: 'लॉगिन', register: 'पंजीकरण', logout: 'लॉगआउट', dashboard: 'डैशबोर्ड', earnings: 'कमाई', slots: 'स्लॉट', zone: 'जोन', city: 'शैहर', riders: 'राइडर', orders: 'ऑर्डर', platforms: 'प्लेटफार्म', welcome: 'GigShift च् स्वागत ऐ', select_role: 'आपनी भूमिका चुनो', rider: 'राइडर', platform: 'प्लेटफार्म', admin: 'एडमिन', email: 'ईमेल', mobile: 'मोबाइल', continue: 'जारी रखो', back: 'पिच्छे', submit: 'सबमिट', name: 'पूरा नां', vehicle: 'सवारी दा किस्म', language: 'बोली', settings: 'सेटिंग', profile: 'प्रोफाइल', dark_mode: 'डार्क मोड', live: 'लाइव', online: 'ऑनलाइन', offline: 'ऑफलाइन', today: 'अज्ज', week: 'इस हफ्ते', total: 'कुल' },
  mni: { login: 'লগইন', register: 'রেজিস্টার', logout: 'লগ আউট', dashboard: 'ডেশবোর্ড', earnings: 'লাউথোকপা', slots: 'স্লট', zone: 'জোন', city: 'সহর', riders: 'রাইডার', orders: 'অর্ডার', platforms: 'প্লেটফর্ম', welcome: 'GigShift-তা নুংশিজরে', select_role: 'নুংশিজরে তোকপা থাজিনবা', rider: 'রাইডার', platform: 'প্লেটফর্ম', admin: 'এডমিন', email: 'ইমেল', mobile: 'মোবাইল', continue: 'চৎলগৎপা', back: 'হাক্তা', submit: 'পীরিবা', name: 'মিং', vehicle: 'গাড়ী', language: 'লোন', settings: 'সেটিং', profile: 'প্রোফাইল', dark_mode: 'ডার্ক মোড', live: 'লাইভ', online: 'অনলাইন', offline: 'অফলাইন', today: 'হায়েং', week: 'অসুম্নিং', total: 'মরম' },
  sd: { login: 'لاگ ان', register: 'رجسٽريشن', logout: 'لاگ آئوٽ', dashboard: 'ڊيش بورڊ', earnings: 'ڪمائي', slots: 'سلاٽ', zone: 'زون', city: 'شهر', riders: 'رائڊر', orders: 'آرڊر', platforms: 'پليٽ فارم', welcome: 'GigShift ۾ ڀلي ڪري آيا', select_role: 'پنهنجو ڪردار چونڊيو', rider: 'رائڊر', platform: 'پليٽ فارم', admin: 'ايڊمن', email: 'اي ميل', mobile: 'موبائل', continue: 'جاري رکو', back: 'واپس', submit: 'جمع ڪريو', name: 'پورو نالو', vehicle: 'گاڏي جو قسم', language: 'ٻولي', settings: 'سيٽنگ', profile: 'پروفائل', dark_mode: 'ڊارڪ موڊ', live: 'لائيو', online: 'آن لائن', offline: 'آف لائن', today: 'اڄ', week: 'هن هفتي', total: 'ڪل' },
  bo: { login: 'ལོག་ཨིན།', register: 'ཐོ་འགོད།', logout: 'ལོག་ཨའུཊ།', dashboard: 'གཙོ་ངོས།', earnings: 'འབབ་རྩིས།', slots: 'སྒྲིག་ལམ།', zone: 'ས་ཁུལ།', city: 'གྲོང་ཁྱེར།', riders: 'འཁྱེར་མཁན།', orders: 'བཀའ་རྒྱ།', platforms: 'མཉམ་འབྲེལ་གནས།', welcome: 'GigShift ལ་ཕེབས་པར་བསུ་བ།', select_role: 'ཁྱེད་ཀྱི་དབང་ཚད་འདེམས།', rider: 'འཁྱེར་མཁན།', platform: 'གནས།', admin: 'དབང་སྐུར།', email: 'གློག་འཕྲིན།', mobile: 'ལག་འཕྲིན།', continue: 'མུ་མཐུད།', back: 'ཕྱིར།', submit: 'འབུལ།', name: 'མིང་ཚང་མ།', vehicle: 'འཁོར་ལོ།', language: 'སྐད་ཡིག', settings: 'སྒྲིག་འགོད།', profile: 'གསལ་བཤད།', dark_mode: 'མུན་ཐབས།', live: 'ཀུ་སུར།', online: 'དྲ་ལམ།', offline: 'དྲ་མིན།', today: 'དེ་རིང།', week: 'བདུན་ཕྲག', total: 'སྤྱི་སྡོམ།' },
  sa: { login: 'प्रवेशः', register: 'पञ्जीकरणम्', logout: 'निर्गमनम्', dashboard: 'डैशबोर्ड', earnings: 'अर्जनम्', slots: 'स्थानानि', zone: 'क्षेत्रम्', city: 'नगरम्', riders: 'रायडर', orders: 'आदेशाः', platforms: 'मञ्चाः', welcome: 'GigShift स्वागतम्', select_role: 'स्वभूमिकां चिनुत', rider: 'रायडर', platform: 'मञ्चः', admin: 'प्रशासकः', email: 'विद्युत्पत्रम्', mobile: 'दूरभाषः', continue: 'अग्रे गच्छतु', back: 'प्रतिनिवर्तनम्', submit: 'प्रस्तुतम्', name: 'नाम', vehicle: 'यानम्', language: 'भाषा', settings: 'व्यवस्थाः', profile: 'परिचयः', dark_mode: 'तमोविधा', live: 'सजीवम्', online: 'सक्रियम्', offline: 'निष्क्रियम्', today: 'अद्य', week: 'सप्ताहः', total: 'समग्रम्' },
}

// Translation helper
export function t(key: string, lang: LangCode): string {
  return UI_STRINGS[lang]?.[key] ?? UI_STRINGS['en'][key] ?? key
}

// ─── PITCH STATS ─────────────────────────────────────────────────────────────
export const PITCH_STATS = {
  totalRiders: '5,00,000+',
  totalPlatforms: '10+',
  citiesCovered: '5+',
  avgPPD: '₹42',
  avgMargin: '12%',
  dailyOrders: '1,200+',
}

// ─── LEGACY COMPATIBILITY STUBS ─────────────────────────────────────────────
// These exist so old unused files (PlatformCard, WeeklyTable, LoginScreen,
// Header, RiderRegistration, PlatformRegistration) don't break the build.
// They are NOT used by page.tsx or any v4 component.

export type Role = UserRole

export interface MarketSnapshot {
  platformId: string
  zone: string
  demand: number
  supply: number
  ppd: number
  surgeMult: number
}

export interface DataRow {
  platform: string
  zone: string
  hour: number
  demand: number
  supply: number
  ppd: number
}

export interface WeeklyRow {
  day: string
  platform: string
  earnings: number
  deliveries: number
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
