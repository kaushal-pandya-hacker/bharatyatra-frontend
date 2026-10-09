export type Language = 'en' | 'gu' | 'hi';

export interface Translations {
  nav: {
    home: string;
    explore: string;
    destinations: string;
    plan: string;
    packages: string;
    stays: string;
    buses: string;
    trains: string;
    flights: string;
    dining: string;
    experiences: string;
    myTrips: string;
    cart: string;
    profile: string;
    support: string;
    signIn: string;
    signOut: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    whereToGo: string;
    voiceSearchTitle: string;
    voiceListening: string;
  };
  booking: {
    bookNow: string;
    confirmBooking: string;
    payAndConfirm: string;
    viewTicket: string;
    cancellationPolicy: string;
    totalAmount: string;
    whoIsTravelling: string;
    serviceUnavailable: string;
    continueWithMakeMyTrip: string;
  };
  accessibility: {
    title: string;
    textSize: string;
    standard: string;
    large: string;
    extraLarge: string;
    highContrast: string;
    reducedMotion: string;
    language: string;
    voiceAssistant: string;
    close: string;
    save: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    back: string;
    next: string;
    cancel: string;
    confirm: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      explore: 'Explore',
      destinations: 'Destinations',
      plan: 'AI Planner',
      packages: 'Tour Packages',
      stays: 'Hotels & Stays',
      buses: 'Buses',
      trains: 'Trains',
      flights: 'Flights',
      dining: 'Restaurants',
      experiences: 'Activities',
      myTrips: 'My Trips',
      cart: 'My Cart',
      profile: 'Account Profile',
      support: 'Call Support',
      signIn: 'Sign In',
      signOut: 'Sign Out',
    },
    home: {
      heroTitle: 'Explore India with Ease & Confidence',
      heroSubtitle: 'Simple, accessible travel planning for every generation. Book hotels, trains, buses, flights & packages.',
      searchPlaceholder: 'Search city, hotel, landmark or state (e.g. Ahmedabad, Taj Mahal)...',
      whereToGo: 'Where do you want to travel?',
      voiceSearchTitle: 'Tap mic and speak your travel query',
      voiceListening: 'Listening... Speak your destination or request',
    },
    booking: {
      bookNow: 'Book Now',
      confirmBooking: 'Confirm My Booking',
      payAndConfirm: 'Pay & Confirm Booking',
      viewTicket: 'View My Ticket',
      cancellationPolicy: 'Cancellation Policy',
      totalAmount: 'Total Amount to Pay',
      whoIsTravelling: 'Who is Travelling?',
      serviceUnavailable: 'Sorry, this service is currently unavailable for direct booking.',
      continueWithMakeMyTrip: 'Continue with MakeMyTrip',
    },
    accessibility: {
      title: 'Easy-Read & Accessibility Settings',
      textSize: 'Text Size',
      standard: 'Standard (100%)',
      large: 'Large (115%)',
      extraLarge: 'Extra Large (130%)',
      highContrast: 'High Contrast Mode',
      reducedMotion: 'Reduce Animations',
      language: 'App Language',
      voiceAssistant: 'Voice Assistant Help',
      close: 'Close Settings',
      save: 'Save Preferences',
    },
    common: {
      loading: 'Loading information...',
      error: 'Something went wrong',
      retry: 'Try Again',
      back: 'Go Back',
      next: 'Continue',
      cancel: 'Cancel Action',
      confirm: 'Confirm',
    },
  },
  gu: {
    nav: {
      home: 'હોમ',
      explore: 'શોધો',
      destinations: 'ગંતવ્ય સ્થળો',
      plan: 'AI પ્લાનર',
      packages: 'પ્રવાસ પેકેજ',
      stays: 'હોટેલ અને સ્ટે',
      buses: 'બસ',
      trains: 'ટ્રેન',
      flights: 'ફ્લાઇટ',
      dining: 'રેસ્ટોરન્ટ',
      experiences: 'પ્રવૃત્તિઓ',
      myTrips: 'મારા પ્રવાસો',
      cart: 'મારી કાર્ટ',
      profile: 'પ્રોફાઇલ',
      support: 'સહાયતા કૉલ કરો',
      signIn: 'સાઇન ઇન',
      signOut: 'સાઇન આઉટ',
    },
    home: {
      heroTitle: 'સરળતા અને વિશ્વાસ સાથે ભારતની યાત્રા કરો',
      heroSubtitle: 'દરેક પેઢી માટે સરળ અને સુલભ પ્રવાસ આયોજન. હોટેલ, ટ્રેન, બસ, ફ્લાઇટ બુક કરો.',
      searchPlaceholder: 'શહેર, હોટેલ કે જોવાલાયક સ્થળ શોધો (દા.ત. અમદાવાદ, તાજમહેલ)...',
      whereToGo: 'તમારે ક્યાં જવું છે?',
      voiceSearchTitle: 'માઇક દબાવો અને બોલો',
      voiceListening: 'સાંભળી રહ્યા છીએ... તમારું સ્થળ બોલો',
    },
    booking: {
      bookNow: 'હમણાં બુક કરો',
      confirmBooking: 'બુકિંગ કન્ફર્મ કરો',
      payAndConfirm: 'ચુકવણી કરો અને બુક કરો',
      viewTicket: 'ટિકિટ જુઓ',
      cancellationPolicy: 'કેન્સલેશન નીતિ',
      totalAmount: 'કુલ ચૂકવવાની રકમ',
      whoIsTravelling: 'કોણ મુસાફરી કરી રહ્યું છે?',
      serviceUnavailable: 'માફ કરશો, આ સેવા હાલમાં સીધી બુકિંગ માટે ઉપલબ્ધ નથી.',
      continueWithMakeMyTrip: 'MakeMyTrip સાથે આગળ વધો',
    },
    accessibility: {
      title: 'સરળ વાંચન અને એક્સેસિબિલિટી સેટિંગ્સ',
      textSize: 'અક્ષરોનું કદ',
      standard: 'સામાન્ય (100%)',
      large: 'મોટા (115%)',
      extraLarge: 'સૌથી મોટા (130%)',
      highContrast: 'હાઇ કોન્ટ્રાસ્ટ મોડ',
      reducedMotion: 'એનિમેશન ઘટાડો',
      language: 'એપ ભાષા',
      voiceAssistant: 'વોઇસ આસિસ્ટન્ટ સહાય',
      close: 'બંધ કરો',
      save: 'સેટિંગ્સ સેવ કરો',
    },
    common: {
      loading: 'માહિતી લોડ થઈ રહી છે...',
      error: 'કંઈક ભૂલ થઈ છે',
      retry: 'ફરી પ્રયાસ કરો',
      back: 'પાછા જાઓ',
      next: 'આગળ વધો',
      cancel: 'રદ કરો',
      confirm: 'મંજૂર કરો',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      explore: 'एक्सप्लोर करें',
      destinations: 'डेस्टिनेशन',
      plan: 'AI प्लानर',
      packages: 'टूर पैकेज',
      stays: 'होटल एवं स्टे',
      buses: 'बसें',
      trains: 'ट्रेनें',
      flights: 'फ्लाइट्स',
      dining: 'रेस्टोरेंट',
      experiences: 'गतिविधियां',
      myTrips: 'मेरी यात्राएं',
      cart: 'मेरी कार्ट',
      profile: 'प्रोफाइल',
      support: 'सपोर्ट कॉल करें',
      signIn: 'साइन इन',
      signOut: 'साइन आउट',
    },
    home: {
      heroTitle: 'आसानी और भरोसे के साथ भारत की यात्रा करें',
      heroSubtitle: 'हर उम्र के यात्रियों के लिए सरल और सुलभ यात्रा योजना। होटल, ट्रेन, बस, फ्लाइट बूक करें।',
      searchPlaceholder: 'शहर, होटल या दर्शनीय स्थल खोजें (जैसे अहमदाबाद, ताजमहल)...',
      whereToGo: 'आप कहाँ जाना चाहते हैं?',
      voiceSearchTitle: 'माइक दबाएं और बोलें',
      voiceListening: 'सुन रहे हैं... अपना गंतव्य बोलें',
    },
    booking: {
      bookNow: 'अभी बुक करें',
      confirmBooking: 'बुकिंग कन्फर्म करें',
      payAndConfirm: 'भुगतान करें और बुक करें',
      viewTicket: 'टिकट देखें',
      cancellationPolicy: 'रद्दीकरण नीति',
      totalAmount: 'कुल देय राशि',
      whoIsTravelling: 'कौन यात्रा कर रहा है?',
      serviceUnavailable: 'क्षमा करें, यह सेवा वर्तमान में सीधे बुकिंग के लिए उपलब्ध नहीं है।',
      continueWithMakeMyTrip: 'MakeMyTrip के साथ जारी रखें',
    },
    accessibility: {
      title: 'सुगम पठन और एक्सेसिबिलिटी सेटिंग्स',
      textSize: 'अक्षरों का आकार',
      standard: 'सामान्य (100%)',
      large: 'बड़ा (115%)',
      extraLarge: 'बहुत बड़ा (130%)',
      highContrast: 'हाई कॉन्ट्रास्ट मोड',
      reducedMotion: 'एनिमेशन कम करें',
      language: 'ऐप भाषा',
      voiceAssistant: 'वॉयस असिस्टेंट सहायता',
      close: 'बंद करें',
      save: 'सेटिंग्स सुरक्षित करें',
    },
    common: {
      loading: 'जानकारी लोड हो रही है...',
      error: 'कुछ समस्या आई है',
      retry: 'पुनः प्रयास करें',
      back: 'पीछे जाएं',
      next: 'आगे बढ़ें',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
    },
  },
};
