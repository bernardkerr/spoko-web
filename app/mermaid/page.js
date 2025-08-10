import { Mermaid } from '@/components/Mermaid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="container py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Mermaid Diagrams</h1>
          <p className="text-muted-foreground">
            Beautiful diagrams and flowcharts with site-themed Mermaid integration.
            These diagrams automatically adapt to your light/dark theme preferences.
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Flowchart</CardTitle>
              <CardDescription>
                A simple decision flowchart showing a typical debugging process.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sequence Diagram</CardTitle>
              <CardDescription>
                Visualizing the interaction between user, browser, server, and database.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Diagram</CardTitle>
              <CardDescription>
                Object-oriented design showing relationships between User, Post, and Comment entities.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Git Graph</CardTitle>
              <CardDescription>
                A Git workflow visualization showing branching, merging, and releases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Mermaid code={`
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add feature A"
    commit id: "Add feature B"
    checkout main
    commit id: "Hotfix"
    merge develop
    commit id: "Release v1.0"
    branch feature/new-ui
    checkout feature/new-ui
    commit id: "New UI design"
    checkout develop
    merge feature/new-ui
`} />
            </CardContent>
          </Card>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2>About Mermaid Integration</h2>
          <p>
            This site includes a custom Mermaid component that automatically themes diagrams 
            based on your CSS variables. The integration features:
          </p>
          <ul>
            <li>Automatic light/dark theme adaptation</li>
            <li>Responsive design that prevents overflow</li>
            <li>Custom color scheme using site brand colors</li>
            <li>Support for all Mermaid diagram types</li>
          </ul>
          
          <h3 className="prose-sm">Typography Examples</h3>
          <div className="prose-sm">
            <p>This is an example of smaller prose text that might be used for captions or secondary content.</p>
          </div>
          
          <div className="prose-lg">
            <p>This is an example of larger prose text that might be used for emphasis or important content sections.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
