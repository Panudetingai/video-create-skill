#!/usr/bin/env python3
"""
Algorithmic lo-fi tech score for the Mali Cowork promo (numpy only).

Everything is derived from src/timeline.json — BPM, scene cuts, duration — so
the music lands exactly on the video's cuts:
  * drums / bass / Rhodes chords / pluck arp synthesised from waveforms + ADSR
  * arrangement follows the scenes (tense intro, drop on the Hero, build into
    the Arena, button ending on the CTA)
  * a whoosh + sub hit on every cut, sparkles on the celebrations

Usage: python3 audio/music.py [out.wav]
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/timeline.json").read_text())
SR = 48000
BPM = TL["bpm"]
BEAT = 60.0 / BPM
DUR = TL["duration"]
N = int(SR * (DUR + 1.5))  # tail for the last chord
CUTS = [s["start"] for s in TL["scenes"][1:]]
SCENE = {s["id"]: (s["start"], s["end"]) for s in TL["scenes"]}
rng = np.random.default_rng(29092026)

L = np.zeros(N)
R = np.zeros(N)


def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.005, d=0.1, s=0.6, r=0.2, hold=None):
    """ADSR envelope of n samples."""
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    hold_n = n - a_n - d_n - r_n if hold is None else int(hold * SR)
    hold_n = max(0, hold_n)
    e = np.concatenate([
        np.linspace(0, 1, max(a_n, 1)),
        np.linspace(1, s, max(d_n, 1)),
        np.full(hold_n, s),
        np.linspace(s, 0, max(r_n, 1)),
    ])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    lg = gain * np.cos((pan + 1) * np.pi / 4)
    rg = gain * np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * lg
    R[i:i + len(sig)] += sig * rg


def lowpass(x, cutoff):
    """One-pole low-pass (cutoff may be an array)."""
    a = np.exp(-2 * np.pi * np.asarray(cutoff, dtype=float) / SR)
    y = np.empty_like(x)
    acc = 0.0
    if np.ndim(a) == 0:
        b = 1 - a
        for i in range(len(x)):
            acc = b * x[i] + a * acc
            y[i] = acc
    else:
        for i in range(len(x)):
            acc = (1 - a[i]) * x[i] + a[i] * acc
            y[i] = acc
    return y


def lp_fast(x, cutoff):
    """FFT brick-ish low-pass with a soft knee (for long buffers)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def hp_fast(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (f / cutoff) ** 4 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ------------------------------------------------------------------ instruments
def kick(g=1.0):
    t = t_arr(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) * g + 0.25 * rng.standard_normal(len(t)) * np.exp(-t * 220)


def snare(g=1.0):
    t = t_arr(0.3)
    noise = hp_fast(rng.standard_normal(len(t)), 1800) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (0.55 * noise + 0.5 * body) * g


def hat(open_=False):
    t = t_arr(0.25 if open_ else 0.06)
    x = hp_fast(rng.standard_normal(len(t)), 7000)
    return x * np.exp(-t * (14 if open_ else 70)) * 0.35


def rhodes(note, dur, vel=1.0):
    t = t_arr(dur + 0.6)
    f = midi(note)
    mod = np.sin(2 * np.pi * f * 2 * t) * 1.2 * np.exp(-t * 4)
    x = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return x * trem * env(len(t), 0.006, 0.4, 0.45, 0.5, hold=dur - 0.4) * 0.16 * vel


def bass(note, dur):
    t = t_arr(dur)
    f = midi(note)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) + 0.1 * np.sign(np.sin(2 * np.pi * f * t))
    return x * env(len(t), 0.01, 0.12, 0.7, 0.08) * 0.26


def pluck(note, dur=0.3, bright=1.0):
    t = t_arr(dur + 0.3)
    f = midi(note)
    saw = 2 * ((f * t) % 1) - 1
    x = lowpass(saw, 900 + 3500 * bright * np.exp(-t * 14))
    return x * env(len(t), 0.002, 0.18, 0.2, 0.25, hold=dur - 0.18) * 0.18


def bell(note, g=1.0):
    t = t_arr(1.6)
    f = midi(note)
    x = np.sin(2 * np.pi * f * t + 2.0 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t * 3))
    return x * np.exp(-t * 3.2) * 0.12 * g


