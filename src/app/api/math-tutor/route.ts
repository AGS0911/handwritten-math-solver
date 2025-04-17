// app/api/math-tutor/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userMessage, problem, solution, conversationHistory } = await request.json();

    // Format conversation history for OpenAI

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: `You are a helpful math tutor. Your job is to help the student understand how to solve this problem: "${problem}". 
    You know the solution is: "${solution}". 
    Break down concepts simply. Be encouraging but concise. When appropriate, use the Socratic method to guide the student to discover the answer themselves. 
    If they ask for a hint, don’t give away the whole solution. If they seem stuck, guide them to the next step.`,
      },
    ];

    // Add conversation history
    conversationHistory.forEach((message: any) => {
      messages.push({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.text
      });
    });

    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const tutorResponse = response.choices[0].message.content || "I'm not sure how to help with that.";

    return NextResponse.json({ response: tutorResponse });
  } catch (error) {
    console.error('Error in math tutor API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}