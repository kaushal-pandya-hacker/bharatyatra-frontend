with open('components/nexi/NexiChatFloating.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add useDiwali import
import_target = "import { useNexi } from '@/lib/nexi/nexi-context';"
import_replacement = """import { useNexi } from '@/lib/nexi/nexi-context';
import { useDiwali } from '@/lib/campaigns/diwali-context';"""

code = code.replace(import_target, import_replacement, 1)

# Add useDiwali hook call
hook_target = "  const { isOpen, closeNexi, pendingPrompt, clearPendingPrompt } = useNexi();"
hook_replacement = """  const { isOpen, closeNexi, pendingPrompt, clearPendingPrompt } = useNexi();
  const { isDiwaliActive } = useDiwali();"""

code = code.replace(hook_target, hook_replacement, 1)

# Replace welcome message
old_welcome = """  // Initialize Welcome Message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'ASSISTANT',
          content: "Hi! I'm **NEXI**, your BharatYatra travel assistant 24/7.\\n\\nI can help you plan trips, understand your itinerary, check your bookings, suggest packing lists, and answer travel questions.",
          actions: [
            { type: 'OPEN_PLANNER', label: 'Plan a Trip' },
            { type: 'OPEN_TRIP', label: 'My Next Trip' },
            { type: 'OPEN_BOOKING', label: 'My Bookings' },
            { type: 'OPEN_PROFILE', label: 'Travel Preferences' },
          ],
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);"""

new_welcome = """  // Initialize Welcome Message on first open (Festive adaptive)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'ASSISTANT',
          content: isDiwaliActive
            ? "Namaste! 🪔 Ready to make this Diwali unforgettable? Let's plan your next journey across India!\\n\\nI can recommend festive holiday circuits, calculate realistic travel durations, recommend verified stays, and organize your family itinerary."
            : "Hi! I'm **NEXI**, your BharatYatra travel assistant 24/7.\\n\\nI can help you plan trips, understand your itinerary, check your bookings, suggest packing lists, and answer travel questions.",
          actions: isDiwaliActive
            ? [
                { type: 'OPEN_PLANNER', label: '🪔 Plan a Diwali Trip' },
                { type: 'OPEN_DESTINATIONS', label: 'Festive Destinations' },
                { type: 'OPEN_OFFERS', label: 'Diwali Travel Offers' },
                { type: 'OPEN_BOOKING', label: 'My Bookings' },
              ]
            : [
                { type: 'OPEN_PLANNER', label: 'Plan a Trip' },
                { type: 'OPEN_TRIP', label: 'My Next Trip' },
                { type: 'OPEN_BOOKING', label: 'My Bookings' },
                { type: 'OPEN_PROFILE', label: 'Travel Preferences' },
              ],
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, isDiwaliActive]);"""

code = code.replace(old_welcome.replace('\r\n', '\n'), new_welcome.replace('\r\n', '\n'))

# Add handlers in handleActionClick
action_target = "      case 'OPEN_PROFILE':\n        router.push('/profile');\n        closeNexi();\n        break;"
if action_target not in code:
    action_target = "      case 'OPEN_PROFILE':\r\n        router.push('/profile');\r\n        closeNexi();\r\n        break;"

action_replacement = """      case 'OPEN_PROFILE':
        router.push('/profile');
        closeNexi();
        break;

      case 'OPEN_DESTINATIONS':
        router.push('/destinations');
        closeNexi();
        break;

      case 'OPEN_OFFERS':
        router.push('/#diwali-offers');
        closeNexi();
        break;"""

code = code.replace(action_target, action_replacement, 1)

with open('components/nexi/NexiChatFloating.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully updated components/nexi/NexiChatFloating.tsx with Diwali AI greeting!")

