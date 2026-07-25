function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const LOCATION_PREFIXES = [
  'Kızıl', 'Kara', 'Altın', 'Unutulmuş', 'Gölgeli', 'Kırık', 'Sessiz', 'Kutsal', 'Lanetli',
  'Ejderha', 'Kurt', 'Demir', 'Taşlı', 'Rüzgarlı', 'Buzlu',
];
const LOCATION_NOUNS = [
  'Kartal', 'Yılan', 'Kule', 'Vadi', 'Han', 'Değirmen', 'Köprü', 'Mağara', 'Orman', 'Liman',
  'Kale', 'Kuyu', 'Meydan', 'Zindan', 'Tapınak',
];
const LOCATION_TYPES = ['Hanı', 'Kalesi', 'Köyü', 'Kasabası', 'Tapınağı', 'Mağarası', 'Adası', 'Ormanı', 'Limanı', ''];

export function generateLocationName() {
  const prefix = pick(LOCATION_PREFIXES);
  const noun = pick(LOCATION_NOUNS);
  const type = pick(LOCATION_TYPES);
  return type ? `${prefix} ${noun} ${type}` : `${prefix} ${noun}`;
}

const QUEST_SUBJECTS = [
  'Yaşlı bir tüccar', 'Köyün muhtarı', 'Gizemli bir yabancı', 'Yerel bir zanaatkar',
  'Kayıp bir çocuğun ailesi', 'Yerel bir soylu', 'Bir grup mülteci', 'Eski bir asker',
  'Genç bir çırak', 'Kervan lideri',
];
const QUEST_PROBLEMS = [
  'bir grup haydudun tehdidinden', 'kaybolan bir aile yadigarından', 'gizemli bir hastalıktan',
  'lanetli bir topraktan', 'kayıp bir kervandan', 'gece görülen tuhaf ışıklardan',
  'ormanın derinliklerinden gelen seslerden', 'kaçırılan bir yakınından', 'kuruyan bir su kaynağından',
  'ansızın ortaya çıkan bir yaratıktan',
];
const QUEST_TWISTS = [
  'ama gerçek aslında göründüğünden çok daha karanlık.',
  've ödül beklenenden çok daha değerli.',
  'ama zaman kısıtlı, biri zaten harekete geçmiş.',
  've bu, daha büyük bir komplonun sadece bir parçası.',
  'ama yardım istenen kişi tamamen dürüst değil.',
  've bir şey (ya da biri) takip ediliyor gibi hissettiriyor.',
];

export function generateQuestHook() {
  return `${pick(QUEST_SUBJECTS)}, ${pick(QUEST_PROBLEMS)} yardım istiyor — ${pick(QUEST_TWISTS)}`;
}

export const PROMPT_CATEGORIES = [
  { id: 'location', label: 'Mekan Adı', generate: generateLocationName },
  { id: 'quest', label: 'Görev İpucu', generate: generateQuestHook },
];
