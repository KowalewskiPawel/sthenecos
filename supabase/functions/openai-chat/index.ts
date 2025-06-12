import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header from the request
    const authorization = req.headers.get('Authorization')

    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { messages, config } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      // Return a helpful error if OpenAI is not configured
      return new Response(
        JSON.stringify({ 
          message: "I'm here to help! OpenAI integration is not configured yet, but I can still assist you with general fitness guidance. For the best experience with personalized AI coaching, please configure the OpenAI API key in your Supabase environment variables." 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create system message based on trainer personality
    const systemMessage = {
      role: 'system',
      content: `You are ${config.trainerPersonality || 'a helpful fitness coach'}. You're knowledgeable about fitness, nutrition, and exercise techniques. Keep responses concise (1-3 sentences), encouraging, and actionable. Focus on safety and proper form. If someone asks about pain or injury, recommend consulting a healthcare professional.`
    }

    // Prepare messages for OpenAI
    const openaiMessages = [systemMessage, ...messages.slice(-5)] // Keep last 5 messages for context

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using cheaper model as requested
        messages: openaiMessages,
        max_tokens: config.maxTokens || 150,
        temperature: config.temperature || 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      
      return new Response(
        JSON.stringify({ 
          message: "I'm having trouble connecting to my AI brain right now. Try asking me again, or consider starting a video call for live coaching!" 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content || "I'm here to help with your fitness journey!"

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in openai-chat function:', error)
    
    return new Response(
      JSON.stringify({ 
        message: "I'm having a technical hiccup! Please try again, or start a video call for live coaching assistance." 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})