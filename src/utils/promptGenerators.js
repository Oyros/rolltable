function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const LOCATION_BANKS = {
  turkce: {
    'post-apocalyptic': {
      prefixes: ['Paslı', 'Kirli', 'Yıkık', 'Terkedilmiş', 'Zehirli', 'Karanlık', 'Harap', 'Çorak', 'Küllü', 'Radyoaktif'],
      nouns: ['Sığınak', 'Depo', 'İstasyon', 'Tünel', 'Fabrika', 'Kamp', 'Otoyol', 'Enkaz', 'Rafineri', 'Yeraltı Geçidi'],
      types: ['Sığınağı', 'Kampı', 'Harabesi', 'Bölgesi', ''],
    },
    cyberpunk: {
      prefixes: ['Neon', 'Çelik', 'Dijital', 'Karanlık', 'Elektrik', 'Sentetik', 'Islak', 'Kirli', 'Yüksek Voltaj', 'Alt Katman'],
      nouns: ['Sektör', 'Blok', 'Kule', 'Pazar', 'Rıhtım', 'Devre', 'Geçit', 'Terminal', 'Ağ Merkezi', 'Sokak'],
      types: ['Bölgesi', 'Kulesi', 'Pazarı', 'Terminali', ''],
    },
    'high-fantasy': {
      prefixes: [
        'Kızıl', 'Kara', 'Altın', 'Unutulmuş', 'Gölgeli', 'Kırık', 'Sessiz', 'Kutsal', 'Lanetli',
        'Ejderha', 'Kurt', 'Demir', 'Taşlı', 'Rüzgarlı', 'Buzlu', 'Yıldız', 'Ay',
      ],
      nouns: [
        'Kartal', 'Yılan', 'Kule', 'Vadi', 'Han', 'Değirmen', 'Köprü', 'Mağara', 'Orman', 'Liman',
        'Kale', 'Kuyu', 'Meydan', 'Zindan', 'Tapınak', 'Vaha',
      ],
      types: ['Hanı', 'Kalesi', 'Köyü', 'Kasabası', 'Tapınağı', 'Mağarası', 'Adası', 'Ormanı', 'Limanı', ''],
    },
    'gothic-horror': {
      prefixes: ['Kanlı', 'Mezar', 'Sisli', 'Lanetli', 'Unutulmuş', 'Karanlık', 'Çürük', 'Ölü', 'Yasta', 'Ayışığı'],
      nouns: ['Malikane', 'Mezarlık', 'Manastır', 'Şato', 'Kilise', 'Orman', 'Bataklık', 'Çan Kulesi', 'Zindan', 'Han'],
      types: ['Malikanesi', 'Mezarlığı', 'Manastırı', 'Şatosu', ''],
    },
    'sci-fi': {
      prefixes: ['Yıldız', 'Kuantum', 'Derin Uzay', 'Işık Hızı', 'Gölge', 'Buz', 'Kızılötesi', 'Yörünge', 'Sinyal', 'Terk Edilmiş'],
      nouns: ['İstasyon', 'Koloni', 'Gemi', 'Üs', 'Sektör', 'Kapsül', 'Laboratuvar', 'Ağ Düğümü', 'Gözlemevi', 'Liman'],
      types: ['İstasyonu', 'Kolonisi', 'Üssü', 'Laboratuvarı', ''],
    },
    western: {
      prefixes: ['Toz', 'Kızıl', 'Kurşun', 'Kavurucu', 'Issız', 'Kanlı', 'Terkedilmiş'],
      nouns: ['Kasaba', 'Saloon', 'Maden', 'Vadi', 'Demiryolu', 'Çiftlik', 'Kanyon'],
      types: ['Kasabası', 'Vadisi', 'Madeni', 'Çiftliği', ''],
    },
    steampunk: {
      prefixes: ['Buharlı', 'Pirinç', 'Dişli', 'Demir', 'Basınçlı', 'Vidalı'],
      nouns: ['Fabrika', 'Atölye', 'Kule', 'Liman', 'Rıhtım', 'Laboratuvar'],
      types: ['Fabrikası', 'Atölyesi', 'Kulesi', 'Limanı', ''],
    },
    pirate: {
      prefixes: ['Kızıl', 'Kara', 'Tuzlu', 'Fırtınalı', 'Gizli', 'Altın'],
      nouns: ['Koy', 'Liman', 'Ada', 'Batık', 'Mağara', 'Rıhtım'],
      types: ['Koyu', 'Limanı', 'Adası', 'Mağarası', ''],
    },
    mythology: {
      prefixes: ['Kutsal', 'Altın', 'Ölümsüz', 'Tanrısal', 'Kadim', 'Beyaz'],
      nouns: ['Tapınak', 'Dağ', 'Vadi', 'Sunak', 'Labirent', 'Bahçe'],
      types: ['Tapınağı', 'Dağı', 'Vadisi', 'Bahçesi', ''],
    },
    noir: {
      prefixes: ['Sisli', 'Karanlık', 'Islak', 'Puslu', 'Terkedilmiş', 'Gölgeli'],
      nouns: ['Sokak', 'Bar', 'Rıhtım', 'Otel', 'Kulüp', 'Depo'],
      types: ['Sokağı', 'Barı', 'Rıhtımı', 'Oteli', ''],
    },
    wuxia: {
      prefixes: ['Bulut', 'Ejder', 'Şafak', 'Sessiz', 'Kızıl', 'Yeşim'],
      nouns: ['Dağ', 'Manastır', 'Vadi', 'Han', 'Bambu Ormanı', 'Şelale'],
      types: ['Dağı', 'Manastırı', 'Vadisi', 'Hanı', ''],
    },
    'space-opera': {
      prefixes: ['Yıldız', 'Nebula', 'Derin Uzay', 'Kuantum', 'Yörünge', 'Kayıp'],
      nouns: ['İstasyon', 'Koloni', 'Gemi', 'Sektör', 'Liman', 'Üs'],
      types: ['İstasyonu', 'Kolonisi', 'Sektörü', 'Üssü', ''],
    },
    zombie: {
      prefixes: ['Terk Edilmiş', 'Enfekte', 'Karantina', 'Yıkık', 'Sessiz', 'Kanlı'],
      nouns: ['Hastane', 'Mahalle', 'Sığınak', 'Okul', 'AVM', 'Karakol'],
      types: ['Hastanesi', 'Mahallesi', 'Sığınağı', 'Karakolu', ''],
    },
    vampire: {
      prefixes: ['Kadim', 'Kanlı', 'Karanlık', 'Asil', 'Gece', 'Solgun'],
      nouns: ['Şato', 'Malikane', 'Opera Binası', 'Kulüp', 'Mezarlık', 'Salon'],
      types: ['Şatosu', 'Malikanesi', 'Kulübü', 'Salonu', ''],
    },
    viking: {
      prefixes: ['Buzlu', 'Demir', 'Kuzey', 'Fırtınalı', 'Kutsal', 'Kızıl'],
      nouns: ['Fiyort', 'Köy', 'Uzunev', 'Tapınak', 'Liman', 'Buzul'],
      types: ['Fiyordu', 'Köyü', 'Limanı', 'Tapınağı', ''],
    },
    arabian: {
      prefixes: ['Altın', 'Kızıl', 'Gizemli', 'Kutsanmış', 'Unutulmuş', 'Ay Işıklı'],
      nouns: ['Vaha', 'Saray', 'Pazar', 'Çöl', 'Kervansaray', 'Kubbe'],
      types: ['Vahası', 'Sarayı', 'Pazarı', 'Kervansarayı', ''],
    },
    'cosmic-horror': {
      prefixes: ['Unutulmuş', 'Derin', 'Adı Anılmayan', 'Kadim', 'Rüyasal', 'Çürük'],
      nouns: ['Kasaba', 'Uçurum', 'Fener', 'Manastır', 'Mağara', 'Kütüphane'],
      types: ['Kasabası', 'Uçurumu', 'Feneri', 'Kütüphanesi', ''],
    },
    superhero: {
      prefixes: ['Metro', 'Gökdelen', 'Gizli', 'Yıkık', 'Merkez', 'Işıklı'],
      nouns: ['Şehir', 'Üs', 'Laboratuvar', 'Kule', 'Meydan', 'Liman'],
      types: ['Şehri', 'Üssü', 'Laboratuvarı', 'Kulesi', ''],
    },
    heist: {
      prefixes: ['Lüks', 'Gizli', 'Yüksek Güvenlikli', 'Gece', 'Altın', 'Sessiz'],
      nouns: ['Kasa Dairesi', 'Kulüp', 'Banka', 'Müze', 'Kule', 'Casino'],
      types: ['Kasası', 'Kulübü', 'Bankası', 'Müzesi', ''],
    },
    kaiju: {
      prefixes: ['Yıkılmış', 'Devasa', 'Alarm Verilen', 'Terk Edilmiş', 'Sarsılan', 'Külrengi'],
      nouns: ['Şehir', 'Liman', 'Fabrika', 'Köprü', 'Üs', 'Sokak'],
      types: ['Şehri', 'Limanı', 'Köprüsü', 'Üssü', ''],
    },
    carnival: {
      prefixes: ['Çığırtkan', 'Karanlık', 'Renkli', 'Gizemli', 'Terk Edilmiş', 'Aynalı'],
      nouns: ['Çadır', 'Dönme Dolap', 'Ayna Evi', 'Panayır', 'Sirk', 'Geçit'],
      types: ['Çadırı', 'Panayırı', 'Sirki', 'Geçidi', ''],
    },
  },
  yabanci: {
    'post-apocalyptic': {
      prefixes: ['Rusted', 'Broken', 'Abandoned', 'Toxic', 'Scorched', 'Forgotten', 'Radioactive', 'Ashen', 'Barren', 'Cracked'],
      nouns: ['Shelter', 'Depot', 'Station', 'Tunnel', 'Factory', 'Camp', 'Wreckage', 'Refinery', 'Bunker', 'Overpass'],
      types: ['Shelter', 'Camp', 'Ruins', 'Zone', ''],
    },
    cyberpunk: {
      prefixes: ['Neon', 'Chrome', 'Digital', 'Static', 'Voltage', 'Synthetic', 'Wet', 'Low-Sector', 'High-Voltage', 'Grid'],
      nouns: ['Sector', 'Block', 'Spire', 'Market', 'Docks', 'Grid', 'Terminal', 'Junction', 'Alley', 'Node'],
      types: ['District', 'Tower', 'Market', 'Terminal', ''],
    },
    'high-fantasy': {
      prefixes: [
        'Crimson', 'Black', 'Golden', 'Forgotten', 'Shadow', 'Broken', 'Silent', 'Sacred', 'Cursed',
        'Iron', 'Frozen', 'Wind-swept', 'Ashen', 'Hollow', 'Starlit', 'Moonlit',
      ],
      nouns: [
        'Eagle', 'Serpent', 'Tower', 'Valley', 'Mill', 'Bridge', 'Cave', 'Forest', 'Harbor',
        'Keep', 'Well', 'Square', 'Dungeon', 'Shrine', 'Oasis',
      ],
      types: ['Inn', 'Keep', 'Village', 'Town', 'Temple', 'Cave', 'Isle', 'Woods', 'Harbor', ''],
    },
    'gothic-horror': {
      prefixes: ['Bloodied', 'Grave', 'Misty', 'Cursed', 'Forgotten', 'Shadowed', 'Rotting', 'Silent', 'Mourning', 'Pale'],
      nouns: ['Manor', 'Graveyard', 'Abbey', 'Castle', 'Chapel', 'Woods', 'Marsh', 'Belfry', 'Crypt', 'Inn'],
      types: ['Manor', 'Graveyard', 'Abbey', 'Castle', ''],
    },
    'sci-fi': {
      prefixes: ['Star', 'Quantum', 'Deep-Space', 'Lightspeed', 'Shadow', 'Frost', 'Infrared', 'Orbital', 'Signal', 'Derelict'],
      nouns: ['Station', 'Colony', 'Vessel', 'Outpost', 'Sector', 'Pod', 'Laboratory', 'Relay', 'Observatory', 'Dock'],
      types: ['Station', 'Colony', 'Outpost', 'Laboratory', ''],
    },
    western: {
      prefixes: ['Dusty', 'Lone', 'Rattlesnake', 'Sundown', 'Copper', 'Blood', 'Forsaken'],
      nouns: ['Gulch', 'Saloon', 'Mine', 'Canyon', 'Railroad', 'Ranch', 'Trail'],
      types: ['Town', 'Gulch', 'Mine', 'Ranch', ''],
    },
    steampunk: {
      prefixes: ['Brass', 'Copper', 'Steam', 'Clockwork', 'Iron', 'Riveted'],
      nouns: ['Foundry', 'Workshop', 'Spire', 'Harbor', 'Engine', 'Laboratory'],
      types: ['Foundry', 'Works', 'Spire', 'Harbor', ''],
    },
    pirate: {
      prefixes: ['Crimson', 'Black', 'Salty', 'Storm', 'Hidden', 'Golden'],
      nouns: ['Cove', 'Harbor', 'Isle', 'Wreck', 'Cave', 'Dock'],
      types: ['Cove', 'Harbor', 'Isle', 'Cave', ''],
    },
    mythology: {
      prefixes: ['Sacred', 'Golden', 'Eternal', 'Divine', 'Ancient', 'Marble'],
      nouns: ['Temple', 'Mount', 'Grove', 'Altar', 'Labyrinth', 'Garden'],
      types: ['Temple', 'Mount', 'Grove', 'Garden', ''],
    },
    noir: {
      prefixes: ['Foggy', 'Dark', 'Wet', 'Hazy', 'Abandoned', 'Shadowed'],
      nouns: ['Street', 'Bar', 'Dock', 'Hotel', 'Club', 'Warehouse'],
      types: ['Street', 'Bar', 'Dock', 'Hotel', ''],
    },
    wuxia: {
      prefixes: ['Cloud', 'Dragon', 'Dawn', 'Silent', 'Crimson', 'Jade'],
      nouns: ['Peak', 'Monastery', 'Valley', 'Pavilion', 'Bamboo Grove', 'Waterfall'],
      types: ['Peak', 'Monastery', 'Valley', 'Pavilion', ''],
    },
    'space-opera': {
      prefixes: ['Star', 'Nebula', 'Deep-Space', 'Quantum', 'Orbital', 'Lost'],
      nouns: ['Station', 'Colony', 'Vessel', 'Sector', 'Port', 'Outpost'],
      types: ['Station', 'Colony', 'Sector', 'Outpost', ''],
    },
    zombie: {
      prefixes: ['Abandoned', 'Infected', 'Quarantine', 'Ruined', 'Silent', 'Bloodstained'],
      nouns: ['Hospital', 'District', 'Shelter', 'School', 'Mall', 'Precinct'],
      types: ['Hospital', 'District', 'Shelter', 'Precinct', ''],
    },
    vampire: {
      prefixes: ['Ancient', 'Bloodstained', 'Shadowed', 'Noble', 'Midnight', 'Pale'],
      nouns: ['Castle', 'Manor', 'Opera House', 'Club', 'Cemetery', 'Parlor'],
      types: ['Castle', 'Manor', 'Club', 'Parlor', ''],
    },
    viking: {
      prefixes: ['Frozen', 'Iron', 'Northern', 'Stormy', 'Sacred', 'Crimson'],
      nouns: ['Fjord', 'Village', 'Longhouse', 'Shrine', 'Harbor', 'Glacier'],
      types: ['Fjord', 'Village', 'Harbor', 'Shrine', ''],
    },
    arabian: {
      prefixes: ['Golden', 'Crimson', 'Mysterious', 'Blessed', 'Forgotten', 'Moonlit'],
      nouns: ['Oasis', 'Palace', 'Bazaar', 'Desert', 'Caravanserai', 'Dome'],
      types: ['Oasis', 'Palace', 'Bazaar', 'Caravanserai', ''],
    },
    'cosmic-horror': {
      prefixes: ['Forgotten', 'Deep', 'Unspeakable', 'Ancient', 'Dreaming', 'Rotting'],
      nouns: ['Town', 'Abyss', 'Lighthouse', 'Monastery', 'Cave', 'Library'],
      types: ['Town', 'Abyss', 'Lighthouse', 'Library', ''],
    },
    superhero: {
      prefixes: ['Metro', 'Skyline', 'Secret', 'Ruined', 'Central', 'Neon'],
      nouns: ['City', 'Base', 'Laboratory', 'Tower', 'Plaza', 'Harbor'],
      types: ['City', 'Base', 'Laboratory', 'Tower', ''],
    },
    heist: {
      prefixes: ['Lavish', 'Hidden', 'High-Security', 'Midnight', 'Golden', 'Silent'],
      nouns: ['Vault', 'Club', 'Bank', 'Museum', 'Tower', 'Casino'],
      types: ['Vault', 'Club', 'Bank', 'Casino', ''],
    },
    kaiju: {
      prefixes: ['Ruined', 'Colossal', 'Alarmed', 'Abandoned', 'Trembling', 'Ashen'],
      nouns: ['City', 'Harbor', 'Factory', 'Bridge', 'Base', 'Street'],
      types: ['City', 'Harbor', 'Bridge', 'Base', ''],
    },
    carnival: {
      prefixes: ['Garish', 'Dark', 'Colorful', 'Mysterious', 'Abandoned', 'Mirrored'],
      nouns: ['Tent', 'Ferris Wheel', 'Mirror House', 'Fairground', 'Circus', 'Midway'],
      types: ['Tent', 'Fairground', 'Circus', 'Midway', ''],
    },
  },
};

