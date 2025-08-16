"use client"

import HomeContent from '@/content/home.mdx'
import MDXImage from '@/components/MDXImage'
import NextLink from 'next/link'
import { Button as RadixButton, Card as RadixCard, Heading, Text, Box, Grid } from '@radix-ui/themes'

// Inline MDX Button adapter using Radix Themes
function MDXButton({ href, variant = 'primary', children, ...props }) {
  // Map legacy variants from MDX to Radix variants
  const variantMap = {
    primary: 'solid',
    secondary: 'soft',
    outline: 'outline',
    ghost: 'ghost',
  }
  const radixVariant = variantMap[variant] || 'solid'

  if (href) {
    return (
      <RadixButton asChild variant={radixVariant} {...props}>
        <NextLink href={href}>{children}</NextLink>
      </RadixButton>
    )
  }
  return (
    <RadixButton variant={radixVariant} {...props}>{children}</RadixButton>
  )
}

export default function ClientHomeContent() {
  // Radix adapters for Card primitives used within MDX
  const Card = ({ children, ...props }) => (
    <RadixCard {...props}>{children}</RadixCard>
  )
  const CardHeader = ({ children, ...props }) => (
    <Box p="4" {...props}>{children}</Box>
  )
  const CardContent = ({ children, ...props }) => (
    <Box p="4" {...props}>{children}</Box>
  )
  const CardTitle = ({ children, ...props }) => (
    <Heading size="4" {...props}>{children}</Heading>
  )
  const CardDescription = ({ children, ...props }) => (
    <Text as="p" color="gray" size="2" {...props}>{children}</Text>
  )
  return (
    <HomeContent
      components={{
        img: MDXImage,
        Button: MDXButton,
        Grid,
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
      }}
    />
  )
}
