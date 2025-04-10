import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabaseClient';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { imagePath } = await request.json();
    
    const { data: { publicUrl } } = supabase
      .storage
      .from('math-images')
      .getPublicUrl(imagePath);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `This image contains a handwritten math problem. Extract and solve the math problem in this image step-by-step. Format your response like this:
                  "Problem": "the recognized math expression",
                  "Solution": "step-by-step solution"
                }`},
            { type: "image_url", image_url: { url: publicUrl } }
          ],
        },
      ],
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
        
    const { data, error } = await supabase
      .from('math_solutions')
      .insert([
        { 
          image_path: imagePath,
          problem_text: result.problem,
          solution: result.solution,
          created_at: new Date()
        }
      ])
      .select();
      
    if (error) throw error;

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error processing math problem:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}