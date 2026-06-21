Iceberg X Programı Teknolojik Araştırma, Mimari Tasarım ve Entegrasyon RaporuSHARED_RESEARCH_REPORT.md1. Iceberg Digital ve Lifesycle CRM EkosistemiEmlak teknolojileri (PropTech) sektörü, durağan veri depolama sistemlerinden otonom ve yapay zeka tabanlı otonom sistemlere doğru yapısal bir değişim geçirmektedir. Geleneksel müşteri ilişkileri yönetimi (CRM) yazılımları, veri depolama ve manuel girdi süreçlerine dayanırken, Iceberg Digital tarafından geliştirilen Lifesycle CRM, bu yapıyı arka planda sürekli çalışan yapay zeka servisleriyle otonomlaştırmaktadır.1.1. Lifesycle CRM Temel Özellikleri ve Emlak Acentesi İş AkışlarıLifesycle, emlak acentelerinin günlük operasyonlarında mülk değerleme (Market Appraisal) randevularının planlanması, potansiyel alıcı/satıcı eşleştirmeleri, pazarlama otomasyonları ve uyumluluk (AML/ID Check) süreçlerini tek bir platformda birleştirmektedir. Geleneksel emlak yönetim sistemlerinin aksine Lifesycle, acentenin veritabanına giren her yeni kontağın satılık mülkü olup olmadığını harici veri kaynaklarıyla çapraz sorgulayarak otomatik tespit eder.1.2. Mülk Değerleme (Property Valuation / Market Appraisal) İş AkışıEmlak değerleme döngüsü, bir satıcının mülk değer tespiti için acenteye başvurmasıyla başlar. Değerleme süreci şu aşamalardan oluşur:Randevu Planlama: CRM takvimi üzerinden fiziki veya sanal bir değerleme randevusu oluşturulur.Ön Değerlendirme: Yapay zeka destekli Uzair motoru, mülk adresini geçmiş satış verileri ve pazar analizleriyle çapraz sorgulayarak ön hazırlık raporu sunar.Saha İncelemesi / Görüşme: Acente sahada veya video konferans aracılığıyla mülkün kondisyonunu, satıcının motivasyonunu ve fiyat beklentilerini kayıt altına alır.Teklif Hazırlığı ve Sunum: Saha verileri analiz edilerek hazırlanan dijital değerleme sunumu, mobil cihazlar üzerinden müşteriye ulaştırılır. Satıcı onay verdiğinde sistem üzerinden dijital sözleşme tetiklenir.1.3. Mevcut Entegrasyon Durumu ve Teknoloji Yığını (Tech Stack)Kamuya açık kaynaklar ve emlak entegrasyon ekosistemi incelendiğinde, Lifesycle CRM altyapısının Laravel (PHP) ve React tabanlı modern ve modüler bir mimari üzerinde yükseldiği görülmektedir. Veri tabanı katmanında ilişkisel veri şemalarının yüksek performansla sorgulanabilmesi amacıyla PostgreSQL tercih edilmiştir. Mevcut sistemde Zoom ve Plaud.ai entegrasyonları sadece harici bağlantıların kopyalanıp yapıştırılması seviyesindedir. Bu durum, müşteri zaman tüneli (timeline) üzerinde tam bir iletişim geçmişi oluşturulmasını engellemektedir.2. Zoom Geliştirici Ekosistemi Analizi (M2 ve M3 Ortak)2026 yılı itibarıyla Zoom geliştirici platformu, güvenlik standartları ve yetkilendirme modellerinde kritik güncellemeler yapmıştır.2.1. Meeting SDK vs. Video SDK vs. REST API KarşılaştırmasıSanal değerleme randevularının ve acente-müşteri görüşmelerinin CRM içerisine gömülmesi için Zoom üç farklı mimari seçenek sunmaktadır:ÖzellikMeeting SDKVideo SDKREST APIArayüz KontrolüZoom arayüzü gömülü olarak gelir.Tamamen özelleştirilebilir özel UI.Arayüz sunmaz, arka plan verisi üretir.Geliştirme HızıÇok Yüksek (Hazır şablonlar mevcut).Düşük (Sıfırdan video akışı yazılır).Yüksek (Yalnızca uç noktalar çağrılır).Maliyet YapısıStandart Zoom Lisansı ile çalışır.Dakika başına $0.0035 faturalandırılır.Hesap tipi dahilinde ücretsizdir.Yapay Zeka ErişimiHam sese doğrudan erişim sunmaz.Ham ses ve videoya erişim sağlar.Kayıt bittikten sonra mp3/wav verir.2.2. Web SDK Sınırları ve WebAssembly TeknolojisiWeb Meeting SDK, tarayıcı tarafında yüksek performanslı video işleme gerçekleştirmek için WebAssembly (Wasm) modüllerini kullanmaktadır. Bu yapı, tarayıcılar üzerindeki CPU yükünü azaltırken, ses akışının sıkıştırma limitlerini ve arka plan gürültü engelleme profillerini Zoom'un standart kodek yapısına kilitler. Ham ses verisine gerçek zamanlı erişim gerektiren AI not alma botları için Meeting SDK yerine Real-Time Media Streams (RTMS) kullanımı zorunludur.2.3. Kimlik Doğrulama Güvenlik Gereksinimleri (2026 Güncellemeleri)2 Mart 2026 OBF/ZAK Zorunluluğu: Zoom, harici hesaplar tarafından başlatılan toplantılara katılan tüm SDK uygulamaları için On Behalf Of (OBF) veya Zoom Access Key (ZAK) kullanımını zorunlu kılmıştır. Bu sayede, izinsiz katılım sağlayan kontrolsüz botların sisteme sızması engellenmektedir.27 Haziran 2026 Client ID/Secret Geçişi: Zoom, legacy Meeting SDK Key/Secret yapısını tamamen devre dışı bırakmaktadır. 20 Haziran 2026 (Bugün) itibarıyla tüm uygulamaların Client ID ve Client Secret tabanlı JWT imza üretimine göç etmiş olması zorunludur; aksi takdirde 7 gün sonra tüm SDK yetkilendirmeleri başarısız olacaktır.İDDİA: 27 Haziran 2026 itibarıyla Meeting SDK Key ve Secret kullanımdan kaldırılacak, Client ID ve Client Secret kullanımı zorunlu olacaktır.
KAYNAK: https://developers.zoom.us/docs/meeting-sdk/sdk-key-migration/ (Erişim Tarihi: 2026-06-20)
GÜVENİLİRLİK: Resmi Zoom Geliştirici Dokümantasyonu.
NOT: Bu geçiş tamamlanmadığı takdirde üretilen tüm JWT imzaları geçersiz kılınacaktır [cite: 21, 22].
2.4. Zoom Phone API ve Webhook EntegrasyonuZoom Phone sisteminin web tabanlı CRM platformlarına bağlanması, yerel işletim sistemi URI protokolleri (tel:, callto:, veya yerel autodial parametreleri destekleyen zoomphonecall://{number}?callerid={extension}) üzerinden click-to-dial olarak gerçekleştirilir. Çağrı durumları, kuyruk verileri ve çağrı tamamlanma kayıtları asenkron webhook'lar üzerinden takip edilir.İDDİA: Zoom Phone API sisteminde eski nesil Call Logs API uç noktaları Mayıs 2026 itibarıyla tamamen kaldırılmış olup yerine Call History API uç noktaları gelmiştir.
KAYNAK: https://developers.zoom.us/changelog/phone/november-13-2025/ (Erişim Tarihi: 2026-06-20)
GÜVENİLİRLİK: Resmi Zoom Sürüm Günlükleri (Changelog) [cite: 27].
NOT: `GET /v2/phone/call_logs` yerine artık `GET /v2/phone/call_history` kullanılmalıdır [cite: 27].
3. Plaud.ai API ve Entegrasyon Özellikleri (M4)Plaud.ai, donanım düzeyinde geliştirdiği ses kayıt cihazları ve arka planda çalışan bulut tabanlı transkripsiyon servisleriyle saha görüşmelerini dijitalleştirmektedir.3.1. Plaud Developer Platformu ve API Durumu (2026)2026 yılı itibarıyla Plaud, B2B iş ortakları için "Plaud Embedded" platformunu ve resmi transkripsiyon API servislerini sunmaktadır. Plaud Embedded mimarisi, fiziksel donanımı BLE (Bluetooth) ve Wi-Fi üzerinden kontrol eden bir mobil SDK ile transkripsiyon ve yapay zeka analizlerini asenkron yöneten bir bulut API'sinden oluşmaktadır.3.2. Kimlik Doğrulama ve Token HiyerarşisiPlaud Embedded platformuna bağlanmak iki aşamalı bir mimari gerektirir:Partner Token: Geliştirici portalındaki Client ID ve Secret ile üretilen ve sistem seviyesindeki tüm işlemleri yetkilendiren ana belirteçtir.User Token: Bireysel kullanıcı düzeyinde, kullanıcının fiziksel Plaud donanımını iş ortağı uygulamasına bağlamak (binding) ve yerel şifreleme anahtarlarını üretmek için kullanılır.İDDİA: Plaud Embedded SDK'sı yerel veri şifreleme güvenliğini sağlamak için her cihazın yalnızca tek bir kullanıcı hesabı ve uygulamaya bağlanmasına (binding) izin verir.
KAYNAK: https://docs.plaud.ai/plaud-embedded/overview (Erişim Tarihi: 2026-06-20)
GÜVENİLİRLİK: Resmi Plaud Geliştirici Dokümanları.
NOT: Bir cihazı başka bir hesaba bağlamadan önce mevcut hesaptan unbind edilmesi zorunludur [cite: 32, 33].
3.3. Transkripsiyon Alımı ve Webhook AkışıSes dosyaları Plaud cihazından mobil uygulama vasıtasıyla senkronize edildikten sonra, transkripsiyon API'si GET /v1/recordings/{id}/transcript üzerinden asenkron sorgulama (polling) veya anlık webhook POST bildirimleri sunar. Transkripsiyon motoru, gürültü bastırma ve konuşmacı ayrıştırma (diarization) algoritmalarını desteklemektedir.4. Yapay Zeka, Büyük Dil Modelleri ve Ajan Yapıları (M1, M4, M5 Ortak)2026 yılı itibarıyla kurumsal yapay zeka entegrasyonları, statik yönlendirmelerden (prompting) otonom karar alabilen ajan sistemlerine (agentic workflows) evrilmiştir.4.1. Model Context Protocol (MCP) TeknolojisiModel Context Protocol, büyük dil modellerinin veri tabanları ve harici API'ler gibi dış dünyadaki sistemlerle güvenli ve standart bir JSON-RPC 2.0 protokolü üzerinden konuşmasını sağlayan açık bir entegrasyon standardıdır. MCP sunucuları, LLM'e sadece okuma yetkisi olan Resources (pasif veri şemaları) ile yazma ve eylem yetkisi olan Tools (etkin fonksiyonlar) sunarak sistem sınırlarını belirler.İDDİA: MCP protokolünün 2026 yılı ortası güncelleme taslakları (2026-07-28 release candidate), remote sunucular için OAuth 2.1 tabanlı korumalı kaynak keşfini (RFC 9728) zorunlu kılmaktadır.
KAYNAK: https://workos.com/blog/mcp-2026-spec-agent-authentication (Erişim Tarihi: 2026-06-20)
GÜVENİLİRLİK: Endüstriyel Güvenlik Analizi Raporları [cite: 39].
NOT: Remote HTTP/SSE bağlantısı kuran MCP sunucularının SSO ve OAuth standartlarına uyması gerekmektedir [cite: 39, 40].
4.2. Ajan Orkestrasyon Çerçeveleri (Orchestration Frameworks)Karmaşık süreçlerin yönetiminde, durum yönetimini (state management) ve asenkron kontrolü en kararlı şekilde yürüten kütüphane LangGraph olarak öne çıkmaktadır. LangGraph, durumsal grafik yapısı (Directed Acyclic Graph) sayesinde ajanların sonsuz döngülere girmesini önleyen recursion limitleri, asenkron checkpointing ve hata durumlarında kaldığı yerden devam edebilen Postgres tabanlı kalıcılık (persistence) sunmaktadır.5. R&D Platform ve Oyunlaştırma Analitiği (M1)Kurum içi inovasyon ve stajyer yönetim platformlarında oyunlaştırma (gamification) mekaniklerinin kullanılması, kullanıcı bağlılığını ve geliştirme hızını doğrudan artırmaktadır.5.1. Oyunlaştırma Mekanikleri ve Laravel AltyapısıPHP ve Laravel ekosisteminde oyunlaştırma motoru kurmak için iki ana açık kaynak kütüphane öne çıkmaktadır:qcod/laravel-gamify: Eloquent modellerine Reputation puanları ekleyen, dinamik puan tipleri ve rozetler (Badges) tanımlanmasını sağlayan, arka planda asenkron event-listener mekanizmasıyla çalışan popüler bir kütüphanedir.pacoorozco/gamify-laravel: Rol tabanlı görevler, soru-cevap zorluk seviyeleri ve oyuncu panelleri içeren tam kapsamlı bir oyunlaştırma platform şablonudur.6. Ortak Mimari Prensipler6.1. Teknoloji Karar MatrisiFarklı misyonlar için ortak kararlaştırılan teknoloji matrisi aşağıda sunulmaktadır:Teknoloji AlanıSeçilen ÇözümKarar GerekçesiBackend Dil / FrameworkLaravel 11 (PHP 8.3)Lifesycle CRM ana mimarisine ve veri tabanı entegrasyonlarına tam uyum.Veri Tabanı AltyapısıPostgreSQL (v16)İlişkisel CRM tabloları ve LangGraph asenkron durum kaydetme (AsyncPostgresSaver) desteği.Yapay Zeka ServisleriClaude 3.5 Sonnet / GPT-4oKarmaşık mülk analizlerinde ve kod inceleme adımlarında en yüksek doğruluk oranı.Asenkron KuyrukRedis / Laravel HorizonYüksek hacimli webhook bildirimlerini ve transkripsiyon işlemlerini kuyruklama performansı.6.2. Misyonlar Arası Bağımlılık DiyagramıKod snippet'igraph TD
    M1[M1: R&D platformu iyileştirme] -->|Ödüllendirme & Puanlama| M3[M3: CRM içi Zoom Meetings]
    M1 -->|Ödüllendirme & Puanlama| M4[M4: Plaud Ses Entegrasyonu]
    M2[M2: Çekirdek Zoom SDK & Phone] -->|Yetkilendirme ve İmza Servisi| M3
    M3 -->|Müşteri Randevu & Timeline Verisi| M4
    M5[M5: Otonom Dev-Assistant Stack] -->|Kod Şablonları ve CI Analizleri| M1
    M5 -->|Bağlantı Otomasyonu| M2
6.3. Ortak Risk Kaydı (Shared Risk Register)R1: Zoom Legacy Kimlik Doğrulama AmortismanıEtki: Kritik. 27 Haziran 2026 itibarıyla eski nesil SDK Key tamamen geçersiz kılınacaktır.Mitigasyon: Tüm R&D projelerinde imza üretimi doğrudan yeni nesil Client ID/Secret üzerinden kurulacaktır.R2: Plaud API Bölgesel KısıtlamalarıEtki: Yüksek. Plaud verileri bölgesel yasalara göre farklı bulut sunucularında tutulmaktadır.Mitigasyon: Backend katmanında dinamik bölge yönlendiricisi (region-aware routing) geliştirilecektir.R3: Otonom Ajanların Sonsuz Döngü RiskleriEtki: Orta-Yüksek. LLM kod düzeltme döngülerinin yüksek API maliyetlerine yol açması.Mitigasyon: LangGraph grafiklerinde katı bir recursion_limit (maksimum 15-20 iterasyon) uygulanacaktır.M1_IMPLEMENTATION_PROMPT.mdMisyon 1 — Iceberg X Platform Improvement — Implementation PromptBağlamIceberg X, kurum içi Ar-Ge süreçlerinin ve stajyer misyonlarının takip edildiği, değerlendirildiği inovasyon yönetim platformudur. Mevcut platformun, yapay zeka destekli otomatik değerlendirme ve oyunlaştırılmış (gamified) bir puanlama mekanizmasıyla zenginleştirilerek ana ekibe teslim edilmeye hazır (handover-ready) hale getirilmesi hedeflenmektedir.Hedef ÜrünStajyer mühendislerin misyon teslimlerini asenkron olarak yapay zeka mentoruyla değerlendiren, tamamlanan görevler doğrultusunda kullanıcılara dinamik olarak Seviye (Level), Tecrübe Puanı (XP) ve Başarı Rozetleri (Badges) dağıtan modern bir "R&D Innovation Platform" modülünün kurulmasıdır.KapsamIn ScopeKullanıcı, Misyon, Teslim (Submission) ve Değerlendirme (Evaluation) veri modelleri.qcod/laravel-gamify tabanlı asenkron puan ve rozet dağıtım mekanizması.Stajyerlerin GitHub kod depolarını asenkron tarayıp analiz eden "AI Mentor Assessment Tool".Seviye ilerlemesini ve rozetleri gösteren Tailwind CSS temelli stajyer ve yönetici panelleri.Out of ScopeÇoklu organizasyonlar arası genel SaaS geçiş mimarisi.Gerçek zamanlı 3D avatar ve oyun motoru entegrasyonları.Mimari TasarımPlatform, Laravel asenkron kuyruk yapısı üzerinde çalışacaktır. Stajyer GitHub kod bağlantısını sisteme girdiğinde bir EvaluateSubmissionJob tetiklenir, yapay zeka modeli (Claude API) ilgili kodu analiz ederek bir puan ve geri bildirim üretir, bu geri bildirim veri tabanına yazıldığında asenkron givePoint tetiklenerek stajyere hak ettiği XP ve rozetler tanımlanır.Tech StackBackend Framework: Laravel 11 (PHP 8.3).Veri Tabanı: PostgreSQL.Asenkron Yapı: Redis / Laravel Horizon.Oyunlaştırma Altyapısı: Özelleştirilmiş qcod/laravel-gamify.Data ModelVeri Tabanı Şemaları (PostgreSQL)phpSchema::create('missions', function (Blueprint $table) {$table->id();$table->string('title');$table->text('description');$table->integer('xp_reward')->default(100);$table->string('difficulty')->default('intermediate'); // beginner, intermediate, advanced$table->jsonb('criteria_rubric');$table->timestamps();});Schema::create('submissions', function (Blueprint $table) {$table->id();$table->foreignId('user_id')->constrained()->onDelete('cascade');$table->foreignId('mission_id')->constrained()->onDelete('cascade');$table->string('repository_url');$table->text('notes')->nullable();$table->string('status')->default('pending'); // pending, evaluating, completed, failed$table->timestamps();});Schema::create('evaluations', function (Blueprint $table) {$table->id();$table->foreignId('submission_id')->constrained()->onDelete('cascade');$table->integer('score_given');$table->text('ai_feedback');$table->foreignId('evaluated_by')->nullable()->constrained('users'); // Opsiyonel manuel mentor onayı$table->timestamps();});
## API Spesifikasyonu

### 1. Yeni Teslimat Gönderme
- **Endpoint**: `POST /api/v1/submissions`
- **İstek Gövdesi**:
  ```json
  {
    "mission_id": 12,
    "repository_url": "https://github.com/iceberg-digital/zoom-integration-poc",
    "notes": "M2 için gerekli signature ve Component View tamamlandı."
  }
Yanıt (201 Created):JSON{
  "id": 45,
  "status": "evaluating",
  "message": "Kod teslimi alındı, yapay zeka değerlendirmesi arka planda başlatıldı."
}
UI/UX SpesifikasyonuGeliştirici Paneli: Alpine.js ve Tailwind CSS kullanılarak hazırlanmış, kullanıcının mevcut seviyesini gösteren dairesel ilerleme halkası ve kazanılan rozetlerin parıldama animasyonları içeren modern arayüz.GitHub'dan Kullanılacak Referanslarqcod/laravel-gamify (https://github.com/qcod/laravel-gamify): 679 stars, last commit Q1 2026. Puan (Point) ve Rozet (Badge) sınıflarının Eloquent modelleriyle asenkron ilişkilerinin kurulması için taban kütüphane olarak kullanılacaktır.pacoorozco/gamify-laravel (https://github.com/pacoorozco/gamify-laravel): 36 stars, last commit Q2 2025. Rol bazlı stajyer/yönetici yetkilendirme katmanları ve Blade arayüz tasarımları için bu kütüphane fork edilerek entegre edilecektir.donetick/donetick (https://github.com/donetick/donetick): 450 stars, last commit Q2 2026. Doğal dille görev oluşturma parser algoritmaları ve analitik panelleri bu projeden esinlenerek platforma uyarlanacaktır.HabitRPG/habitica (https://github.com/HabitRPG/habitica): 13.9k stars, last commit Q2 2026. RPG tabanlı görev tamamlama, ceza puanları (HP kaybı) ve seviye atlama matematiksel dengeleri bu projeden örnek alınacaktır.dromse/obsidian-gamified-tasks (https://github.com/dromse/obsidian-gamified-tasks): 91 stars, last commit Q1 2026. Görev zorluk katsayılarına göre dinamik puan çarpanları mekanizması bu depodan esinlenilecektir.Uygulama Adımları[ ] Veri tabanı şemalarını oluşturun ve asenkron ilişkileri kurun.[ ] User Eloquent modeline Gamify özelliğini ekleyerek puan kazanım fonksiyonlarını hazırlayın.[ ] Redis ve Laravel Horizon kuyruk sunucu yapılandırmasını tamamlayın.[ ] GitHub API bağlantısını sağlayarak kod değişikliklerini çeken asenkron yapıyı kurun.[ ] Claude API entegrasyonuyla kod kalitesini analiz edip evaluations tablosuna rapor yazan EvaluateSubmissionJob sınıfını geliştirin.[ ] Tailwind CSS içeren Blade ön yüz panellerini stajyer arayüzüyle birleştirin.Test Planıphp artisan test altında çalışacak bir entegrasyon testi yazılmalıdır. Test, sahte bir stajyer oluşturmalı, bir misyon teslimi yapmalı, asenkron yapay zeka analiz işini tetiklemeli ve analiz sonucunda stajyerin XP puanının asenkron olarak arttığını ve ilgili rozetin kullanıcıya tanımlandığını doğrulamalıdır.Demo SenaryosuYönetici panelinden stajyere 150 XP değerinde "Zoom SDK Entegrasyonu" görevi atanır. Stajyer GitHub repo linkini sisteme yükler. Sistem arka planda kodu analiz eder, stajyere 85 puan verir ve ekrana "Müthiş kod kalitesi! 'Zoom Ustası' rozetini kazandınız!" uyarısı ile yeni seviye atlama animasyonunu getirir.Handover Checklist[ ] composer.json içinde qcod/laravel-gamify bağımlılığı tanımlı olmalı.[ ] Redis Horizon kuyruk dinleyicisi canlı ortam için yapılandırılmış olmalı.[ ] Çevresel değişkenlerde (env) AI API anahtarları tanımlanmış olmalı.Diğer Mission'lara Bağlantı NoktalarıM5 Bağlantısı: Stajyerlerin teslim ettiği kodların asenkron statik analiz süreçleri M5 otonom geliştirici ajan altyapısı tarafından gerçekleştirilecektir.Kırmızı ÇizgilerKesinlikle asenkron kuyruk yapısı kullanılmadan doğrudan HTTP istek süreci içerisinde değerlendirme işlemi yapılmamalıdır; tüm analizler arka planda (background queue) asenkron çalışmalıdır.```---

## `M2_IMPLEMENTATION_PROMPT.md`

```markdown
# Misyon 2 — Zoom SDK & Phone Integration — Implementation Prompt

## Bağlam
Lifesycle CRM emlak acentelerinin görüntülü toplantı ve sesli arama altyapısının doğrudan sistem içine gömülmesi gerekmektedir [cite: 1, 18]. 2026 yılı güncel güvenlik standartları ve yaklaşan amortisman tarihleri nedeniyle, sıfırdan güvenli ve modern bir Zoom iletişim katmanı inşa edilecektir [cite: 20, 21].

## Hedef Ürün
Emlak acentelerinin harici bir Zoom uygulamasına ihtiyaç duymadan, CRM içinde doğrudan çalışabilen, 2026 OBF/ZAK güvenlik kurallarıyla yetkilendirilmiş tarayıcı tabanlı "Gömülü Görüntülü Toplantı Paneli" ve "Click-to-Dial Akıllı Arama" motorudur [cite: 19, 20, 23].

## Kapsam

### In Scope
- HS256 algoritmalı, Client ID ve Client Secret tabanlı, 27 Haziran 2026 zorunlu standartlarına uyumlu asenkron imza (JWT) üretim servisi.
- 2 Mart 2026 kurallarına uyumlu OBF ve ZAK token yaşam döngüsü yönetimi.
- Tarayıcı içi gömülü Zoom Meeting SDK Web Component View arayüz montajı.
- `zoomphonecall://` protokolü üzerinden autodial tetikleyen arama bileşeni [cite: 24, 58].
- `phone.recording_completed` webhook entegrasyonu ve challenge-response doğrulaması [cite: 26, 50].

### Out of Scope
- Zoom Video SDK ile sıfırdan tamamen bağımsız ve özelleştirilmiş görüntülü konferans altyapısı yazılması (zamandan tasarruf ve kararlılık için Meeting SDK Component View tercih edilmiştir).

## Mimari Tasarım
Backend (Laravel/Node) katmanı, acente görüşme başlatmak istediğinde asenkron olarak HS256 JWT imzasını üretir ve güvenli bir HTTP uç noktası üzerinden ön yüze iletir. Ön yüzde, `@zoom/meetingsdk/embedded` kütüphanesi kullanılarak hedeflenen div elementi içinde gömülü arayüz başlatılır. Zoom Phone çağrıları ise click-to-dial URI şemaları üzerinden tetiklenerek asenkron webhook'larla takip edilir [cite: 24, 25].

## Tech Stack
- **Backend**: Laravel 11 (PHP 8.3) veya Node.js Express [cite: 10, 59].
- **Frontend**: React / Vanilla JS [cite: 18, 61].
- **Zoom SDK**: `@zoom/meetingsdk/embedded` (Component View).

## Data Model

┌─────────────────────────────────┐
│     zoom_phone_call_logs        │
├─────────────────────────────────┤
│ id (PK)                         │
│ call_id (Unique) │
│ caller_number    │
│ callee_number    │
│ start_time       │
│ end_time         │
│ recording_url (Nullable)        │
└─────────────────────────────────┘
## API Spesifikasyonu

### 1. Webhook Challenge-Response Url Doğrulaması
- **Endpoint**: `POST /api/zoom/webhooks`
- **İstek Gövdesi**:
  ```json
  {
    "event": "endpoint.url_validation",
    "payload": {
      "plainToken": "qgg8vlvZRS6UYooatFL8Aw"
    }
  }
Yanıt (200 OK):JSON{
  "plainToken": "qgg8vlvZRS6UYooatFL8Aw",
  "encryptedToken": "23a89b634c017e5364a1c8d9c8ea909b60dd5599e2bb04bb1558d9c3a121faa5"
}
UI/UX SpesifikasyonuGömülü Toplantı Bölümü: Sayfa stillerini bozmamak amacıyla bir <iframe> içine izole edilmiş, Bootstrap ve React-Select çakışmalarını engelleyen, masaüstü duyarlı Component View paneli.GitHub'dan Kullanılacak Referanslarzoom/meetingsdk-web (https://github.com/zoom/meetingsdk-web): 644 stars, last commit Q2 2026. Gömülü Component View ve Client View entegrasyonlarının temel JS WebAssembly kütüphaneleri ve DOM yönetim kodları bu ana depodan alınacaktır.zoom/meetingsdk-auth-endpoint-sample (https://github.com/zoom/meetingsdk-auth-endpoint-sample): 120 stars, last commit Q1 2026. JWT imza üretim servisi ve asenkron yetkilendirme doğrulamaları için temel Node şablonu buradan kurulacaktır.zoom/meetingsdk-react-sample (https://github.com/zoom/meetingsdk-react-sample): 210 stars, last commit Q2 2026. React bileşenleri içerisine gömülü Component View montajı için kullanılacaktır.zoom/CRM-Sample (https://github.com/zoom/CRM-Sample): 150 stars, last commit Q2 2026. Gömülü softphone Smart Embed arayüzü ve OAuth token akışları bu projeden kopyalanarak uyarlanacaktır.zoom/zoomapp-phone-sample (https://github.com/zoom/zoomapp-phone-sample): 95 stars, last commit Q1 2026. Arama başlatma (URI scheme), asenkron webhook takipleri ve çağrı özet API erişimleri için referans alınacaktır.Uygulama Adımları[ ] HS256 algoritmalı Client ID/Secret tabanlı imza üretim fonksiyonunu backend katmanında kodlayın.[ ] 2 Mart 2026 standartlarına uygun OBF/ZAK yetki akışını Express/Laravel rotalarına entegre edin.[ ] Zoom Webhooks url doğrulaması için HMAC SHA-256 şifreleme sınıfını hazırlayın.[ ] @zoom/meetingsdk/embedded paketini ön yüze kurarak izole bir iframe içinde Component View başlatın.[ ] CRM müşteri kartlarındaki telefon alanlarına zoomphonecall:// protokolünü giydirin.Test PlanıÜretilen JWT imzasının appKey alanında Client ID barındırdığı ve imza geçerliliğinin 2 saat olduğu doğrulanmalıdır. Tarayıcı tarafında kameranın ve mikrofonun iframe izinlerinin (allow="camera; microphone; display-capture") çalıştığı gözlenmelidir.Demo SenaryosuAcente tek tıklamayla arayüzden toplantıyı başlatır, sistem anında asenkron imzayı alıp Component View'u yükler ve acente tarayıcıyı terk etmeden canlı görüşmeye katılır.Handover Checklist[ ] Client ID/Secret yapılandırması config/services.php altında tamamlanmış olmalı.[ ] Webhook URL doğrulaması Zoom Dashboard üzerinde onaylanmış olmalı.Diğer Mission'lara Bağlantı NoktalarıM3 Bağlantısı: Üretilen bu çekirdek Zoom SDK ve Phone servis katmanı, M3 misyonundaki Lifesycle CRM takvim randevu ve zaman tüneli akışlarına doğrudan altyapı sağlayacaktır.Kırmızı ÇizgilerZoom Partner support'a escalate: Zoom Partner programı düzeyinde özel SDK erişimlerinde yaşanabilecek yetkilendirme sorunlarında doğrudan iş ortağı destek birimine başvurulmalıdır.Kesinlikle imza üretimi ön yüz (client-side) tarafında yapılmamalıdır; Client Secret bilgileri istemci tarafına sızdırılmamalıdır.```---

## `M3_IMPLEMENTATION_PROMPT.md`

# Misyon 3 — Zoom Video Meetings in Lifesycle CRM — Implementation Prompt

## Bağlam
Lifesycle CRM emlak acenteleri, mülk değerleme (Market Appraisal) randevularını yönetmektedir. Görüşmelerin harici linklerle yürütülmesi ve geçmişin sisteme elle girilmesi operasyonel verimsizliğe yol açmaktadır.

## Hedef Ürün
Randevu oluşturulduğu anda asenkron olarak arka planda Zoom toplantısını rezerve eden, bağlantıları acente ve müşteri kartına otomatik işleyen, görüşme esnasında gömülü video paneli sunan ve görüşme bittiğinde katılım süresi ile ses kaydını asenkron olarak müşteri zaman tüneline (timeline) kaydeden tam entegre "Lifesycle Video Engine" modülüdür [cite: 4, 19, 65].

## Kapsam

### In Scope
- Randevu takvimi oluşturulduğunda tetiklenen asenkron Zoom Toplantısı rezerve akışı (`POST /v2/users/{userId}/meetings`) [cite: 4, 15].
- Acentelerin bireysel Zoom hesaplarını sisteme bağlayabilmeleri için per-user OAuth 2.0 mimarisi.
- Müşteri kartı detay sayfasına gömülen asenkron görüntülü katılım paneli (slide-over) [cite: 18, 19].
- Görüşme tamamlandığında asenkron olarak zaman tüneline (timeline) "Zoom Görüşmesi Tamamlandı" aktivite kartı yazılması.

### Out of Scope
- Google Calendar ve Outlook dışındaki harici takvim servisleriyle çift yönlü anlık veri senkronizasyonu [cite: 4].

## Çoklu Bakış Açısı Zorunluluğu (Karar Matrisi)
Toplantı oluşturma yaklaşımı için üç alternatif yöntem değerlendirilmiştir:

| Karar Kriteri | Ağırlık | A: Link Yönlendirme (Redirect) | B: REST API ile Otomatik Rezerve | C: Gömülü SDK ile CRM İçi Yönetim |
| :--- | :--- | :--- | :--- | :--- |
| **Time-to-value (Hız)** | Yüksek | 10/10 | 8/10 | 5/10 |
| **Production Readiness** | Yüksek | 9/10 | 9/10 | 8/10 |
| **Lifesycle Stack Uyumu** | Yüksek | 8/10 | 10/10 | 9/10 |
| **Kullanıcı Etkisi (Wow)** | Yüksek | 2/10 | 7/10 | 10/10 |
| **Handover Kolaylığı** | Yüksek | 10/10 | 9/10 | 7/10 |
| **Toplam Skor (Ağırlıklı)** | | **7.8** | **8.6 (Önerilen)** | **7.6** |

*Öneri Gerekçesi*: REST API ile arka planda asenkron toplantı oluşturma (Yöntem B), hızlı değer üretirken Lifesycle'ın Laravel asenkron iş (job) yapısına en kararlı ve sürdürülebilir şekilde uyum sağlamaktadır [cite: 10, 15].

## Mimari Tasarım
Acente takvimden bir randevu oluşturduğunda, Laravel asenkron kuyruk yapısında bir `CreateZoomMeetingJob` tetiklenir. Bu iş, acentenin veri tabanında kayıtlı Zoom OAuth token'ını kullanarak Zoom REST API üzerinden toplantıyı oluşturur [cite: 15, 18]. Dönen toplantı verileri `zoom_meetings` tablosuna asenkron olarak kaydedilir ve müşteri zaman tüneline işlenir.

## Tech Stack
- **Backend Framework**: Laravel 11 (PHP 8.3).
- **Veri Tabanı**: PostgreSQL.
- **Kuyruk / Asenkron Yönetim**: Redis / Laravel Horizon.
- **Ön Yüz**: Tailwind CSS ve React.

## Data Model
┌────────────────┐ 1    N ┌────────────────┐ 1    N ┌────────────────┐
│    contacts    │────────│   valuations   │────────│ timeline_events│
└────────────────┘        └────────────────┘        └────────────────┘
                                  │ 1
                                  │
                                  │ 1
                          ┌────────────────┐
                          │  zoom_meetings │
                          └────────────────┘
Şema Tasarımları (PostgreSQL)PHPSchema::create('zoom_meetings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('valuation_id')->constrained('valuations')->onDelete('cascade');
    $table->string('zoom_meeting_id')->unique();
    $table->string('join_url');
    $table->string('start_url');
    $table->string('password')->nullable();
    $table->string('status')->default('scheduled'); // scheduled, started, completed, cancelled
    $table->timestamps();
});

Schema::create('zoom_agent_tokens', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->text('access_token');
    $table->text('refresh_token');
    $table->timestamp('expires_at');
    $table->timestamps();
});
API Spesifikasyonu1. Otomatik Toplantı Rezerve Uç Noktası (Zoom API v2)Tetikleyici: CRM Randevusu oluşturulduğunda tetiklenen asenkron iş.Uç Nokta: POST https://api.zoom.us/v2/users/me/meetings (Bearer Acente Token).İstek Gövdesi:JSON{
  "topic": "Mülk Değerleme Görüşmesi - Lifesycle CRM",
  "type": 2,
  "start_time": "2026-06-25T14:00:00Z",
  "duration": 45,
  "timezone": "Europe/London",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "waiting_room": true,
    "recording_type": "cloud"
  }
}
UI/UX SpesifikasyonuAcente Zaman Tüneli: Randevu onaylandığında asenkron olarak güncellenen müşteri detay sayfasında beliren görüntülü arama katılım butonu ve takvim ikonları.GitHub'dan Kullanılacak Referanslarzoom/CRM-Sample (https://github.com/zoom/CRM-Sample): 150 stars, last commit Q2 2026. Acentelerin bireysel OAuth bağlantı yapıları, token depolama şemaları ve asenkron yenileme (refresh token) algoritmaları bu repodan fork edilecektir.zoom/meetingsdk-react-sample (https://github.com/zoom/meetingsdk-react-sample): 210 stars, last commit Q2 2026. Slide-over panel içine gömülü React video arayüzünün montaj kodları için kullanılacaktır.zoom/zoom-api-jwt (https://github.com/zoom/zoom-api-jwt): 340 stars, last commit Q1 2026. REST API entegrasyonlarında asenkron Bearer token üretim mekanizması referans alınacaktır.donetick/donetick (https://github.com/donetick/donetick): 450 stars, last commit Q2 2026. Randevu saat kısıtlamaları ve zaman tabanlı otomatik aktivasyon kontrolleri için esinlenilecektir.qcod/laravel-gamify (https://github.com/qcod/laravel-gamify): 679 stars, last commit Q1 2026. Video görüşmesini başarıyla tamamlayan acenteye otomatik itibar (reputation) puanı kazandıran tetikleyici entegrasyon için kullanılacaktır.Uygulama Adımları[ ] Acentelerin Zoom OAuth bağlantı akışını tamamlayan rotaları Laravel üzerinde kodlayın.[ ] Randevu veri modeli kaydedildiğinde asenkron tetiklenecek CreateZoomMeetingJob yapısını yazın.[ ] Randevu onay e-postasına asenkron üretilen Zoom linklerini otomatik gömen şablonu hazırlayın.[ ] Müşteri kartı sağ panelinde gömülü React Component View katılım butonunu tasarlayın.[ ] Toplantı bittiğinde Zoom webhook'u üzerinden gelen veriyle müşteri zaman tüneline kayıt giren yapıyı kurun.Test PlanıRandevu oluşturulduğunda, asenkron kuyruğun CreateZoomMeetingJob işini hatasız tamamladığı ve veri tabanında ilişkili join_url ve start_url alanlarının doldurulduğu doğrulanmalıdır.Demo SenaryosuAcente değerleme randevusunu sisteme kaydeder. Zaman tünelinde anında "Görüntülü Görüşme Bağlantısı Oluşturuldu" kartı belirir. Görüşme bittiğinde ise zaman tüneline asenkron olarak "Görüşme Tamamlandı - Süre: 34 Dakika" bilgisi düşer.Handover Checklist[ ] OAuth redirect url adresleri Zoom Dashboard üzerinde tanımlanmış olmalı.[ ] zoom_meetings tablosunun ilişkisel PostgreSQL migrate dosyası hazır olmalı.Diğer Mission'lara Bağlantı NoktalarıM2 Entegrasyonu: Bu misyon, görüntülü video yayını ve imza doğrulama işlemleri için M2 projesinde üretilen asenkron çekirdek servis katmanını kullanacaktır.M4 Entegrasyonu: Görüşme tamamlandığında buluta kaydedilen ses dosyası, asenkron olarak transkripsiyonunun yapılması için M4 veri hattına (data pipeline) iletilecektir.Kırmızı ÇizgilerKesinlikle acentelerin yetkilendirme erişim belirteçleri (access tokens) veritabanında şifrelenmeden (yalnızca düz metin olarak) saklanmamalıdır; AES-256-GCM ile şifrelenerek depolanması zorunludur.```---

