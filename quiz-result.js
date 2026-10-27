/* silence-<pattern>.html — renders the "What Kind of Silence Is This?" result block.
   The page itself fixes the pattern (window.QUIZ_PATTERN, set by build-quiz-pages.py).
   Score, silence and first name come from localStorage.wh_quiz (written by quiz.html on
   the same device) or, on the live domain, GET /quiz-result?r=<opaque id> — never the URL.
   Copy is condensed from Welcome Home ch. 3 (patterns) and ch. 4 (silences); Catherine
   reviews all of it before launch. */
(function () {
  const API = 'https://pact-funnel-api.alex-f42.workers.dev';
  const LIVE = /parentingadultstoday\.com$/.test(location.hostname);
  const QS = new URLSearchParams(location.search);

  const WHO = {
    son:      { they:'he',   them:'him',  their:'his',   themselves:'himself',    child:'your son',      is:'is',  has:'has',  wants:'wants', lives:'lives', finds:'finds', looks:'looks' },
    daughter: { they:'she',  them:'her',  their:'her',   themselves:'herself',    child:'your daughter', is:'is',  has:'has',  wants:'wants', lives:'lives', finds:'finds', looks:'looks' },
    children: { they:'they', them:'them', their:'their', themselves:'themselves', child:'your children', is:'are', has:'have', wants:'want',  lives:'live',  finds:'find',  looks:'look'  },
  };
  function pron(text, who) {
    const p = WHO[who] || WHO.children;
    return String(text).replace(/\{(\w+)\}/g, (m, k) => {
      const lk = k.charAt(0).toLowerCase() + k.slice(1);
      if (!(lk in p)) return m;
      const w = p[lk];
      return k.charAt(0) === k.charAt(0).toUpperCase() ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    });
  }

  const PATTERNS = {
    'The Slow Fade': {
      what: 'There was no fight. The calls just got shorter, then rarer, and one day you noticed the door had been closed for a year. Nothing was slammed. Contact had quietly started to cost {them} something — a current of expectation, a running tally of how little you talk — and {they} began avoiding the toll booth, not you.',
      backs: ['The big gesture — the long letter naming the estrangement, the "we need to talk about us" summit, the tearful holiday confrontation. A child avoiding weight will not walk toward a heavier version of it.',
              'Guilt, however gentle: "we never hear from you," "you have time for everyone but us."',
              'Waiting it out. The Slow Fade is the one pattern that never reverses on its own.'],
      hope: 'Of the six, this pattern moves on the kindest timelines. There is no wound to heal — only a toll to remove.' },
    'The Rupture': {
      what: 'Everyone can name the date. There was a before, there was that day, and there has been silence since. But the event is the door, not the house: ruptures detonate along a fault line that was building for years. Explaining that day — however gently — is experienced by {them} as the day continuing by other means.',
      backs: ['Any contact that carries your version of the event — the context, what you really meant, how it was blown out of proportion.',
              'Recruiting relatives to speak for you. Every ambassador says you are still building a case, not a bridge.',
              'Going back in while the heat is still high. Early contact reliably re-burns the site.'],
      hope: 'Ruptures carry the hottest emotions of any pattern — and heat, unlike emptiness, means the relationship still matters to both of you.' },
    'The Rewrite': {
      what: 'A letter, an email, or a final call described a childhood you don’t recognize — often in words like toxic, boundaries, or narcissist. You feel accused, so you do what accused people do: defend the record. But the record is not what’s at stake. {They} {is} telling you how it felt to be {them} in your house, in the only vocabulary {they} {has} for it. Two people can leave the same room with two true stories.',
      backs: ['Correcting the record, point by point — at any length, on any timeline.',
              '"You’re forgetting all the good." "Who put these ideas in your head?" Disparaging the therapy confirms, in one sentence, the exact unsafety the letter named.',
              'Treating {their} feelings as a case to be won.'],
      hope: 'When you stop defending the record, you become the rarest thing in {their} reckoning: a parent it is safe to be honest with.' },
    'The New Household': {
      what: 'The distance arrived with a person. Contact thinned after the serious relationship, the engagement, the marriage. Holidays got renegotiated, then surrendered, and replies now come through {their} partner. {They} didn’t disappear behind a partner — {they} chose a household, and a household has a door. In healthy families that shift is called growing up. It only becomes estrangement when the old household and the new one go to war over it.',
      backs: ['Going around the partner to reach {them}. It always gets back, and the fog thickens.',
              'Criticizing the partner to {them} — even gently, even when you’re right.',
              'Asking {them} to choose. {They} will choose the household {they} {lives} in. {They} {is} supposed to.'],
      hope: 'Nothing here is broken. The work is becoming safe to the whole household — side door by side door.' },
    'The Shielded Door': {
      what: 'The silence is a shield, and {they} {is} holding it for a reason {they} can name, even if {they} never fully named it to you: a parent’s drinking, rage, or untreated depression; relentless criticism; conflict between the parents; something toward the grandchildren that crossed a line. The distance is not drift, protest, or story. It is protection — of {themselves}, {their} marriage, or most often {their} children.',
      backs: ['Minimizing: "it was one Christmas."',
              'Negotiating the boundary: "just supervised visits, then."',
              'Demanding trust on a schedule. Trust in this pattern is not owed. It is re-earned at the pace of the person who was harmed.'],
      hope: 'Time helps in this pattern — but only time with real, sustained change inside it. Shields read patterns, not performances.' },
    'The Standoff': {
      what: 'Nobody in this pattern thinks of themselves as estranged. They think of themselves as owed an apology. The last contact ended over a concrete grievance — money, a business, a will, a betrayal, words that can’t be unsaid — and both sides retreated to positions with remarkably similar shapes: I’d talk tomorrow if they would just acknowledge what they did. Standoffs don’t resolve by justice. Nobody wins one.',
      backs: ['The conditional overture: "I’ll apologize for my part if you’ll own yours." The other side always hears it in the original language.',
              'Waiting for {them} to move first — the pattern where parents wait the longest and lose the most.',
              'Keeping score. Every day spent being right is a day not spent being close.'],
      hope: 'Standoffs resolve when one person decides the relationship matters more than the ruling and goes first — without surrendering dignity or truth. When this pattern moves, it often moves fastest of all.' },
  };

  const SILENCES = {
    testing: { name: 'a testing silence',
      what: 'A testing silence is a question: what happens when I stop holding this relationship up by myself? {They} {has} stepped back to watch. Messages are still read, sometimes within minutes; news still leaks through a sibling or the family group chat. {They} {has} not sealed the house — {they} {wants} to find out whether you can hear anything quieter than a slammed door.',
      ask: 'It asks for the hardest thing right now: not reaching out. Met with pursuit — more messages, guilt, escalation — it gets its answer (nothing has changed) and it hardens. Met with a real pause and then a well-built re-entry, it can move in weeks.',
      time: 'Honest timeline: weeks to a few months. The most responsive of the three silences, and the most easily spoiled by speed.' },
    protective: { name: 'a protective silence',
      what: 'A protective silence is not a question. It is a bandage. {They} stepped away not to see what you’ll do, but to stop a bleeding of {their} own — {their} peace, {their} marriage, {their} footing as a parent. Messages go unread for weeks, or get read late in flat batches. There are no tests and no signals, because {their} attention is turned inward.',
      ask: 'It asks for honored distance on a longer clock, with rare, feather-light signals that the door is open and costs nothing to walk through. Pressure of any kind is the very cost this silence exists to escape. One daughter told her mother afterward: "I didn’t have enough of me left to be anyone’s daughter that year."',
      time: 'Honest timeline: months to a year or more — and it tracks {their} repair, not your effort.' },
    hardened: { name: 'a hardened silence',
      what: 'A hardened silence has stopped being a response and become a settlement: the number blocked for years, mail returned, a wedding you learned about afterward. Early silences have temperature — anger, grief, vigilance. This one is room temperature. {They} {has} built a life that no longer requires resolving it.',
      ask: 'Catherine will not soften this: it is the slowest ground in the book, and no method — hers or anyone’s — can promise it turns. But it turns more often than parents believe, and almost never because of something a parent sends. It opens from the inside — a birth, a divorce, a diagnosis, {their} own child asking "why don’t we see Grandma?" — and everything then depends on what {they} {finds} when {they} {looks} out: a parent still campaigning, or a parent visibly changed, at peace, and findable.',
      time: 'Honest timeline: years. The work is to be worth discovering when contact becomes thinkable. Catherine’s own father got his opening at year twenty.' },
  };

  const BAND_LABEL = { overdrawn: 'Overdrawn', 'running-low': 'Running Low', rebuilding: 'Rebuilding', steady: 'Steady' };
  const PAGE_PATTERN = PATTERNS[window.QUIZ_PATTERN] ? window.QUIZ_PATTERN : null;

  function carry() {
    const out = new URLSearchParams();
    for (const [k, v] of QS) if (/^utm_/i.test(k) || k === 'fbclid' || k === 'src') out.set(k, v);
    return out.toString();
  }
  function text(id, s) { const el = document.getElementById(id); if (el) el.textContent = s; }

  function render(d) {
    const extra = carry();
    if (extra) document.querySelectorAll('a[href^="checkout.html"]').forEach(a => { a.href += (a.href.includes('?') ? '&' : '?') + extra; });

    const who = d && WHO[d.who] ? d.who : null;
    const first = d && d.first ? String(d.first).trim() : '';
    const dataPat = d ? (typeof d.pattern === 'string' ? d.pattern : d.pattern && d.pattern.name) : null;
    const pName = PAGE_PATTERN || (PATTERNS[dataPat] ? dataPat : 'The Slow Fade');
    const P = PATTERNS[pName];
    const S = d && SILENCES[d.silence] ? SILENCES[d.silence] : null;
    const safety = d && Number.isInteger(d.safety) ? d.safety : null;
    const bandLabel = d ? (typeof d.band === 'string' ? d.band : (d.band && (d.band.label || BAND_LABEL[d.band.key])) || '') : '';

    text('qr-child', who ? pron('{child}', who) : 'your child');
    if (safety != null) {
      text('qr-score', String(safety));
      text('qr-band', bandLabel);
      document.getElementById('qr-fill').style.left = Math.max(2, Math.min(98, safety)) + '%';
    } else {
      // No stored result on this device (e.g. a link opened elsewhere): the pattern still reads.
      document.querySelectorAll('.qr-score, .qr-bar, .qr-bands').forEach(el => { el.hidden = true; });
      document.querySelector('.qr-note').textContent = 'Your Safety Account score and your silence are saved on the device where you took the quiz. Your pattern is below.';
    }
    const line = (first ? first + ', your' : 'Your') + ' family is in ' + pName.replace(/^The /, 'the ') + ' pattern' +
      (S ? ', with ' + S.name + '.' : '.');
    text('qr-line', line);
    text('qr-what', pron(P.what, who) + ' ' + pron(P.hope, who));
    document.querySelectorAll('.qr-pn').forEach(el => { el.textContent = pName; });
    document.getElementById('qr-backs').innerHTML = P.backs.map(b => '<li>' + pron(b, who) + '</li>').join('');
    if (S) {
      text('qr-silname', S.name.replace(/^a /, ''));
      text('qr-silwhat', pron(S.what, who));
      text('qr-silask', pron(S.ask, who));
      text('qr-siltime', pron(S.time, who));
    } else {
      document.getElementById('qr-silname').closest('.qr-sec').hidden = true;
    }
    if (d && d.track === 'strained') strainedMode(d, who, S);
    document.getElementById('qr').hidden = false;
  }

  // Still talking, but tense: the live training fits them, not the book. Same diagnosis on
  // top; the recommendation and the button change, and the book page underneath is hidden.
  function strainedMode(d, who, S) {
    const THRIVE = 'https://parentingadultstoday.com/thrive?src=quiz-strained' + (carry() ? '&' + carry() : '');
    const silName = S ? S.name : 'a silence that has not hardened';
    const rec = document.createElement('p');
    rec.className = 'qr-rec';
    rec.innerHTML = pron('You still talk to {them}, and that changes the first step. Your silence is <b>' + silName + '</b>, which means the door is open. The fastest help is <b>Catherine\u2019s free live training</b>: how to step out of the manager\u2019s chair before a strained silence hardens into a closed one. Save your seat below.', who);
    const cta = document.getElementById('qr-cta');
    cta.before(rec);
    cta.href = THRIVE;
    cta.innerHTML = '<span>Save my seat at Catherine\u2019s free live training<small>Free \u00b7 live on Zoom \u00b7 spouses welcome</small></span>';
    const under = document.querySelector('.qr-under'); if (under) under.textContent = 'No camera, no talking, and no one is told you came.';
    const mech = document.getElementById('qr-mech');
    if (mech) mech.innerHTML = 'Every relationship runs on an account of safety. Every contact is a deposit or a withdrawal. While you still talk, every conversation is a chance to make a deposit instead of a withdrawal, and most loving parents do not know which one they are making. <b>That is what the live training teaches.</b> Save your seat above.';
    document.querySelectorAll('body > *').forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'footer' || el.id === 'qr') return;
      if (el.classList.contains('helpbar') || el.classList.contains('logobar')) return;
      el.hidden = true; el.style.display = 'none';
    });
    document.title = 'Your Result \u2014 Catherine\u2019s Free Live Training';
  }

  async function load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem('wh_quiz') || 'null'); } catch (e) {}
    const r = (QS.get('r') || '').toLowerCase();
    const want = /^[0-9a-f-]{36}$/.test(r);
    // Another device (or storage cleared): resolve the opaque id on the live domain only.
    if (want && (!d || (d.r && d.r !== r)) && LIVE) {
      try {
        const res = await fetch(API + '/quiz-result?r=' + encodeURIComponent(r));
        if (res.ok) { d = await res.json(); d.r = r; }
      } catch (e) {}
    }
    render(d && typeof d === 'object' ? d : null);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
