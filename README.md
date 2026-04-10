# Vercel AI SDK Agent Example
## Prerequisites

Create `.env.local` file and fill required environment variables
- `MCP_SERVER_URL` - Your Ai2wallet MCP Server URL up and running
- `GOOGLE_GENERATIVE_AI_API_KEY` - LLM provider API Key (you can use any provider to fit your needs)

## Quick Start

```bash
git clone https://github.com/jeanlouis-dev/vercel-ai-agent-ai2wallet.git
cd vercel-ai-agent-ai2wallet
```

```bash
npm install && npm run dev
```
or
```bash
npm install && npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000)

## From scratch

First create your next.js App Router Vercel ai agent
### Installation

Run the following command inside your root directory

```bash
npm install ai2wallet-sdk
```

#### Update `app/layout.tsx`

```typescript
import "ai2wallet-sdk/dist/client/style.css";
import { Ai2walletProvider } from "ai2wallet-sdk";

//Wrap your whole app with Ai2walletProvider
<html lang="en">
    <body>
        <Ai2walletProvider>{children}</Ai2walletProvider>
    </body>
</html>


```

#### Update your root page `app/page.tsx`

```typescript
'use client';
// Other imports
import { ai2walletParser, Ai2walletRenderer } from "ai2wallet-sdk";
.............
{messages.map(message => (
    {ai2walletParser(message).parts.map((part: UIMessagePart<UIDataTypes, UITools>, i: number) => {
        if (part.type === "text" && message.role === "user") {
            return (
                <div key={`${message.id}-${i}`}>
                    {part.text}
                </div>
            );
        }
        if (message.role === "assistant") {
            return (<Ai2walletRenderer key={`${message.id}-${i}`} part={part} />)
        }
        return null;
    })}
))}
................
```

#### Update your route handler `api/chat/route.ts`
```typescript
// Other imports
import getAi2walletTools from 'ai2wallet-sdk/tools';

const mcpServerURL = process.env.MCP_SERVER_URL;
// Allow streaming responses up to 300 seconds
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const stream = createUIMessageStream<any>({
    execute: async ({ writer }: any) => {
      const tools = await getAi2walletTools(mcpServerURL, writer);
      const result = streamText({
        system: 'You are a helpful assistant that can answer questions and use tools',
        model: google('gemini-2.5-flash'), 
        messages: await convertToModelMessages(messages),
        tools,
        timeout: { totalMs: 300000 }
      });
      writer.merge(result.toUIMessageStream());
    },
  });
  return createUIMessageStreamResponse({ stream });
}

```