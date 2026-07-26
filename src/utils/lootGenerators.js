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
    'ev yapımı süzgeç filtresi', 'kırık gözlük', 'tohum paketi', 'yağmurluk',
    'eski bir radyo parçası', 'paslanmaz çelik bıçak',
  ],
  cyberpunk: [
    'kırık nöral implant', 'kredi çipi', 'şifreli veri diski', 'kaçak sinir stimülatörü',
    'holografik reklam projektörü', 'siber göz lensi', 'hacklenmiş erişim kartı', 'sentetik uyuşturucu ampulü',
    'silah üstü lazer nişangahı', 'kurumsal kimlik rozeti', 'kendinden temizlenen bıçak', 'kripto cüzdan',
    'yedek pil hücresi', 'sahte biyometrik parmak izi', 'gürültü engelleyici çip', 'holografik maske',
    'mini drone gövdesi', 'şifreli iletişim cihazı',
  ],
  'high-fantasy': [
    'büyülü tılsım', 'ejder pulundan yapılma kalkan parçası', 'iksir şişesi', 'eski bir büyü kitabı sayfası',
    'gümüş kaplı hançer', 'peri tozu kesesi', 'runik yüzük', 'kutsanmış su',
    'altın sikke kesesi', 'değerli mücevher', 'antik bir tomar', 'ejder dişi',
    'büyülenmiş pelerin tokası', 'elf işi bir ok', 'kehanet taşı', 'zehir panzehiri',
    'gümüş kolye', 'unutulmuş bir kralın mührü',
  ],
  'gothic-horror': [
    'kanla lekeli günlük', 'gümüş haç', 'kurutulmuş kurtboğan çiçeği', 'mumdan yapılmış mühür',
    'eski bir mezar taşı parçası', 'lanetli madalyon', 'kırık ayna parçası', 'kutsal su şişesi',
    'el yazması dua kitabı', 'kemikten yapılmış düğme', 'sararmış bir mektup', 'gümüş kurşun',
    'siyah dantelli eldiven', 'mumyalanmış bir kuş kalıntısı', 'eski bir cenaze daveti', 'kırık bir müzik kutusu',
    'kurşun mühürlü şişe', 'solmuş bir aile portresi',
  ],
  'sci-fi': [
    'yedek oksijen tüpü', 'kuantum pil hücresi', 'holografik harita çipi', 'onarım nano-kiti',
    'sinyal yükseltici', 'uzaylı alaşımdan parça', 'taşınabilir güç kaynağı', 'kripto anahtar kartı',
    'plazma hücresi', 'bozulmuş robot kolu', 'yıldız haritası verisi', 'acil durum feneri',
    'yedek basınç contası', 'donmuş biyolojik örnek', 'mini yerçekimi jeneratörü', 'iletişim bobini',
    'kriyo uyku kapsülü anahtarı', 'tanımlanamayan bir alaşım külçesi',
  ],
  western: [
    'paslı revolver', 'deri eyer çantası', 'altın cep saati', 'viski şişesi',
    'poker destesi', 'nal', 'dinamit çubuğu', 'kovboy şapkası',
    'ödüllü ihbar kağıdı', 'gümüş mahmuz', 'tütün kesesi', 'eski bir harita',
  ],
  steampunk: [
    'pirinç cep saati', 'buhar tüpü', 'dişli çark seti', 'mekanik el',
    'basınç göstergesi', 'bakır anahtar', 'uçuş gözlüğü', 'otomaton parçası',
    'enerji kristali', 'şifreli plan', 'vida takımı', 'buharlı fener',
  ],
  pirate: [
    'altın dublon kesesi', 'pusula', 'İskorbüt ilacı', 'harita parçası',
    'rom şişesi', 'inci kolye', 'kılıç kını', 'papağan tüyü',
    'batık gemi çanı', 'mühürlü mektup', 'gümüş kama', 'deniz feneri anahtarı',
  ],
  mythology: [
    'altın laurel', 'kutsanmış zeytin dalı', 'mermer heykelcik', 'tanrı mühürlü yüzük',
    'kehanet parşömeni', 'ambrosia şişesi', 'bronz kalkan parçası', 'kutsal su testisi',
    'oracle kemikleri', 'altın elma', 'lir teli', 'kutsal küllü kap',
  ],
  noir: [
    'dolgun bir nakit zarfı', 'ruj izli sigara', 'silah kılıfı', 'şifreli not',
    'fotoğraf negatifi', 'kırık gözlük', 'viski kadehi', 'gizli anahtar',
    'poker fişi', 'saat kösteği', 'kanlı mendil', 'dedektif rozeti',
  ],
  wuxia: [
    'jade kolye', 'gizli teknik kitabı', 'zehir panzehiri', 'ipek kılıç kını',
    'akupunktur iğneleri', 'kutsanmış tütsü', 'demir yumruk sargısı', 'ejder pulundan tılsım',
    'çay seremonisi takımı', 'gümüş şuriken', 'lotus tohumu', 'usta mührü',
  ],
  'space-opera': [
    'plazma hücresi', 'holo-harita', 'kuantum anahtar', 'yıldız haritası çipi',
    'nebula tozu örneği', 'antik uygarlık parçası', 'enerji kalkanı jeneratörü', 'kripto kredi çubuğu',
    'sinyal fişeği', 'uzaylı alaşımı', 'yörünge pasaportu', 'gravite stabilizatörü',
  ],
  zombie: [
    'antibiyotik şişesi', 'el yapımı bıçak', 'konserve kutusu', 'sargı bezi',
    'benzin bidonu', 'radyo pili', 'gaz maskesi', 'ateşleme çakmağı',
    'ilaç kutusu', 'işlevsel el feneri', 'takas fişi', 'eski bir aile fotoğrafı',
  ],
  vampire: [
    'kristal kadeh', 'gümüş haç kolye', 'kadim mühür yüzüğü', 'kadife eldiven',
    'gece çiçeği özütü', 'antika broş', 'kan kırmızı yakut', 'gizli mezar anahtarı',
    'ipek pelerin tokası', 'kadim ahit kağıdı', 'gümüş kama', 'zehirli parfüm şişesi',
  ],
  viking: [
    'run taşı', 'demir kolbant', 'boynuz kadeh', 'kürk pelerin',
    'balta sapı süsü', 'gümüş bilezik', 'kehribar kolye', 'kutsal odun parçası',
    'gemi çivisi', 'deri harita', 'buz kristali', 'savaş boyası kabı',
  ],
  arabian: [
    'sönük sihirli lamba', 'ipek halı parçası', 'baharat kesesi', 'altın bilezik',
    'kehanet küresi', 'inci taçlı hançer', 'tütsü kutusu', 'yakut yüzük',
    'deve çanı', 'eski papirüs', 'gümüş su matarası', 'zümrüt küpe',
  ],
  'cosmic-horror': [
    'adı anılmayan kitap sayfası', 'garip taş oymalar', 'kurutulmuş deniz canlısı', 'mühürlü şişe',
    'tuhaf açılı pusula', 'kemik düğme', 'çürümüş günlük', 'cam göz',
    'kadim mühür', 'fısıltılı kabuk', 'kanlı ritüel bıçağı', 'anlaşılmaz harita',
  ],
  superhero: [
    'enerji hücresi', 'gizli kimlik rozeti', 'zırh parçası', 'sinyal cihazı',
    'esrarengiz kristal', 'gadget prototipi', 'pelerin tokası', 'gizli mesaj kartı',
    'güç eldiveni', 'takip cihazı', 'maske', 'antik güç yüzüğü',
  ],
  heist: [
    'elmas gerdanlık', 'sahte kimlik kartı', 'kasa şifresi notu', 'altın külçe',
    'nadir tablo parçası', 'şifre çözücü cihaz', 'gümüş çakmak', 'gizli anahtar kartı',
    'nakit deste', 'koleksiyon saat', 'mücevher kutusu', 'plan çizimi',
  ],
  kaiju: [
    'canavar pulu', 'radyoaktif örnek', 'ordu künyesi', 'hasarlı drone parçası',
    'acil durum çantası', 'canavar dişi', 'enerji ölçer', 'tahliye bileti',
    'sağlam bir gaz maskesi', 'şehir haritası', 'sinyal fişeği', 'zırh plakası',
  ],
  carnival: [
    'aynalı maske', 'renkli konfeti kesesi', 'sihirli kart destesi', 'palyaço burnu',
    'eski bir bilet', 'müzik kutusu', 'ayna kırığı', 'ipli kukla',
    'fal kartı destesi', 'parlak boncuk kolye', 'gizemli anahtar', 'kadife eldiven',
  ],
};

const CURRENCY_LABELS = {
  'post-apocalyptic': 'kapak parası',
  cyberpunk: 'kredi',
  'high-fantasy': 'altın',
  'gothic-horror': 'gümüş sikke',
  'sci-fi': 'kredi',
  western: 'dolar',
  steampunk: 'lonca kredisi',
  pirate: 'dublon',
  mythology: 'drahmi',
  noir: 'dolar',
  wuxia: 'gümüş tael',
  'space-opera': 'galaktik kredi',
  zombie: 'takas jetonu',
  vampire: 'altın dükat',
  viking: 'gümüş halka',
  arabian: 'altın dinar',
  'cosmic-horror': 'gümüş sikke',
  superhero: 'kredi',
  heist: 'nakit',
  kaiju: 'yardım kuponu',
  carnival: 'panayır jetonu',
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
