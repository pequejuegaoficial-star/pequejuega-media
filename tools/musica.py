"""Genera pistas de música original y libre de derechos para los reels de Peque Juega.
Uso: python3 musica.py <salida.wav> <semilla> [segundos]
"""
import sys, numpy as np
from scipy.io import wavfile
SR = 44100
out, seed = sys.argv[1], int(sys.argv[2]); dur = float(sys.argv[3]) if len(sys.argv) > 3 else 24
rng = np.random.default_rng(seed)
bpm = [104, 112, 120][seed % 3]; beat = 60 / bpm
keys = [0, 2, 5, 7]; root = 60 + keys[seed % 4]
prog = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]] if seed % 2 == 0 else [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]]
scale = [0, 2, 4, 7, 9, 12, 14, 16]
f = lambda m: 440 * 2 ** ((m - 69) / 12)
n = int(dur * SR); mix = np.zeros(n)
def pluck(freq, start, length, amp, bright=0.6):
    s = int(start * SR); L = int(length * SR)
    if s >= n: return
    L = min(L, n - s); t = np.arange(L) / SR
    tone = sum((bright ** k) * np.sin(2 * np.pi * freq * (k + 1) * t) for k in range(4))
    env = np.exp(-t * 6) * np.minimum(1, t * 200)
    mix[s:s + L] += amp * tone * env
def kick(start):
    s = int(start * SR); L = min(int(0.25 * SR), n - s)
    if L <= 0: return
    t = np.arange(L) / SR
    mix[s:s + L] += 0.5 * np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 14)
def shaker(start):
    s = int(start * SR); L = min(int(0.06 * SR), n - s)
    if L <= 0: return
    t = np.arange(L) / SR
    mix[s:s + L] += 0.06 * rng.standard_normal(L) * np.exp(-t * 60)
bar = 4 * beat; t0 = 0.0; i = 0
while t0 < dur:
    ch = prog[i % 4]
    for b in range(4):
        for note in ch: pluck(f(root - 12 + note), t0 + b * beat, beat * 1.5, 0.10, 0.5)
        kick(t0 + b * beat) if b in (0, 2) else None
        shaker(t0 + b * beat + beat / 2)
    pluck(f(root - 24 + ch[0]), t0, bar, 0.18, 0.3)
    for e in range(8):
        if rng.random() < 0.7:
            pluck(f(root + 12 + rng.choice(scale)), t0 + e * beat / 2, beat, 0.09, 0.7)
    t0 += bar; i += 1
fade = int(1.0 * SR); mix[-fade:] *= np.linspace(1, 0, fade); mix[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
mix = mix / np.max(np.abs(mix)) * 0.8
wavfile.write(out, SR, (np.column_stack([mix, mix]) * 32767).astype(np.int16))
