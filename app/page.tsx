'use client';

import { useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { AlertTriangleIcon, Loader, MessageSquare } from "lucide-react";
import { ai2walletParser, Ai2walletRenderer } from "ai2wallet-sdk";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UIDataTypes, UIMessagePart, UITools } from "ai";


const suggestions = {
  "I want to manage my wallets": "I want to manage my wallets",
  "What is the weather in paris ? (paid mcp tool)": "What is the weather in paris ?",
  "Say Hello BOB ! (free tool)": "Say Hello BOB in spanish !"
};

export default function Home() {
  const { messages, status, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = (message: any) => {
    const hasText = Boolean(message.text);
    if (!hasText) {
      return;
    }
    sendMessage(
      {
        text: message.text || '',
      }
    );
    setInput('');
  };

  const handleSuggestionClick = async (suggestion: keyof typeof suggestions) => {
    sendMessage(
      {
        text: suggestions[suggestion]
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="relative w-full" style={{ height: '500px' }}>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No messages yet"
                description="Start a conversation to see messages here"
              />
            ) : (
              <>
                {messages.map((message: UIMessage) => {
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {ai2walletParser(message).parts.map((part: UIMessagePart<UIDataTypes, UITools>, i: number) => {
                          if (part.type === "text" && message.role === "user") {
                            return (
                              <MessageResponse key={`${message.id}-${i}`}>
                                {part.text}
                              </MessageResponse>
                            );
                          }
                          if (message.role === "assistant") {
                            return (<Ai2walletRenderer key={`${message.id}-${i}`} part={part} />)
                          }
                          return null;
                        })}
                      </MessageContent>
                    </Message>
                  )
                }
                )}
              </>
            )}
            {status === 'submitted' || status === 'streaming' && <Loader className="animate-spin" />}
            {status === "error" && (
              <Alert className="max-w-md border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
                <AlertTriangleIcon />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  Your LLM api key is either invalid or quota has been reached. Also Check rate limits or internet connection !
                </AlertDescription>
              </Alert>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <Suggestions className="justify-center">
          {Object.keys(suggestions).map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={() =>
                handleSuggestionClick(suggestion as keyof typeof suggestions)
              }
              variant="outline"
              size="sm"
            />
          ))}
        </Suggestions>
        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit className="cursor-pointer" disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

