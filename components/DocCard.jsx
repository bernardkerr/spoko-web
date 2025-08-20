import { Card, Box } from '@radix-ui/themes'

export default function DocCard({ children, ...props }) {
  return (
    <Card {...props}>
      <Box p="4">
        {children}
      </Box>
    </Card>
  )
}
