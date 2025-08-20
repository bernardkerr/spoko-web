"use client"

import HomeContent from '@/content/home.mdx'
import MDXImage from '@/components/MDXImage'
import FeatureBox from '@/components/FeatureBox'
import NextLink from 'next/link'
import { Button, Heading, Text, Box, Grid, Flex } from '@radix-ui/themes'

export default function ClientHomeContent() {
  return (
    <HomeContent
      components={{
        // Markdown elements
        h1: (props) => <Heading as="h1" size="9" mb="2" {...props} />,
        img: MDXImage,
        // Custom components
        FeatureBox,
        // Radix primitives exposed to MDX
        Box,
        Grid,
        Flex,
        Heading,
        Text,
        Button,
        NextLink,
      }}
    />
  )
}
