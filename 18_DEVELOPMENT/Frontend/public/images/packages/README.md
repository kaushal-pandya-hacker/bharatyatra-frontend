# BharatYatra Package Image Repository Directory Structure

Place high-resolution WebP or JPG package hero & gallery images in these dedicated directories:

- `/public/images/packages/gujarat/`
  - `/somnath-dwarka/hero.webp`, `01.webp`, `02.webp`
  - `/rann-of-kutch/hero.webp`, `01.webp`, `02.webp`
  - `/statue-of-unity/hero.webp`, `01.webp`, `02.webp`
  - `/gir-wildlife/hero.webp`, `01.webp`
- `/public/images/packages/rajasthan/`
  - `/golden-triangle/hero.webp`
  - `/royal-heritage/hero.webp`
- `/public/images/packages/goa/`
  - `/beach-escape/hero.webp`
- `/public/images/packages/kerala/`
  - `/backwaters-hills/hero.webp`
- `/public/images/packages/himachal-pradesh/`
  - `/mountain-odyssey/hero.webp`
- `/public/images/packages/uttarakhand/`
  - `/char-dham/hero.webp`
- `/public/images/packages/jammu-kashmir/`
  - `/kashmir-paradise/hero.webp`
- `/public/images/packages/ladakh/`
  - `/high-pass/hero.webp`
- `/public/images/packages/maharashtra/`
- `/public/images/packages/madhya-pradesh/`
- `/public/images/packages/uttar-pradesh/`
- `/public/images/packages/tamil-nadu/`
- `/public/images/packages/karnataka/`
- `/public/images/packages/odisha/`
- `/public/images/packages/west-bengal/`
- `/public/images/packages/northeast/`

Image Handling Rule: If an image has not yet been uploaded to these paths, the `getPackageImageUrl()` fallback system automatically renders a high-res Unsplash destination visual, keeping production UI polished.
