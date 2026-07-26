export default function HelpGuide({ onClose }) {
  return (
    <div className="whisper-overlay">
      <div className="game-setup-card panel rules-editor-card help-guide-card">
        <div className="rules-editor-header">
          <h1 className="title-font">❓ Nasıl Çalışır?</h1>
          <button type="button" className="btn-ghost" onClick={onClose}>
            ✕ Kapat
          </button>
        </div>
        <p className="subtitle">
          RollTable'ın tüm bölümleri ve ne işe yaradıkları. Başlıklara tıklayıp açabilirsin.
        </p>

        <details open>
          <summary>🚪 Başlarken</summary>
          <p>
            <strong>Oda Kur</strong>: yeni bir oda kodu ve isim gir. Otomatik olarak o odanın GM'i
            olursun ve <strong>sadece sen</strong> o odayı silebilirsin.
          </p>
          <p>
            <strong>Odaya Katıl</strong>: sadece daha önce kurulmuş bir oda koduna girilebilir. Eğer
            odayı kuran kişiysen (aynı tarayıcı) otomatik GM olarak tanınırsın, değilsen otomatik
            Oyuncu olursun. Rol seçmen gerekmez.
          </p>
        </details>

        <details>
          <summary>⚙️ Oyunu Ayarlama (sadece GM, ilk girişte)</summary>
          <p>Oda ilk kurulduğunda GM'den oyunun kurallarını tanımlaması istenir:</p>
          <ul>
            <li><strong>Kayıtlı Şablon Kullan</strong> — daha önce kaydettiğin bir kural setini tek tıkla uygula.</li>
            <li><strong>Sıfırdan Oluştur</strong> — Senaryo Adı, Tasarım Teması, Statlar, Irklar, Sınıflar, Alt Sınıflar, Traitler, Perkler ve Bulunabilecek Eşyalar listelerini kendin oluştur.</li>
            <li>İstersen bu kural setini bir <strong>şablon olarak kaydedip</strong> başka odalarda tekrar kullanabilirsin.</li>
          </ul>
          <p>
            GM daha sonra <strong>"⚙️ Kuralları Düzenle"</strong> ile oyun ortasında yeni perk, eşya,
            ırk vb. ekleyebilir — oyuncuların mevcut seçimleri bozulmaz.
          </p>
        </details>

        <details>
          <summary>🖼️ Sahne & Atmosfer</summary>
          <p>Orta bölümdeki sahne alanı herkese aynı anda görünür:</p>
          <ul>
            <li><strong>Mekan Görseli</strong> ve <strong>Sahne Adı</strong> — sahne adı daktilo efektiyle yazılır.</li>
            <li><strong>Odak Görseli</strong> — o an konuşan karakter/eşya, kendi adıyla birlikte.</li>
            <li><strong>Harita</strong> — "Haritayı Göster" ile açılır; üzerine tıklayarak pin bırakabilirsin (kendi renginde). Kendi pinini herkes, başkasının pinini sadece GM kaldırabilir.</li>
            <li><strong>Müzik / Ambiyans</strong> — GM çalar/durdurur, herkes kendi ses seviyesini ayarlar.</li>
            <li><strong>Vinyet, Flaş/Sarsıntı</strong> — GM'in tetiklediği görsel atmosfer efektleri (sağ kenardaki "Atmosfer Kontrolleri"nde).</li>
            <li><strong>Tema parçacıkları</strong> — seçilen temaya göre (kül, neon, büyü tozu, sis, yıldız) otomatik arka plan efekti.</li>
          </ul>
        </details>

        <details>
          <summary>👥 Parti Paneli (sol kenar)</summary>
          <p>
            En üstte GM'in kutucuğu (isim, avatar, çevrimiçi/çevrimdışı durumu) bulunur. Altında
            oyuncu listesi vardır — bir oyuncuya tıklayınca statları, ırk/sınıf/alt sınıfı,
            trait/perkleri, yeteneklerini ve envanterini görürsün. GM buradan oyuncuyu odadan
            atabilir. En altta, sana özel gelen <strong>Fısıltı Geçmişi</strong> listelenir.
          </p>
        </details>

        <details>
          <summary>📜 Karakter Kağıdı (oyuncular)</summary>
          <ul>
            <li>Karakter görseli ve <strong>profil rengi</strong> seç — bu renk Parti panelinde ve harita pinlerinde senin rengin olur.</li>
            <li>Irk / Sınıf / Alt Sınıf seç (varsa açıklamaları altında görünür).</li>
            <li>Statlarını +/- ile ayarla, Durumunu (İyi/Yaralı/Bitkin/Ölü) seç.</li>
            <li>Traitler ve Perkler arasından işaretle — seçtiklerinin açıklaması altta çıkar.</li>
            <li>Yetenek/Dal metnini serbestçe yaz.</li>
            <li>Envantere GM'in eşya kataloğundan seçerek veya kendi yazarak eşya ekle.</li>
          </ul>
        </details>

        <details>
          <summary>🎲 Zar (sağ kenar)</summary>
          <ul>
            <li><strong>Normal / Avantaj / Dezavantaj</strong> modunu seç — avantaj/dezavantajda iki zar atılır, sırayla açılır, büyük/küçük olan seçilir.</li>
            <li>GM için <strong>Gizli Zar</strong> — işaretliyken GM'in attığı zarlar oyunculara <code>??</code> görünür.</li>
            <li>d4'ten d20'ye zar butonları, dönme animasyonu ve sesi (ses düzeyini kaydırıcıdan ayarlayabilirsin).</li>
            <li>Son atışların geçmişi ve <strong>İstatistikler</strong> (kim kaç attı, ortalaması, en şanslı/şanssız) altta.</li>
          </ul>
        </details>

        <details>
          <summary>🛠️ GM Kontrol Paneli (orta bölüm, sadece GM)</summary>
          <ul>
            <li><strong>Oda Yönetimi</strong> — odayı kilitle/aç (yeni katılımı engelle), oturum zamanlayıcısını başlat/sıfırla, odayı sil (sadece oda sahibi görür).</li>
            <li><strong>Üst Menü Afişi</strong> — sayfanın en üstündeki banner görseli.</li>
            <li><strong>Kayıtlı Sahneler</strong> — sık kullandığın sahneleri isimle kaydet, tek tıkla tekrar yayınla.</li>
            <li>Sahne formu — mekan/odak/harita görselleri, sahne adı, müzik linki.</li>
            <li><strong>Gizli Fısıltı</strong> — tek bir oyuncuya ya da "📢 Herkese" özel mesaj gönder.</li>
          </ul>
        </details>

        <details>
          <summary>🌫️ Atmosfer Kontrolleri (sağ kenar, sadece GM)</summary>
          <p>
            Kısa, tek seferlik ses efektlerini (kapı gıcırtısı, kılıç sesi vb.) butona basarak
            anlık çalabilirsin. Sürekli çalan ambiyans parçaları (yağmur, rüzgar vb.) ise
            çal/durdur butonuyla açılıp kapanır ve kendi ses düzeyi kaydırıcısına sahiptir. Altta
            Vinyet yoğunluğu kaydırıcısı ve Flaş/Sarsıntı tetikleyici butonu bulunur.
          </p>
        </details>

        <details>
          <summary>📓 Notlar & Üreteçler</summary>
          <ul>
            <li><strong>Not Defterim</strong> (oyuncular) / <strong>GM Notları</strong> (GM) — sadece o kişinin gördüğü, otomatik kaydedilen kişisel not alanı.</li>
            <li><strong>NPC İsim Üretici</strong> (GM) — Türkçe/Yabancı/Fantastik/Cyberpunk/Gotik kategorilerinden rastgele isim üretir.</li>
            <li><strong>Mekan / Görev İpucu Üretici</strong> (GM) — rastgele mekan adı veya görev fikri üretir.</li>
          </ul>
        </details>

        <details>
          <summary>🔒 Güvenlik Notu</summary>
          <p>
            Bu uygulamada hesap/şifre sistemi yok — oda koduna sahip olan herkes o odaya
            katılabilir. Oda kodunu tahmin edilmesi zor seç ve sadece güvendiğin arkadaşlarınla
            paylaş. Fısıltı ve notlar sadece arayüzde gizlenir, teknik olarak tamamen şifreli
            değildir.
          </p>
        </details>
      </div>
    </div>
  );
}
