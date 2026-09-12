"""Local WebKit regression checks; requires Playwright and its WebKit browser."""
from pathlib import Path
from html.parser import HTMLParser
from playwright.sync_api import sync_playwright, expect
import re
import json

ROOT = Path(__file__).parent
class Content(HTMLParser):
    def __init__(self):
        super().__init__(); self.words=[]; self.skip=0; self.links=[]; self.alts=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag in ('script','style'): self.skip+=1
        if tag=='a': self.links.append(attrs.get('href'))
        if tag=='img': self.alts.append(attrs.get('alt'))
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.skip-=1
    def handle_data(self, data):
        if not self.skip: self.words.extend(data.split())
a,b=Content(),Content()
a.feed((ROOT/'index.html').read_text(encoding='utf-8'))
b.feed((ROOT/'index-moderno.html').read_text(encoding='utf-8'))
assert a.words==b.words, 'Original text changed'
assert a.links==b.links, 'Original destinations changed'
assert a.alts==b.alts, 'Original photo descriptions changed'

results=[]
with sync_playwright() as p:
    browser=p.webkit.launch()
    for width,height in [(320,568),(375,667),(390,844),(430,932),(667,375),(844,390),(768,1024),(1024,768),(1440,1000),(1920,1080)]:
        context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=2 if width<500 else 1,is_mobile=width<900,has_touch=width<900)
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto('http://127.0.0.1:8765/index-moderno.html',wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        assert page.evaluate('document.fonts.check("500 16px Archivo")'), 'Display font failed'
        assert page.evaluate('document.fonts.check("400 16px Manrope")'), 'Body font failed'
        for theme in ('light','dark'):
            page.evaluate('(theme)=>document.documentElement.dataset.theme=theme',theme)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'Overflow {width} {theme}'
        if width<=760:
            page.get_by_role('button',name='Abrir menu',exact=True).click()
            assert page.locator('#menu').is_visible()
            page.locator('#menu a').first.click()
            assert not page.locator('#menu').is_visible()
            assert page.locator('.menu-toggle').get_attribute('aria-expanded')=='false'
        page.locator('.theme-toggle').click()
        assert page.locator('html').get_attribute('data-theme')=='light'
        page.reload(wait_until='networkidle')
        assert page.locator('html').get_attribute('data-theme')=='light'
        page.locator('.theme-toggle').click()
        first=page.locator('.project-image-button').first
        first.scroll_into_view_if_needed()
        page.evaluate('document.documentElement.style.scrollBehavior="auto"')
        before=page.evaluate('scrollY')
        first.click()
        assert page.get_by_role('dialog').is_visible()
        assert page.evaluate('document.body.style.position')=='fixed'
        page.get_by_role('button',name='Próxima imagem',exact=True).click()
        assert page.locator('.lightbox p').inner_text().startswith('2 / 20')
        page.keyboard.press('ArrowLeft')
        expect(page.locator('.lightbox p')).to_have_text(re.compile(r'^1 / 20'))
        page.get_by_role('button',name='Fechar imagem ampliada').focus()
        page.keyboard.press('Shift+Tab')
        assert page.evaluate('document.activeElement.className')=='lightbox-next'
        page.keyboard.press('Escape')
        assert not page.get_by_role('dialog').is_visible()
        assert abs(page.evaluate('scrollY')-before)<3, f'Scroll restoration {width}'
        assert page.evaluate('document.activeElement.className')=='project-image-button'
        for image in page.locator('.project-grid img').all():
            image.scroll_into_view_if_needed()
            image.evaluate('(img)=>img.decode()')
        assert page.locator('.project-grid img').count()==20
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors,errors
        if width in (390,1440):
            page.evaluate('document.documentElement.style.scrollBehavior="auto";scrollTo(0,0)')
            page.screenshot(path=str(ROOT/f'preview-webkit-{width}.png'))
            if width==1440: page.screenshot(path=str(ROOT/'preview-webkit-full.png'),full_page=True)
        results.append({'viewport':f'{width}x{height}','overflow':False,'menu':'passed' if width<=760 else 'desktop','theme':'passed','gallery':'passed','scroll_restore':'passed','images':20,'errors':errors})
        context.close()
    context=browser.new_context(viewport={'width':390,'height':844},java_script_enabled=False,reduced_motion='reduce')
    page=context.new_page();page.goto('http://127.0.0.1:8765/index-moderno.html')
    assert page.locator('h1').is_visible()
    assert page.locator('.hero-actions a').first.is_visible()
    browser.close()
(ROOT/'validation-moderno.json').write_text(json.dumps({'engine':'WebKit','content_preserved':True,'links_preserved':True,'viewports':results,'no_js_content':True},indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
