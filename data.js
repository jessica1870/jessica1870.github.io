// IPA sound inventory for the quiz.
// Symbols and sound files are taken from "Original IPA Site With Sounds/IPAcharts.html".
// All sound files live in SOUND_DIR.

const SOUND_DIR = "Original IPA Site With Sounds/sounds/";

// ---------------------------------------------------------------------------
// Pulmonic consonants
// row = manner index, col = place index, v = 0 voiceless / 1 voiced
// ---------------------------------------------------------------------------
const PULMONIC_PLACES = [
  "Bilabial", "Labiodental", "Dental", "Alveolar", "Postalveolar",
  "Retroflex", "Palatal", "Velar", "Uvular", "Pharyngeal", "Glottal",
];
const PULMONIC_MANNERS = [
  "Plosive", "Nasal", "Trill", "Tap / Flap", "Fricative", "Lateral fricative",
  "Affricate", "Lateral affricate", "Approximant", "Lateral approximant",
];

const PULMONIC = [
  // sym, file, name, row, col, voiced
  ["p", "p.wav", "voiceless bilabial plosive", 0, 0, 0],
  ["b", "b.wav", "voiced bilabial plosive", 0, 0, 1],
  ["t", "t.wav", "voiceless alveolar plosive", 0, 3, 0],
  ["d", "d.wav", "voiced alveolar plosive", 0, 3, 1],
  ["ʈ", "retroflex_t.wav", "voiceless retroflex plosive", 0, 5, 0],
  ["ɖ", "retroflex_d.wav", "voiced retroflex plosive", 0, 5, 1],
  ["c", "c.wav", "voiceless palatal plosive", 0, 6, 0],
  ["ɟ", "voiced_palatal_stop.wav", "voiced palatal plosive", 0, 6, 1],
  ["k", "k.wav", "voiceless velar plosive", 0, 7, 0],
  ["ɡ", "g.wav", "voiced velar plosive", 0, 7, 1],
  ["q", "q.wav", "voiceless uvular plosive", 0, 8, 0],
  ["ɢ", "uvular_G.wav", "voiced uvular plosive", 0, 8, 1],
  ["ʔ", "glottalstop.wav", "glottal stop (glottal plosive)", 0, 10, 0],

  ["m", "m.wav", "voiced bilabial nasal", 1, 0, 1],
  ["ɱ", "labiodental_nasal.wav", "voiced labiodental nasal", 1, 1, 1],
  ["n", "n.wav", "voiced alveolar nasal", 1, 3, 1],
  ["ɳ", "retroflex_nasal.wav", "voiced retroflex nasal", 1, 5, 1],
  ["ɲ", "palatal_nasal.wav", "voiced palatal nasal", 1, 6, 1],
  ["ŋ", "velar_nasal.wav", "voiced velar nasal", 1, 7, 1],
  ["ɴ", "uvular_nasal.wav", "voiced uvular nasal", 1, 8, 1],

  ["ʙ", "bilabial_trill.wav", "voiced bilabial trill", 2, 0, 1],
  ["r", "r.wav", "voiced alveolar trill", 2, 3, 1],
  ["ʀ", "uvular_trill.wav", "voiced uvular trill", 2, 8, 1],

  ["ɾ", "tap.wav", "voiced alveolar tap", 3, 3, 1],
  ["ɽ", "flap.wav", "voiced retroflex flap", 3, 5, 1],

  ["ɸ", "phi.wav", "voiceless bilabial fricative", 4, 0, 0],
  ["β", "beta.wav", "voiced bilabial fricative", 4, 0, 1],
  ["f", "f.wav", "voiceless labiodental fricative", 4, 1, 0],
  ["v", "v.wav", "voiced labiodental fricative", 4, 1, 1],
  ["θ", "theta.wav", "voiceless dental fricative", 4, 2, 0],
  ["ð", "eth.wav", "voiced dental fricative", 4, 2, 1],
  ["s", "s.wav", "voiceless alveolar fricative", 4, 3, 0],
  ["z", "z.wav", "voiced alveolar fricative", 4, 3, 1],
  ["ʃ", "esh.wav", "voiceless postalveolar fricative", 4, 4, 0],
  ["ʒ", "ezh.wav", "voiced postalveolar fricative", 4, 4, 1],
  ["ʂ", "retroflex_s.wav", "voiceless retroflex fricative", 4, 5, 0],
  ["ʐ", "retroflex_z.wav", "voiced retroflex fricative", 4, 5, 1],
  ["ç", "voiceless_palatal_fric.wav", "voiceless palatal fricative", 4, 6, 0],
  ["ʝ", "voiced_palatal_fric.wav", "voiced palatal fricative", 4, 6, 1],
  ["x", "x.wav", "voiceless velar fricative", 4, 7, 0],
  ["ɣ", "gamma.wav", "voiced velar fricative", 4, 7, 1],
  ["χ", "chi.wav", "voiceless uvular fricative", 4, 8, 0],
  ["ʁ", "voiced_uvular_fric.wav", "voiced uvular fricative", 4, 8, 1],
  ["ħ", "voiceless_pharyngeal_fric.wav", "voiceless pharyngeal fricative", 4, 9, 0],
  ["ʕ", "voiced_pharyngeal_fric.wav", "voiced pharyngeal fricative", 4, 9, 1],
  ["h", "h.wav", "voiceless glottal fricative", 4, 10, 0],
  ["ɦ", "voiced_h.wav", "voiced glottal fricative", 4, 10, 1],

  ["ɬ", "voiceless_lateral_fric.wav", "voiceless alveolar lateral fricative", 5, 3, 0],
  ["ɮ", "voiced_lateral_fric.wav", "voiced alveolar lateral fricative", 5, 3, 1],

  ["p͡f", "pf.wav", "voiceless labiodental affricate", 6, 1, 0],
  ["b͡v", "bv.wav", "voiced labiodental affricate", 6, 1, 1],
  ["t͡s", "ts.wav", "voiceless alveolar affricate", 6, 3, 0],
  ["d͡z", "dz.wav", "voiced alveolar affricate", 6, 3, 1],
  ["t͡ʃ", "voiceless_postalveolar_affricate.wav", "voiceless postalveolar affricate", 6, 4, 0],
  ["d͡ʒ", "voiced_postalveolar_affricate.wav", "voiced postalveolar affricate", 6, 4, 1],
  ["ʈ͡ʂ", "voiceless_retroflex_affricate.wav", "voiceless retroflex affricate", 6, 5, 0],
  ["ɖ͡ʐ", "voiced_retroflex_affricate.wav", "voiced retroflex affricate", 6, 5, 1],
  ["k͡x", "kx.wav", "voiceless velar affricate", 6, 7, 0],
  ["ɡ͡ɣ", "voiced_velar_affricate.wav", "voiced velar affricate", 6, 7, 1],

  ["t͡ɬ", "voiceless_lateral_affricate.wav", "voiceless alveolar lateral affricate", 7, 3, 0],

  ["ʋ", "approximant_v.wav", "voiced labiodental approximant", 8, 1, 1],
  ["ɹ", "approximant_r.wav", "voiced alveolar approximant", 8, 3, 1],
  ["ɻ", "retroflex_approximant_r.wav", "voiced retroflex approximant", 8, 5, 1],
  ["j", "j.wav", "voiced palatal approximant", 8, 6, 1],
  ["ɰ", "velar_approximant.wav", "voiced velar approximant", 8, 7, 1],

  ["l", "l.wav", "voiced alveolar lateral approximant", 9, 3, 1],
  ["ɭ", "retroflex_l.wav", "voiced retroflex lateral approximant", 9, 5, 1],
  ["ʎ", "palatal_lateral.wav", "voiced palatal lateral approximant", 9, 6, 1],
  ["ʟ", "velar_l.wav", "voiced velar lateral approximant", 9, 7, 1],
];

