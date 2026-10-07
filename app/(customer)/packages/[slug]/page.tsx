import PackageClient from './PackageClient';

export function generateStaticParams() {
  return [
    { slug: 'gujarat-heritage-tour' },
    { slug: 'somnath-dwarka-spiritual' },
    { slug: 'rann-of-kutch-experience' },
    { slug: 'statue-of-unity-express' },
    { slug: 'gir-wildlife-safari' },
  ];
}

export default function PackageDetailPage() {
  return <PackageClient />;
}
