with open('components/layout/footer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add useDiwali import
import_target = "import { SMART_QR_CONFIG } from '@/lib/config/smart-qr-config';"
import_replacement = """import { SMART_QR_CONFIG } from '@/lib/config/smart-qr-config';
import { useDiwali } from '@/lib/campaigns/diwali-context';"""

if import_target in code and "useDiwali" not in code:
    code = code.replace(import_target, import_replacement, 1)

# Add hook call
hook_target = "  const pathname = usePathname();"
hook_replacement = """  const pathname = usePathname();
  const { isDiwaliActive } = useDiwali();"""

if hook_target in code and "const { isDiwaliActive }" not in code:
    code = code.replace(hook_target, hook_replacement, 1)

# Add festive banner before bottom copyright
bottom_target = "        {/* BOTTOM COPYRIGHT & NEXIIFY DEVELOPER CREDIT                         */}"
bottom_replacement = """        {isDiwaliActive && (
          <div className="py-4 px-6 rounded-2xl bg-[#102A56]/60 border border-[#F5BD4F]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-base">🪔</span>
              <span className="text-xs font-black text-[#F5BD4F] uppercase tracking-wider">
                THIS DIWALI, DON&apos;T JUST CELEBRATE. EXPLORE INDIA.
              </span>
            </div>
            <span className="text-xs text-slate-300 font-medium">
              Every Destination Has a Story. Make Yours This Diwali.
            </span>
          </div>
        )}

        {/* BOTTOM COPYRIGHT & NEXIIFY DEVELOPER CREDIT                         */}"""

if bottom_target in code and "THIS DIWALI, DON" not in code:
    code = code.replace(bottom_target, bottom_replacement, 1)

with open('components/layout/footer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated footer.tsx with Diwali festive banner!")

