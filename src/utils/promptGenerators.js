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
};

export function generateQuestHook(themeId) {
  const subjects = QUEST_SUBJECTS[themeId] || QUEST_SUBJECTS['high-fantasy'];
  const problems = QUEST_PROBLEMS[themeId] || QUEST_PROBLEMS['high-fantasy'];
  const twists = QUEST_TWISTS[themeId] || QUEST_TWISTS['high-fantasy'];
  return `${pick(subjects)}, ${pick(problems)} yardım istiyor — ${pick(twists)}`;
}
