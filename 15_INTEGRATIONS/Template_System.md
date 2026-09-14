# Versioned Template Engine & Localization Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Overview & Immutable Versioning

`NotificationTemplateEngine` manages versioned notification templates. Templates are stored with version tags (`v1.0`, `v1.1`) and are immutable. Older template versions are retained for historical audit and debugging.

## 2. Localization Strategy

Supported Locales:
- `en`: English (Default)
- `gu`: Gujarati
- `hi`: Hindi

Critical transactional templates are pre-translated and approved to guarantee accuracy. Dynamic AI translation is never used for financial or booking confirmations.

## 3. Variable Injection Safeguards

Variables (`{{user_name}}`, `{{booking_reference}}`, `{{amount}}`, `{{destination}}`) are safely interpolated. Unsafe code/script injection in template variables is strictly sanitized and blocked.
