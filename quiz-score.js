/* "What Kind of Silence Is This?" — pure scoring + routing.
   Loaded by quiz.html via <script src> and by tests/quiz-score.test.js via require().
   Rules come straight from the Oct 26 proposal (Safety Account, pattern, silence,
   tags). Nothing here touches the DOM or the network. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.QuizScore = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const PATTERNS = {
    fade:      { slug: 'slow-fade',     name: 'The Slow Fade' },
    rupture:   { slug: 'rupture',       name: 'The Rupture' },
    rewrite:   { slug: 'rewrite',       name: 'The Rewrite' },
    household: { slug: 'new-household', name: 'The New Household' },
    shielded:  { slug: 'shielded-door', name: 'The Shielded Door' },
    standoff:  { slug: 'standoff',      name: 'The Standoff' },
  };
  const PATTERN_ORDER = ['fade', 'rupture', 'rewrite', 'household', 'shielded', 'standoff'];
  const SILENCE_ORDER = ['testing', 'protective', 'hardened']; // least → most guarded

  // Safety Account deductions
  const CONTACT_PTS  = { thin: 6, stopped: 14, blocked: 20 };
  const DURATION_PTS = { '<6m': 2, '6-12m': 6, '1-3y': 12, '3y+': 18 };
  const TRIED_PTS    = { letter: 6, apologise: 4, relative: 6, talk: 4, gifts: 2, space: 0, therapy: 0, nothing: 0 };
  const TRIED_CAP    = 18;
  const COUNT_PTS    = { none: 0, '1-3': 6, '4-10': 12, '10+': 18 };
  const PORTRAIT_PTS = { three: 0, two: 4, one: 8, none: 12 };

  // Silence signals
  const MESSAGE_SIL  = { 'read-no-reply': 'testing', 'read-late': 'protective', blocked: 'hardened', stopped: null };
  const DURATION_SIL = { '<6m': 'testing', '6-12m': 'testing', '1-3y': 'protective', '3y+': 'hardened' };
  const LEAKS        = ['sick', 'watches', 'sibling', 'holidays'];

  const BANDS = [
    { max: 24,  key: 'overdrawn',   label: 'Overdrawn' },
    { max: 49,  key: 'running-low', label: 'Running Low' },
    { max: 74,  key: 'rebuilding',  label: 'Rebuilding' },
    { max: 100, key: 'steady',      label: 'Steady' },
  ];

  const PRONOUNS = {
    son:      { they: 'he',   them: 'him',  their: 'his',   child: 'your son' },
    daughter: { they: 'she',  them: 'her',  their: 'her',   child: 'your daughter' },
    children: { they: 'they', them: 'them', their: 'their', child: 'your children' },
  };

  const arr = (v) => Array.isArray(v) ? v : (v ? [v] : []);

  function band(score) {
    return BANDS.find((b) => score <= b.max) || BANDS[BANDS.length - 1];
  }

  function safetyScore(a) {
    const tried = Math.min(TRIED_CAP, arr(a.tried).reduce((s, t) => s + (TRIED_PTS[t] || 0), 0));
    const total = (CONTACT_PTS[a.contact] || 0) + (DURATION_PTS[a.duration] || 0) + tried +
      (COUNT_PTS[a.count] || 0) + (PORTRAIT_PTS[a.portrait] || 0);
    return Math.max(5, 100 - total);
  }

  // Pattern = highest of Q3 (+3) and Q4 (+1 each). Ties go to the Q3 answer.
  // Q3 "unsure" with nothing heard → Slow Fade (the book's most common pattern).
  function pattern(a) {
    const pts = {};
    PATTERN_ORDER.forEach((k) => { pts[k] = 0; });
    if (PATTERNS[a.start]) pts[a.start] += 3;
    arr(a.heard).forEach((k) => { if (PATTERNS[k]) pts[k] += 1; });
    const top = Math.max.apply(null, PATTERN_ORDER.map((k) => pts[k]));
    if (top === 0) return 'fade';
    const leaders = PATTERN_ORDER.filter((k) => pts[k] === top);
    if (leaders.length === 1) return leaders[0];
    if (PATTERNS[a.start] && leaders.includes(a.start)) return a.start;
    return leaders[0]; // canonical order; Slow Fade wins if it is among them
  }

  // Silence = highest of Q6 (+2), Q7 (testing +1 per leak, "nothing" → hardened +1)
  // and the Q5 adder. Any leak rules out hardened. Ties go to the more guarded silence.
  function silence(a) {
    const pts = { testing: 0, protective: 0, hardened: 0 };
    const m = MESSAGE_SIL[a.messages];
    if (m) pts[m] += 2;
    const leaks = arr(a.leaks).filter((l) => LEAKS.includes(l));
    pts.testing += leaks.length;
    if (arr(a.leaks).includes('none')) pts.hardened += 1;
    const d = DURATION_SIL[a.duration];
    if (d) pts[d] += 1;
    const allowed = leaks.length ? ['testing', 'protective'] : SILENCE_ORDER;
    const top = Math.max.apply(null, allowed.map((k) => pts[k]));
    for (let i = allowed.length - 1; i >= 0; i--) if (pts[allowed[i]] === top) return allowed[i];
    return 'protective';
  }

  function score(a) {
    a = a || {};
    const who = PRONOUNS[a.who] ? a.who : 'children';
    const situation = arr(a.situation);
    const base = {
      who, pronouns: PRONOUNS[who],
      fields: { 'Quiz Who': who, 'Quiz Contact': a.contact || '', 'Quiz Goal': a.goal || '' },
      tags: ['quiz-completed'],
    };
    if (situation.includes('addiction-mh')) base.tags.push('quiz-addiction-mh');
    if (situation.includes('spouse-split')) base.tags.push('quiz-spouse-split');

    // Q2 "still talk but tense" = the strained track: same questions, same score, but the
    // result page recommends the live training instead of the book.
    base.track = a.contact === 'strained' ? 'strained' : 'estranged';
    if (base.track === 'strained') base.tags.push('quiz-track-strained');
    const pk = pattern(a), sil = silence(a), sa = safetyScore(a), b = band(sa);
    base.pattern = Object.assign({ key: pk }, PATTERNS[pk]);
    base.silence = sil;
    base.safety = sa;
    base.band = b;
    Object.assign(base.fields, {
      'Quiz Start': a.start || '', 'Quiz Heard': arr(a.heard).join(', '),
      'Quiz Duration': a.duration || '', 'Quiz Messages': a.messages || '',
      'Quiz Leaks': arr(a.leaks).join(', '), 'Quiz Tried': arr(a.tried).join(', '),
      'Quiz Count': a.count || '', 'Quiz Portrait': a.portrait || '',
      'Quiz Situation': situation.join(', '),
      'Quiz Pattern': base.pattern.name, 'Quiz Silence': sil,
      'Quiz Safety Score': sa + ' (' + b.label + ')',
    });
    base.tags.push('quiz-pattern-' + base.pattern.slug, 'quiz-silence-' + sil);
    const longEnough = a.duration === '1-3y' || a.duration === '3y+';
    if ((sil === 'protective' || sil === 'hardened') && longEnough && situation.includes('grandchildren'))
      base.tags.push('quiz-priority');
    return base;
  }

  return { score, safetyScore, pattern, silence, band, PRONOUNS, PATTERNS, BANDS };
});
