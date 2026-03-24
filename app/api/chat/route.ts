import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs
} from 'ai';
//import { google } from '@ai-sdk/google'; //uncomment to use Gemini model
import { groq } from '@ai-sdk/groq';
import getAi2walletTools from 'ai2wallet-sdk/tools';

const mcpServerURL = process.env.MCP_SERVER_URL as string;

// Allow streaming responses up to 320 seconds
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const stream = createUIMessageStream<any>({
    execute: async ({ writer }: any) => {

      const tools = await getAi2walletTools(mcpServerURL, writer) as any;

      const result = streamText({
        system: 'You are a helpful assistant that can answer questions and use tools',
        //model: google('gemini-2.5-flash'), //uncomment to use Gemini model
        model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(2),
        timeout: { totalMs: 300000 }
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}