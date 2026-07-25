const NAME_BANKS = {
  turkce: {
    first: [
      'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Merve',
      'Yusuf', 'Deniz', 'Osman', 'Sibel', 'Cengiz', 'Nur', 'Baran', 'Ece', 'Tarkan', 'Gül',
    ],
    last: [
      'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Kurt',
      'Aksoy', 'Polat', 'Güneş', 'Bulut', 'Karaca',
    ],
  },
  yabanci: {
    first: [
      'John', 'Mary', 'William', 'Elizabeth', 'James', 'Anna', 'Robert', 'Sophia', 'Michael',
      'Clara', 'Henry', 'Alice', 'Thomas', 'Grace', 'Edward',
    ],
    last: [
      'Smith', 'Miller', 'Brown', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Clark', 'Baker',
      'Hughes', 'Reed', 'Foster', 'Blackwood',
    ],
  },
  fantastik: {
    first: [
      'Thalindra', 'Korrath', 'Elyndor', 'Vaelira', 'Brommund', 'Sylvara', 'Draven', 'Nymeria',
      'Ashkar', 'Feylin', 'Grimhold', 'Isolde', 'Thorne', 'Wren', 'Kael',
    ],
    last: [
      'Nightwhisper', 'Ironoak', 'Stormrune', 'Duskbane', 'Emberfall', 'Frostwind', 'Shadowmere',
      'Goldleaf', 'the Wanderer', 'of the Hollow', 'Ravenscar',
    ],
  },
  cyberpunk: {
    first: ['Nyx', 'Zed', 'Kade', 'Vex', 'Riko', 'Juno', 'Axel', 'Mira', 'Dex', 'Cipher', 'Raze', 'Echo', 'Kilo', 'Ren', 'Vega'],
    last: ['//Null', '_9', '-Prime', 'Vortex', 'Circuit', 'Byte', 'Neon', 'Static', 'Chrome', 'Glitch', '.exe', 'Zero'],
  },
  gotik: {
    first: [
      'Mortimer', 'Seraphine', 'Ambrose', 'Ligeia', 'Cassian', 'Morgue', 'Isadora', 'Edgar',
      'Ravenna', 'Silas', 'Ophelia', 'Dorian', 'Vesper',
    ],
    last: [
      'Blackwood', 'Graves', 'Ashford', 'Nightingale', 'Crowley', 'Von Hollow', 'Wraithe',
      'Sable', 'Marrow', 'Thornheart',
    ],
  },
};

const CATEGORY_LABELS = {
  turkce: 'Türkçe',
  yabanci: 'Yabancı',
  fantastik: 'Fantastik',
  cyberpunk: 'Cyberpunk',
  gotik: 'Korku / Gotik',
};

export const NPC_CATEGORIES = Object.keys(NAME_BANKS).map((key) => ({
  id: key,
  label: CATEGORY_LABELS[key],
}));

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNpcName(category) {
  const bank = NAME_BANKS[category] || NAME_BANKS.turkce;
  return `${pick(bank.first)} ${pick(bank.last)}`;
}