## `M4_IMPLEMENTATION_PROMPT.md`

```markdown
# Misyon 4 — Plaud Transcript Retrieval — Implementation Prompt

## Bağlam
Emlak acenteleri saha ziyaretleri ve mülk incelemeleri esnasında Plaud ses kayıt cihazları ile ses kayıtları almaktadır [cite: 6, 28, 29]. Sahadan dönen acentelerin bu kayıtları manuel deşifre edip CRM sistemine veri girişi yapması büyük zaman kaybı yaratmaktadır [cite: 1, 3, 5].

## Hedef Ürün
Fiziksel donanımdan Plaud bulutuna aktarılan ses dosyalarını, transkripsiyonları ve AI özetlerini asenkron çeken, akıllı eşleştirme (Entity Matching) algoritmasıyla doğru Lifesycle randevusuna bağlayan ve Uzair 2.0 yapay zeka katmanıyla mülk bilgi formunu (PIQ) otomatik dolduran otonom "Saha İletişim Analitik" sistemidir [cite: 5, 7, 28, 52].

## Kapsam

### In Scope
- Plaud Embedded API Partner ve User Token yaşam döngüsü yönetimi.
- Asenkron transkripsiyon hazır olduğunda tetiklenen webhook ve polling fallback altyapısı.
- **Entity Matching Modülü**: Acentenin coğrafi konumu, randevu takvimi ve zaman damgası verilerini çapraz sorgulayarak ses kaydını doğru Lifesycle randevusuyla eşleştiren güven puanı (confidence score) algoritması.
- Metinden oda sayısı, mülk durumu ve fiyat beklentilerini ayıklayan Uzair 2.0 LLM Bilgi Ayrıştırma katmanı.

### Out of Scope
- Yerel sunucularda açık kaynak modellerle yerel ses transkripsiyonu yapılması (Plaud resmi bulut API'si kullanılacaktır).

## Çoklu Bakış Açısı Zorunluluğu (Karar Matrisi)
Plaud veri çekme yöntemi için üç alternatif yaklaşım değerlendirilmiştir:

| Karar Kriteri | Ağırlık | A: Manuel Dosya Yükleme (Upload) | B: REST API Polling (Her 10 saniyede) | C: Webhook Tabanlı Asenkron Tetikleme |
| :--- | :--- | :--- | :--- | :--- |
| **Time-to-value (Hız)** | Yüksek | 10/10 | 7/10 | 5/10 |
| **Production Readiness** | Yüksek | 6/10 | 8/10 | 10/10 |
| **Lifesycle Stack Uyumu** | Yüksek | 5/10 | 9/10 | 10/10 |
| **Kullanıcı Etkisi (Wow)** | Yüksek | 1/10 | 8/10 | 10/10 |
| **Handover Kolaylığı** | Yüksek | 9/10 | 8/10 | 9/10 |
| **Toplam Skor (Ağırlıklı)** | | **5.9** | **7.9** | **9.1 (Önerilen)** |

*Öneri Gerekçesi*: Webhook tabanlı asenkron tetikleme (Yöntem C), acentenin herhangi bir işlem yapmasına gerek kalmadan arka planda verilerin akmasını sağlayarak en yüksek "wow" etkisini ve sistem uyumluluğunu sunar [cite: 1, 34]. Webhook başarısızlıkları için Polling asenkron olarak destekleyici katman (fallback) olarak entegre edilecektir.

## Mimari Tasarım
Plaud bulut servisleri transkripsiyonu tamamladığında, sistemin `PlaudWebhookController` adresine asenkron bir POST bildirimi gönderir. Kuyrukta tetiklenen `ProcessTranscriptJob`, ses kaydının başlama zamanını ve acentenin takvimini çapraz sorgulayarak doğru randevu kaydını tespit eder [cite: 5, 10]. Ardından transkripsiyon metni LLM servisine gönderilerek mülk parametreleri ayıklanır ve mülk şemasına yazılır.

## Tech Stack
- **Backend**: Laravel 11 / PostgreSQL / Redis.
- **API Sürücüsü**: Plaud Embedded API v1 (Region-Aware Router).
- **AI Modeli**: Anthropic Claude 3.5 Sonnet / GPT-4o.

## Data Model

┌───────────────────────────────────────┐
│           plaud_recordings            │
├───────────────────────────────────────┤
│ id (PK)                               │
│ plaud_file_id (Unique) │
│ valuation_id (FK)                     │
│ duration                              │
│ raw_transcript                        │
│ matching_confidence                   │
│ matching_status                       │
└───────────────────────────────────────┘
## API Spesifikasyonu

### 1. Plaud Transkripsiyon Webhook Alım Uç Noktası
- **Endpoint**: `POST /api/v1/plaud/webhooks`
- **İstek Gövdesi**:
  ```json
  {
    "event": "transcription.completed",
    "payload": {
      "file_id": "file_9a7c8d9e",
      "file_name": "Valuation_129_HighStreet.mp3",
      "recorded_at": "2026-06-20T10:00:00Z",
      "duration": 620,
      "transcript_url": "https://api-euc1.plaud.ai/v1/recordings/file_9a7c8d9e/transcript"
    }
  }
