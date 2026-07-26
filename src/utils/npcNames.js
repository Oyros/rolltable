const NAME_BANKS = {
  turkce: {
    'post-apocalyptic': {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Demir', 'Karataş', 'Yanık', 'Küloğlu', 'Toprak', 'Ateş', 'Kurt', 'Bulut',
        'Kayalık', 'Çorak', 'Yıkıkoğlu', 'Külrengi',
      ],
    },
    cyberpunk: {
      first: [
        'Aslı', 'Barış', 'Ege', 'Kaan', 'Su', 'Toprak', 'Yaz', 'Ada', 'Bora', 'Deniz',
        'Nil', 'Ozan', 'Pelin', 'Rüzgar', 'Umut', 'Çınar',
      ],
      last: [
        'Volt', 'Devre-9', 'Sıfır', 'Kod-7', 'Sentetik', 'Elektrik', 'Prime', 'Static',
        'Nöron', 'Piksel', 'Sinyal', 'Devre-X',
      ],
    },
    'high-fantasy': {
      first: [
        'Alp', 'Bilge', 'Gökhan', 'Ergun', 'Tomris', 'Bengisu', 'Kaya', 'Aygün', 'Oğuz',
        'Aslıhan', 'Yıldıray', 'Sungur', 'Aytaç', 'Aybüke',
      ],
      last: [
        'Aslanyürek', 'Gökkuşağı', 'Yıldıztaş', 'Ejderoğlu', 'Demirkalkan', 'Altınoku',
        'Şafakyeli', 'Rüzgarkanat', 'Ayışığı', 'Demirdiken',
      ],
    },
    'gothic-horror': {
      first: [
        'Kudret', 'Cemile', 'Sıtkı', 'Perihan', 'Necmi', 'Zühre', 'Rauf', 'Handan',
        'Nazif', 'Leyla', 'Vahit', 'Nermin', 'Şükrü', 'Naciye',
      ],
      last: [
        'Karanlık', 'Mezaroğlu', 'Kefen', 'Ölmez', 'Karakuzgun', 'Sisli', 'Yasoğlu',
        'Ruhsuz', 'Matemoğlu', 'Gölgeoğlu',
      ],
    },
    'sci-fi': {
      first: [
        'Deniz', 'Efe', 'Ada', 'Gün', 'Işın', 'Kutay', 'Ozan', 'Şafak', 'Tan', 'Yıldız',
        'Ece', 'Alp', 'Meriç', 'Derya',
      ],
      last: [
        'Yıldızyolu', 'Uzay', 'Işıkhız', 'Kuantum', 'Nova', 'Yörünge', 'Gökcan',
        'Galaksi', 'Yıldıztozu', 'Nebula',
      ],
    },
  },
  yabanci: {
    'post-apocalyptic': {
      first: [
        'Jax', 'Raider', 'Ash', 'Duke', 'Wren', 'Cole', 'Sable', 'Mac', 'Rusty', 'Nomad',
        'Reaper', 'Grim', 'Vale', 'Fenn',
      ],
      last: [
        'Wasteland', 'Ashborn', 'Scrapheart', 'Ironsides', 'Graves', 'Steel', 'Dustwalker',
        'Blackrust', 'Fallow', 'Cinderpath', 'Rustmane',
      ],
    },
    cyberpunk: {
      first: [
        'Nyx', 'Zed', 'Kade', 'Vex', 'Riko', 'Juno', 'Axel', 'Mira', 'Dex', 'Cipher',
        'Raze', 'Echo', 'Loki', 'Pix',
      ],
      last: [
        '//Null', '_9', '-Prime', 'Vortex', 'Circuit', 'Byte', 'Neon', 'Static', 'Chrome',
        'Glitch', '.exe', 'Feed', 'Overclock',
      ],
    },
    'high-fantasy': {
      first: [
        'Thalindra', 'Korrath', 'Elyndor', 'Vaelira', 'Brommund', 'Sylvara', 'Draven',
        'Nymeria', 'Ashkar', 'Isolde', 'Rowan', 'Faelar',
      ],
      last: [
        'Nightwhisper', 'Ironoak', 'Stormrune', 'Duskbane', 'Emberfall', 'Frostwind',
        'Shadowmere', 'Goldleaf', 'Wyrmscale', 'Starweaver', 'Thistledown',
      ],
    },
    'gothic-horror': {
      first: [
        'Mortimer', 'Seraphine', 'Ambrose', 'Ligeia', 'Cassian', 'Morgue', 'Isadora',
        'Edgar', 'Ravenna', 'Lucian', 'Ophira', 'Bertrand',
      ],
      last: [
        'Blackwood', 'Graves', 'Ashford', 'Nightingale', 'Crowley', 'Von Hollow', 'Wraithe',
        'Sable', 'Marrow', 'Hollowgrave', 'Dampwood', 'Ravensworth',
      ],
    },
    'sci-fi': {
      first: [
        'Nova', 'Orion', 'Vega', 'Kai', 'Lyra', 'Zane', 'Juno', 'Axel', 'Sol', 'Nyra',
        'Nyla', 'Corin', 'Pax',
      ],
      last: [
        'Starfall', 'Voidwalker', 'Quantum', 'Stellaris', 'Draken', 'Halcyon', 'Nightingale',
        'Corvus', 'Ionstrike', 'Cryovane', 'Astrapex',
      ],
    },
  },
};

const CATEGORY_LABELS = {
  turkce: 'Türkçe',
  yabanci: 'Yabancı',
};

export const NPC_CATEGORIES = Object.keys(NAME_BANKS).map((key) => ({
  id: key,
  label: CATEGORY_LABELS[key],
}));

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNpcName(lang, themeId) {
  const langBank = NAME_BANKS[lang] || NAME_BANKS.turkce;
  const bank = langBank[themeId] || langBank['high-fantasy'];
  return `${pick(bank.first)} ${pick(bank.last)}`;
}
