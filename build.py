import re,pathlib
r=pathlib.Path(__file__).parent
svg=(r/"assets/brand/orbit-logo-nav.svg").read_text()
inner=re.search(r"<svg[^>]*>(.*)</svg>",svg,re.S).group(1)
vb=re.search(r'viewBox="([^"]+)"',svg).group(1)
inner=inner.replace("#092D3F","currentColor").replace('id="m"','id="mn"').replace('url(#m)','url(#mn)')
logo=f'<svg viewBox="{vb}" aria-hidden="true">{inner}</svg>'
foot=logo.replace('id="mn"','id="mf"').replace("url(#mn)","url(#mf)")

# Chrome blocks CSS mask images over file:// (no CORS), so the tool icons are inlined as data URIs
import urllib.parse
def _icon(m):
    d=(r/"assets"/"icons"/m.group(1)).read_text().strip()
    return "url('data:image/svg+xml,"+urllib.parse.quote(d,safe="/:=() ,;")+"')"
html=(r/"index.src.html").read_text().replace("{{NAVLOGO}}",logo).replace("{{FOOTLOGO}}",foot)
html=re.sub(r"url\(icons/([a-z]+\.svg)\)",_icon,html)
(r/"index.html").write_text(html)
print("built",len(html))