// "Other" pulmonic symbols, shown under the main chart.
// row/col are approximate, used only to pick similar distractors.
const PULMONIC_OTHER = [
  ["w", "w.wav", "voiced labial-velar approximant", 8, 7, 1],
  ["ʍ", "voiceless_w.wav", "voiceless labial-velar fricative", 4, 7, 0],
  ["ɥ", "upsidedown_h.wav", "voiced labial-palatal approximant", 8, 6, 1],
];

// ---------------------------------------------------------------------------
// Non-pulmonic consonants
// type: click / implosive / ejective, place = rough place index (for similarity)
// ---------------------------------------------------------------------------
const NONPULMONIC = [
  // sym, file, name, type, placeLabel, place, nasal
  ["kʘ", "voiceless_bilabial_click.wav", "voiceless bilabial click", "click", "Bilabial", 0, 0],
  ["ŋʘ", "nasalized_bilabial_click.wav", "nasalized bilabial click", "click", "Bilabial", 0, 1],
  ["kǀ", "voiceless_dental_click.wav", "voiceless dental click", "click", "Dental", 2, 0],
  ["ŋǀ", "nasalized_dental_click.wav", "nasalized dental click", "click", "Dental", 2, 1],
  ["kǃ", "voiceless_postalveolar_click.wav", "voiceless postalveolar click", "click", "Postalveolar", 4, 0],
  ["ŋǃ", "nasalized_postalveolar_click.wav", "nasalized postalveolar click", "click", "Postalveolar", 4, 1],
  ["kǂ", "voiceless_palatoalveolar_click.wav", "voiceless palatoalveolar click", "click", "Palatoalveolar", 5, 0],
  ["ŋǂ", "nasalized_palatoalveolar_click.wav", "nasalized palatoalveolar click", "click", "Palatoalveolar", 5, 1],
  ["kǁ", "voiceless_lateral_click.wav", "voiceless alveolar lateral click", "click", "Alveolar lateral", 3, 0],
  ["ŋǁ", "nasalized_lateral_click.wav", "nasalized alveolar lateral click", "click", "Alveolar lateral", 3, 1],

  ["ɓ", "implosive_b.wav", "voiced bilabial implosive", "implosive", "Bilabial", 0, 0],
  ["ɗ", "implosive_d.wav", "voiced alveolar implosive", "implosive", "Alveolar", 3, 0],
  ["ʄ", "implosive_j.wav", "voiced palatal implosive", "implosive", "Palatal", 6, 0],
  ["ɠ", "implosive_g.wav", "voiced velar implosive", "implosive", "Velar", 7, 0],
  ["ʛ", "uvular_implosive.wav", "voiced uvular implosive", "implosive", "Uvular", 8, 0],

  ["pʼ", "ejective_p.wav", "bilabial ejective stop", "ejective", "Bilabial", 0, 0],
  ["tʼ", "ejective_t.wav", "alveolar ejective stop", "ejective", "Alveolar stop", 3, 0],
  ["kʼ", "ejective_k.wav", "velar ejective stop", "ejective", "Velar", 7, 0],
  ["qʼ", "ejective_q.wav", "uvular ejective stop", "ejective", "Uvular", 8, 0],
  ["sʼ", "ejective_s.wav", "alveolar ejective fricative", "ejective", "Alveolar fricative", 3, 0],
  ["t͡ʃʼ", "ejective_postalveolar_affricate.wav", "postalveolar ejective affricate", "ejective", "Postalveolar affricate", 4, 0],
];

