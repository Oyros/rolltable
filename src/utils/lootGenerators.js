function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RARITIES = [
  { label: 'Sıradan', weight: 5 },
  { label: 'Nadir', weight: 3 },
  { label: 'Değerli', weight: 1 },
];

function pickRarity() {
  const total = RARITIES.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    if (roll < r.weight) return r.label;
    roll -= r.weight;
  }
  return RARITIES[0].label;
}

const LOOT_POOLS = {
  'post-apocalyptic': [
    'paslı çakı', 'yarı dolu su matarası', 'el yapımı gaz maskesi', 'eski dünya konservesi',
    'kırık ama çalışan pusula', 'radyasyon ölçer', 'kurşun kutusu mühimmat', 'tıbbi kit',
    'benzin bidonu', 'işlevsel el feneri', 'takas edilebilir kapak parası', 'eski dünya fotoğrafı',
  ],
  cyberpunk: [
    'kırık nöral implant', 'kredi çipi', 'şifreli veri diski', 'kaçak sinir stimülatörü',
    'holografik reklam projektörü', 'siber göz lensi', 'hacklenmiş erişim kartı', 'sentetik uyuşturucu ampulü',
    'silah üstü lazer nişangahı', 'kurumsal kimlik rozeti', 'kendinden temizlenen bıçak', 'kripto cüzdan',
  ],
  'high-fantasy': [
    'büyülü tılsım', 'ejder pulundan yapılma kalkan parçası', 'iksir şişesi', 'eski bir büyü kitabı sayfası',
    'gümüş kaplı hançer', 'peri tozu kesesi', 'runik yüzük', 'kutsanmış su',
    'altın sikke kesesi', 'değerli mücevher', 'antik bir tomar', 'ejder dişi',
  ],
  'gothic-horror': [
    'kanla lekeli günlük', 'gümüş haç', 'kurutulmuş kurtboğan çiçeği', 'mumdan yapılmış mühür',
    'eski bir mezar taşı parçası', 'lanetli madalyon', 'kırık ayna parçası', 'kutsal su şişesi',
    'el yazması dua kitabı', 'kemikten yapılmış düğme', 'sararmış bir mektup', 'gümüş kurşun',
  ],
  'sci-fi': [
    'yedek oksijen tüpü', 'kuantum pil hücresi', 'holografik harita çipi', 'onarım nano-kiti',
    'sinyal yükseltici', 'uzaylı alaşımdan parça', 'taşınabilir güç kaynağı', 'kripto anahtar kartı',
    'plazma hücresi', 'bozulmuş robot kolu', 'yıldız haritası verisi', 'acil durum feneri',
  ],
};

const CURRENCY_LABELS = {
  'post-apocalyptic': 'kapak parası',
  cyberpunk: 'kredi',
  'high-fantasy': 'altın',
  'gothic-horror': 'gümüş sikke',
  'sci-fi': 'kredi',
};

export function generateLoot(themeId) {
  const pool = LOOT_POOLS[themeId] || LOOT_POOLS['post-apocalyptic'];
  const currencyLabel = CURRENCY_LABELS[themeId] || 'altın';
  const rarity = pickRarity();
  const item = pick(pool);
  const roll = Math.random();

  if (roll < 0.25) {
    const amount = Math.floor(10 + Math.random() * 190);
    return `${amount} ${currencyLabel}`;
  }
  return `${rarity}: ${item}`;
}
