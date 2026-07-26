import Portal from './Portal.jsx';

export default function HelpGuide({ onClose }) {
  return (
    <Portal>
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
            Oda kurmak veya bir odaya katılmak için önce bir <strong>hesap</strong> gerekir —
            e-posta/şifre ile ya da Google ile kayıt olabilirsin; kayıt sırasında herkese özel,
            benzersiz bir <strong>kullanıcı adı</strong> seçersin. Giriş yaptıktan sonra
            karşına <strong>Profilim</strong> sayfası çıkar.
          </p>
          <p>
            <strong>🎲 Yeni Oda Kur</strong>: yeni bir oda kodu ve isim gir. Otomatik olarak o
            odanın GM'i olursun ve <strong>sadece sen</strong> o odayı silebilirsin.
          </p>
          <p>
            <strong>🚪 Kodla Odaya Katıl</strong>: sadece daha önce kurulmuş bir oda koduna
            girilebilir. Eğer odayı kuran kişiysen otomatik GM olarak tanınırsın, değilsen otomatik
            Oyuncu olursun. Rol seçmen gerekmez. GM oda için bir <strong>şifre</strong>
            belirlediyse, katılırken bu şifre de istenir (GM kendisi şifresiz girer).
          </p>
        </details>

        <details>
          <summary>👤 Profilim & Oturum Aç/Kapa</summary>
          <p>
            Giriş sonrası iniş sayfan. Üstte kullanıcı adın ve <strong>"Aktivitemi Gizle"</strong>
            (açarsan başkaları senin GM olduğun/katıldığın odaları göremez) anahtarı var.
          </p>
          <ul>
            <li>
              <strong>GM Olduğun Odalar</strong> — her oda için 🟢 Aktif / ⚪ Kapalı rozeti
              gösterir. "▶️ Oturumu Başlat" ile oturumu açıp direkt odaya girersin; oturum zaten
              açıksa aynı buton "Odaya Gir" olarak sadece içeri alır. Oturumu GM Kontrol
              Paneli'nden "⏹️ Oturumu Sonlandır" ile kapatabilirsin — bu <strong>odayı veya
              verileri silmez</strong>, sadece kapalı gösterir; sen tekrar başlatana kadar öyle
              kalır.
            </li>
            <li>
              <strong>Katıldığın Odalar</strong> — oturum aktifse "Oturuma Katıl" butonu çıkar,
              kapalıyken buton görünmez.
            </li>
          </ul>
        </details>

        <details>
          <summary>🤝 Arkadaşlar & Mesajlaşma</summary>
          <p>
            Profilim sayfasındaki <strong>Arkadaşlar</strong> bölümünden kullanıcı adıyla birini
            arayıp arkadaşlık isteği gönderebilirsin. Gelen istekleri kabul/reddedebilir, giden
            istekleri iptal edebilirsin. Bir isme tıklamak o kişinin profilini açar — nickname,
            avatarı ve (aktivitesini gizlemediyse) GM olduğu/katıldığı odaların listesi görünür.
            Arkadaş olduğunuzda profilinden veya arkadaş listesinden <strong>💬 Mesaj</strong> ile
            oturumdan bağımsız, birebir özel yazışma açabilirsin.
          </p>
        </details>

        <details>
          <summary>⚙️ Oyunu Ayarlama (sadece GM, ilk girişte)</summary>
          <p>Oda ilk kurulduğunda GM'den oyunun kurallarını tanımlaması istenir:</p>
          <ul>
            <li><strong>Kayıtlı Şablon Kullan</strong> — daha önce kaydettiğin bir kural setini tek tıkla uygula.</li>
            <li><strong>Sıfırdan Oluştur</strong> — Senaryo Adı, Tasarım Teması (21 farklı tür arasından: fantazi, cyberpunk, western, korsan, vampir, uzay operası ve daha fazlası), <strong>Seviye Sistemi</strong> (maksimum seviye + seviye başına gereken XP), Statlar, <strong>Kaynaklar</strong> (Can Puanı, Stres, Kaynak Puanı gibi dolgu çubukları), Irklar, Sınıflar, Alt Sınıflar, Traitler, Perkler ve Bulunabilecek Eşyalar listelerini kendin oluştur.</li>
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
            <li><strong>Vinyet, Flaş/Sarsıntı, Hava Durumu</strong> — GM'in tetiklediği görsel atmosfer efektleri (sağ kenardaki "Görsel Efektler"de).</li>
            <li><strong>Tema parçacıkları</strong> — seçilen temaya göre değişen otomatik arka plan efekti (kül, neon, kiraz çiçeği, kar, konfeti ve daha fazlası) — renk paleti, fontlar ve tüm üreteçler de temayla birlikte değişir.</li>
          </ul>
        </details>

        <details>
          <summary>🗓️ Takvim</summary>
          <p>
            Sol kenarın en üstünde oyun içi gün ve saat gösterilir. GM +1 Saat / +6 Saat / +1 Gün
            butonlarıyla ilerletebilir, ya da gün/saat/dakikayı elle ayarlayabilir (bu kutular hızlı
            butonlarla birlikte otomatik güncellenir). Herkes aynı takvimi görür; gündüz/gece
            ayrımı başlıktaki ☀️/🌙 simgesinden anlaşılır.
          </p>
        </details>

        <details>
          <summary>🎙️ İnisiyatif Sırası</summary>
          <p>
            Header'ın orta kısmında sıradaki ve bir önceki kişinin adı gösterilir. GM'in "İnisiyatif
            Sırası" panelinden (GM Kontrol Paneli içinde) sıraya oyuncu ekler, oku ile yeniden
            sıralar ve "⏭ Sonraki" / "⏮ Önceki" ile sırayı ilerletir — bunu doğrudan header'daki
            hızlı oklardan da yapabilir. Sıra kime geldiyse o oyuncunun adının yanında Parti
            panelinde 🎙️ rozeti belirir ve o oyuncunun ekranında "SIRA SENDE!" uyarısı çıkar.
          </p>
          <p>
            <strong>NPC / Düşman ekleme</strong> — Odak Kütüphanesi'ne "🎭 Karakter/NPC" olarak
            kaydettiğin görseller de sıraya eklenebilir (ayrı bir "⚔️ Kuyruğa NPC/düşman ekle"
            menüsünden). Sırada ve header'daki turda düşmanlar kırmızı çerçeve, "⚔️ DÜŞMAN" etiketi
            ve kırmızı isimle partiden net şekilde ayrılır. "📦 Obje/Eşya" olarak kaydedilenler bu
            listede görünmez — sadece görsel gösterimi içindir.
          </p>
        </details>

        <details>
          <summary>👥 Parti Paneli (sol kenar)</summary>
          <p>
            En üstte GM'in kutucuğu (isim, avatar, çevrimiçi/çevrimdışı durumu) bulunur. Altında
            oyuncu listesi vardır — bir oyuncuya tıklayınca statları, ırk/sınıf/alt sınıfı,
            trait/perkleri, yeteneklerini ve envanterini görürsün. GM buradan oyuncuyu odadan
            atabilir; oyuncunun karakter kağıdını kilitleyebilir ve "✏️ Karakteri Düzenle" ile
            doğrudan düzenleyebilir. Fısıltılar ve otomatik sistem kayıtları artık ayrı bir liste
            değil — hemen altındaki <strong>💬 Sohbet</strong> panelinde, sohbet mesajlarıyla
            birlikte farklı bir görünümle (🔒 fısıltı, açık renkli sistem kaydı) karışık akışta
            görünür.
          </p>
        </details>

        <details>
          <summary>📜 Görev Panosu (sol kenar)</summary>
          <p>
            GM görev ekler; başlık, açıklama, <strong>öncelik</strong> (Normal/🔴 Acil),
            <strong> atanan oyuncu</strong> (opsiyonel — boş bırakılırsa "Genel" sayılır) ve
            <strong> son teslim günü/saati</strong> (opsiyonel) belirleyebilir. Süresi olan görevler
            için kalan zaman takvimle birlikte otomatik azalır; süre dolduğunda görev otomatik
            olarak "Süresi doldu" durumuna düşer. GM "✅ Tamamla" ile görevi kapatabilir. Oyuncular
            sadece görüntüler, düzenleyemez.
          </p>
        </details>

        <details>
          <summary>📜 Karakter Kağıdı (oyuncular)</summary>
          <p>
            Orta bölümün altındaki <strong>"📜 Karakter Kağıdımı Aç"</strong> kartına tıklayınca
            tam ekran açılır (kapatmak için "✕ Kapat" ya da dışına tıkla).
          </p>
          <ul>
            <li>Karakter görseli ve <strong>profil rengi</strong> seç — bu renk Parti panelinde ve harita pinlerinde senin rengin olur.</li>
            <li>Irk / Sınıf / Alt Sınıf seç (varsa açıklamaları altında görünür).</li>
            <li>Statlarını +/- ile ayarla, Durumunu (İyi/Yaralı/Bitkin/Ölü) seç.</li>
            <li>
              <strong>Kaynaklar</strong> (varsa — Can Puanı, Stres, Fate Puanı gibi) dolgu
              çubuğu olarak görünür, +/- ile değiştirirsin; üst sınırı GM'in tanımladığı değerdir.
            </li>
            <li>Traitler ve Perkler arasından işaretle — seçtiklerinin açıklaması altta çıkar.</li>
            <li>Yetenek/Dal metnini serbestçe yaz.</li>
            <li>Envantere GM'in eşya kataloğundan seçerek veya kendi yazarak eşya ekle.</li>
            <li>
              <strong>XP Çubuğu</strong> — GM'in "Kuralları Düzenle"de belirlediği "Maksimum
              Seviye" ve "Seviye Başına Gereken XP" değerlerine göre doluyor. GM Parti panelinden
              sana XP verir; çubuk bir sonraki seviyeye ne kadar kaldığını gösterir. XP seviye
              atlarken sıfırlanmaz, birikmeye devam eder.
            </li>
            <li>
              <strong>🎉 Seviye Atla</strong> — yeterli XP'ye ulaşınca buton parlayarak aktif olur;
              açılan ekranda bir stata +1 verip (varsa) henüz almadığın bir perk seçersin,
              onaylayınca seviyen artar ve kaynakların (varsa) tamamen dolar. Maksimum seviyeye
              ulaşınca buton kaybolur. (GM her zaman, XP yetmese bile seviye atlatabilir.)
            </li>
            <li>
              <strong>🔒 Kilit</strong> — GM istediği zaman senin karakter kağıdını
              kilitleyebilir/açabilir (sen kendin kilitleyemezsin). Kilitliyken hiçbir alanı
              değiştiremezsin; GM ise kilitliyken bile "✏️ Karakteri Düzenle" ile her zaman
              değişiklik yapabilir. Oturum başladıktan (GM "▶️ Oturumu Başlat" dedikten) sonraki
              stat/envanter/trait/perk/ırk/sınıf değişiklikleri, hangi oyuncuda olduğu belirtilerek
              💬 Sohbet panelinde sistem kaydı olarak otomatik görünür.
            </li>
          </ul>
        </details>

        <details>
          <summary>🎲 Zar (sağ kenar)</summary>
          <ul>
            <li><strong>Normal / Avantaj / Dezavantaj</strong> modunu seç — avantaj/dezavantajda iki zar atılır, sırayla açılır, büyük/küçük olan seçilir.</li>
            <li>GM için <strong>Gizli Zar</strong> — işaretliyken GM'in attığı zarlar oyunculara <code>??</code> görünür.</li>
            <li>d4'ten d20'ye zar butonları, dönme animasyonu ve sesi (ses düzeyini kaydırıcıdan ayarlayabilirsin).</li>
            <li><strong>Zar Formülü</strong> — kutuya <code>2d6+3</code> gibi bir ifade yazıp "At" dersin; her zarın sonucu ve toplam gösterilir.</li>
            <li><strong>🎴 4dF (Fate zarı)</strong> — FATE/Fudge sistemleri için 4 zar atar, her biri -1/0/+1, toplamı gösterir.</li>
            <li><strong>Kritik vurgu</strong> — zarın en yüksek yüzü gelirse altın parlama ve yükselen bir ton, 1 gelirse kırmızı sarsılma ve boğuk bir ses eşlik eder (sadece tek zar atışlarında).</li>
            <li>Son atışların geçmişi ve <strong>İstatistikler</strong> (kim kaç attı, ortalaması, en şanslı/şanssız) altta.</li>
          </ul>
        </details>

        <details>
          <summary>🛠️ GM Kontrol Paneli (orta bölüm, sadece GM)</summary>
          <p>
            Orta bölümün altındaki <strong>"🛠️ GM Kontrol Panelini Aç"</strong> kartına tıklayınca
            tam ekran açılır (kapatmak için "✕ Kapat" ya da dışına tıkla).
          </p>
          <ul>
            <li><strong>Oda Yönetimi</strong> — odayı kilitle/aç (yeni katılımı engelle), isteğe bağlı <strong>oda şifresi</strong> belirle, "▶️ Oturumu Başlat" / "⏹️ Oturumu Sonlandır" ile oturumu aç/kapa (kapatmak odayı veya verileri silmez — sadece "aktif değil" gösterir, tekrar başlatana kadar), odayı sil (sadece oda sahibi görür).</li>
            <li><strong>Üst Menü Afişi</strong> — sayfanın en üstündeki banner görseli.</li>
            <li>
              <strong>Mekan / Odak / Müzik Kütüphaneleri</strong> — görsel/link ile bir isim
              girip "💾 Kaydet" dersin, canlı sahneyi <em>hemen değiştirmez</em>, sadece
              kütüphaneye ekler. Seçim yapmak için paneli açmana gerek yok: orta bölümdeki mekan
              ya da odak görseline (GM olarak) tıklayınca kayıtlı listeden seçebilirsin; müzik
              için de "▶️ Devam Ettir" butonunun solundaki açılır menüden seçim yaparsın — hepsi
              anında canlı sahneye uygulanır. Böylece önceden bir sürü görsel/müzik hazırlayıp
              oturum sırasında tek tıkla geçiş yapabilirsin.
            </li>
            <li>
              Her görsel/ses alanının yanındaki <strong>"📤 Yükle"</strong> butonuyla bir link
              yapıştırmak yerine bilgisayarından dosya seçip doğrudan yükleyebilirsin (görsel için
              8MB, ses için 15MB üst sınır). Bu, Firebase Storage'ın etkinleştirilmiş olmasını
              gerektirir — değilse yükleme birkaç saniye içinde net bir hata verir, URL alanı her
              zaman alternatif olarak çalışmaya devam eder.
            </li>
            <li><strong>Harita</strong> — URL gir, "Yayınla" ile canlı haritayı günceller (harita değişirse eski pinler temizlenir).</li>
            <li><strong>İnisiyatif Sırası</strong> — sıraya oyuncu ekle/çıkar, yeniden sırala, sırayı ilerlet (bkz. yukarıdaki "İnisiyatif Sırası" başlığı).</li>
            <li><strong>Gizli Fısıltı</strong> — tek bir oyuncuya ya da "📢 Herkese" özel mesaj gönder.</li>
          </ul>
        </details>

        <details>
          <summary>🌫️🔊 Görsel Efektler & Ses Efektleri (sağ kenar, sadece GM)</summary>
          <p>
            İki ayrı açılır menü halindedir. <strong>Ses Efektleri</strong>'nde kısa, tek seferlik
            ses efektlerini (kapı gıcırtısı, kılıç sesi vb.) butona basarak anlık çalabilirsin.
            Sürekli çalan ambiyans parçaları (yağmur, rüzgar vb.) çal/durdur butonuyla açılıp
            kapanır ve kendi ses düzeyi kaydırıcısına sahiptir. <strong>Görsel Efektler</strong>'de
            ise <strong>Hava Durumu</strong> (Yok/🌧️ Yağmur/❄️ Kar — herkesin ekranında
            animasyonlu görünür), Vinyet yoğunluğu kaydırıcısı ve Flaş/Sarsıntı tetikleyici
            butonu bulunur.
          </p>
        </details>

        <details>
          <summary>💬 Sohbet (sol kenar)</summary>
          <p>
            Herkesin birlikte kullandığı ortak yazışma kanalı; GM'in "👥 Parti" panelinin hemen
            altında. Üç tür mesaj aynı akışta, farklı görünümle karışık sırayla listelenir:
          </p>
          <ul>
            <li>Normal sohbet mesajları — herkesin yazdığı, herkesin gördüğü.</li>
            <li>
              <strong>🔒 Fısıltılar</strong> — GM Kontrol Paneli'ndeki "Gizli Fısıltı" ile gönderilen
              özel mesajlar; kesikli amber çerçeveyle vurgulanır. Oyuncu sadece kendine gelenleri
              görür, GM tüm oyunculara giden fısıltıları (kime gittiği belirtilerek) görür.
            </li>
            <li>
              <strong>Sistem kayıtları</strong> — oturum başladıktan sonra karakter kağıdında olan
              stat/kaynak/trait/perk/ırk/sınıf/envanter değişiklikleri ve seviye atlamalar otomatik
              olarak buraya, soluk/italik bir görünümle düşer.
            </li>
          </ul>
        </details>

        <details>
          <summary>📋 Oturum Kaydı (sağ kenar)</summary>
          <p>
            "📥 Oturumu Dışa Aktar" butonu zar atışlarını, sohbeti (fısıltı ve sistem kayıtları
            dahil), görevleri ve karakter kağıdı değişikliklerini tek bir <code>.txt</code> dosyası
            olarak indirir. Oyuncular sadece kendi kayıtlarını ve gizli olmayan zarları görür; GM
            her şeyi görür.
          </p>
        </details>

        <details>
          <summary>📓 Notlar & Üreteçler</summary>
          <ul>
            <li><strong>Not Defterim</strong> (oyuncular) / <strong>GM Notları</strong> (GM) — sadece o kişinin gördüğü, otomatik kaydedilen kişisel not alanı.</li>
            <li><strong>NPC İsim Üretici</strong> (GM) — Türkçe veya Yabancı isim üretir; isim tarzı odanın seçili temasına göre otomatik değişir.</li>
            <li><strong>Mekan Adı Üretici</strong> (GM) — Türkçe veya Yabancı stilde, odanın temasına uygun rastgele mekan adı üretir.</li>
            <li><strong>Görev İpucu Üretici</strong> (GM) — odanın seçili temasına uygun rastgele görev fikri üretir.</li>
            <li><strong>Ganimet Üretici</strong> (GM) — odanın temasına uygun rastgele eşya/para üretir; "📢 Partiye Duyur" ile herkese fısıltı olarak duyurulur, ya da hedef oyuncu seçip "🎒 Envantere Ekle" ile doğrudan o oyuncunun envanterine eklenir.</li>
          </ul>
        </details>

        <details>
          <summary>🔒 Güvenlik Notu</summary>
          <p>
            Her hesap Firebase üzerinden gerçek, sahtesi üretilemeyen bir kimlikle (e-posta/şifre
            veya Google) tanımlanır; oda sahibi (GM) rolü, her oyuncunun kendi karakteri ve
            arkadaşlık/mesajlaşma bu kimliğe bağlıdır — bu, sunucu tarafında da uygulanır (sadece
            arayüzde gizlemek değil). Buna ek olarak GM isteğe bağlı bir
            <strong> oda şifresi</strong> belirleyebilir. Oda kodunu yine de tahmin edilmesi zor
            seç ve sadece güvendiğin kişilerle paylaş.
          </p>
        </details>
      </div>
    </div>
    </Portal>
  );
}
