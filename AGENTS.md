# BharatYatra — Engineering Guidelines & Operational Rules

## 1. Page Catalog & Architecture Directory Maintenance Rule

> **MANDATORY RULE:** Whenever a page is **added**, **renamed**, or **removed** anywhere under the `app/` directory:
> 
> 1. You **MUST** run the automated directory generator:
>    ```bash
>    npm run docs:pages
>    # or: python scripts/generate_pages_directory.py
>    ```
> 2. Ensure all three directory documentation artifacts are updated:
>    - `BharatYatra_Pages_Directory.docx` (Official Microsoft Word / Google Docs format)
>    - `APP_PAGES_DIRECTORY.docs` (Structured document format)
>    - `APP_PAGES_DIRECTORY.md` (Repository markdown reference with file links)
> 3. Verify that the total page count reflects the true number of registered Next.js App Router routes.
> 4. Stage and commit the updated directory files alongside the page code changes.

---

## 2. Senior Developer Scope & Token Discipline
- Simple fix/feature (< ~20 lines logic) -> write ONLY exact lines needed, not full file rewrites.
- Preserve existing functions and comments.
- Run type checks (`npm run type-check`) and test suites before committing.
