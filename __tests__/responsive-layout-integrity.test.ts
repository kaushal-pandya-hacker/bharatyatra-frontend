import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('BharatYatra Comprehensive Responsive Engineering & Layout Contract', () => {
  const rootDir = process.cwd();

  it('1. Root Layout exports comprehensive mobile viewport with viewportFit cover', () => {
    const layoutPath = path.join(rootDir, 'app', 'layout.tsx');
    assert.ok(fs.existsSync(layoutPath), 'app/layout.tsx must exist');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    assert.match(layoutContent, /viewportFit:\s*'cover'/, 'Viewport must configure viewportFit: cover for notch & modern mobile screen displays');
    assert.match(layoutContent, /width:\s*'device-width'/, 'Viewport must set width to device-width');
    assert.match(layoutContent, /initialScale:\s*1/, 'Viewport must set initialScale: 1');
  });

  it('2. Global Styles enforce zero page-level horizontal overflow and fluid media scaling', () => {
    const cssPath = path.join(rootDir, 'styles', 'globals.css');
    assert.ok(fs.existsSync(cssPath), 'styles/globals.css must exist');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Horizontal overflow containment
    assert.match(cssContent, /overflow-x:\s*hidden;/, 'html and body must contain overflow-x to prevent side-scrolling jitter');
    assert.match(cssContent, /max-width:\s*100vw;/, 'html/body must be constrained to 100vw');

    // Dynamic viewport height
    assert.match(cssContent, /min-height:\s*100dvh;/, 'Body must leverage dynamic viewport height (100dvh)');

    // Universal media responsiveness
    assert.match(cssContent, /img,\s*video,\s*canvas,\s*svg\s*\{[^}]*max-width:\s*100%/, 'Media elements must scale within container');

    // iOS Safari auto-zoom prevention (<768px font-size: 16px)
    assert.match(cssContent, /@media screen and \(max-width:\s*768px\)/, 'Mobile media query must enforce 16px input font size to prevent iOS zoom');
  });

  it('3. Tailwind design system includes dedicated mobile margins and typography tokens', () => {
    const twPath = path.join(rootDir, 'tailwind.config.ts');
    assert.ok(fs.existsSync(twPath), 'tailwind.config.ts must exist');
    const twContent = fs.readFileSync(twPath, 'utf8');

    assert.match(twContent, /'margin-mobile':\s*'1rem'/, 'tailwind.config.ts must define margin-mobile spacing token');
    assert.match(twContent, /'gutter-mobile':\s*'1rem'/, 'tailwind.config.ts must define gutter-mobile spacing token');
    assert.match(twContent, /'title-lg':/, 'tailwind.config.ts must define title-lg font-size token');
    assert.match(twContent, /'title-md':/, 'tailwind.config.ts must define title-md font-size token');
    assert.match(twContent, /'label-md':/, 'tailwind.config.ts must define label-md font-size token');
  });

  it('4. Floating destination bar respects responsive bounds without off-screen bleed', () => {
    const barPath = path.join(rootDir, 'components', 'travel', 'GlobalDestinationSelectionBar.tsx');
    assert.ok(fs.existsSync(barPath), 'GlobalDestinationSelectionBar must exist');
    const barContent = fs.readFileSync(barPath, 'utf8');

    // Must not combine left-4 right-4 with unconstrained w-full
    assert.doesNotMatch(
      barContent,
      /left-4 right-4 [^"]*max-w-2xl w-full/,
      'GlobalDestinationSelectionBar must not use left-4 right-4 with unconstrained w-full on mobile'
    );
    assert.match(barContent, /w-\[calc\(100%-2rem\)\]\s*sm:w-full/, 'GlobalDestinationSelectionBar must use safe computed mobile width');
  });

  it('5. Floating bottom controls provide clearance above MobileBottomNav', () => {
    const g100Path = path.join(rootDir, 'components', 'travel', 'Gujarat100LandmarksDirectory.tsx');
    assert.ok(fs.existsSync(g100Path), 'Gujarat100LandmarksDirectory must exist');
    const g100Content = fs.readFileSync(g100Path, 'utf8');

    assert.match(
      g100Content,
      /fixed bottom-20 md:bottom-6/,
      'Gujarat100LandmarksDirectory floating bar must clear MobileBottomNav on mobile devices'
    );
  });

  it('6. Header and MobileBottomNav provide accessible 44px+ touch targets', () => {
    const headerPath = path.join(rootDir, 'components', 'layout', 'header.tsx');
    const bottomNavPath = path.join(rootDir, 'components', 'layout', 'mobile-bottom-nav.tsx');
    assert.ok(fs.existsSync(headerPath), 'header.tsx must exist');
    assert.ok(fs.existsSync(bottomNavPath), 'mobile-bottom-nav.tsx must exist');

    const headerContent = fs.readFileSync(headerPath, 'utf8');
    const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf8');

    assert.match(headerContent, /min-h-\[44px\]\s*min-w-\[44px\]/, 'Header mobile hamburger button must have at least 44x44px touch target');
    assert.match(bottomNavContent, /min-h-\[48px\]\s*min-w-\[56px\]/, 'MobileBottomNav items must exceed 44px minimum touch targets');
  });
});
