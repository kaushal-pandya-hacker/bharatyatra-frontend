# Fix GlobalDestinationSelectionBar.tsx line 72
for path in [
    'components/travel/GlobalDestinationSelectionBar.tsx',
    '18_DEVELOPMENT/Frontend/components/travel/GlobalDestinationSelectionBar.tsx'
]:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("onClick={() => setIsAIModalOpen(true)}", "onClick={() => router.push('/onboarding?flow=plan')}")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {path} line 72!")

