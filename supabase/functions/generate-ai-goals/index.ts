import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoalRequest {
  category?: string;
  difficulty?: string;
  timeAvailable?: string;
  interests?: string[];
  currentGoals?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'general', difficulty = 'easy', timeAvailable = '30 minutes', interests = [], currentGoals = [] }: GoalRequest = await req.json();

    console.log('Generating AI goals for:', { category, difficulty, timeAvailable, interests, currentGoals });

    const prompt = `
You are a teen-focused AI goal coach. Generate 3-5 realistic, engaging daily goals for a teen based on these preferences:

Category: ${category}
Difficulty: ${difficulty} 
Time Available: ${timeAvailable}
Interests: ${interests.join(', ') || 'general activities'}
Current Goals: ${currentGoals.join(', ') || 'none'}

For each goal, provide:
1. Title (concise, motivating)
2. Description (why it's beneficial, 1-2 sentences)
3. XP reward (10-100 based on difficulty/time: easy=10-30, medium=25-60, hard=50-100)
4. Estimated duration
5. Category
6. Difficulty

Make goals:
- Age-appropriate for teens
- Achievable in the given timeframe
- Varied and engaging
- Different from current goals
- Specific and actionable
- Motivating with teen-friendly language

Return ONLY a valid JSON array of goal objects with these exact keys:
title, description, xp_reward, estimated_duration, category, difficulty

Example format:
[
  {
    "title": "Read 15 pages of a book",
    "description": "Boost your knowledge and improve focus while escaping into a good story!",
    "xp_reward": 25,
    "estimated_duration": "20 minutes",
    "category": "learning",
    "difficulty": "easy"
  }
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a teen-focused AI goal generator. Always respond with valid JSON arrays only. No additional text or formatting.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    let generatedGoals;
    try {
      const content = data.choices[0].message.content.trim();
      console.log('Generated content:', content);
      
      // Clean up the response in case it has markdown formatting
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      generatedGoals = JSON.parse(jsonContent);
      
      if (!Array.isArray(generatedGoals)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback goals if AI response fails
      generatedGoals = [
        {
          title: "Take a 10-minute walk",
          description: "Get some fresh air and movement to boost your energy and mood!",
          xp_reward: 20,
          estimated_duration: "10 minutes",
          category: "health",
          difficulty: "easy"
        },
        {
          title: "Organize your study space",
          description: "A clean workspace helps improve focus and productivity for homework time!",
          xp_reward: 30,
          estimated_duration: "15 minutes", 
          category: "productivity",
          difficulty: "easy"
        },
        {
          title: "Practice gratitude - list 3 things",
          description: "Boost your mental health by reflecting on positive things in your life!",
          xp_reward: 15,
          estimated_duration: "5 minutes",
          category: "wellness",
          difficulty: "easy"
        }
      ];
    }

    return new Response(JSON.stringify({ goals: generatedGoals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-goals function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate goals', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});