export const LOCATION_CATEGORIES = [
  { id: 'turkce', label: 'Türkçe' },
  { id: 'yabanci', label: 'Yabancı' },
];

export function generateLocationName(lang, themeId) {
  const langBank = LOCATION_BANKS[lang] || LOCATION_BANKS.turkce;
  const bank = langBank[themeId] || langBank['high-fantasy'];
  const prefix = pick(bank.prefixes);
  const noun = pick(bank.nouns);
  const type = pick(bank.types);
  return type ? `${prefix} ${noun} ${type}` : `${prefix} ${noun}`;
}

const QUEST_SUBJECTS = {
  'post-apocalyptic': [
    'Sığınaktaki yaşlı bir kâhya', 'Sert bir kervan lideri', 'Yaralı bir gezgin',
    'Yeraltı barınağının reisi', 'Son su kaynağını koruyan bir grup', 'Radyo sinyaliyle yardım isteyen biri',
    'Genç bir hurdacı', 'Kayıp bir keşif ekibinin son üyesi', 'Takas pazarının sahibi',
  ],
  cyberpunk: [
    'Alt tabakadan bir hacker', 'Kurumsal bir muhbir', 'Sokak çetesinin genç bir üyesi',
    'Eski bir kurumsal ajan', 'Barmenlik yapan eski bir asker', 'Yeraltı doktoru',
    'Bilinci yedeklenen bir müşteri', 'Sınır dışı edilmiş bir mühendis', 'Bağımsız bir haberci',
  ],
  'high-fantasy': [
    'Yaşlı bir tüccar', 'Köyün muhtarı', 'Gizemli bir yabancı',
    'Yerel bir zanaatkar', 'Kayıp bir çocuğun ailesi', 'Kervan lideri',
    'Gezgin bir şifacı', 'Tapınağın genç rahibesi', 'Emekli bir paralı asker',
  ],
  'gothic-horror': [
    'Yaşlı bir başrahip', 'Malikanenin sadık uşağı', 'Yas tutan dul bir kontes',
    'Köy mezarcısı', 'Gece bekçisi', 'Tımarhaneden kaçan bir hasta',
    'Şüpheci bir gazeteci', 'Ailenin son yaşayan üyesi', 'Kasabanın falcı kadını',
  ],
  'sci-fi': [
    'Gemi mühendisi', 'Koloni valisi', 'Yapay zeka birimi',
    'Kaçak bir klon', 'İstasyon güvenlik şefi', 'Sinyal analisti',
    'Emekli bir asteroit madencisi', 'Karantina doktoru', 'Filo komuta yardımcısı',
  ],
  western: [
    'Yorgun bir şerif', 'Genç bir çiftlik sahibi', 'Gizemli bir silahşör',
    'Kasabanın berberi', 'Bir tren istasyonu memuru', 'Dul bir kadın',
  ],
  steampunk: [
    'Deli bir mucit', 'Fabrika ustabaşısı', 'Gizli bir mühendis loncası üyesi',
    'Buharlı gemi kaptanı', 'Zengin bir sanayici', 'Kaçak bir otomaton',
  ],
  pirate: [
    'Yaşlı bir kaptan', 'Liman kâhyası', 'Kaçak bir mürettebat üyesi',
    'Zengin bir tüccar', 'Efsanevi bir korsan', 'Deniz feneri bekçisi',
  ],
  mythology: [
    'Yaşlı bir kâhin', 'Tapınağın baş rahibesi', 'Sürgün edilmiş bir yarı-tanrı',
    'Köyün ihtiyar bilgesi', 'Kutsal korunun bekçisi', 'Kayıp bir kahraman',
  ],
  noir: [
    'Yorgun bir dedektif', 'Gizemli bir müşteri', 'Kayıp bir tanık',
    'Yozlaşmış bir polis memuru', 'Gece kulübü sahibi', 'Eski bir suç ortağı',
  ],
  wuxia: [
    'Yaşlı bir usta', 'Genç bir çırak', 'Sürgün edilmiş bir savaşçı',
    'Manastırın başrahibi', 'Gizli bir suikastçı', 'Köyün ihtiyar şifacısı',
  ],
  'space-opera': [
    'Yıldız gemisi kaptanı', 'Koloni valisi', 'Kaçak bir android',
    'Galaktik tüccar', 'İsyancı bir pilot', 'İstasyon komutanı',
  ],
  zombie: [
    'Son hayatta kalanlardan biri', 'Karantina bölgesi doktoru', 'Silahlı bir çete lideri',
    'Kayıp bir aile', 'Eski bir asker', 'Radyo operatörü',
  ],
  vampire: [
    'Kadim bir vampir lordu', 'Genç bir yeni-doğan', 'İnsan bir muhbir',
    'Avcı loncası üyesi', 'Gece kulübü sahibi', 'Sürgün edilmiş bir asilzade',
  ],
  viking: [
    'Yaşlı bir şef', 'Genç bir savaşçı', 'Bir skald (ozan)',
    'Sürgün edilmiş bir prens', 'Şaman bir kadın', 'Gemi kaptanı',
  ],
  arabian: [
    'Yaşlı bir hikaye anlatıcısı', 'Saray veziri', 'Kaçak bir cin',
    'Kervan lideri', 'Genç bir sultan', 'Çölün bilge kadını',
  ],
  'cosmic-horror': [
    'Paranoyak bir akademisyen', 'Kasabanın son sakini', 'Deniz feneri bekçisi',
    'Gizli bir tarikat üyesi', 'Kayıp bir kaşif', 'Kütüphaneci',
  ],
  superhero: [
    'Emekli bir kahraman', 'Genç bir çırak', 'Şehrin polis şefi',
    'Gizemli bir muhbir', 'Bilim insanı', 'Eski bir kötü adam',
  ],
  heist: [
    'Emekli bir hırsız', 'Genç bir hacker', 'Kasa uzmanı',
    'İçeriden bir muhbir', 'Zengin bir koleksiyoncu', 'Eski bir ortak',
  ],
  kaiju: [
    'Askeri komutan', 'Bilim insanı', 'Şehrin belediye başkanı',
    'Devasa robot pilotu', 'Gazeteci', 'Hayatta kalan bir sivil',
  ],
  carnival: [
    'Gizemli bir sirk yöneticisi', 'Genç bir cambaz', 'Kayıp bir palyaço',
    'Fal bakan kadın', 'Panayır işletmecisi', 'Ayna evi bekçisi',
  ],
};

