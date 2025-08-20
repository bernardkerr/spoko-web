import { Box } from '@radix-ui/themes'

export default function FeatureBox({ children, ...props }) {
  return (
    <Box 
      p="4" 
      style={{ 
        border: '1px solid var(--gray-a6)', 
        borderRadius: 'var(--radius-3)' 
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
