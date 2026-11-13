file_path = 'node_modules/next/dist/compiled/@next/font/dist/google/loader.js'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

target = "const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];"
replacement = "const extMatch = /\\.(woff|woff2|eot|ttf|otf)($|\\?)/.exec(googleFontFileUrl); const ext = extMatch ? extMatch[1] : 'woff2';"

if target in code:
    code = code.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: loader.js patched!")
else:
    print("TARGET NOT FOUND in loader.js")

