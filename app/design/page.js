'use client';

import Link from 'next/link';
import FigmaDesignRenderer from '../../components/FigmaDesignRenderer';
import { getAssetPath } from '@/lib/paths';
import { ArrowLeft, Figma } from 'lucide-react';

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href={getAssetPath('/')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <Link 
            href={getAssetPath('/figma')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Figma className="h-4 w-4" />
            Figma Integration
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Figma Design</h1>
          <p className="text-lg text-muted-foreground">
            Your complete Figma design rendered as a web interface
          </p>
        </div>

        {/* Design Renderer */}
        <FigmaDesignRenderer />
      </div>
    </div>
  );
}