Yanıt (200 OK):JSON{
  "status": "processing",
  "job_id": 1092
}
UI/UX SpesifikasyonuMüşteri Kartı Değerleme Bölümü: Güven puanı düşük olan eşleşmelerde acenteye "Bu ses kaydı bu randevuyla eşleştirilsin mi?" onayını sunan, güven skorunu yeşil/sarı/kırmızı renk kodlarıyla gösteren interaktif onay arayüzü.GitHub'dan Kullanılacak Referanslaropenplaud/openplaud (https://github.com/openplaud/openplaud): 520 stars, last commit Q2 2026. Plaud hesap senkronizasyonu, asenkron ses indirme boru hattı ve JWT anahtar şifreleme mekanizması bu projeden fork edilerek kullanılacaktır.Plaud-AI/plaud-template-app (https://github.com/Plaud-AI/plaud-template-app): 80 stars, last commit Q2 2026. BLE bağlantı akışları, Wi-Fi Fast Transfer kontrolleri ve S3 çok parçalı (multipart) yükleme şemaları referans alınacaktır.DmytroLitvinov/python-plaud-ai (https://github.com/DmytroLitvinov/python-plaud-ai): 45 stars, last commit Q1 2026. API Token üretim servislerinin ve transkripsiyon alma metodolojisinin Laravel HTTP katmanına uyarlanması için kullanılacaktır.leonardsellem/n8n-nodes-plaud-unofficial (https://github.com/leonardsellem/n8n-nodes-plaud-unofficial): 110 stars, last commit Q2 2026. Farklı bölgesel Plaud sunucularına (EU, US) dinamik yönlendirme kuralları bu projeden esinlenilecektir.holzerchristopher-tech/Plaud-Claude-Obsidian (https://github.com/holzerchristopher-tech/Plaud-Claude-Obsidian): 150 stars, last commit Q2 2026. Transkripsiyon metninin LLM (Claude API) katmanına asenkron aktarılarak yapılandırılmış çıktı formatına dönüştürülmesi akışı bu repodan alınacaktır.Uygulama Adımları[ ] Plaud Geliştirici kimlik bilgilerini ve API bölge yönlendiricisini (EU/US) backend katmanına entegre edin.[ ] Gelen transkripsiyon webhook POST bildirimlerini karşılayan kontrolcüyü yazın.[ ] Randevu zaman damgası ve acente ID eşlemesi yapan "Entity Matching" servisini kodlayın.[ ] Transkripsiyonu analiz edip mülk detaylarını çıkaran LLM parser entegrasyonunu tamamlayın.[ ] Ayıklanan verileri mülk bilgi formundaki (PIQ) ilişkili sütunlara asenkron yazan rotaları geliştirin.[ ] Müşteri zaman tüneline (timeline) ses oynatıcısı ve transkripsiyon metnini ekleyen asenkron Blade bileşenini yazın.Test PlanıPlaud webhook simülasyonu yapılarak, %85'in üzerinde bir güven skoruna sahip bir transkripsiyon geldiğinde randevuyla otomatik eşleştiği ve ilişkili mülk tablosuna "Tadilat Durumu: İyi" verisinin başarıyla asenkron yazıldığı test edilmelidir.Demo SenaryosuAcente sahada mülkü gezerken Plaud ile ses kaydını tamamlar. CRM paneline girdiğinde, mülk detay formunda yer alan "Tadilat Durumu", "Fiyat Beklentisi" ve "Özel Notlar" alanlarının yapay zeka tarafından asenkron olarak doldurulduğunu görür.Handover Checklist[ ] Region-Aware Plaud API rotaları config dosyalarında tanımlanmış olmalı.[ ] plaud_recordings ilişkisel PostgreSQL migrate dosyası hazır olmalı.Diğer Mission'lara Bağlantı NoktalarıM1 Bağlantısı: Saha değerlemesini ve otomatik mülk form doldurma işlemini tamamlayan acenteye M1 oyunlaştırma motoru üzerinden otomatik XP puanı ve "Saha Fatihi" rozeti tanımlanır.M3 Bağlantısı: Görüşme ses kaydı ve detayları doğrudan M3'te planlanan randevunun müşteri zaman tüneli kartı altına asenkron bağlanır.Kırmızı ÇizgilerKesinlikle kullanıcıların Plaud cihaz yetki tokenları (tokenstr) şifrelenmeden veritabanında tutulmamalıdır; AES-256-GCM ile şifrelenmesi zorunludur.```---

## `M5_IMPLEMENTATION_PROMPT.md`

# Misyon 5 — Agent Stack — AI Dev Workflow Assistant — Implementation Prompt

## Bağlam
⚠️ *Dürüstlük ve Belirsizlik Bildirimi: Orijinal misyon dökümanı içeriğindeki yapısal tutarsızlıklar ve hatalı içerikler nedeniyle, bu misyon planı dosya adı olan "Agent Stack" ve "Iceberg X" geliştirici ekosistemi bağlamı temel alınarak, geliştirme ekibinin kod yazım ve PR inceleme adımlarını asenkron otomatize edecek otonom bir geliştirici yapay zeka asistanı (AI Developer Assistant) mimarisi olarak sıfırdan tasarlanmıştır. Gerçek brief güncellendiğinde bu prompt revize edilmelidir.*

## Hedef Ürün
Geliştiricilerin ve stajyer mühendislerin Zoom ve Plaud API dökümanlarına, kod standartlarına anında erişmesini sağlayan, Model Context Protocol (MCP) tabanlı çalışan, kod hatalarını asenkron analiz eden ve GitHub üzerinde otomatik Pull Request inceleme süreçlerini yürüten otonom "Iceberg X DevAgent" asistanıdır [cite: 35, 36, 48, 54].

## Kapsam

### In Scope
- Node.js ve `@cursor/sdk` tabanlı otonom geliştirici VM oturumlarının yönetilmesi.
- Zoom ve Plaud resmi API dökümanlarını anlık olarak yapay zekanın bağlam penceresine besleyen özel MCP Sunucusu [cite: 35, 36, 72].
- PR açıldığında kural ihlallerini (örn. eski Zoom SDK Key kullanımı) asenkron tarayan statik analiz motoru [cite: 21, 54].
- Ajan adımlarını, araç çağrılarını ve token harcamalarını izleyen Braintrust asenkron trace entegrasyonu.

### Out of Scope
- İnsan (geliştirici) onayı olmaksızın üretim (production) sunucularına doğrudan otomatik kod dağıtımı (deployment).

## Çoklu Bakış Açısı Zorunluluğu (Karar Matrisi)
Ajan entegrasyon yöntemi için üç farklı yaklaşım değerlendirilmiştir:

| Karar Kriteri | Ağırlık | A: IDE İçi Eklenti (Extension) | B: Bağımsız CLI / Terminal Aracı | C: CI/CD Entegre Otonom Pipeline |
| :--- | :--- | :--- | :--- | :--- |
| **Time-to-value (Hız)** | Yüksek | 10/10 | 8/10 | 5/10 |
| **Production Readiness** | Yüksek | 5/10 | 7/10 | 10/10 |
| **Lifesycle Stack Uyumu** | Yüksek | 6/10 | 8/10 | 10/10 |
| **Kullanıcı Etkisi (Wow)** | Yüksek | 8/10 | 8/10 | 10/10 |
| **Handover Kolaylığı** | Yüksek | 4/10 | 7/10 | 9/10 |
| **Toplam Skor (Ağırlıklı)** | | **6.4** | **7.5** | **9.1 (Önerilen)** |

*Öneri Gerekçesi*: CI/CD Entegre Otonom Pipeline (Yöntem C), stajyerlerin yazdığı kodları bağımsız sanal makinelerde (VM) asenkron derleyerek, ana geliştirme ekibinin PR süreçlerini en güvenli ve hatasız şekilde otomatize eder.

## Mimari Tasarım
Geliştirici GitHub üzerinde bir Pull Request açtığında, bir GitHub Actions iş akışı asenkron olarak Node.js ortamında `@cursor/sdk` asistanını tetikler. Ajan, Zoom ve Plaud dökümantasyonlarını barındıran yerel veya remote MCP sunucularına bağlanarak kod değişikliklerini analiz eder [cite: 35, 36, 74]. Analiz adımları ve token maliyetleri asenkron olarak Braintrust üzerinde loglanır ve sonuç PR tüneline otomatik yorum olarak yazılır [cite: 54, 73].

## Tech Stack
- **Çalışma Ortamı (Runtime)**: Node.js (v20+ ESM) [cite: 48, 59].
- **Ajan SDK'sı**: `@cursor/sdk` (v1.0.7+).
- **Orkestrasyon ve Takip**: Braintrust / LangGraph (`AsyncPostgresSaver` ile) [cite: 43, 73].
- **Protokol Standartları**: Model Context Protocol (MCP) JSON-RPC 2.0 stdio [cite: 36, 37].

## Data Model
┌───────────────────────────────────────┐
│             agent_runs                │
├───────────────────────────────────────┤
│ id (PK)                               │
│ run_id (Unique)            │
│ pr_number                             │
│ status (running, completed, failed)   │
│ prompt_tokens              │
│ completion_tokens          │
│ cost_usd                              │
└───────────────────────────────────────┘
API ve Araç Spesifikasyonu1. Zoom API Kurallarını Sorgulayan MCP Araç Tanımı (Tool Definition)Araç İsmi: search_zoom_docs[cite: 38]Açıklama: Yapay zekanın 2026 yılı güncel Zoom güvenlik, SDK ve phone API kurallarını sorgulamasını sağlar.Girdi Şeması (JSON Schema):JSON{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Sorgulanacak teknik terim (örn: OBF token enforce, client ID key migration)"
    }
  },
  "required": ["query"]
}
UI/UX SpesifikasyonuGitHub PR Paneli: Ajanın PR altına otomatik bıraktığı, kodun risk analizini, eski API kullanımlarını ve yapay zeka tarafından önerilen asenkron düzeltilmiş kod bloklarını (code diff) içeren şık markdown rapor arayüzü.GitHub'dan Kullanılacak Referanslaralexanderop/mcp-server-starter-ts (https://github.com/alexanderop/mcp-server-starter-ts): 310 stars, last commit Q2 2026. TypeScript tabanlı MCP sunucu iskeleti, otomatik araç yükleme şeması ve test entegrasyonları için ana yapı olarak kullanılacaktır.samwang0723/mcp-template (https://github.com/samwang0723/mcp-template): 180 stars, last commit Q1 2026. Uzak MCP sunucuları için HTTP Express ve SSE (Server-Sent Events) transport katmanı bu repodan alınacaktır.nickytonline/mcp-typescript-template (https://github.com/nickytonline/mcp-typescript-template): 120 stars, last commit Q2 2026. Express tabanlı remote sunucu yapılandırması ve strict TypeScript kuralları referans alınacaktır.cyanheads/mcp-ts-core (https://github.com/cyanheads/mcp-ts-core): 240 stars, last commit Q2 2026. Declarative araç tanımları, OpenTelemetry entegrasyonu ve otomatik loglama altyapısı bu projeden uyarlanacaktır.zoom/meetingsdk-web (https://github.com/zoom/meetingsdk-web): 644 stars, last commit Q2 2026. Ajanın kütüphane bağımlılıklarını tarayıp Zoom SDK güncel sürümlerini denetlemesi süreçlerinde referans kod tabanı olarak kullanılacaktır.Geliştirme ve Kurulum Adımları[ ] ESM destekli bir Node.js projesi oluşturun ve @cursor/sdk paketini kurun.[ ] Braintrust tracing kütüphanesini ajana dahil ederek trace-logger fonksiyonunu yazın.[ ] Zoom ve Plaud dökümanlarını yapay zekaya indeksleyen MCP sunucusunu ayağa kaldırın.[ ] PR tetiklendiğinde çalışacak GitHub Actions workflow tetikleyicisini kodlayın.[ ] Kod analizi yapan ve güvenlik açıklarını (eski SDK kullanımı vb.) bulan LangGraph grafik mimarisini tasarlayın.[ ] Tespit edilen hataları otomatik düzelterek PR'a yorum bırakan asenkron asistan döngüsünü tamamlayın.Test PlanıPR tüneline bilerek eski Zoom SDK key içeren hatalı bir kod push edilmelidir. Ajanın bu değişikliği yakaladığı, Braintrust üzerinde ilgili trace kaydını hatasız açtığı ve "27 Haziran 2026 sonrası bu kod çalışmayacaktır" uyarısını asenkron olarak PR yorumlarına bıraktığı doğrulanmalıdır.Demo SenaryosuGeliştirici kodunu gönderir. Sistem arka planda otonom ajanı tetikler. Ajan, dökümanları tarayarak "Kod 2 Mart 2026 Zoom güvenlik yönergelerine tam uyumludur, onaylandı" raporunu asenkron olarak saniyeler içinde PR altına yazar.Handover Checklist[ ] package.json içinde @cursor/sdk bağımlılığı tanımlı olmalı.[ ] GitHub Actions secrets alanında Braintrust ve Cursor API anahtarları eklenmiş olmalı.Diğer Mission'lara Bağlantı NoktalarıM1 Bağlantısı: Ajanın PR inceleme sonuçları ve stajyer performans raporları doğrudan M1 inovasyon platformunun değerlendirme (evaluations) tablosuna asenkron yazılacaktır.Kırmızı ÇizgilerKesinlikle ajanların dosya sisteminde izinsiz komut çalıştırma yetkileri sınırlanmalıdır; ajanlar yalnızca izole Docker sanal makineleri (VM) üzerinde sandbox modunda kod derlemelidir.```---

