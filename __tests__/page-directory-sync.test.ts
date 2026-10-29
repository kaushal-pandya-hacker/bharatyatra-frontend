import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('BharatYatra Page Directory Continuous Sync Enforcement', () => {
  const rootDir = process.cwd();

  it('verifies all 4 page directory files (.docx, .docs, .md, .pdf) exist and reflect the exact count of pages in app/', () => {
    const docxPath = path.join(rootDir, 'BharatYatra_Pages_Directory.docx');
    const docsPath = path.join(rootDir, 'APP_PAGES_DIRECTORY.docs');
    const mdPath = path.join(rootDir, 'APP_PAGES_DIRECTORY.md');
    const pdfPath = path.join(rootDir, 'BharatYatra_Pages_Catalog.pdf');

    assert.ok(fs.existsSync(docxPath), 'BharatYatra_Pages_Directory.docx must exist');
    assert.ok(fs.existsSync(docsPath), 'APP_PAGES_DIRECTORY.docs must exist');
    assert.ok(fs.existsSync(mdPath), 'APP_PAGES_DIRECTORY.md must exist');
    assert.ok(fs.existsSync(pdfPath), 'BharatYatra_Pages_Catalog.pdf must exist');
    assert.ok(fs.statSync(pdfPath).size > 1000, 'PDF must be a valid non-empty document');

    // Count all page files in app/
    const appDir = path.join(rootDir, 'app');
    let actualPageCount = 0;
    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.startsWith('page.')) {
          actualPageCount++;
        }
      }
    }
    walk(appDir);

    assert.ok(actualPageCount > 100, `Expected >100 pages, found ${actualPageCount}`);

    // Verify .docs file matches
    const docsContent = fs.readFileSync(docsPath, 'utf8');
    const countMatch = docsContent.match(/Total Registered Pages:\*{0,2}\s*\*{0,2}(\d+)/i);
    assert.ok(countMatch, 'APP_PAGES_DIRECTORY.docs must declare Total Registered Pages');
    const documentedCount = parseInt(countMatch[1], 10);

    assert.strictEqual(
      documentedCount,
      actualPageCount,
      `Directory documentation is out of sync! Documented: ${documentedCount}, Actual in app/: ${actualPageCount}. Run 'npm run docs:pages' to synchronize.`
    );
  });
});
