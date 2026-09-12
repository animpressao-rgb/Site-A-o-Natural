from pathlib import Path
from PIL import Image, ImageOps
import re, urllib.request

root = Path(__file__).parent
out = root / 'assets' / 'moderno'
out.mkdir(exist_ok=True)
html = (root / 'index.html').read_text(encoding='utf-8')
sources = list(dict.fromkeys(re.findall(r'src="(assets/[^"]+\.png)"', html)))
dimensions = {}
for source in sources:
    with Image.open(root / source) as original:
        original = ImageOps.exif_transpose(original).convert('RGB')
        dimensions[source] = original.size
        for width in (640, 1200, 2000):
            im = original.copy()
            im.thumbnail((width, round(width * original.height / original.width)), Image.Resampling.LANCZOS)
            im.save(out / f'{Path(source).stem}-{width}.jpg', quality=86, optimize=True, progressive=True)

def image_tag(match):
    tag = match.group(0)
    source = re.search(r'src="([^"]+)"', tag).group(1)
    if source not in dimensions:
        return tag
    stem = Path(source).stem
    width, height = dimensions[source]
    hero = 'hero-image' not in image_tag.__dict__
    image_tag.__dict__['hero-image'] = True
    tag = tag.replace(source, f'assets/moderno/{stem}-1200.jpg')
    sizes = '(max-width: 760px) 100vw, 55vw' if hero else '(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) 50vw, 66vw'
    attrs = f' width="{width}" height="{height}" srcset="assets/moderno/{stem}-640.jpg 640w, assets/moderno/{stem}-1200.jpg 1200w, assets/moderno/{stem}-2000.jpg 2000w" sizes="{sizes}"'
    attrs += ' fetchpriority="high"' if hero else ' loading="lazy" decoding="async"'
    attrs += f' data-full="assets/moderno/{stem}-2000.jpg"'
    return tag[:-1] + attrs + '>'

html = re.sub(r'<img\b[^>]*>', image_tag, html)
html = html.replace('width=device-width,initial-scale=1', 'width=device-width,initial-scale=1,viewport-fit=cover')
html = html.replace("<script>document.documentElement.classList.add('js')</script>", "<script>try{document.documentElement.dataset.theme=localStorage.getItem('acnatural-modern-theme')||'dark'}catch(e){}</script>")
html = re.sub(r'  <link rel="preconnect".*?  <link rel="stylesheet" href="theme-toggle.css">', '  <link rel="preload" href="assets/moderno/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>\n  <link rel="stylesheet" href="styles-moderno.css">', html, flags=re.S)
html = html.replace('sinalizada.<br><em>', 'sinalizada.<br> <em>')
html = html.replace('src="script.js"', 'src="script-moderno.js"')
html = html.replace('<button class="menu-toggle"', '<button type="button" class="menu-toggle"')
(root / 'index-moderno.html').write_text(html, encoding='utf-8')

for family, filename in [('Archivo:wght@400..700', 'archivo'), ('Manrope:wght@400..700', 'manrope')]:
    req = urllib.request.Request('https://fonts.googleapis.com/css2?family=' + family + '&display=swap', headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'})
    css = urllib.request.urlopen(req).read().decode()
    urls = re.findall(r'url\((https://[^)]+)\)', css)
    urllib.request.urlretrieve(urls[-1], out / f'{filename}-latin.woff2')
    print(filename, urls[-1])
print(f'Created copy with {len(sources)} photos. Optimized images: {sum(p.stat().st_size for p in out.glob("*.jpg")) / 1048576:.1f} MB across all sizes.')
