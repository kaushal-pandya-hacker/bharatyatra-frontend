import os
import re

app_dir = 'app'
metadata_files = []

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file).replace('\\', '/')
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'metadata' in content.lower() or 'canonical' in content.lower() or 'bharatyatra' in content.lower():
                metadata_files.append((path, content))

print(f"Total candidate files scanned: {len(metadata_files)}")

issues = []
for path, content in metadata_files:
    # check for bharatyatra.com in URLs
    com_urls = re.findall(r'https?://[^\s\'"`,;)]*bharatyatra\.com[^\s\'"`,;)]*', content)
    # check for canonical definitions
    canonicals = re.findall(r'canonical\s*:\s*[\'"`]([^\'"`]+)[\'"`]', content)
    # check for metadataBase
    metadatabase = re.findall(r'metadataBase\s*:\s*new URL\([\'"`]([^\'"`]+)[\'"`]\)', content)
    # check for openGraph url
    og_urls = re.findall(r'url\s*:\s*[\'"`](https?://[^\'"`]*bharatyatra[^\'"`]*)[\'"`]', content)
    
    # check for non-www bharatyatra.in in canonical or og_url
    non_www_in = re.findall(r'https?://bharatyatra\.in[^\s\'"`,;)]*', content)
    
    if com_urls or canonicals or metadatabase or og_urls or non_www_in:
        issues.append({
            'path': path,
            'com_urls': com_urls,
            'canonicals': canonicals,
            'metadatabase': metadatabase,
            'og_urls': og_urls,
            'non_www_in': non_www_in
        })

print(f"\nFound {len(issues)} files with canonical/metadataBase/URLs:")
for iss in issues:
    print(f"\nFile: {iss['path']}")
    if iss['metadatabase']:
        print(f"  metadataBase: {iss['metadatabase']}")
    if iss['canonicals']:
        print(f"  canonicals: {iss['canonicals']}")
    if iss['og_urls']:
        print(f"  og_urls: {iss['og_urls']}")
    if iss['com_urls']:
        print(f"  .com URLs: {iss['com_urls']}")
    if iss['non_www_in']:
        print(f"  non-www .in: {iss['non_www_in']}")

