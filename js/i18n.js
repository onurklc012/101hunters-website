/* Turkish is written in the HTML; English lives here. Elements carry data-i18n="key".
   Dynamic texts (built by site.js) use I18N.t(key, vars). The choice is remembered per browser. */
(function () {
  const EN = {
    'brand.sub': 'Fighter Squadron',
    'step.1.t': 'Apply', 'step.1': 'Fill in the short form — HOTAS, head tracking and the F-16C or F/A-18C module are all you need.',
    'step.2.t': 'Meet us', 'step.2': 'A short voice interview on Discord.',
    'step.3.t': 'Training', 'step.3': 'Friday 21:00 training sorties: formation flying and air-to-air refuelling.',
    'step.4.t': 'Check-ride', 'step.4': 'Pass it and fly the Saturday operations as a combat pilot.',
    'join.discord': 'Join our Discord',
    'nav.faq': 'FAQ', 'dc.title': 'Our Discord community', 'dc.members': 'members', 'dc.online': 'online now',
    'voices.eyebrow': 'Our Pilots Say', 'voices.title': 'Through Hunters\' Eyes',
    'faq.eyebrow': 'Good to Know', 'faq.title': 'Frequently Asked Questions',
    'faq.1.q': 'Which modules do I need?', 'faq.1.a': 'At least one of DCS: F-16C Viper or F/A-18C Hornet. You can fly other aircraft on our servers too, but squadron training is built around these two jets.',
    'faq.2.q': 'What hardware is required?', 'faq.2.a': 'A HOTAS (stick and throttle) and head tracking: TrackIR, a VR headset or OpenTrack.',
    'faq.3.q': 'I have little experience — can I still apply?', 'faq.3.a': 'Yes. We look for dedication, not perfection; formation flying, radio discipline and air-to-air refuelling are trained together in the training sorties.',
    'faq.4.q': 'How often do you fly?', 'faq.4.a': 'Training every Friday 21:00 and operations every Saturday 21:00 (Turkey time). Three unexcused absences end your membership.',
    'faq.5.q': 'What is the check-ride?', 'faq.5.a': 'The flight exam before becoming a combat pilot: ground and take-off discipline, formation, radio and brevity, landing, flight safety and 6,000 lbs of air-to-air refuelling in at most 5 contacts.',
    'faq.6.q': 'Can I fly on your servers without joining?', 'faq.6.a': 'Yes, our servers are public. Game and SRS radio addresses are on the server cards above — click to copy.',
    'faq.7.q': 'What happens after I apply?', 'faq.7.a': 'Your application goes straight to squadron headquarters. We contact you on Discord for a voice interview.',
    'sortie.training': 'Friday 21:00 Training (TRT)', 'sortie.ops': 'Saturday 21:00 Operations (TRT)', 'sortie.now': 'airborne now!',
    'sortie.dh': 'in {d}d {h}h', 'sortie.hm': 'in {h}h {m}m', 'sortie.m': 'in {m} min',
    'nav.about': 'About', 'nav.servers': 'Servers', 'nav.map': 'Live Map', 'nav.boards': 'Leaderboards',
    'nav.ops': 'Operations', 'nav.academy': 'Academy', 'nav.gallery': 'Gallery', 'nav.join': 'Join', 'nav.login': 'Member Login',
    'hero.eyebrow': 'DCS World · Virtual Fighter Squadron · Adana', 'hero.join': 'Join the Squadron',
    'live.checking': 'Checking servers…', 'live.loading': 'Loading…',
    'stats.members': 'Squadron Members', 'stats.hours': 'Flight Hours', 'stats.sorties': 'Sorties', 'stats.refuels': 'Air Refuels',
    'about.eyebrow': 'Who We Are', 'about.title': 'About The Hunters', 'about.lead': 'An elite DCS virtual fighter squadron.',
    'about.p1': 'The 101st Hunter Squadron is a DCS World virtual fighter squadron dedicated to delivering the ultimate combat flight simulation experience. Based in Adana, we bring together pilots who share a passion for tactical excellence and authentic military aviation.',
    'about.p2': 'We primarily operate the F-16 Fighting Falcon and F/A-18C Hornet, mastering both air-to-air combat and precision strike missions. Teamwork, continuous training and the highest standards of combat proficiency are the core of our squadron.',
    'ac.f16': 'Multi-role workhorse', 'ac.f18': 'Carrier operations', 'ac.f14': 'Fleet defense interceptor', 'ac.f4': 'Legendary multi-role',
    'ac.f15': 'Air superiority & strike', 'ac.helo': 'Attack helicopters', 'ac.su': 'Russian fighters & CAS', 'ac.tac.t': 'Tactical Focus', 'ac.tac': 'Real-world tactics',
    'servers.eyebrow': 'Live Status', 'servers.title': 'Our Servers',
    'servers.lead': 'All our servers are public. Click an address to copy it; the SRS radio address is under each server.',
    'map.eyebrow': 'Real-Time', 'map.title': 'Live Operations Map', 'map.lead': 'Where the aircraft on our servers are right now. Blue: friendly, red: hostile.',
    'map.empty': 'Nobody is flying right now. Aircraft appear here as soon as a sortie starts.',
    'boards.eyebrow': 'Hall of Fame', 'boards.title': 'Leaderboards', 'boards.lead': 'Live statistics of our squadron pilots on our servers.',
    'boards.hours': 'Flight Hours', 'boards.refuels': 'Air Refuels', 'boards.air': 'Air-to-Air', 'boards.ground': 'Air-to-Ground', 'boards.aircraft': 'Aircraft',
    'ops.eyebrow': 'What We Do', 'ops.title': 'Operations',
    'ops.1.t': 'Training', 'ops.1': 'Comprehensive training from basic flight to advanced combat tactics. We make sure every pilot reaches their full potential.',
    'ops.2.t': 'Combat Missions', 'ops.2': 'Regular combat missions: air superiority, strike packages, SEAD and dynamic campaigns.',
    'ops.3.t': 'Joint Operations', 'ops.3': 'Exercises with other squadrons and communities; large-scale battles that test teamwork.',
    'ops.4.t': 'Competitive Events', 'ops.4': 'Tournaments, Red Flag exercises and events where Hunters prove their dominance.',
    'ops.5.t': 'Mission Planning', 'ops.5': 'Detailed briefings, tactical planning and debriefs. Learn real military planning and execution.',
    'ops.6.t': 'Casual Flights', 'ops.6': 'Not every sortie is serious! Free flights and fun events with your squadron mates.',
    'academy.eyebrow': 'Training Platform',
    'academy.lead': 'Our training platform for the F-16C, F/A-18C, F-14, F-4, F-15C/E, AH-64D, Ka-50, Su-25T, Su-33 and Su-27: cockpit tours, quizzes, tactics schools and community features.',
    'academy.f1': '📚 Interactive training modules', 'academy.f2': '🧠 Quizzes and knowledge tests', 'academy.f3': '🎛️ Cockpit tours',
    'academy.f4': '🎙️ Voice room (Premium)', 'academy.f5': '⚔️ 1v1 duel mode', 'academy.f6': '📊 Pilot statistics', 'academy.soon': 'Soon',
    'lead.eyebrow': 'Command', 'lead.title': 'Leadership', 'lead.owner': 'Squadron Founder', 'lead.co': 'Squadron Co-Lead',
    'gallery.eyebrow': 'In Action', 'gallery.title': 'Gallery',
    'join.eyebrow': 'Ready to Hunt?', 'join.title': 'Join The Hunters',
    'join.lead': 'The 101st Hunter Squadron is recruiting motivated pilots who want to be part of an elite virtual squadron. We are not looking for perfection — we are looking for dedication.',
    'req.hw.t': '🕹️ Hardware', 'req.hw': 'HOTAS and head tracking (TrackIR / VR / OpenTrack) are required.',
    'req.mod.t': '✈️ Module', 'req.mod': 'At least one of DCS: F-16C Viper or F/A-18C Hornet.',
    'req.cal.t': '📅 Schedule', 'req.cal': 'Regular attendance: Friday 21:00 (training) and Saturday 21:00 (operations), Turkey time.',
    'req.disc.t': '📜 Discipline', 'req.disc': '3 unexcused absences end your membership.',
    'join.apply': 'Application Form', 'join.rules': 'Squadron Rules (PDF)',
    'foot.about': 'DCS World virtual fighter squadron. Real tactics, regular training and a strong community.',
    'foot.docs': 'Documents', 'foot.rules': 'Squadron Rules', 'foot.guide': 'Check-Ride Training Guide', 'foot.exam': 'Check-Ride Exam Sheet',
    'foot.form': 'Check-Ride Evaluation Form', 'foot.links': 'Links', 'foot.apply': 'Apply', 'foot.privacy': 'Privacy Policy',
    'foot.note': 'DCS World is a trademark of Eagle Dynamics SA. We are not a real military unit.',
    // dynamic
    'st.online': 'Online', 'st.starting': 'Starting', 'st.maintenance': 'Maintenance', 'st.offline': 'Offline',
    'srv.mission': 'Mission', 'srv.map': 'Map', 'srv.players': 'Pilots online', 'srv.game': 'Game server', 'srv.srs': 'SRS radio',
    'srv.copy': 'copy', 'srv.copied': 'Copied: {v}', 'srv.none': 'No server information right now.',
    'srv.down': 'Live data is unavailable right now. Please try again in a few minutes.',
    'live.summary': '{on} of {all} servers online · {p} pilots flying', 'live.offline': 'Live data unavailable',
    'board.none': 'No data yet.', 'board.updated': 'Updated {t} · refreshes automatically',
    'unit.h': 'h', 'unit.refuel': 'refuels', 'unit.kills': 'kills',
    // application page
    'ap.title': 'Pilot Application', 'ap.lead': 'Fill in the form completely. Your application goes straight to squadron headquarters; we will contact you on Discord for a voice interview.',
    'ap.back': '← Home', 'ap.s1': '👤 Pilot details', 'ap.s2': '✈️ DCS & hardware', 'ap.s3': '📜 Schedule & discipline',
    'ap.name': 'Full name', 'ap.age': 'Age', 'ap.city': 'City', 'ap.discord': 'Discord username', 'ap.callsign': 'Requested callsign',
    'ap.dcsname': 'In-game (DCS) name', 'ap.dcsname.h': 'So we can find your flight statistics (optional).',
    'ap.modules': 'Jet modules you own', 'ap.other': 'Other jets', 'ap.exp': 'DCS experience', 'ap.pick': 'Choose…',
    'ap.exp1': '0 – 6 months (basic flight)', 'ap.exp2': '6 – 12 months (systems & BVR)', 'ap.exp3': '1 – 2 years (BVR + AAR)', 'ap.exp4': '2+ years (experienced)',
    'ap.hotas': 'HOTAS model', 'ap.hotas.p': 'e.g. Thrustmaster Warthog, VKB Gladiator…', 'ap.head': 'Head tracking', 'ap.none': 'None',
    'ap.sched': 'Will you join the Friday 21:00 and Saturday 21:00 sorties regularly?', 'ap.yes': 'Yes, definitely.', 'ap.some': 'Sometimes I may miss.',
    'ap.rules': 'Do you accept the rule "3 unexcused absences = permanent removal"?', 'ap.accept': 'I have read and accept it.', 'ap.reject': 'I do not accept.',
    'ap.why': 'Why the 101st Hunter Squadron?', 'ap.why.p': 'Tell us briefly about yourself and what you expect.',
    'ap.send': '🚀 Send application', 'ap.sending': 'Sending…', 'ap.need': 'Please fill in the required fields: {f}',
    'ap.module.need': 'Please choose at least one jet module.', 'ap.fail': 'The application could not be sent: {e}',
    'ap.offline': 'Headquarters cannot be reached right now. Please try again later or write to us on Discord.',
    'ap.ok.t': 'APPLICATION RECEIVED!', 'ap.ok': 'Your details reached the 101st Hunter Squadron headquarters. Join our Discord server and wait for the voice interview call.',
    'ap.side.t': 'Requirements', 'ap.side.1': 'HOTAS and head tracking (TrackIR / VR / OpenTrack).', 'ap.side.2': 'DCS: F-16C Viper or F/A-18C Hornet.',
    'ap.side.3': 'Friday 21:00 (training) and Saturday 21:00 (operations).', 'ap.side.4': '3 unexcused absences = removal.',
    'ap.side.5': 'Accepted candidates fly training sorties until they pass the check-ride (AAR 6,000 lbs in max. 5 contacts + formation).',
    'ap.discord': 'Join our Discord', 'ap.rulespdf': 'Squadron Rules (PDF)',
  };
  const TR = {
    'sortie.training': 'Cuma 21:00 Eğitim', 'sortie.ops': 'Cumartesi 21:00 Harekât', 'sortie.now': 'şu an havada!',
    'sortie.dh': '{d} gün {h} sa kaldı', 'sortie.hm': '{h} sa {m} dk kaldı', 'sortie.m': '{m} dk kaldı',
    'st.online': 'Çevrimiçi', 'st.starting': 'Açılıyor', 'st.maintenance': 'Bakımda', 'st.offline': 'Kapalı',
    'srv.mission': 'Görev', 'srv.map': 'Harita', 'srv.players': 'Çevrimiçi pilot', 'srv.game': 'Oyun sunucusu', 'srv.srs': 'SRS telsiz',
    'srv.copy': 'kopyala', 'srv.copied': 'Kopyalandı: {v}', 'srv.none': 'Şu anda sunucu bilgisi yok.',
    'srv.down': 'Canlı verilere şu an ulaşılamıyor. Birkaç dakika sonra tekrar deneyin.',
    'live.summary': '{all} sunucudan {on} tanesi açık · {p} pilot uçuşta', 'live.offline': 'Canlı veri alınamıyor',
    'board.none': 'Henüz veri yok.', 'board.updated': '{t} güncellendi · otomatik yenilenir',
    'unit.h': 'sa', 'unit.refuel': 'ikmal', 'unit.kills': 'vuruş',
    'ap.need': 'Lütfen zorunlu alanları doldurun: {f}', 'ap.module.need': 'Lütfen en az bir jet modülü seçin.',
    'ap.fail': 'Başvuru gönderilemedi: {e}', 'ap.sending': 'Gönderiliyor…',
    'ap.offline': 'Karargaha şu an ulaşılamıyor. Lütfen biraz sonra tekrar deneyin ya da Discord\'dan yazın.',
    'ap.ok.t': 'BAŞVURUNUZ ALINDI!',
    'ap.ok': 'Bilgileriniz 101. Hunter Squadron Karargahı\'na ulaştı. Discord sunucumuza katılıp sesli mülakat çağrısını bekleyin.',
    'ap.discord': 'Discord Sunucumuza Katıl',
  };

  const KEY = 'site.lang';
  let lang;
  try { lang = localStorage.getItem(KEY); } catch { /* storage blocked */ }
  if (lang !== 'tr' && lang !== 'en') lang = (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en';

  const originals = new Map();         // Turkish text from the HTML, to switch back

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (!originals.has(el)) originals.set(el, el.textContent);
      el.textContent = lang === 'en' && EN[key] ? EN[key] : originals.get(el);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      if (!el.dataset.phTr) el.dataset.phTr = el.placeholder;
      el.placeholder = lang === 'en' && EN[el.dataset.i18nPh] ? EN[el.dataset.i18nPh] : el.dataset.phTr;
    });
    document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
  }

  window.I18N = {
    get lang() { return lang; },
    t(key, vars = {}) {
      const text = (lang === 'en' ? EN[key] : TR[key]) ?? EN[key] ?? key;
      return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
    },
    set(next) {
      lang = next;
      try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
      apply();
      document.dispatchEvent(new CustomEvent('langchange'));
    },
    apply,
  };

  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => window.I18N.set(b.dataset.lang)));
  });
})();
