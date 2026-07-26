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
    western: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Demirbaş', 'Toprakçı', 'Atlıoğlu', 'Kurtoğlu', 'Yalnızkurt', 'Çakırgöz',
        'Kartaloğlu', 'Sertkaya', 'Baruthane', 'Çeliktoprak',
      ],
    },
    steampunk: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Çarkçıoğlu', 'Vidalıoğlu', 'Demirhane', 'Buharoğlu', 'Miloğlu',
        'Cıvataoğlu', 'Pistonoğlu', 'Tornacı', 'Dişlioğlu', 'Basınçoğlu',
      ],
    },
    pirate: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Dalgakıran', 'Rüzgaroğlu', 'Çapaoğlu', 'Denizhan', 'Fırtınaoğlu',
        'Yelkenci', 'Sandalcı', 'Köpüklü', 'Rotaoğlu', 'Enginoğlu',
      ],
    },
    mythology: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Güneşoğlu', 'Tanrıkulu', 'Yıldıztaç', 'Kutsalkan', 'Gökbey',
        'Ateşdoğan', 'Tanrısever', 'Kadimsoylu', 'Ölümsüzoğlu', 'Şafakdoğan',
      ],
    },
    noir: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Karagöz', 'Sisoğlu', 'Gölgekıran', 'Dumanlı', 'Kurşunkalem',
        'Sokakoğlu', 'Gececi', 'Kirlihava', 'Sessizadım', 'Puslu',
      ],
    },
    wuxia: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Rüzgarkılıç', 'Bulutadım', 'Şafakyumruk', 'Demiryumruk', 'Gölgeadım',
        'Kırlangıçel', 'Ayninefes', 'Kaplandiş', 'Ejderyumruk', 'Sessizkılıç',
      ],
    },
    'space-opera': {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Yıldızkaşif', 'Galaksioğlu', 'Nebulaoğlu', 'Işıkyılı', 'Kuyrukluyıldız',
        'Uzayoğlu', 'Yörüngeci', 'Kozmoscan', 'Yıldıztozu', 'Takımyıldız',
      ],
    },
    zombie: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Toprakaltı', 'Mezarcı', 'Yıkıntı', 'Sürgün', 'Kokuşmuş',
        'Sürüoğlu', 'Isırıkoğlu', 'Çürükoğlu', 'Salgınoğlu', 'Enkazoğlu',
      ],
    },
    vampire: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Kanhan', 'Gecesoylu', 'Ölmezoğlu', 'Karanlıkasil', 'Kadimkan',
        'Solgunbey', 'Mezarsoylu', 'Asiloğlu', 'Kanhanedan', 'Karanlıkkan',
      ],
    },
    viking: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Buzkıran', 'Demirbalta', 'Kurtsakal', 'Kalkanoğlu', 'Baltaocağı',
        'Ejderyelken', 'Kuzeyrüzgarı', 'Buztepeli', 'Fırtınabalta', 'Demirkabuk',
      ],
    },
    arabian: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Çölgülü', 'Kervanbaşı', 'Vahaoğlu', 'Kumsaati', 'Yıldıznamesi',
        'Serapoğlu', 'Kumfırtınası', 'Vahaerozi', 'Çölyıldızı', 'Kervanyıldızı',
      ],
    },
    'cosmic-horror': {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Derinsu', 'Kadimsır', 'Uçurumoğlu', 'Rüyabozan', 'Fısıltıoğlu',
        'Karanlıkkadim', 'Derinuykulu', 'Sonsuzuçurum', 'Gölgekulu', 'Kadimfısıltı',
      ],
    },
    superhero: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Çelikyürek', 'Şimşekoğlu', 'Demirbilek', 'Gökkalkan', 'Yıldırımel',
        'Kahramanoğlu', 'Zırhlıoğlu', 'Çelikyumruk', 'Gökçelik', 'Kalkanyürek',
      ],
    },
    heist: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Kasaoğlu', 'Gölgeparmak', 'Sessizadım', 'Anahtarcı', 'Hesapoğlu',
        'Vurgunoğlu', 'Planoğlu', 'Sesizkasa', 'Gölgeplan', 'Kilitaçan',
      ],
    },
    kaiju: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Devoğlu', 'Yıkımoğlu', 'Depremoğlu', 'Külkıran', 'Ejderboy',
        'Devasaoğlu', 'Sarsıntıoğlu', 'Şehirkıran', 'Yerdevi', 'Külyıkan',
      ],
    },
    carnival: {
      first: [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Kemal', 'Zeynep', 'Emre', 'Elif', 'Hasan', 'Deniz',
        'Yusuf', 'Merve', 'Osman', 'Sibel', 'Cengiz', 'Nur',
      ],
      last: [
        'Palyaçooğlu', 'Maskeoğlu', 'Sirkçi', 'Gülüşoğlu', 'Aynalıoğlu',
        'Perdeci', 'Cambazoğlu', 'Fanfaroğlu', 'Maskeligülüş', 'Ayinsoylu',
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
    western: {
      first: ['Jesse', 'Cole', 'Annie', 'Wyatt', 'Belle', 'Clint', 'Dutch', 'Rosa', 'Billy', 'Hank'],
      last: [
        'Colt', 'Ironside', 'Dust', 'Ravenwood', 'Steele', 'Hollis', 'Blackwater',
        'Rangeland', 'Sundown', 'Draw',
      ],
    },
    steampunk: {
      first: [
        'Ambrose', 'Constance', 'Reginald', 'Cordelia', 'Percival', 'Isadora', 'Barnaby',
        'Ottoline', 'Sherlock', 'Millicent',
      ],
      last: [
        'Cogsworth', 'Brassfield', 'Ironvale', 'Steamwright', 'Copperfield',
        'Gearheart', 'Boilerplate', 'Winchester',
      ],
    },
    pirate: {
      first: ['Redbeard', 'Anne', 'Silas', 'Marguerite', 'Barnabus', 'Isla', 'Jack', 'Cassia', 'Roderick', 'Bess'],
      last: [
        'Blackwave', 'Cutlass', 'Saltbeard', 'Tidewalker', 'Drake',
        'Stormhull', 'Ironhook', 'Deepwater',
      ],
    },
    mythology: {
      first: ['Theron', 'Kassandra', 'Perseus', 'Athenia', 'Orpheus', 'Selene', 'Icarus', 'Nyssa', 'Achilles', 'Elara'],
      last: [
        'Godsblood', 'Olympian', 'Fatesworn', 'Sunborn', 'Stormcaller',
        'Titanheir', 'Moonveil', 'Starforged',
      ],
    },
    noir: {
      first: ['Vincent', 'Lorraine', 'Sam', 'Rita', 'Eddie', 'Vivian', 'Marlowe', 'Dolores', 'Frank', 'Gloria'],
      last: ['Gray', 'Sinclair', 'Malone', 'Kane', 'Voss', 'Sterling', 'Blackwell', 'Vance'],
    },
    wuxia: {
      first: ['Wei', 'Lian', 'Jin', 'Mei', 'Feng', 'Xiu', 'Long', 'Hua', 'Bo', 'Yun'],
      last: [
        'Stormblade', 'Ironfist', 'Silentcrane', 'Windwalker', 'Shadowfang',
        'Moonblade', 'Jadeheart', 'Dragonbone',
      ],
    },
    'space-opera': {
      first: ['Zara', 'Orion', 'Kira', 'Talon', 'Nova', 'Reyes', 'Vex', 'Lyric', 'Cassian', 'Astra'],
      last: [
        'Starforge', 'Voidrunner', 'Nebulon', 'Solaris', 'Quasar',
        'Starlance', 'Comettail', 'Galaxwing',
      ],
    },
    zombie: {
      first: ['Ash', 'Rhea', 'Cole', 'Nadia', 'Marcus', 'Wren', 'Silas', 'Tessa', 'Grim', 'Vale'],
      last: [
        'Ashfall', 'Bitewound', 'Deadwalk', 'Graveborn', 'Rotgut',
        'Lastbreath', 'Scavenger', 'Hollowveil',
      ],
    },
    vampire: {
      first: ['Lucian', 'Isolde', 'Damien', 'Seraphina', 'Viktor', 'Ravenna', 'Alistair', 'Morgana', 'Adrian', 'Lilith'],
      last: [
        'Blackthorn', 'Nightshade', 'Von Carstein', 'Moonshadow', 'Crimson',
        'Duskheart', 'Ravensworth', 'Bloodmoor',
      ],
    },
    viking: {
      first: ['Bjorn', 'Astrid', 'Ragnar', 'Freya', 'Ivar', 'Sigrid', 'Leif', 'Gudrun', 'Erik', 'Thora'],
      last: [
        'Ironfist', 'Stormborn', 'Wolfsbane', 'Frostbeard', 'Ravensong',
        'Battleaxe', 'Skalding', 'Northwind',
      ],
    },
    arabian: {
      first: ['Amir', 'Layla', 'Kassim', 'Zahra', 'Rashid', 'Nadia', 'Omar', 'Yasmin', 'Farid', 'Selin'],
      last: [
        'Al-Sahra', 'Nightsand', 'Moonveil', 'Starweaver', 'Duneborn',
        'Al-Qamar', 'Sandwhisper', 'Oasis',
      ],
    },
    'cosmic-horror': {
      first: ['Ezra', 'Corvina', 'Silas', 'Wyneth', 'Malachi', 'Ondine', 'Thaddeus', 'Ligeia', 'Obadiah', 'Persis'],
      last: [
        'Deepwhisper', 'Voidgaze', 'Yawning', 'Unspoken', 'Hollowmind',
        'Starmadness', 'Abyssborn', 'Nightcrawl',
      ],
    },
    superhero: {
      first: ['Max', 'Ivy', 'Blaze', 'Nova', 'Steel', 'Raven', 'Bolt', 'Vera', 'Titan', 'Skye'],
      last: [
        'Ironheart', 'Thunderstrike', 'Nightwing', 'Starfist', 'Shieldbreaker',
        'Vortex', 'Ironclad', 'Skyward',
      ],
    },
    heist: {
      first: ['Vinnie', 'Elle', 'Marco', 'Sasha', 'Dex', 'Nadia', 'Jack', 'Ruby', 'Leo', 'Fiona'],
      last: [
        'Sharpe', 'Vaultbreaker', 'Silvers', 'Quickfingers', 'Marchetti',
        'Kessler', 'Blackout', 'Duval',
      ],
    },
    kaiju: {
      first: ['Kaito', 'Rina', 'Goro', 'Emi', 'Taro', 'Sora', 'Ken', 'Yuki', 'Riku', 'Aiko'],
      last: [
        'Titanfall', 'Groundshaker', 'Skyscraper', 'Devastator', 'Earthbreaker',
        'Colossus', 'Ragemaw', 'Cityfall',
      ],
    },
    carnival: {
      first: [
        'Pepper', 'Marionette', 'Augustin', 'Coraline', 'Bartholomew', 'Ophelia', 'Jasper',
        'Lucille', 'Sideshow', 'Delphine',
      ],
      last: [
        'Mirrormask', 'Ticklebone', 'Ragdoll', 'Painted', 'Nightcircus',
        'Hollowlaugh', 'Tentshadow', 'Grimshow',
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
