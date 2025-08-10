'use client';

import Link from 'next/link';
import { getAssetPath } from '@/lib/paths';
import { ArrowLeft, Figma } from 'lucide-react';
import Cover from '@/components/generated/Cover';
import Separator from '@/components/generated/Separator';
import Slider from '@/components/generated/Slider';
import Switch from '@/components/generated/Switch';
import Tabs from '@/components/generated/Tabs';
import TextArea from '@/components/generated/TextArea';
import Tooltip from '@/components/generated/Tooltip';
import Popover from '@/components/generated/Popover';
import Progress from '@/components/generated/Progress';
import RadioGroup from '@/components/generated/RadioGroup';
import ScrollArea from '@/components/generated/ScrollArea';
import Select from '@/components/generated/Select';
import HoverCard from '@/components/generated/HoverCard';
import Inout from '@/components/generated/Inout';
import Label from '@/components/generated/Label';
import Menubar from '@/components/generated/Menubar';
import NavigationMenu from '@/components/generated/NavigationMenu';
import Checkbox from '@/components/generated/Checkbox';
import Collapsible from '@/components/generated/Collapsible';
import Command from '@/components/generated/Command';
import ContextMenu from '@/components/generated/ContextMenu';
import Dialog from '@/components/generated/Dialog';
import DropdownMenu from '@/components/generated/DropdownMenu';
import Accordion from '@/components/generated/Accordion';
import AlertDialog from '@/components/generated/AlertDialog';
import AspectRatio from '@/components/generated/AspectRatio';
import Avatar from '@/components/generated/Avatar';
import Button from '@/components/generated/Button';
import Typography from '@/components/generated/Typography';
import Frame7 from '@/components/generated/Frame7';

export default function GeneratedDesignPage() {
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
          <h1 className="text-4xl font-bold mb-2">@shadcn/ui - Design System (Community)</h1>
          <p className="text-lg text-muted-foreground">
            Your Figma design converted to React components
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Generated from 7 page(s) • 31 component(s)
          </p>
        </div>

        {/* Generated Components Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Cover />
        <Separator />
        <Slider />
        <Switch />
        <Tabs />
        <TextArea />
        <Tooltip />
        <Popover />
        <Progress />
        <RadioGroup />
        <ScrollArea />
        <Select />
        <HoverCard />
        <Inout />
        <Label />
        <Menubar />
        <NavigationMenu />
        <Checkbox />
        <Collapsible />
        <Command />
        <ContextMenu />
        <Dialog />
        <DropdownMenu />
        <Accordion />
        <AlertDialog />
        <AspectRatio />
        <Avatar />
        <Button />
        <Typography />
        <Frame7 />
        </div>
      </div>
    </div>
  );
}