def pad(notes, dur, bright=0.3):
    t = t_arr(dur)
    x = np.zeros(len(t))
    for i, n in enumerate(notes):
        f = midi(n)
        for det in (-0.12, 0.0, 0.12):
            x += 2 * ((f * 2 ** (det / 12) * t + i * 0.13) % 1) - 1
    x = lp_fast(x, 500 + 2500 * bright)
    return x * env(len(t), 0.8, 0.2, 1.0, 1.2) * 0.03


def whoosh(dur=0.5, up=True):
    t = t_arr(dur)
    n = rng.standard_normal(len(t))
    cutoff = (400 + 7000 * (t / dur) ** 2) if up else (7400 - 7000 * (t / dur) ** 0.5)
    x = lowpass(n, cutoff)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return x * shape * 0.28


def sub_hit():
    t = t_arr(0.9)
    f = 38 + 50 * np.exp(-t * 9)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5) * 0.7


def tick():
    t = t_arr(0.03)
    return np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 300) * 0.25


def knock():
    t = t_arr(0.18)
    return (np.sin(2 * np.pi * 180 * t) + 0.5 * lowpass(rng.standard_normal(len(t)), 1500)) * np.exp(-t * 35) * 0.9


# ------------------------------------------------------------------ harmony
# Fmaj9 – Em7 – Dm9 – Cmaj7 (lo-fi ii–V feel), 2 beats... one chord per bar
CHORDS = [
    (41, [53, 57, 60, 64, 67]),  # Fmaj9
    (40, [52, 55, 59, 62]),      # Em7
    (38, [50, 53, 57, 60, 64]),  # Dm9
    (36, [48, 52, 55, 59]),      # Cmaj7
]
PENTA = [60, 62, 64, 67, 69, 72, 74, 76, 79]
BAR = 4 * BEAT


def in_scene(t, *ids):
    return any(SCENE[i][0] <= t < SCENE[i][1] for i in ids)


def section_energy(t):
    """0 = intro, 1 = groove, 2 = build, 3 = outro."""
    if t < 7:
        return 0
    if t >= 86:
        return 3
    if t >= 79:
        return 2
    return 1


# ------------------------------------------------------------------ arrangement
# intro 0–7: filtered pad, clock ticks, "overwhelmed" dissonance, knocks, riser
add(pad([53, 57, 60, 64], 7.5, bright=0.1), 0.0, 1.0)
add(pad([54, 61], 3.0, bright=0.05), 1.5, 0.6)  # slight tension (tritone-ish color)
for i in range(int(7 / BEAT)):
    add(tick(), i * BEAT, 0.6 if i % 2 else 1.0, pan=(-0.3 if i % 2 else 0.3))
add(knock(), 4.12, 0.8, 0.4)
add(knock(), 4.38, 0.8, 0.4)
add(bell(72), 4.45, 0.9, 0.2)   # colour returns
add(bell(79), 4.7, 0.6, -0.2)
add(whoosh(1.6), 5.4, 1.4)

