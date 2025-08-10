'use client';

import Link from 'next/link';
import FigmaIntegrationClean from '../../components/FigmaIntegrationClean';
import { getAssetPath } from '@/lib/paths';
import { ArrowLeft } from 'lucide-react';

export default function FigmaPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <Link 
          href={getAssetPath('/')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <FigmaIntegrationClean />
      </div>
    </div>
  );
}
