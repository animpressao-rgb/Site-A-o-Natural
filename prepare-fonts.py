"""Freeze variable font weights for consistent browser rendering (fonttools + brotli)."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import re

for family in ['archivo', 'manrope']:
    for weight in [400, 500, 600, 700]:
        font = TTFont(f'assets/moderno/{family}-latin.woff2')
        axes = {a.axisTag: (weight if a.axisTag == 'wght' else a.defaultValue) for a in font['fvar'].axes}
        instance = instantiateVariableFont(font, axes, inplace=True)
        instance.save(f'assets/moderno/{family}-{weight}.woff2')
css = Path('styles-moderno.css').read_text(encoding='utf-8')
css = re.sub(r'@font-face\{[^}]+\}\n', '', css)
faces = '\n'.join('@font-face{font-family:' + family.title() + ";src:url('assets/moderno/" + family + '-' + str(weight) + ".woff2') format('woff2');font-style:normal;font-weight:" + str(weight) + ';font-display:swap}' for family in ['archivo', 'manrope'] for weight in [400, 500, 600, 700])
Path('styles-moderno.css').write_text(faces + '\n' + css, encoding='utf-8')
p = Path('index-moderno.html')
p.write_text(p.read_text(encoding='utf-8').replace('archivo-latin.woff2', 'archivo-500.woff2'), encoding='utf-8')
