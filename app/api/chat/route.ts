import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse
} from 'ai';
import { google } from '@ai-sdk/google'; 
import getAi2walletTools from 'ai2wallet-sdk/tools';

const mcpServerURL = process.env.MCP_SERVER_URL as string;

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