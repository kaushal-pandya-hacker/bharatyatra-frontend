with open('components/home/HomePageClient.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add imports
import_target = "import { VoiceSearchModal } from '@/components/accessibility/VoiceSearchModal';"
import_replacement = """import { VoiceSearchModal } from '@/components/accessibility/VoiceSearchModal';
import { useDiwali } from '@/lib/campaigns/diwali-context';
import { DiwaliHeroDeck } from '@/components/festive/DiwaliHeroDeck';
import { DiwaliOffersSection } from '@/components/festive/DiwaliOffersSection';
import { DiwaliDestinationsSection } from '@/components/festive/DiwaliDestinationsSection';"""

code = code.replace(import_target, import_replacement, 1)

# 2. Add useDiwali hook call
hook_target = "  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);"
hook_replacement = """  const { isDiwaliActive } = useDiwali();
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);"""

code = code.replace(hook_target, hook_replacement, 1)

# 3. Add conditional festive rendering
body_start = "        <div className=\"flex flex-col w-full\">\n          {/* SECTION 1: IMMERSIVE EDITORIAL HERO DECK */}"
if body_start not in code:
    body_start = "        <div className=\"flex flex-col w-full\">\r\n          {/* SECTION 1: IMMERSIVE EDITORIAL HERO DECK */}"

replacement_body = """        <div className="flex flex-col w-full">
          {isDiwaliActive ? (
            <>
              {/* DIWALI FESTIVE HERO DECK */}
              <DiwaliHeroDeck />

              {/* DIWALI TRAVEL OFFERS SECTION */}
              <DiwaliOffersSection />

              {/* DIWALI DESTINATIONS DISCOVERY */}
              <DiwaliDestinationsSection />
            </>
          ) : (
            <>
              {/* SECTION 1: IMMERSIVE EDITORIAL HERO DECK */}"""

code = code.replace(body_start, replacement_body, 1)

# 4. Close the ternary before SECTION 5
sec5_start = "          {/* SECTION 5: AI ITINERARY GENERATOR CALLOUT */}"
replacement_sec5 = """            </>
          )}

          {/* SECTION 5: AI ITINERARY GENERATOR CALLOUT */}"""

code = code.replace(sec5_start, replacement_sec5, 1)

with open('components/home/HomePageClient.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully updated components/home/HomePageClient.tsx with Diwali Festive Experience!")