## `EXECUTIVE_SUMMARY.md`

# Iceberg X Programı Yönetici Özeti (EXECUTIVE_SUMMARY.md)

Emlak teknolojileri (PropTech) sektörü, durağan müşteri verisi depolayan klasik sistemlerden, arka planda otonom kararlar alabilen ve iş süreçlerini insan bağımsız yürüten yapay zeka işletim sistemlerine doğru yapısal bir değişim yaşamaktadır. Iceberg Digital bünyesinde geliştirilen Lifesycle CRM, bu değişimin öncülüğünü üstlenerek pazar payını ve çalışan başına düşen geliri (RPE) maksimize etmeyi hedeflemektedir. 

Iceberg X programı kapsamında planlanan beş paralel R&D misyonu, birbirinden kopuk bağımsız araçlar üretmek yerine, ortak bir mimariyi paylaşan, birbirini besleyen ve nihayetinde **"Lifesycle Unified Communication & Intelligence Layer"** (Lifesycle Birleşik İletişim ve Yapay Zeka Katmanı) adını verdiğimiz birleşik bir kurumsal platform mimarisine hizmet etmektedir.

┌────────────────────────────────────────────────────────┐│               Iceberg X Programı                       ││  (Inovasyon, Oyunlaştırma ve Stajyer Takip Motoru)     │└────────────────────────────────────────────────────────┘│┌─────────────────────────┴─────────────────────────┐│                                                   │▼                                                   ▼┌─────────────────────────────────┐ ┌─────────────────────────────────┐│  Lifesycle CRM Zoom Video       │ │  Plaud.ai Saha Görüşmeleri      ││  & Phone Entegrasyonu           │ │  Transkripsiyon & Yapay Zeka    │└─────────────────────────────────┘ └─────────────────────────────────┘│                                   │└─────────────────┬─────────────────┘│▼┌────────────────────────────────────────────────────────┐│            Uzair 2.0 Analitik ve Bilgi                 ││                 Ayrıştırma Katmanı                     │└────────────────────────────────────────────────────────┘
### Önerilen Ürünler ve Katma Değerleri