const QUEST_PROBLEMS = {
  'post-apocalyptic': [
    'bir mutant sürüsünün saldırılarından', 'kuruyan son temiz su kaynağından',
    'radyasyonla kirlenmiş bir bölgeden', 'bir haydut çetesinin haraç istemesinden',
    'kayıp bir kervan konvoyundan', 'bozulan hayati bir jeneratörden',
    'sığınağa sızan zehirli gazdan', 'çalınan bir tohum stokundan',
  ],
  cyberpunk: [
    'bir şirketin sildiği verilerden', 'kaçırılan bir yakınından',
    'bozuk bir nöral implanttan', 'rakip bir çetenin bölge kavgasından',
    'kurumsal bir suikast listesinden', 'kaçak bir yapay zekadan',
    'sızdırılan bir kurumsal sırdan', 'kontrolden çıkan bir güvenlik dronundan',
  ],
  'high-fantasy': [
    'bir grup haydudun tehdidinden', 'kaybolan bir aile yadigarından', 'gizemli bir hastalıktan',
    'lanetli bir topraktan', 'ormanın derinliklerinden gelen seslerden', 'ansızın ortaya çıkan bir yaratıktan',
    'mühürlü bir mezarın açılmasından', 'kuruyan kutsal bir pınardan',
  ],
  'gothic-horror': [
    'geceleri uyanan bir lanetten', 'mezarlıktan gelen tuhaf seslerden',
    'ailesine musallat olan bir hayaletten', 'kanı çekilmiş cesetlerden',
    'eski bir ailenin kara sırrından', 'ay ışığında değişen bir yakınından',
    'köyde yayılan gizemli bir çılgınlıktan', 'mühürlü bir kapının ardından gelen fısıltılardan',
  ],
  'sci-fi': [
    'sistemden kaybolan bir mürettebattan', 'bozulan yaşam destek sisteminden',
    'ele geçirilen bir kolonizasyon gemisinden', 'gizemli bir uzay sinyalinden',
    'isyan eden bir robot birliğinden', 'karantinaya alınan bir istasyondan',
    'kontrolü kaybedilen bir deney biriminden', 'bilinmeyen bir enkazın yaydığı sinyalden',
  ],
  western: [
    'topraklarını ele geçirmek isteyen bir demiryolu şirketinden', 'bir haydut çetesinin baskınından',
    'kayıp bir altın madeni haritasından', 'kasabaya sızan bir kumarbazdan',
    'çalınan bir sürüden', 'sınırdaki gizemli cinayetlerden',
  ],
  steampunk: [
    'çalınan bir icat planından', 'kontrolden çıkan bir makineden',
    'rakip bir loncanın sabotajından', 'patlayan bir buhar kazanından',
    'kayıp bir mühendisten', 'yasaklı bir enerji kaynağından',
  ],
  pirate: [
    'gömülü bir hazine haritasından', 'rakip bir korsan gemisinin tehdidinden',
    'isyan eden bir mürettebattan', 'deniz canavarı söylentilerinden',
    'kayıp bir kaptan yardımcısından', 'kraliyet donanmasının takibinden',
  ],
  mythology: [
    'tanrıların gazabından', 'kehanetin gerçekleşmesinden',
    'çalınan kutsal bir eşyadan', 'labirentte kaybolan bir kahramandan',
    'lanetli bir soydan', 'canavarın uyanmasından',
  ],
  noir: [
    'çözülmemiş bir cinayetten', 'kayıp bir kişinin izinden',
    'şantaj yapan bir muhbirden', 'yozlaşmış bir çete savaşından',
    'kaybolan gizli belgelerden', 'sahte bir alibiden',
  ],
  wuxia: [
    'çalınan kutsal bir kılıçtan', 'rakip bir dövüş okulunun tehdidinden',
    'ailesinin intikamından', 'gizli bir teknik kitabından',
    'haydutların köyü basmasından', 'ustasının ölümünün sırrından',
  ],
  'space-opera': [
    'kaybolan bir yıldız gemisinden', 'düşman bir imparatorluğun tehdidinden',
    'isyan eden bir kolonizasyon filosundan', 'gizemli bir sinyalden',
    'kaçak bir yapay zekadan', 'enerji krizinden',
  ],
  zombie: [
    'enfekte bölgeye sıkışan bir gruptan', 'tükenen erzaktan',
    'silahlı bir çetenin saldırısından', 'kayıp bir tedavi formülünden',
    'enfekte olan bir yakınından', 'kapalı kalan bir sığınaktan',
  ],
  vampire: [
    'klan savaşından', 'insanlara sızan bir sırdan',
    'avcıların tehdidinden', 'kayıp bir kadim eserden',
    'ihanet eden bir müttefikten', 'gün ışığında yakalanma riskinden',
  ],
  viking: [
    'rakip bir klanın baskınından', 'kutsal bir silahın çalınmasından',
    'donan bir kışın kıtlığından', 'tanrıların gazabından',
    'kayıp bir akınından', 'düşman bir donanmanın yaklaşmasından',
  ],
  arabian: [
    'çalınan bir sihirli lambadan', 'saraydaki bir komplodan',
    'kaybolan bir kervandan', 'lanetli bir dilekten',
    'kum fırtınasında kaybolan bir vahadan', 'kıskanç bir vezirin entrikasından',
  ],
  'cosmic-horror': [
    'adı anılmaması gereken bir kitaptan', 'denizden gelen tuhaf seslerden',
    'kaybolan bir araştırma ekibinden', 'gerçekliğin bozulmasından',
    'rüyalarda beliren bir varlıktan', 'kasabanın yavaşça değişmesinden',
  ],
  superhero: [
    'şehri tehdit eden bir süper kötüden', 'kaçırılan bir bilim insanından',
    'kontrolden çıkan bir deneyden', 'gizli kimliğin ifşa olma riskinden',
    'rakip bir kahraman takımından', 'şehri saran bir enerji krizinden',
  ],
  heist: [
    'yüksek güvenlikli bir kasadan', 'ihanet eden bir ekip üyesinden',
    'değerli bir tablonun çalınmasından', 'polisin izini sürmesinden',
    'rakip bir çetenin aynı hedefe göz dikmesinden', 'planın sızdırılmasından',
  ],
  kaiju: [
    'şehre yaklaşan bir canavardan', 'canavarı durduracak silahın eksikliğinden',
    'tahliye edilemeyen bir bölgeden', 'canavarı kışkırtan bir deneyden',
    'ikinci bir canavarın belirmesinden', 'ordunun başarısız savunmasından',
  ],
  carnival: [
    'kaybolan bir sirk üyesinden', 'lanetli bir aynadan',
    'kasabaya musallat olan panayırdan', 'gizemli bir davetiyeden',
    'kaçan bir sirk canavarından', 'gece yarısı başlayan tuhaf bir gösteriden',
  ],
};

