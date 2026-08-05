import Portal from './Portal.jsx';
import ShortcutSettings from './ShortcutSettings.jsx';

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
        <p className="muted small-hint">
          💡 Sol ve sağ panellerin iç kenarındaki tutamağı sağa/sola sürükleyerek genişliklerini,
          alttaki kamera şeridinin tutamağını yukarı/aşağı sürükleyerek de yüksekliğini kendine
          göre ayarlayabilirsin. Ayarların tarayıcında hatırlanır.
        </p>

        <details>
          <summary>⌨️ Klavye Kısayolları (kendi tuşlarını seç)</summary>
          <p>
            Oda ekranındayken tek tuşla pencere açıp kapatabilirsin. Bir yazı kutusuna
            yazarken kısayollar devre dışı kalır — yani sohbete "m" yazmak haritayı açmaz.
            (Esc her zaman çalışır, açık pencereyi kapatır.)
          </p>
          <ShortcutSettings />
        </details>

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
          <p>
            <strong>👁️ İzleyici olarak katıl</strong>: katılma formundaki kutucuğu işaretlersen
            karakter oluşturmadan sadece izlersin. İzleyiciler sahneyi, zar animasyonunu/geçmişini
            ve sohbeti görür ama zar atamaz, sohbete yazamaz; sol Parti panelinde ayrı, sade bir
            "İzleyiciler" listesinde görünür (bu liste de diğer menüler gibi başlığına tıklanarak
            katlanabilir) ve göreve/inisiyatife/ganimete dahil edilmez. GM
            istediği zaman bir izleyiciyi odadan atabilir.
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
            <li><strong>Sıfırdan Oluştur</strong> — Senaryo Adı, Tasarım Teması (21 farklı tür arasından: fantazi, cyberpunk, western, korsan, vampir, uzay operası ve daha fazlası), <strong>Seviye Sistemi</strong> (maksimum seviye + seviye başına gereken XP), <strong>Stat Sistemi</strong> (statların hangi puandan hangi puana kadar çıkabileceği, ve bir stata tıklanınca atılan 1d20'ye hangi puanlardan itibaren +1/+2/+3 eklenip -1/-2/-3 düşüleceği), Statlar, <strong>Kaynaklar</strong> (Can Puanı, Stres, Kaynak Puanı gibi dolgu çubukları), <strong>Savaş ayarları</strong> (can kaynağı + durum etkileri), Irklar, Sınıflar, Alt Sınıflar, <strong>Trait/Perk Kategorileri</strong>, <strong>Seviye Atlama Ödülleri</strong> ve Bulunabilecek Eşyalar listelerini kendin oluştur.</li>
            <li>İstersen bu kural setini bir <strong>şablon olarak kaydedip</strong> başka odalarda tekrar kullanabilirsin.</li>
          </ul>
          <p>
            GM daha sonra <strong>"⚙️ Kuralları Düzenle"</strong> ile oyun ortasında yeni kayıt, eşya,
            ırk vb. ekleyebilir — oyuncuların mevcut seçimleri bozulmaz.
          </p>
          <p>
            <strong>Emeğin kaybolmaz</strong>: kurulum ve kural düzenleme ekranlarında yazdıkların
            birkaç saniyede bir tarayıcına <em>taslak</em> olarak kaydedilir. Sekme kapanır ya da
            kazara çıkarsan, ekranı bir daha açtığında "Kaydedilmemiş bir taslak bulundu — geri
            yüklensin mi?" diye sorar. Kaydetmeden kapatmaya çalışırsan da uyarı alırsın. Taslak
            sadece senin tarayıcında durur, odaya yazılmaz; "Kaydet" dediğin an silinir.
          </p>
        </details>

        <details>
          <summary>⚔️ Savaş: Can Barı, Hasar ve Durumlar</summary>
          <p>
            Haritadaki token'lar artık savaş yönetiyor. Kurulumda/"⚙️ Kuralları Düzenle"de iki
            ayar yaparsın:
          </p>
          <ul>
            <li>
              <strong>Can Kaynağı</strong> — kaynaklarından hangisi can sayılsın (Can Puanı,
              Dayanıklılık, Gemi Bütünlüğü... ne tanımladıysan). Bu, karakter kağıdındaki
              <em> aynı değerdir</em>: haritadan verilen hasar kağıda, kağıttan yapılan değişiklik
              haritaya anında yansır. "Yok" seçersen can barı hiç çıkmaz.
            </li>
            <li>
              <strong>Durum Etkileri</strong> — kendi listeni yazarsın (🩸 Kanama, 😵 Sersem,
              🛡️ Korunma...). İkonu açılır menüden seçersin.
            </li>
          </ul>
          <p>
            <strong>NPC canı</strong>: Odak Kütüphanesi'nde bir kaydı "🎭 Karakter/NPC" olarak
            eklerken "Can" kutusuna bir sayı yazarsan, o NPC haritaya çıktığında barı dolu başlar.
            Boş bırakırsan o NPC'de bar olmaz. Sonradan da değiştirebilirsin: kütüphane
            listesinde her NPC'nin yanındaki küçük can kutusuna yeni değeri yazıp Enter'a basman
            (ya da kutudan çıkman) yeterli.
          </p>
          <ul>
            <li>
              Token'ın altında ince bir <strong>can barı</strong> görünür; can azaldıkça yeşilden
              sarıya, sonra kırmızıya döner. Can sıfırlanınca token griye düşer.
            </li>
            <li>
              <strong>Sadece GM</strong> bir token'a tıklayarak hasar panelini açar: −1/−5/−10 ve
              +1/+5/+10 hızlı tuşları, serbest miktar girip "⚔️ Hasar" / "✚ İyileş", ayrıca
              "Tam doldur" ve "Sıfırla". (Sürüklemek token'ı taşır, tıklamak paneli açar.)
            </li>
            <li>
              Aynı panelden <strong>durum etkilerini</strong> açıp kapatırsın; ikonlar token'ın
              köşesinde, ayrıca Parti panelinde oyuncunun adının yanında ve karakter kağıdında
              görünür.
            </li>
            <li>
              Oyuncular canlarını kendi karakter kağıtlarındaki kaynak çubuğundan yönetmeye devam
              eder; haritadan hasar veremezler.
            </li>
          </ul>
        </details>

        <details>
          <summary>📜 Belgeler (Handout)</summary>
          <p>
            GM Kontrol Paneli'ndeki <strong>Belge Kütüphanesi</strong>'nde mektup, not, gazete
            kupürü, harita parçası gibi belgeler hazırlanır: bir başlık, isteğe bağlı metin ve
            isteğe bağlı görsel (link ya da "📤 Yükle").
          </p>
          <ul>
            <li>
              Kaydetmek belgeyi kimseye göstermez — sadece kütüphaneye ekler. Oyun sırasında
              <strong> "📤 Gönder"</strong> deyip <strong>herkese</strong> ya da işaretlediğin
              <strong> tek tek oyunculara</strong> yollarsın.
            </li>
            <li>
              Gönderilen belge alıcının <strong>sohbet akışına kart olarak</strong> düşer (görsel +
              metin); görsele tıklayınca tam boy açılır. Yeni belge geldiğinde sohbet bildirim sesi
              çalar ve küçük log yanıp söner. Sana özel gelen belgelerde "sana özel" yazar.
            </li>
            <li>
              GM tüm gönderilen belgeleri görür. <strong>"📤 Gönderilenler"</strong> listesinden
              <strong> "Geri Al"</strong> ile bir belgeyi alıcılardan geri çekebilirsin — kart
              sohbetten kaybolur.
            </li>
            <li>
              Gönderilen kopya bağımsızdır: kütüphanedeki belgeyi sonradan silmek, daha önce
              gönderdiklerini bozmaz.
            </li>
          </ul>
        </details>

        <details>
          <summary>🎉 Seviye Atlama Ödülleri (sadece GM)</summary>
          <p>
            Kurulum ekranında ve "⚙️ Kuralları Düzenle"de, seviye atlayan bir karakterin ne
            kazanacağını sen belirlersin:
          </p>
          <ul>
            <li>
              <strong>Genel kural</strong> — kaç <strong>stat puanı</strong> dağıtılacağı ve her
              trait/perk kategorisinden kaçar seçim hakkı verileceği. Bu kural, özel kuralı
              olmayan bütün seviyeler için geçerlidir.
            </li>
            <li>
              <strong>Seviyeye özel kural</strong> — "➕ Seviyeye Özel Kural Ekle" ile bir seviye
              numarası seçip o seviyeye başka değerler verebilirsin (örneğin 3. seviyede 2 stat
              puanı + 1 büyü seçimi, diğerlerinde 1 stat puanı). Ulaşılan seviyenin kendi kuralı
              varsa o, yoksa genel kural uygulanır.
            </li>
            <li>
              Hepsini 0 yaparsan o seviyede sadece seviye artar (ve kaynaklar dolar). Bir
              kategoriden kalan seçenek sayısı verilen haktan azsa, oyuncudan sadece kalan kadarı
              istenir.
            </li>
            <li>
              Hiç ayar yapmadıysan eski davranış sürer: 1 stat puanı + 1 perk seçimi.
            </li>
          </ul>
        </details>

        <details>
          <summary>🏷️ Trait / Perk Kategorileri (sadece GM)</summary>
          <p>
            Kurulum ekranında ve "⚙️ Kuralları Düzenle"de, karakter kağıdındaki işaretlemeli
            listeler artık tamamen senin kontrolünde:
          </p>
          <ul>
            <li>
              <strong>İsimlerini değiştir</strong> — varsayılan "Traitler" ve "Perkler" adlarını
              silip ne istersen yazabilirsin (Yetenekler, Büyüler, Kusurlar, Ekipman Dalları...).
              Yeni ad karakter kağıdında, Parti panelinde ve sistem kayıtlarında da görünür.
            </li>
            <li>
              <strong>İstediğin kadar kategori ekle</strong> — "➕ Kategori Ekle" ile ikiden fazla
              liste oluşturabilirsin; her birinin kendi kayıtları ve açıklamaları olur. Bir
              kategoriyi silmek içindeki kayıtları da siler (onay ister).
            </li>
            <li>
              <strong>Sınıfa/alt sınıfa özel kayıtlar</strong> — her kaydın altındaki "Herkese
              açık" satırına tıklayıp kaydı belirli sınıf ve/veya alt sınıflara sınırlayabilirsin.
              Sınırlı bir kaydı yalnızca o sınıf/alt sınıftaki karakterler kendi kağıtlarında
              görür; hiçbiri işaretli değilse herkes görür. Bir oyuncu daha önce seçtiği bir kaydı,
              sınıfını değiştirse bile kağıdında görmeye devam eder (kaldırabilsin diye).
            </li>
            <li>
              Seviye atlarken verilen ödül, "Perkler" kategorisinden (o kategoriyi sildiysen
              listedeki ikinci kategoriden) seçilir ve o kategorinin adıyla anılır.
            </li>
          </ul>
        </details>

        <details>
          <summary>🖼️ Sahne & Atmosfer</summary>
          <p>Orta bölümdeki sahne alanı herkese aynı anda görünür:</p>
          <ul>
            <li><strong>Mekan Görseli</strong> ve <strong>Sahne Adı</strong> — sahne adı daktilo efektiyle yazılır.</li>
            <li><strong>Odak Görseli</strong> — o an konuşan karakter/eşya, kendi adıyla birlikte.</li>
            <li><strong>Harita</strong> — üst menüdeki inisiyatif sırasının sağındaki "🗺️ Haritayı Göster" ile <strong>serbest bir pencere</strong> olarak açılır: üst çubuğundan tutup istediğin yere sürükleyebilir, sağ alt ve sol alt köşesinden boyutlandırabilirsin (yeri ve boyutu hatırlanır). Üzerine tıklayarak pin bırakabilirsin (kendi renginde); kendi pinini herkes, başkasının pinini sadece GM kaldırabilir. Başlıktaki ➕/➖ ile ya da doğrudan harita üzerinde <strong>fare tekerleğini çevirerek</strong> yakınlaştırıp uzaklaştırabilirsin (tekerlekle yaparken imlecin altındaki nokta sabit kalır); yakınlaştırdığında haritayı sürükleyerek gezebilirsin (⟲ sıfırlar). Pinler ve token'lar yakınlaştırmayla birlikte doğru yerlerinde kalır, boyutları sabit görünür. GM ayrıca pencerenin üst çubuğundaki menüden kütüphanedeki başka bir haritaya geçebilir.</li>
            <li><strong>Taktiksel Token'lar</strong> — inisiyatif sırasındaki her oyuncu ve NPC, harita açıldığında otomatik olarak bir token (portre + renkli halka; NPC'ler kırmızı) halinde haritada belirir. Sadece GM token'ları sürükleyip konumlandırabilir; oyuncular canlı olarak izler. Kuyruktan çıkarılan bir karakterin token'ı da haritadan kalkar.</li>
            <li><strong>Müzik / Ambiyans</strong> — GM çalar/durdurur, herkes kendi ses seviyesini ayarlar. Sahne değiştirmek müziğe dokunmaz: müzik kaldığı yerden çalmaya devam eder. Müzik yalnızca menüden farklı bir parça seçildiğinde (ya da "⏮ Baştan Başlat" denildiğinde) baştan başlar.</li>
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
            Sıra değiştiğinde sırası gelen oyuncu ekranında bir uyarı bandı görür ve kısa bir bildirim sesi duyar; masadaki herkesin inisiyatif şeridi de kısaca parlar (sessiz). Ses seviyesi zar sesleriyle aynı 🔊 ayarına bağlıdır.
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
            trait/perkleri, özgeçmişini ve envanterini görürsün. Bir oyuncunun satırının <strong>üzerine gelmen</strong> (tıklamadan) ırkını, sınıfını, alt sınıfını, seçtiği trait/perkleri özetleyen bir ipucu gösterir. Açılan detayda ırk/sınıf/alt sınıf, trait/perk ve envanter isimlerinin üzerine gelirsen, kurallarda o kayıt için yazdığın <strong>açıklama</strong> belirir (altı noktalı çizgili olanların açıklaması vardır). GM buradan oyuncuyu odadan
            atabilir; oyuncunun karakter kağıdını kilitleyebilir ve "✏️ Karakteri Düzenle" ile
            doğrudan düzenleyebilir. Fısıltılar ve otomatik sistem kayıtları artık ayrı bir liste
            değil — hemen altındaki <strong>💬 Sohbet</strong> panelinde, sohbet mesajlarıyla
            birlikte farklı bir görünümle (🔒 fısıltı, açık renkli sistem kaydı) karışık akışta
            görünür. Bir oyuncunun statlarına tıklayıp onun adına zar atmak sadece GM'e ve
            oyuncunun kendisine açıktır — başka bir oyuncunun stat'ına tıklayamazsın. GM bir
            oyuncunun karakter kağıdını görünürlükten zorla gizlemediyse, oyuncular birbirinin
            statlarını/trait/perk/envanterini görüp görmeyeceğini kendi karakter kağıdındaki bir
            anahtardan ayarlayabilir — kapatırsa diğer oyuncular portresini, durumunu ve
            seviye/ırk/sınıf satırını yine de görür, sadece statlardan itibaren "gizledi" notu
            çıkar; GM yine de her zaman tam görür.
          </p>
        </details>

        <details>
          <summary>📜 Görev Panosu (üst menü)</summary>
          <p>
            Üst menüde harita tuşunun yanındaki <strong>"📜 Görevleri Göster"</strong> ile serbest
            bir pencere olarak açılır, aynı tuşa tekrar basınca kapanır. Harita ve sohbet
            pencereleri gibi üst çubuğundan sürüklenip alt köşelerinden boyutlandırılabilir; yeri
            ve boyutu tarayıcında hatırlanır.
          </p>
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
            Üst menüde harita/görev tuşlarının altındaki <strong>"📜 Karakter Kağıdım"</strong>
            tuşuna tıklayınca pencere olarak açılır (kapatmak için "✕ Kapat" ya da dışına tıkla).
            Ekranın ortası tamamen sahneye ayrıldığı için bu tuş artık orada yer kaplamıyor.
          </p>
          <ul>
            <li><strong>Karakter Adı</strong> dilediğin zaman değiştirilebilir — odaya girerken seçtiğin isimle sınırlı değilsin, buradan güncelleyince sohbet, zar atışları ve Parti panelinde de anında yeni isim görünür.</li>
            <li>GM görünürlüğü zorlamadıysa, en üstteki <strong>"Karakter kağıdımı diğer oyunculara göster"</strong> anahtarıyla statların/trait/perk/envanterinin diğer oyunculara görünüp görünmeyeceğini kendin seçersin (portren, seviyen ve durumun her zaman görünür kalır).</li>
            <li><strong>Karakter görselleri</strong> — link yapıştırıp "➕ Ekle" diyerek ya da "📤 Yükle" ile bilgisayarından seçerek istediğin kadar görsel biriktirebilirsin. Eklemeden önce <strong>"Görsel Adı"</strong> kutusuna bir isim yazarsan (örn. "Zırhlı hali") görsel o adla kaydedilir; boş bırakırsan "Görsel 1, 2..." diye adlandırılır. Eklediklerin küçük kareler halinde listelenir, adları altlarında yazar — adına tıklayarak sonradan değiştirebilirsin. Hangisini kullanmak istiyorsan karesine tıklarsın (seçili olan altın çerçeveyle belli olur), köşesindeki ✕ ile silersin. Seçtiğin görsel Parti panelinde, inisiyatif şeridinde ve haritadaki token'ında görünür.</li>
            <li><strong>Görsellerin GM'e açıktır</strong> — yüklediğin her görsel, GM'in odak görseli seçtiği yerde <strong>👥 Oyuncular › karakter adın</strong> klasörü altında verdiğin isimle listelenir; GM istediğini seçip canlı sahneye verebilir. Verdiğin ad sadece seçim listesinde görünür — sahnede her zaman yalnızca <strong>karakter adın</strong> yazar.</li>
            <li><strong>Profil rengi</strong> seç — bu renk Parti panelinde ve harita pinlerinde senin rengin olur.</li>
            <li>Irk / Sınıf / Alt Sınıf seç (varsa açıklamaları altında görünür).</li>
            <li>Statlarını +/- ile ayarla, Durumunu (İyi/Yaralı/Bitkin/Ölü) seç. Bir statın adına/değerine tıklayınca, GM'in belirlediği eşiklere göre bonus eklenmiş bir 1d20 atılır — sonuç herkesin gördüğü zar panelinde çıkar. Zar panelindeki Avantaj/Dezavantaj seçimin neyse (⬇ Dezavantaj / Normal / ⬆ Avantaj), stat atışların da otomatik olarak onu kullanır.</li>
            <li>
              <strong>Kaynaklar</strong> (varsa — Can Puanı, Stres, Fate Puanı gibi) dolgu
              çubuğu olarak görünür, +/- ile değiştirirsin; üst sınırı GM'in tanımladığı değerdir.
            </li>
            <li>GM'in tanımladığı kategorilerden (varsayılan adlarıyla Traitler ve Perkler, ama GM bunları yeniden adlandırıp yenilerini ekleyebilir) işaretle — seçtiklerinin açıklaması altta çıkar. Bir kayıt belirli sınıf/alt sınıflara sınırlandıysa <strong>sadece o sınıftaki karakterler</strong> onu listede görür; sonradan sınıf değiştirsen bile önceden seçtiklerin kaybolmaz, istersen kaldırabilirsin.</li>
            <li><strong>Özgeçmiş</strong> metnini serbestçe yaz.</li>
            <li>Envantere GM'in eşya kataloğundan seçerek veya kendi yazarak eşya ekle. Yanındaki <strong>Adet</strong> kutusuna bir sayı yazarsan eşya "×3" gibi sayılı eklenir ve envanterde +/- düğmeleriyle adedini artırıp azaltabilirsin (silip yeniden eklemene gerek kalmaz). Adet boş bırakılırsa eşya eskisi gibi tek satır olarak durur.</li>
            <li>
              <strong>XP Çubuğu</strong> — GM'in "Kuralları Düzenle"de belirlediği "Maksimum
              Seviye" ve "Seviye Başına Gereken XP" değerlerine göre doluyor. GM Parti panelinden
              sana XP verir; çubuk bir sonraki seviyeye ne kadar kaldığını gösterir. XP seviye
              atlarken sıfırlanmaz, birikmeye devam eder.
            </li>
            <li>
              <strong>🎉 Seviye Atla</strong> — yeterli XP'ye ulaşınca buton parlayarak aktif olur.
              Açılan ekranda o seviyenin ödülü yazar: GM'in belirlediği kadar <strong>stat
              puanını</strong> +/- düğmeleriyle istediğin statlara dağıtırsın (bir stata birden
              fazla puan koyabilirsin, maksimum stat puanını aşamazsın) ve her kategoriden
              belirlenen sayıda seçim yaparsın. Tüm puanları dağıtıp seçimleri tamamlamadan onay
              düğmesi açılmaz. Onaylayınca seviyen artar ve kaynakların (varsa) tamamen dolar.
              Maksimum seviyeye ulaşınca buton kaybolur. (GM her zaman, XP yetmese bile seviye
              atlatabilir.)
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
          <summary>🛠️ GM Kontrol Paneli (üst menü, sadece GM)</summary>
          <p>
            Üst menüde harita/görev tuşlarının altındaki <strong>"🛠️ GM Kontrol Paneli"</strong>
            tuşuna tıklayınca pencere olarak açılır (kapatmak için "✕ Kapat" ya da dışına tıkla).
            Ekranın ortası tamamen sahneye ayrıldığı için bu tuş artık orada yer kaplamıyor.
            Panel dört sekmeye ayrılmıştır — <strong>🏠 Oda</strong>, <strong>📚 Kütüphaneler</strong>,
            <strong> ⚔️ İnisiyatif</strong>, <strong>🔧 Araçlar</strong> — ve son kullandığın sekme
            hatırlanır. Kütüphaneler uzadıkça listelerin başında bir <strong>arama kutusu</strong>
            belirir; aynı arama sahnedeki mekan/odak seçim menüsünde de vardır.
          </p>
          <ul>
            <li><strong>Oda Yönetimi</strong> — odayı kilitle/aç (yeni katılımı engelle), isteğe bağlı <strong>oda şifresi</strong> belirle, "▶️ Oturumu Başlat" / "⏹️ Oturumu Sonlandır" ile oturumu aç/kapa (kapatmak odayı veya verileri silmez — sadece "aktif değil" gösterir, tekrar başlatana kadar), odayı sil (sadece oda sahibi görür), <strong>Karakter Kağıdı Görünürlüğü</strong> ile oyuncuların birbirinin statlarını/traitlerini/envanterini görüp göremeyeceğini "Herkese zorla göster", "Herkesten zorla gizle" ya da "Oyuncunun kendi seçimine bırak" olarak ayarla (sen GM olarak her zaman herkesi tam görürsün).</li>
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
              <strong>Kütüphane adı ve sahne metni ayrıdır</strong> — "Kütüphane adı" sadece sana
              görünür (kayıtları kolayca bulman için), "Sahnede yazacak metin" ise oyuncuların
              görselin üzerinde göreceği yazıdır. Boş bırakırsan sahnede metin çıkmaz. Ayrıca
              isteğe bağlı bir <strong>klasör</strong> adı verip kütüphaneni gruplayabilirsin;
              klasörler hem GM panelinde hem de sahne seçim menüsünde ayrı başlıklar halinde
              görünür.
            </li>
            <li>
              <strong>👥 Oyuncular klasörü</strong> — oyuncuların karakter kağıtlarına yükledikleri
              görseller, odak seçim menüsünde (ve GM panelindeki Odak Kütüphanesi'nde) otomatik
              olarak "Oyuncular" başlığı altında, her oyuncunun kendi adıyla açılan alt klasöründe
              listelenir. Oyuncunun görsele verdiği ad seçim listesinde görünür; sahnede ise her
              zaman sadece <strong>karakterin adı</strong> yazar. Bunlar kütüphanene kopyalanmaz —
              oyuncu görseli silerse listeden de düşer.
            </li>
            <li>
              Her görsel/ses alanının yanındaki <strong>"📤 Yükle"</strong> butonuyla bir link
              yapıştırmak yerine bilgisayarından dosya seçip doğrudan yükleyebilirsin (görsel için
              8MB, ses için 15MB üst sınır). Bu, Firebase Storage'ın etkinleştirilmiş olmasını
              gerektirir — değilse yükleme birkaç saniye içinde net bir hata verir, URL alanı her
              zaman alternatif olarak çalışmaya devam eder.
            </li>
            <li><strong>Harita Kütüphanesi</strong> — mekan/odak kütüphaneleri gibi çalışır: istediğin kadar harita kaydedip (isteğe bağlı klasörleyip) listeden tıklayarak canlı haritayı değiştirirsin. Farklı bir harita yayınlandığında o haritaya ait pinler ve token'lar temizlenir. "🚫 Haritayı Kaldır" ile haritayı tamamen kapatabilirsin.</li>
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
          <summary>💬 Sohbet (üst menü)</summary>
          <p>
            Herkesin birlikte kullandığı ortak yazışma kanalı. Üst menüde inisiyatif sırasının
            solundaki <strong>"💬 Sohbeti Göster"</strong> ile serbest bir pencere olarak açılır —
            harita penceresi gibi üst çubuğundan sürüklenip köşelerinden boyutlandırılabilir, yeri
            ve boyutu hatırlanır. Pencerenin solunda, sohbet kapalıyken bile <strong>son birkaç
            mesajı</strong> gösteren küçük bir kayıt duruyor; ona tıklayarak da sohbeti
            açabilirsin (o küçük kayıt da sohbetin tamamını yansıtır: fısıltılar ve sistem
            kayıtları dahil, sadece senin görmeye yetkili olduğun kadarıyla). Başkasından yeni bir
            mesaj geldiğinde kısa bir <strong>bildirim sesi</strong> çalar (ses seviyesi, zar
            sesleriyle aynı 🔊 ayarına bağlıdır) ve sohbet kapalıysa küçük kayıt odanın temasına
            uygun renkte <strong>yanıp söner</strong>; sohbeti açtığında uyarı söner. Üç tür mesaj
            aynı akışta, farklı görünümle karışık sırayla listelenir:
          </p>
          <ul>
            <li>Normal sohbet mesajları — herkesin yazdığı, herkesin gördüğü.</li>
            <li>
              <strong>🔒 Fısıltılar</strong> — mesaj kutusunun yanındaki "📢 Herkese" açılır
              menüsünden bir kişi (GM dahil) seçip özel mesaj gönderebilirsin; herkes birbirine
              fısıldayabilir, sadece GM ve GM Kontrol Paneli'ne özel değil. Sadece gönderen ve alan
              görür — GM istisna olarak, kendisini ilgilendirmeyen oyuncular arası fısıltıları da
              dahil, masadaki tüm fısıltıları görür.
            </li>
            <li>
              <strong>Sistem kayıtları</strong> — oturum başladıktan sonra karakter kağıdında olan
              stat/kaynak/trait/perk/ırk/sınıf/envanter değişiklikleri ve seviye atlamalar otomatik
              olarak buraya, soluk/italik bir görünümle düşer.
            </li>
          </ul>
        </details>

        <details>
          <summary>📷 Kamera & Mikrofon (alt kenar)</summary>
          <p>
            Ekranın en altında sabit bir şerit. Şeridin en üstündeki tutamağı yukarı/aşağı
            sürükleyerek yüksekliğini ayarlayabilirsin — kameralar şeridin yüksekliğine göre
            büyüyüp küçülür, ayarın tarayıcında hatırlanır. GM ve oyuncular <strong>"📷 Kamerayı Aç"</strong>
            ile kendi kamera/mikrofonunu açabilir, açıkken <strong>"🎤 Sustur"</strong> ile sadece
            mikrofonu kapatabilir. İzleyiciler kamera açamaz ama şeritteki herkesi izleyebilir.
            Görüntü/ses tarayıcılar arasında doğrudan (uçtan uca şifreli) akar, hiçbir sunucudan
            geçmez; kamera hiçbir zaman otomatik açılmaz, her seferinde tıklaman gerekir.
            Tarayıcılar başkasının sesini otomatik açmaya izin vermediği için her kutucuk
            başlangıçta sessiz gelir — kutucuğun sağ üstündeki 🔇 ikonuna tıklayınca o kişinin
            sesini açarsın. Kutucuğun kendisine tıklayınca o kişiye özel bir
            <strong> ses seviyesi</strong> kaydırıcısı açılır (herkesin sesini ayrı ayrı
            ayarlayabilirsin). Konuşan kişinin kutucuğu <strong>yeşil çerçeveyle</strong>
            belirginleşir. Bazı
            kısıtlı ağlarda (kurumsal ağ, katı NAT) bağlantı kurulamayabilir — bu durumda o kişinin
            kutucuğu görünmeyebilir.
          </p>
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