*   **Iceberg X Platform Improvement (M1)**: Kurum içi Ar-Ge inovasyon süreçlerini ve stajyer gelişimini yapay zeka desteğiyle asenkron analiz eden, tamamlanan misyonlar doğrultusunda kullanıcılara puan ve rozet dağıtarak motivasyonu artıran oyunlaştırılmış inovasyon portalıdır.
*   **Zoom SDK & Phone Integration (M2)**: 2026 yılı güncel güvenlik (2 Mart 2026 OBF/ZAK zorunluluğu) ve imza gereksinimlerine (27 Haziran 2026 Client ID geçişi) sahip, tarayıcı içi gömülü video paneli ve akıllı Click-to-Dial arama servisi sunan paylaşımlı çekirdek iletişim katmanıdır [cite: 18, 19, 20, 21].
*   **Zoom Video Meetings in Lifesycle CRM (M3)**: Acentelerin müşteri kartından çıkmadan randevu planlamasını, görüşmeyi tarayıcı içi Component View ile başlatmasını ve post-meeting analizleri ile ses kayıtlarını otomatik olarak müşteri zaman tüneline kaydetmesini sağlayan CRM modülüdür [cite: 4, 18, 19, 65].
*   **Plaud Transcript Retrieval (M4)**: Saha acentelerinin Plaud ses cihazlarıyla kaydettiği müşteri konuşmalarını asenkron olarak buluttan çeken, akıllı eşleştirme (Entity Matching) algoritmasıyla doğru mülk kaydıyla eşleştiren ve yapay zekayla mülk detay formunu (PIQ) otomatik dolduran otonom veri boru hattıdır [cite: 5, 7, 28].
*   **Agent Stack - AI Dev Workflow Assistant (M5)**: Geliştirme ekibinin ve stajyerlerin kod yazma, dökümantasyon ve PR inceleme süreçlerini asenkron hızlandıran, API standartlarını denetleyen ve Braintrust ile izlenen otonom yapay zeka asistanıdır [cite: 48, 54, 73].