const QUEST_TWISTS = {
  'post-apocalyptic': [
    'ama su kaynağı zaten başka bir grup tarafından işaretlenmiş.',
    've bulunan şey hayatta kalmaktan çok daha değerli çıkabilir.',
    'ama zaman kısıtlı, radyasyon seviyesi hızla yükseliyor.',
    've bu, daha büyük bir çete savaşının sadece başlangıcı.',
    'ama yardım isteyen kişi son hayatta kalanları koruyor gibi görünmüyor.',
    've bir şeyin (ya da birinin) karanlıkta izlediği hissediliyor.',
  ],
  cyberpunk: [
    'ama gerçek veri, göründüğünden çok daha tehlikeli bir sır saklıyor.',
    've ödül, beklenenden çok daha büyük bir kurumsal komployu açığa çıkarabilir.',
    'ama zaman kısıtlı, kurumsal güvenlik zaten hareket halinde.',
    've bu, şehir çapında bir güç mücadelesinin sadece bir parçası.',
    'ama yardım isteyen kişi tamamen dürüst değil, kendi ajandası var.',
    've biri (ya da bir şey) her hareketi izliyor gibi hissettiriyor.',
  ],
  'high-fantasy': [
    'ama gerçek aslında göründüğünden çok daha karanlık.',
    've ödül beklenenden çok daha değerli.',
    'ama zaman kısıtlı, biri zaten harekete geçmiş.',
    've bu, daha büyük bir komplonun sadece bir parçası.',
    'ama yardım istenen kişi tamamen dürüst değil.',
    've bir şey (ya da biri) takip ediliyor gibi hissettiriyor.',
  ],
  'gothic-horror': [
    'ama gerçek, mezarın ötesinden gelen çok daha eski bir laneti saklıyor.',
    've çözüm, ailenin en karanlık sırrını gün yüzüne çıkarabilir.',
    'ama zaman kısıtlı, dolunay yaklaşıyor.',
    've bu, kasabanın kuruluşuna kadar uzanan bir komplonun parçası.',
    'ama yardım isteyen kişi göründüğü kadar masum değil.',
    've karanlıkta bir şeyin nefes aldığı hissediliyor.',
  ],
  'sci-fi': [
    'ama gerçek, göründüğünden çok daha eski bir teknolojiye dayanıyor.',
    've ödül, tüm koloninin geleceğini değiştirebilecek kadar değerli.',
    'ama zaman kısıtlı, sistem arızası hızla yayılıyor.',
    've bu, daha büyük bir filo çapında komplonun sadece bir parçası.',
    'ama yardım isteyen kişi tüm gerçeği paylaşmıyor.',
    've bir şeyin (ya da birinin) sinyalleri izlediği hissediliyor.',
  ],
  western: [
    'ama şerifin kendisi de bu işin içinde.',
    've ödül beklenenden çok daha büyük bir servet.',
    'ama zaman kısıtlı, tren yarın kasabadan geçiyor.',
    've bu, daha büyük bir toprak kavgasının parçası.',
    'ama yardım isteyen kişi tam olarak dürüst değil.',
    've biri kasabaya çoktan sızmış gibi hissettiriyor.',
  ],
  steampunk: [
    'ama icat, göründüğünden çok daha tehlikeli.',
    've ödül, tüm şehrin geleceğini değiştirebilir.',
    'ama zaman kısıtlı, makine her an patlayabilir.',
    've bu, daha büyük bir sanayi savaşının parçası.',
    'ama yardım isteyen mucit tüm gerçeği söylemiyor.',
    've dişlilerin arkasında bir şeyin izlediği hissediliyor.',
  ],
  pirate: [
    'ama hazine göründüğünden çok daha lanetli.',
    've ödül tüm mürettebatı zengin edebilir.',
    'ama zaman kısıtlı, fırtına yaklaşıyor.',
    've bu, daha büyük bir korsan ittifakının parçası.',
    'ama yardım isteyen kaptan tam olarak güvenilir değil.',
    've derinlerde bir şeyin izlediği hissediliyor.',
  ],
  mythology: [
    'ama kehanet göründüğünden çok daha karmaşık.',
    've ödül ölümsüzlük kadar değerli.',
    'ama zaman kısıtlı, tanrılar sabırsız.',
    've bu, daha büyük bir tanrısal komplonun parçası.',
    'ama yardım isteyen kişi tam olarak insan değil.',
    've tanrı dağından bir şeyin izlediği hissediliyor.',
  ],
  noir: [
    'ama gerçek, göründüğünden çok daha karanlık.',
    've ödül beklenenden çok daha tehlikeli bilgiler içeriyor.',
    'ama zaman kısıtlı, polis de peşinde.',
    've bu, şehir çapında bir komplonun sadece bir parçası.',
    'ama müşteri tam olarak dürüst değil.',
    've biri sokağın karşısından izliyor gibi hissettiriyor.',
  ],
  wuxia: [
    'ama gerçek, göründüğünden çok daha derin bir onur meselesi.',
    've ödül, kayıp bir dövüş sanatının sırrı olabilir.',
    'ama zaman kısıtlı, turnuva yarın başlıyor.',
    've bu, iki büyük okul arasındaki eski bir husumetin parçası.',
    'ama yardım isteyen usta tüm gerçeği söylemiyor.',
    've gölgelerde bir suikastçının izlediği hissediliyor.',
  ],
  'space-opera': [
    'ama sinyal, göründüğünden çok daha eski bir uygarlığa ait.',
    've ödül, tüm galaksinin dengesini değiştirebilir.',
    'ama zaman kısıtlı, filo yaklaşıyor.',
    've bu, imparatorluklar arası bir savaşın sadece başlangıcı.',
    'ama yardım isteyen kaptan tüm gerçeği paylaşmıyor.',
    've yıldızların arasında bir şeyin izlediği hissediliyor.',
  ],
  zombie: [
    'ama tedavi göründüğünden çok daha tehlikeli bir bedel istiyor.',
    've ödül, son güvenli bölgeye ulaşmak olabilir.',
    'ama zaman kısıtlı, enfeksiyon hızla yayılıyor.',
    've bu, hayatta kalanlar arasındaki daha büyük bir çatışmanın parçası.',
    'ama yardım isteyen kişi ısırılmış olabilir.',
    've karanlıkta bir şeylerin takip ettiği hissediliyor.',
  ],
  vampire: [
    'ama gerçek, kadim bir klan sırrına dayanıyor.',
    've ödül, sonsuz yaşamdan bile değerli olabilir.',
    'ama zaman kısıtlı, şafak yaklaşıyor.',
    've bu, yüzyıllardır süren bir klan savaşının parçası.',
    'ama yardım isteyen kişi tamamen güvenilir değil.',
    've karanlıkta biri sürekli izliyor gibi hissettiriyor.',
  ],
  viking: [
    'ama gerçek, eski tanrıların bir sınavı olabilir.',
    've ödül, klanın onuru kadar değerli.',
    'ama zaman kısıtlı, kış yaklaşıyor.',
    've bu, iki klan arasındaki eski bir kan davasının parçası.',
    'ama yardım isteyen şef tam olarak dürüst değil.',
    've buzun altında bir şeyin uyandığı hissediliyor.',
  ],
  arabian: [
    'ama lamba, göründüğünden çok daha tehlikeli bir güce sahip.',
    've ödül, bir sultanlığı değiştirebilir.',
    'ama zaman kısıtlı, üç dilek hakkı azalıyor.',
    've bu, saray içindeki daha büyük bir entrikanın parçası.',
    'ama yardım isteyen cin tam olarak dürüst değil.',
    've kum tanelerinin arasında bir şeyin fısıldadığı hissediliyor.',
  ],
  'cosmic-horror': [
    'ama gerçek, insan aklının kaldıramayacağı kadar büyük.',
    've bilgi, delilikten başka bir ödül vermeyebilir.',
    'ama zaman kısıtlı, gerçeklik hızla çözülüyor.',
    've bu, kadim bir varlığın uyanışının sadece başlangıcı.',
    'ama yardım isteyen kişi artık tam olarak insan değil.',
    've derinlerden bir şeyin izlediği hissediliyor.',
  ],
  superhero: [
    'ama kötü adamın planı göründüğünden çok daha büyük.',
    've ödül, şehrin geleceğini kurtarabilir.',
    'ama zaman kısıtlı, şehir çapında bir saldırı yaklaşıyor.',
    've bu, daha büyük bir komplonun sadece başlangıcı.',
    'ama yardım isteyen kişi tam olarak masum değil.',
    've gökyüzünden bir şeyin izlediği hissediliyor.',
  ],
  heist: [
    'ama kasanın içinde beklenenden çok daha fazlası var.',
    've ödül, tüm ekibi ömür boyu zengin edebilir.',
    'ama zaman kısıtlı, güvenlik değişimi yakında.',
    've bu, daha büyük bir suç imparatorluğunun planının parçası.',
    'ama işi ayarlayan kişi tam olarak güvenilir değil.',
    've biri ekibi baştan beri izliyor gibi hissettiriyor.',
  ],
  kaiju: [
    'ama canavar, göründüğünden çok daha zeki.',
    've çözüm, şehrin geleceğini kurtarabilir.',
    'ama zaman kısıtlı, canavar hızla yaklaşıyor.',
    've bu, canavarların neden ortaya çıktığına dair daha büyük bir sırrın parçası.',
    'ama yardım isteyen bilim insanı tüm gerçeği söylemiyor.',
    've denizin altından bir şeyin daha geldiği hissediliyor.',
  ],
  carnival: [
    'ama panayır, göründüğünden çok daha eski ve karanlık.',
    've ödül, hayatın kendisi kadar değerli olabilir.',
    'ama zaman kısıtlı, gösteri gece yarısı bitiyor.',
    've bu, kasabanın unutulmuş bir geçmişinin parçası.',
    'ama yardım isteyen palyaço tam olarak göründüğü gibi değil.',
    've aynalardan bir şeyin izlediği hissediliyor.',
  ],
};

export function generateQuestHook(themeId) {
  const subjects = QUEST_SUBJECTS[themeId] || QUEST_SUBJECTS['high-fantasy'];
  const problems = QUEST_PROBLEMS[themeId] || QUEST_PROBLEMS['high-fantasy'];
  const twists = QUEST_TWISTS[themeId] || QUEST_TWISTS['high-fantasy'];
  return `${pick(subjects)}, ${pick(problems)} yardım istiyor — ${pick(twists)}`;
}
