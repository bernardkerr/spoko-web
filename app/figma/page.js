'use client';

import Link from 'next/link';
import FigmaDesignSystem from '../../components/FigmaDesignSystem';
import { getAssetPath } from '@/lib/paths';
import { ArrowLeft } from 'lucide-react';

// Sample design tokens (these would be loaded from your actual Figma sync)
const sampleTokens = {
  colors: {
    'primary': '#3b82f6',
    'secondary': '#64748b',
    'accent': '#8b5cf6',
    'success': '#10b981',
    'warning': '#f59e0b',
    'error': '#ef4444',
    'background': '#ffffff',
    'foreground': '#0f172a',
  },
  typography: {
    'heading-1': {
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1.2',
    },
    'heading-2': {
      fontSize: '36px',
      fontWeight: '600',
      lineHeight: '1.3',
    },
    'body-large': {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.6',
    },
    'body': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    'caption': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.4',
    },
  },
  spacing: {
    'xs': '4px',
    'sm': '8px',
    'md': '16px',
    'lg': '24px',
    'xl': '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  effects: {
    'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

export default function FigmaPage() {
  const handleSync = async () => {
    // This would trigger the actual Figma sync
    console.log('Syncing with Figma...');
    
    // In a real implementation, you would:
    // 1. Call your Figma API
    // 2. Update the design tokens
    // 3. Regenerate CSS/Tailwind config
    // 4. Refresh the component
    
    // For now, we'll just simulate a sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Sync complete!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <Link 
          href={getAssetPath('/')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <FigmaDesignSystem tokens={sampleTokens} onSync={handleSync} />
    </div>
  );
}