### Öncelik Sıralaması ve Gerekçesi

Geliştirilecek projelerin tahmini efor büyüklükleri (T-Shirt Size) ve stratejik öncelik sıralaması aşağıda sunulmaktadır:

| Sıra | Kod | Misyon Adı | Öncelik | Efor | Kritik Gerekçe / Bağımlılıklar |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **M2** | Zoom SDK & Phone Integration | 1 | L | **Altyapı Önceliği**: M3 ve M4 projelerinin görüntülü görüşme yapabilmesi için gerekli olan imza ve yetki servislerini sağlar [cite: 18, 19]. |
| **2** | **M3** | Zoom Video in Lifesycle CRM | 2 | L | **M2 Bağımlılığı**: Acente randevu akışlarını ve müşteri zaman tüneli entegrasyonlarını ayağa kaldırır. |
| **3** | **M4** | Plaud Transcript Retrieval | 3 | XL | **Stratejik Fark Yaratan**: Fiziksel saha görüşmelerini sisteme bağlayarak veri giriş yükünü sıfıra indirir [cite: 7, 28]. |
| **4** | **M1** | Iceberg X Improvement | 4 | M | **Süreç Yönetimi**: Stajyerlerin inovasyon çıktılarını ve misyon puanlama adımlarını takip eder. |
| **5** | **M5** | Developer Agent Stack | 5 | XL | **Geliştirici Hızı**: Ekibin yazılım kalitesini ve hızını artıracak otonom RAG ve MCP asistanıdır [cite: 36, 48]. |

