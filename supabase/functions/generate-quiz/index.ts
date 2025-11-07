import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Processing Wikipedia URL:', url);

    if (!url || !url.includes('wikipedia.org')) {
      return new Response(
        JSON.stringify({ error: 'Invalid Wikipedia URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scrape Wikipedia article
    console.log('Fetching Wikipedia content...');
    const wikiResponse = await fetch(url);
    const html = await wikiResponse.text();
    
    // Extract title and content (basic parsing)
    const titleMatch = html.match(/<title>(.+?) - Wikipedia<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Unknown Article';
    
    // Extract main content (simplified - gets text between <p> tags)
    const contentMatches = html.match(/<p>(.+?)<\/p>/gs);
    const content = contentMatches 
      ? contentMatches.slice(0, 15).join(' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Could not extract content from Wikipedia article' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracted content, generating quiz with AI...');

    // Generate quiz using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator. Generate engaging quiz questions from Wikipedia articles.
            
Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation why this is correct",
      "difficulty": "easy",
      "relatedTopics": ["Topic 1", "Topic 2"]
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Generate 7 engaging quiz questions from this Wikipedia article about "${title}":

${content.slice(0, 3000)}

Create questions with varying difficulty (2 easy, 3 medium, 2 hard). Make them educational and interesting. Include related Wikipedia topics for further reading.

Return ONLY the JSON object, no other text.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate quiz with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices[0].message.content;
    
    // Parse the AI response
    let quizData;
    try {
      // Remove markdown code blocks if present
      const jsonText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      quizData = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', generatedText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse quiz data from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: quiz, error: dbError } = await supabase
      .from('quizzes')
      .insert({
        wikipedia_url: url,
        article_title: title,
        scraped_content: content.slice(0, 5000),
        questions: quizData.questions,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save quiz to database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Quiz generated and saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        quiz: {
          id: quiz.id,
          title,
          url,
          questions: quizData.questions,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});