// ---------------------------------------------------------------------------
// Vowels
// h = height 0 (close) .. 6 (open)
// b = backness 0 front, 1 near-front, 2 central, 3 near-back, 4 back
// r = 0 unrounded / 1 rounded (-1 = centred, e.g. schwa)
// ---------------------------------------------------------------------------
const VOWELS = [
  ["i", "i.wav", "close front unrounded vowel", 0, 0, 0],
  ["y", "y.wav", "close front rounded vowel", 0, 0, 1],
  ["ɨ", "barred_i.wav", "close central unrounded vowel", 0, 2, 0],
  ["ʉ", "barred_u.wav", "close central rounded vowel", 0, 2, 1],
  ["ɯ", "upsidedown_m.wav", "close back unrounded vowel", 0, 4, 0],
  ["u", "u.wav", "close back rounded vowel", 0, 4, 1],
  ["ɪ", "small_cap_i.wav", "near-close near-front unrounded vowel", 1, 1, 0],
  ["ʏ", "small_cap_y.wav", "near-close near-front rounded vowel", 1, 1, 1],
  ["ʊ", "upsilon.wav", "near-close near-back rounded vowel", 1, 3, 1],
  ["e", "e.wav", "close-mid front unrounded vowel", 2, 0, 0],
  ["ø", "slash_o.wav", "close-mid front rounded vowel", 2, 0, 1],
  ["ɤ", "ramshorns.wav", "close-mid back unrounded vowel", 2, 4, 0],
  ["o", "o.wav", "close-mid back rounded vowel", 2, 4, 1],
  ["ə", "schwa.wav", "mid central vowel (schwa)", 3, 2, -1],
  ["ɛ", "epsilon.wav", "open-mid front unrounded vowel", 4, 0, 0],
  ["œ", "oe.wav", "open-mid front rounded vowel", 4, 0, 1],
  ["ʌ", "wedge.wav", "open-mid back unrounded vowel", 4, 4, 0],
  ["ɔ", "open_o.wav", "open-mid back rounded vowel", 4, 4, 1],
  ["æ", "ae.wav", "near-open front unrounded vowel", 5, 0, 0],
  ["a", "a.wav", "open front unrounded vowel", 6, 0, 0],
  ["ɑ", "back_a.wav", "open back unrounded vowel", 6, 4, 0],
  ["ɒ", "upsidedown_a.wav", "open back rounded vowel", 6, 4, 1],
];

