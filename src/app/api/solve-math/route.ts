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
            {
              type: "text", text: `This image contains a handwritten math problem. 
Please respond in **strict JSON format** like this:

{
  "problem": "extracted equation in plain text",
  "solution": "step-by-step explanation with each step starting on a new line"
}

If you can't recognize the problem, say:
{
  "problem": "N/A",
  "solution": "N/A"
}`},
            { type: "image_url", image_url: { url: publicUrl } }
          ],
        },
      ],
    });

    let result;
    if (response.choices[0].message.content !== null) {
      const cleanedResult = response.choices[0].message.content.replace(/```json\n?|```/g, '');
      result = JSON.parse(cleanedResult);
    } else {
      result = '{}'
    }

    const { error } = await supabase
      .from('math_solutions')
      .insert([
        {
          image_path: imagePath,
          problem_text: result.problem,
          solution: result.solution,
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