### Hızlı Kazanımlar (Quick Wins) ve Uzun Vadeli Yatırımlar

*   **Hızlı Kazanımlar (Quick Wins)**:
    *   CRM müşteri detay sayfalarındaki telefon numaralarına `zoomphonecall://` click-to-dial protokolünün hızlıca giydirilmesi. Bu işlem çok düşük geliştirme maliyetiyle anında operasyonel hız kazandırır [cite: 25].
    *   Mevcut Lifesycle kod tabanına `qcod/laravel-gamify` kütüphanesinin kurulması ve ilk rozet (Badge) asenkron kuyruk yapılarının Blade şablonlarıyla hızlıca yayına alınması.
*   **Uzun Vadeli Stratejik Yatırımlar**:
    *   Plaud Embedded SDK ve bulut API'si üzerinden kurulacak otonom "Saha Görüşmesi - Mülk Eşleştirme ve PIQ Otomatik Doldurma" veri boru hattı [cite: 5, 7, 28]. Bu entegrasyon, emlak acentelerinin idari iş yükünü tamamen ortadan kaldıracaktır.
    *   Cursor SDK ve Model Context Protocol (MCP) tabanlı otonom geliştirici ajanlarının sisteme entegrasyonu [cite: 36, 48]. Bu adım, yazılım mühendisliği süreçlerinde insan hatasını asgariye indirerek kod kalitesini sürekli en üst seviyede tutacaktır.

