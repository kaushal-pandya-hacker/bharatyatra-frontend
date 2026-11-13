def update_modal(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    import_target = "import { Sparkles, Calendar, Compass, Route, DollarSign, X, Check, MapPin, Navigation, Car, Plane, Train, Bus, Bike } from 'lucide-react';"
    import_replacement = """import { Sparkles, Calendar, Compass, Route, DollarSign, X, Check, MapPin, Navigation, Car, Plane, Train, Bus, Bike } from 'lucide-react';
import { useDiwali } from '@/lib/campaigns/diwali-context';"""

    if import_target in code and "useDiwali" not in code:
        code = code.replace(import_target, import_replacement, 1)

    hook_target = "  const [currentView, setCurrentView] = useState<'PREFERENCES' | 'CALCULATING' | 'RECOMMENDATION'>('PREFERENCES');"
    hook_replacement = """  const { isDiwaliActive } = useDiwali();
  const [currentView, setCurrentView] = useState<'PREFERENCES' | 'CALCULATING' | 'RECOMMENDATION'>('PREFERENCES');"""

    if hook_target in code and "const { isDiwaliActive }" not in code:
        code = code.replace(hook_target, hook_replacement, 1)

    title_target = '<h2 className="text-xl font-black text-white">Personalize Your AI Journey</h2>'
    title_replacement = """<div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Personalize Your AI Journey</h2>
                {isDiwaliActive && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <span>🪔 Diwali Special</span>
                  </span>
                )}
              </div>"""

    if title_target in code and "Diwali Special" not in code:
        code = code.replace(title_target, title_replacement, 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Updated {filepath}")

update_modal('components/travel/AITripPersonalizationModal.tsx')
update_modal('18_DEVELOPMENT/Frontend/components/travel/AITripPersonalizationModal.tsx')

