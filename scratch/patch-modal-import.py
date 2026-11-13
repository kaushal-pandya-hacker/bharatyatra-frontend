def patch(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    import_line = "import { useRouter } from 'next/navigation';"
    if import_line in c and "useDiwali" not in c:
        c = c.replace(import_line, import_line + "\nimport { useDiwali } from '@/lib/campaigns/diwali-context';", 1)

    hook_line = "const { selectedDestinations, selectedCount, uniqueStatesCount } = useDestinationSelection();"
    if hook_line in c and "const { isDiwaliActive }" not in c:
        c = c.replace(hook_line, hook_line + "\n  const { isDiwaliActive } = useDiwali();", 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f"Patched {filepath}")

patch('components/travel/AITripPersonalizationModal.tsx')
patch('18_DEVELOPMENT/Frontend/components/travel/AITripPersonalizationModal.tsx')

