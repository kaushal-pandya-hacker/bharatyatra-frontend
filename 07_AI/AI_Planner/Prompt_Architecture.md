# Prompt Architecture & Injection Defense v1.0

## 1. Structure
- **System Prompt**: Enforces system identity, schema enforcement, and grounding in verified facts.
- **Context Injection**: Verified facts from `normalized_facts.json` injected as structured bullet points.
- **User Request**: User intent & preferences passed inside a bounded `USER REQUEST:` section.

## 2. Security Defense
- Natural language prompts are passed through `IntentExtractor.sanitize_prompt()`.
- Untrusted text is NEVER evaluated as system instructions.
- System prompt instructs LLM to treat retrieved travel facts strictly as DATA.
