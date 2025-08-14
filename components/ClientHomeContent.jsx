"use client"

import HomeContent from '@/content/home.mdx'
import { getAssetPath } from '@/lib/paths'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import GeneratedButton from '@/components/generated/Button'

export default function ClientHomeContent() {
  return (
    <HomeContent
      components={{
        Button: GeneratedButton,
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
      }}
    />
  )
}
