// DEPRECATED: This file is intentionally disabled per request to remove the
// legacy DesignShowcase (shadcn/custom components). Do not import or use.
// If you need this file permanently gone, delete it from the repo.

export default function DesignShowcase() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('DesignShowcase is deprecated and must not be used.')
  }
  return null
}

'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Plus, ExternalLink, Info, AlertTriangle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'

export default function DesignShowcase() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Spoko Design System</h1>
          <p className="text-lg text-muted-foreground">Real ShadCN components styled with site tokens / Radix tokens</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Variants and sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="icon button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />Add
                </Button>
                <Button>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </Button>
                <Button asChild variant="link" className="gap-1">
                  <Link href="https://spoko.dev" target="_blank" rel="noreferrer">
                    External Link
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scroll Area */}
          <Card>
            <CardHeader>
              <CardTitle>Scroll Area</CardTitle>
              <CardDescription>Overflow content</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea style={{ height: 140 }}>
                <div className="space-y-2 p-2 text-sm">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="rounded border bg-card p-2">Row {i + 1}</div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Content switching</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="billing" disabled>
                    Billing (disabled)
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="mt-4 text-sm text-muted-foreground">
                  Make changes to your account here.
                </TabsContent>
                <TabsContent value="password" className="mt-4 text-sm text-muted-foreground">
                  Change your password here.
                </TabsContent>
                <TabsContent value="billing" className="mt-4 text-sm text-muted-foreground">
                  Update your billing information here.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Dialog */}
          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
              <CardDescription>Modal interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                      This is a dialog using ShadCN's dialog component.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Alerts and Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Alert</CardTitle>
              <CardDescription>Status messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can use alerts to convey important information.
                </AlertDescription>
              </Alert>
              <Alert className="border-destructive/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  Please try again later.
                </AlertDescription>
              </Alert>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card */}
          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>Container example</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Cards are flexible content containers with multiple variants and options.</p>
              <div className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Headings and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <h3 className="text-2xl font-semibold">Heading 3</h3>
              <h4 className="text-xl font-medium">Heading 4</h4>
              <p className="text-sm text-muted-foreground">
                Body text uses tokens: foreground/muted-foreground. This matches the site theme.
              </p>
              <p className="text-sm">
                Links can be styled with brand color: <a href="#" className="text-primary underline-offset-4 hover:underline">Learn more</a>
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge>Label</Badge>
                <Badge variant="secondary">Meta</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tokens (colors) */}
          <Card>
            <CardHeader>
              <CardTitle>Design Tokens</CardTitle>
              <CardDescription>Key color tokens preview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-md border p-3">
                  <div className="h-10 w-full rounded bg-background border" />
                  <div className="mt-2">background</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="h-10 w-full rounded bg-foreground" />
                  <div className="mt-2">foreground</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="h-10 w-full rounded bg-primary" />
                  <div className="mt-2">primary</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="h-10 w-full rounded bg-secondary" />
                  <div className="mt-2">secondary</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="h-10 w-full rounded bg-accent" />
                  <div className="mt-2">accent</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="h-10 w-full rounded bg-destructive" />
                  <div className="mt-2">destructive</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Separator */}
          <Card>
            <CardHeader>
              <CardTitle>Separator</CardTitle>
              <CardDescription>Dividing content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">Above content</div>
              <Separator />
              <div className="text-sm">Below content</div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Completion indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[20, 45, 75, 100].map((val) => (
                <div key={val} className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{val}%</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Slider */}
          <Card>
            <CardHeader>
              <CardTitle>Slider</CardTitle>
              <CardDescription>Numeric input</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider defaultValue={30} />
              <Slider defaultValue={70} />
            </CardContent>
          </Card>

          {/* Forms */}
          <Card>
            <CardHeader>
              <CardTitle>Forms</CardTitle>
              <CardDescription>Inputs and textareas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
                <p className="text-xs text-muted-foreground">We'll never share your email.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={4} placeholder="Type your message here" />
              </div>
            </CardContent>
          </Card>

          {/* Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Selection</CardTitle>
              <CardDescription>Checkboxes, radios, switch, select</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="chk1" />
                  <Label htmlFor="chk1">Accept terms</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="chk2" defaultChecked />
                  <Label htmlFor="chk2">Subscribe to updates</Label>
                </div>
              </div>
              <div className="space-y-2">
                <RadioGroup name="plan">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="r1" value="basic" defaultChecked />
                    <Label htmlFor="r1">Basic</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="r2" value="pro" />
                    <Label htmlFor="r2">Pro</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Select</Label>
                <Select id="country" defaultValue="ca">
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                  <option value="pl">Poland</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Switch</Label>
                <div className="flex items-center gap-3">
                  <Switch defaultChecked />
                  <span className="text-muted-foreground">Enable notifications</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>User identity</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar name="Spoko User" />
              <Avatar name="Ada Lovelace" />
              <Avatar name="Alan Turing" />
            </CardContent>
          </Card>
        </div>

        {/* Note about coverage */}
        <p className="mt-8 text-sm text-muted-foreground">
          Note: This showcase currently includes core components available in the codebase. I can extend it to cover additional ShadCN components (e.g., Checkbox, Select, Tooltip, etc.) or map specific Figma components you care about.
        </p>
      </div>
    </div>
  )
}
