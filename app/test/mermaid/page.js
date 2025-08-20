import { Mermaid } from '@/components/Mermaid'
import DocCard from '@/components/DocCard'
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
          <DocCard>
            <Heading className="card-title">Flowchart</Heading>
            <Text className="card-description">A simple decision flowchart showing a typical debugging process.</Text>
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
          </DocCard>

          <DocCard>
            <Heading className="card-title">Sequence Diagram</Heading>
            <Text className="card-description">Visualizing the interaction between user, browser, server, and database.</Text>
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
          </DocCard>

          <DocCard>
            <Heading className="card-title">Class Diagram</Heading>
            <Text className="card-description">Object-oriented design showing relationships between User, Post, and Comment entities.</Text>
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
          </DocCard>

          <DocCard>
            <Heading className="card-title">Git Graph</Heading>
            <Text className="card-description">A Git workflow visualization showing branching, merging, and releases.</Text>
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
          </DocCard>

          <DocCard>
            <Heading className="card-title">Timeline</Heading>
            <Text className="card-description">Chronological milestones across product and marketing tracks.</Text>
            <Mermaid code={`
timeline
  title Product + Marketing
  section Product
    2023-01 : Design
    2023-03 : MVP
  section Marketing
    2023-02 : Brand
    2023-04 : Launch
`} />
          </DocCard>
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