# groove bars
bar = 0
t = 7.0
while t < 86 - 1e-9:
    root, notes = CHORDS[bar % 4]
    e = section_energy(t)
    # chords (on the one, and a push on the "and" of 2 in groove)
    for n in notes:
        add(rhodes(n, BAR * 0.9, 1.0), t, 1.0, pan=-0.25 + 0.5 * ((n % 7) / 6))
    # bass: root on 1, fifth on the "and" of 3, octave pickup
    add(bass(root, BEAT * 1.5), t)
    add(bass(root + 7, BEAT * 0.5), t + 2.5 * BEAT)
    add(bass(root + 12, BEAT * 0.4), t + 3.5 * BEAT)
    # drums
    for b in range(4):
        bt = t + b * BEAT
        if b in (0,) or (b == 2 and e >= 1 and bar % 2 == 1):
            add(kick(), bt, 0.95)
        if b == 2 and bar % 2 == 0:
            add(kick(0.7), bt + BEAT * 0.5, 0.8)
        if b in (1, 3):
            add(snare(), bt + 0.012, 0.55, pan=0.05)  # lazy lo-fi snare
        for s in range(2):
            swing = 0.035 if s else 0.0
            add(hat(open_=(b == 3 and s == 1)), bt + s * BEAT / 2 + swing, 0.9 if s == 0 else 0.6, pan=0.35)
    # arp from the Modes scene on, brighter in the build
    if t >= 15:
        for k in range(8):
            n = PENTA[(bar * 3 + k * 2 + (k // 3)) % len(PENTA)]
            if (k + bar) % 3 == 2 and e < 2:
                continue
            add(pluck(n, 0.18, bright=0.6 if e < 2 else 1.0), t + k * BEAT / 2 + (0.02 if k % 2 else 0), 0.9, pan=(-0.5 if k % 2 else 0.5))
    # build: snare roll + rising pad into the CTA
    if e == 2:
        add(pad([n + 12 for n in notes[:3]], BAR, bright=0.2 + 0.6 * (t - 79) / 7), t, 1.3)
    bar += 1
    t += BAR

# snare roll into the CTA (84–86)
roll_start, roll_end = 84.0, 86.0
k = 0
tt = roll_start
while tt < roll_end:
    frac = (tt - roll_start) / (roll_end - roll_start)
    add(snare(0.35 + 0.65 * frac), tt, 0.5)
    tt += BEAT / (2 if frac < 0.5 else 4)
add(whoosh(1.2), 84.8, 1.5)

# outro 86–90: big Fmaj9 → Cmaj(add9) button ending
add(sub_hit(), 86.0, 1.0)
add(kick(1.2), 86.0, 1.0)
for n in [53, 57, 60, 64, 67, 72]:
    add(rhodes(n, 1.9, 1.2), 86.0, 1.0, pan=-0.3 + 0.12 * (n % 6))
add(pad([65, 69, 72, 76], 2.2, bright=0.8), 86.0, 1.2)
for i, n in enumerate([72, 76, 79, 84, 88]):
    add(bell(n, 0.8), 86.05 + i * 0.09, 0.9, pan=-0.5 + 0.25 * i)
for b in range(4):
    add(hat(), 86.0 + b * BEAT / 2, 0.6, 0.35)
for n in [48, 52, 55, 62, 64]:
    add(rhodes(n, 1.6, 1.1), 88.0, 1.0, pan=0.1)
add(bass(36, 2.0), 88.0)
add(kick(1.0), 88.0)
add(sub_hit(), 88.0, 0.7)

# every cut: whoosh into it + sub hit on it
for c in CUTS:
    if c in (7.0, 86.0):
        add(sub_hit(), c, 0.9)
    add(whoosh(0.42), c - 0.36, 0.9)
    add(sub_hit(), c, 0.35)

# sparkles on the celebrations (S7 confetti, S12 confetti) + drop on the Hero
for at in (52.45, 87.25, 87.9):
    for i, n in enumerate([84, 88, 91, 96]):
        add(bell(n, 0.7), at + i * 0.06, 0.8, pan=-0.6 + 0.4 * i)
for i, n in enumerate([72, 76, 79, 84]):
    add(bell(n), 7.0 + 1.35 + i * 0.12, 0.8, pan=-0.6 + 0.4 * i)  # the team jumps out

# ------------------------------------------------------------------ master
def reverb(x, secs=1.8, mix=0.18):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp_fast(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    y = hp_fast(y, 300)  # keep the low end dry and tight
    return (1 - mix) * x + mix * y


# vinyl crackle, very quiet
crack = np.zeros(N)
idx = rng.integers(0, N, size=int(DUR * 18))
crack[idx] = rng.standard_normal(len(idx)) * 0.08
crack = hp_fast(crack, 2000)

L = reverb(L + crack)
R = reverb(R + np.roll(crack, 311))
# tame the sub below 35 Hz (inaudible rumble eats headroom)
L, R = hp_fast(L, 32), hp_fast(R, 32)
# warm tape-ish saturation + gentle fade out
mx = max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(1.4 * L / mx) / np.tanh(1.4), np.tanh(1.4 * R / mx) / np.tanh(1.4)
fade = np.ones(N)
fs = int((DUR - 0.2) * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 2
L, R = L * fade * 0.89, R * fade * 0.89
L, R = L[: int(DUR * SR)], R[: int(DUR * SR)]

out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "audio/out/music.wav"
out.parent.mkdir(parents=True, exist_ok=True)
pcm = (np.stack([L, R], axis=1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"music: {out} ({DUR}s @ {BPM} BPM, {len(CUTS)} cuts)")
