'use client'

import React from 'react'
import { getAssetPath } from '@/lib/paths'
import {
  Button,
  Card,
  Flex,
  Text,
  Heading,
  Separator,
  Tabs,
  Dialog,
  TextField,
  TextArea,
  Select,
  Switch,
  Slider,
  ScrollArea,
  Avatar,
  Tooltip,
  Badge,
  Box,
  Code,
  Section,
  Grid,
  Inset,
  AspectRatio,
  Link,
  Callout,
  Table,
} from '@radix-ui/themes'

export default function RadixDesignShowcase() {
  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }} p="4">
        <Flex direction="column" gap="6">
        <Box>
          <Heading size="8">Spoko Design System</Heading>
          <Text size="4" color="gray">Radix Themes components only</Text>
        </Box>

        {/* Radix Layout Examples (nested, first) */}
        <Card>
          <Flex direction="column" gap="3" p="4">
            <Heading size="4">Radix Layout Examples</Heading>
            <Text size="3" color="gray">Using Grid with two responsive columns</Text>
            <Grid columns={{ initial: '1', md: '2' }} gap="5" align="start">
              <Card>
                <Flex direction="column" gap="3" p="4">
                  <Heading size="4">Left Column</Heading>
                  <Text size="3" color="gray">Great for navigation, summaries, or side content.</Text>
                  <Button variant="soft">Primary action</Button>
                </Flex>
              </Card>
              <Card>
                <Flex direction="column" gap="3" p="4">
                  <Heading size="4">Right Column</Heading>
                  <Text size="3" color="gray">Main content area with additional details.</Text>
                  <Text size="2">Use Grid responsive props to adapt layout by breakpoint.</Text>
                </Flex>
              </Card>
            </Grid>
          </Flex>
        </Card>

        {/* Buttons */}
        <Card>
          <Flex direction="column" gap="3" p="4">
            <Heading size="4">Buttons</Heading>
            <Flex wrap="wrap" gap="3">
              <Button>Default</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button color="red">Destructive</Button>
            </Flex>
            <Flex align="center" gap="3">
              <Button size="1">Small</Button>
              <Button>Default</Button>
              <Button size="3">Large</Button>
            </Flex>
          </Flex>
        </Card>

        {/* (Removed) Standalone Page Layout Section moved to first card above */}

        {/* Grid Gallery with Images */}
        <Card>
          <Flex direction="column" gap="3" p="4">
            <Heading size="4">Image Gallery</Heading>
            <Text size="2" color="gray">Images are synced to <Code>/public/content/images</Code> and basePath-aware.</Text>
            <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <Inset clip="padding-box" side="top" p="0">
                    <AspectRatio ratio={16/9}>
                      <img
                        alt={`Gallery ${i}`}
                        src={getAssetPath('/content/images/spoko-animation.png')}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </AspectRatio>
                  </Inset>
                  <Flex direction="column" gap="2" p="3">
                    <Text weight="bold">Card {i}</Text>
                    <Text size="2" color="gray">Caption or description can go here.</Text>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Flex>
        </Card>

        {/* Content Sections with Callouts */}
        <Card>
          <Flex direction="column" gap="3" p="4">
            <Heading size="4">Callouts</Heading>
            <Callout.Root>
              <Callout.Icon>
                <Badge color="indigo">Info</Badge>
              </Callout.Icon>
              <Callout.Text>
                Use Callout to highlight important information with subtle emphasis.
              </Callout.Text>
            </Callout.Root>
            <Callout.Root color="red">
              <Callout.Text>Destructive actions should be clearly communicated.</Callout.Text>
            </Callout.Root>
          </Flex>
        </Card>

        {/* Data Table */}
        <Card>
          <Flex direction="column" gap="3" p="4">
            <Heading size="4">Table</Heading>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Project</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.RowHeaderCell>Homepage</Table.RowHeaderCell>
                  <Table.Cell>Live</Table.Cell>
                  <Table.Cell>Alex</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.RowHeaderCell>Docs</Table.RowHeaderCell>
                  <Table.Cell>WIP</Table.Cell>
                  <Table.Cell>Sam</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.RowHeaderCell>Design</Table.RowHeaderCell>
                  <Table.Cell>Planned</Table.Cell>
                  <Table.Cell>Uma</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Flex>
        </Card>

        {/* Tabs */}
        <Card>
          <Flex direction="column" gap="3" p="4">
            <Heading size="4">Tabs</Heading>
            <Tabs.Root defaultValue="one">
              <Tabs.List>
                <Tabs.Trigger value="one">One</Tabs.Trigger>
                <Tabs.Trigger value="two">Two</Tabs.Trigger>
                <Tabs.Trigger value="three">Three</Tabs.Trigger>
              </Tabs.List>
              <Box pt="3">
                <Tabs.Content value="one"><Text>Tab one content</Text></Tabs.Content>
                <Tabs.Content value="two"><Text>Tab two content</Text></Tabs.Content>
                <Tabs.Content value="three"><Text>Tab three content</Text></Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>
        </Card>

        {/* Dialog */}
        <Card>
          <Flex direction="column" gap="3" p="4">
            <Heading size="4">Dialog</Heading>
            <Dialog.Root>
              <Dialog.Trigger>
                <Button>Open Dialog</Button>
              </Dialog.Trigger>
              <Dialog.Content maxWidth="450px">
                <Dialog.Title>Radix Dialog</Dialog.Title>
                <Dialog.Description>Simple dialog using Radix Themes</Dialog.Description>
                <Separator my="3" />
                <Flex gap="3" justify="end">
                  <Dialog.Close>
                    <Button variant="soft">Close</Button>
                  </Dialog.Close>
                  <Button>Confirm</Button>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
        </Card>

        {/* Forms */}
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Heading size="4">Form Inputs</Heading>
            <Flex direction="column" gap="3">
              <Text as="label">Email</Text>
              <TextField.Root placeholder="you@example.com" />
            </Flex>
            <Flex direction="column" gap="3">
              <Text as="label">Message</Text>
              <TextArea placeholder="Type your message here" rows={4} />
            </Flex>
            <Flex direction="column" gap="3" maxWidth="240px">
              <Text as="label">Select Country</Text>
              <Select.Root defaultValue="ca">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="us">United States</Select.Item>
                  <Select.Item value="ca">Canada</Select.Item>
                  <Select.Item value="pl">Poland</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
        </Card>

        {/* Toggles & Inputs */}
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Heading size="4">Toggles & Inputs</Heading>
            <Flex align="center" gap="3">
              <Text>Notifications</Text>
              <Switch defaultChecked />
            </Flex>
            <Flex direction="column" gap="3" maxWidth="320px">
              <Text>Slider</Text>
              <Slider defaultValue={[50]} />
            </Flex>
          </Flex>
        </Card>

        {/* Scroll & Avatar & Tooltip */}
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Heading size="4">Misc</Heading>
            <Flex align="center" gap="3">
              <Badge>Badge</Badge>
              <Tooltip content="I am a tooltip">
                <Button variant="soft">Hover me</Button>
              </Tooltip>
            </Flex>
            <Flex gap="3">
              <Avatar fallback="SU" size="3" />
              <Avatar fallback="AL" size="3" />
              <Avatar fallback="AD" size="3" />
            </Flex>
            <Text size="2">Scroll Area</Text>
            <ScrollArea type="auto" style={{ height: 140 }}>
              <Flex direction="column" gap="2" p="2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Card key={i}>
                    <Flex p="2">Row {i + 1}</Flex>
                  </Card>
                ))}
              </Flex>
            </ScrollArea>
          </Flex>
        </Card>
      </Flex>
    </Box>
    </Section>
  )
}