// Shown beside the vowel chart rather than inside it.
const VOWEL_OTHER = [
  ["ɚ", "rhotic_schwa.wav", "r-coloured mid central vowel (rhotacised schwa)", 3, 2, -1],
];

// Pairs that count as the same answer. From the original page:
// "[ɻ] and [ɹ] will be considered interchangeable for the purposes of the quizzes."
const INTERCHANGEABLE = [["ɹ", "ɻ"]];

// ---------------------------------------------------------------------------
// Build a single flat list of sound objects.
// ---------------------------------------------------------------------------
const SOUNDS = [];
(function build() {
  let n = 0;
  const add = (o) => { o.id = "s" + (n++); SOUNDS.push(o); };

  for (const [sym, file, name, row, col, voiced] of PULMONIC)
    // Rows 6 and 7 are affricates / lateral affricates, which can be switched off in setup.
    add({ cat: "pulmonic", sym, file, name, row, col, voiced, affricate: row === 6 || row === 7 });
  for (const [sym, file, name, row, col, voiced] of PULMONIC_OTHER)
    add({ cat: "pulmonic", other: true, sym, file, name, row, col, voiced });
  for (const [sym, file, name, type, placeLabel, place, nasal] of NONPULMONIC)
    add({ cat: "nonpulmonic", sym, file, name, type, placeLabel, place, nasal });
  for (const [sym, file, name, h, b, r] of VOWELS)
    add({ cat: "vowel", sym, file, name, h, b, r });
  for (const [sym, file, name, h, b, r] of VOWEL_OTHER)
    add({ cat: "vowel", other: true, sym, file, name, h, b, r });
})();
