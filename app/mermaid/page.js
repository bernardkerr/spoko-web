import { Mermaid } from '@/components/Mermaid'
import { Section, Box, Grid, Card, Heading, Text } from '@radix-ui/themes'

const flowchartCode = `
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix Issues]
    E --> B
    C --> F[Deploy]
    F --> G[End]
`

const sequenceCode = `
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server->>Database: Query Data
    Database-->>Server: Return Data
    Server-->>Browser: HTTP Response
    Browser-->>User: Display Page
`

const classCode = `
classDiagram
    class User
    class Post
    class Comment
    User --> Post
    Post --> Comment
`

const gitGraphCode = `
gitgraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add feature A"
    commit id: "Add feature B"
    checkout main
    merge develop
    commit id: "Release v1.0"
    branch hotfix
    checkout hotfix
    commit id: "Fix critical bug"
    checkout main
    merge hotfix
    commit id: "Release v1.0.1"
`

export default function MermaidPage() {
  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5">
          <Heading size="9">Mermaid Diagrams</Heading>
          <Text as="p" color="gray" size="4">
            Beautiful diagrams and flowcharts with site-themed Mermaid integration. These diagrams automatically adapt to your light/dark theme preferences.
          </Text>
        </Box>

        <Grid columns={{ initial: '1', md: '2' }} gap="5">
          <Card>
            <Box p="4">
              <Heading size="4" mb="2">Flowchart</Heading>
              <Text color="gray" size="2" mb="3">A simple decision flowchart showing a typical debugging process.</Text>
              <Mermaid code={`
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix Issues]
    E --> B
    C --> F[Deploy]
    F --> G[End]
`} />
            </Box>
          </Card>

          <Card>
            <Box p="4">
              <Heading size="4" mb="2">Sequence Diagram</Heading>
              <Text color="gray" size="2" mb="3">Visualizing the interaction between user, browser, server, and database.</Text>
              <Mermaid code={`
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server->>Database: Query Data
    Database-->>Server: Return Data
    Server-->>Browser: HTTP Response
    Browser-->>User: Display Page
`} />
            </Box>
          </Card>

          <Card>
            <Box p="4">
              <Heading size="4" mb="2">Class Diagram</Heading>
              <Text color="gray" size="2" mb="3">Object-oriented design showing relationships between User, Post, and Comment entities.</Text>
              <Mermaid code={`
classDiagram
    class User {
        +int id
        +string name
        +string email
        +createPost()
        +deletePost()
    }
    class Post {
        +int id
        +string title
        +string content
        +Date createdAt
        +addComment()
    }
    class Comment {
        +int id
        +string text
        +Date createdAt
    }
    User "1" --> "*" Post : creates
    Post "1" --> "*" Comment : has
`} />
            </Box>
          </Card>

          <Card>
            <Box p="4">
              <Heading size="4" mb="2">Git Graph</Heading>
              <Text color="gray" size="2" mb="3">A Git workflow visualization showing branching, merging, and releases.</Text>
              <Mermaid code={`
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add feature A"
    commit id: "Add feature B"
    checkout main
    merge develop
    commit id: "Release v1.0"
    branch hotfix
    checkout hotfix
    commit id: "Fix critical bug"
    checkout main
    merge hotfix
    commit id: "Release v1.0.1"
`} />
            </Box>
          </Card>
        </Grid>

        <Box mt="6">
          <Heading size="6" mb="2">About Mermaid Integration</Heading>
          <Text as="p" color="gray" size="3" mb="3">
            This site includes a custom Mermaid component that automatically themes diagrams based on your CSS variables. The integration features:
          </Text>
          <ul>
            <li>Automatic light/dark theme adaptation</li>
            <li>Responsive design that prevents overflow</li>
            <li>Custom color scheme using site brand colors</li>
            <li>Support for all Mermaid diagram types</li>
          </ul>
        </Box>
      </Box>
    </Section>
  )
}