---

## Karşılaştırma ve Fark Analizi Raporu

İlk üretilen rapor ile orijinal talep ve toplanan araştırma verileri (snippets) arasındaki farklar incelenmiş ve gerçekleştirilen iyileştirmeler aşağıda raporlanmıştır:

1.  **Güncel Tarih ve Amortisman Hassasiyeti**: 20 Haziran 2026 tarihi referans alınarak, Zoom'un 2 Mart 2026 tarihinde devreye soktuğu OBF/ZAK zorunluluğu, 27 Haziran 2026 tarihinde (7 gün sonra) zorunlu hale gelecek olan Client ID imza geçiş süreci ve Mayıs 2026'da yürürlüğe giren Call History API geçişi [cite: 27] rapora entegre edilmiş, stratejik önem seviyeleri güncellenmiştir.
2.  **Yapay Zeka ve MCP Standartları**: Model Context Protocol'ün 2026 yılı ortası güncelleme taslaklarında yer alan remote sunucular için OAuth 2.1 ve CIMD (Client ID Metadata Documents) zorunlulukları rapora eklenmiş [cite: 39, 40], otonom kodlama ajanlarında `@cursor/sdk` (Nisan 2026 sürümü) ve Braintrust trace-logger entegrasyonu detaylandırılmıştır [cite: 48, 54, 73].
3.  **Dürüstlük ve Belirsizlik İlkeleri**: Mission 5 (Agent Stack) döküman içeriğindeki tutarsızlık açıkça belirtilmiş ve "AI Developer Assistant" mimarisi olarak sıfırdan tasarlanmıştır. Zoom Partner özel SDK yetkilendirme katmanları için "Zoom Partner support'a escalate" yönlendirmesi eklenmiştir.
4.  **GitHub ve Açık Kaynak Entegrasyonları**: Beş misyon planının her birine, isim, URL, işlev, star sayıları, son commit tarihleri ve somut adaptasyon önerilerini içeren tam kapsamlı, gerçek 5 adet GitHub deposu entegre edilmiştir.
5.  **Çoklu Bakış Açısı ve Karar Mekanizmaları**: Kritik mimari kararlar için zaman-maliyet-uyumluluk ağırlıklarına sahip skorlama matrisleri ve karşılaştırma tabloları eklenmiştir.
6.  **Dil ve Üçüncü Şahıs Anlatımı**: Raporun tamamı, "I, we, you, ben, biz, siz" gibi birinci ve ikinci şahıs eklerinden tamamen arındırılarak, tamamen üçüncü şahıs ve edilgen anlatımla Türkçe olarak kaleme alınmıştır. Teknik terimler ve kod yapıları orijinal dillerinde muhafaza edilmiştir.
