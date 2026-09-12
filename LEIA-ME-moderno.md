# Cópia modernizada — Ação Natural

Abra `index-moderno.html`. O `index.html`, seus estilos, seu script e as fotos originais foram preservados.

Para publicar esta versão, mantenha juntos `index-moderno.html`, `styles-moderno.css`, `script-moderno.js`, `assets/logo-acnatural.svg` e a pasta `assets/moderno`. A página é estática e não exige instalação nem compilação. Fontes e imagens são locais.

## Direção visual

Paleta original: fundo #11161b, painéis #171d23, azul #4eb7e8 e #173b66, amarelo #ffd617, magenta #e72683. A fotografia da identificação no edifício é o destaque da abertura. Soluções acompanham as quatro fases da obra; os três passos numerados permanecem apenas no processo. Galeria com vinte fotos e legendas fora das imagens para facilitar a leitura.

Referência tipográfica: https://getdesign.md/ferrari/design-md e https://getdesign.md/design-md/ferrari/preview. Títulos com peso moderado e espaçamento controlado; navegação e botões em caixa alta. Archivo é a alternativa utilizada à FerrariSans, combinada com Manrope no texto. Não é a fonte proprietária da Ferrari. Licenças OFL incluídas em `assets/moderno`. Pesos estáticos WOFF2 evitam diferenças de interpretação de fontes variáveis entre navegadores.

## Imagens e interação

As mesmas vinte fotos foram exportadas para JPEG em 640, 1200 e 2000 pixels, sem alterar o conteúdo. Os originais somam aproximadamente 414 MB; o conjunto de 1200 pixels soma 4,4 MB. `srcset` escolhe a resolução conforme a tela, carregamento tardio adia imagens fora da vista e a galeria ampliada usa 2000 pixels. O tamanho efetivamente transferido depende da tela e da navegação.

Menu móvel, temas claro/escuro com preferência salva, links de WhatsApp e e-mail, galeria com anterior/próxima, teclado, contenção de foco e restauração da rolagem. O bloqueio da página na galeria usa posição fixa para o Safari do iPhone. Controles de pelo menos 44 pixels, suporte a áreas seguras e unidades de altura com fallback. O conteúdo não depende de animação ou JavaScript para aparecer.

## Validação

`validation-moderno.json` registra testes em WebKit, de 320 a 1920 pixels, incluindo retrato e paisagem: ausência de rolagem horizontal nos dois temas, menu móvel, persistência do tema, vinte imagens carregadas, galeria, teclado, restauração da rolagem e foco. Comparação automatizada confirma os textos, os destinos dos links e as descrições das fotos originais. Conferência visual adicional em Chromium.

WebKit executado no Windows não substitui uma conferência no Safari de um iPhone físico; nenhum aparelho físico foi usado.

Scripts opcionais de manutenção: `build-modern.py` (Pillow), `prepare-fonts.py` (fonttools e brotli, executar após o build) e `check-modern.py` (Playwright com WebKit). Eles não são necessários para abrir ou publicar o site.
