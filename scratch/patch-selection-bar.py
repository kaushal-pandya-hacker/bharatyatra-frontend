import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace import
    content = content.replace("import { usePathname } from 'next/navigation';", "import { usePathname, useRouter } from 'next/navigation';")
    content = re.sub(r"import dynamic from 'next/dynamic';\s*const AITripPersonalizationModal = dynamic\([\s\S]*?\);\n?", "", content)

    # Insert router hook
    content = content.replace("const pathname = usePathname();", "const pathname = usePathname();\n  const router = useRouter();")

    # Replace modal trigger with router push
    content = content.replace("setIsAIModalOpen(true);", "router.push('/onboarding?flow=plan');")

    # Remove modal state if present
    content = content.replace("const [isAIModalOpen, setIsAIModalOpen] = useState(false);\n", "")

    # Remove modal component render at bottom
    content = re.sub(r"\{\s*/\*\s*AI Trip Personalization Modal\s*\*/\s*\}[\s\S]*?\{isAIModalOpen && \([\s\S]*?<AITripPersonalizationModal[\s\S]*?/>[\s\S]*?\)\}\n?", "", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {filepath} successfully!")

patch_file('components/travel/GlobalDestinationSelectionBar.tsx')
patch_file('18_DEVELOPMENT/Frontend/components/travel/GlobalDestinationSelectionBar.tsx')

