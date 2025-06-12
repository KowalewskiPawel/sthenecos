import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract the JWT token
    const token = authorization.replace('Bearer ', '')

    // Create Supabase client with user's JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authorization }
        }
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    const { goals, userId, trainerId } = await req.json()
    console.log('Received request:', { goals, userId, trainerId })

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.log('OpenAI API key not found, using basic workout generation')
      // Generate a basic workout without OpenAI
      const workout = generateBasicWorkout(goals)
      const savedWorkout = await saveWorkout(supabaseClient, workout, goals, userId, trainerId)
      
      return new Response(
        JSON.stringify(savedWorkout),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Using OpenAI to generate workout')

    // Create prompt for OpenAI
    const prompt = createWorkoutPrompt(goals)

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fitness trainer. Create detailed workout plans in the exact JSON format requested. Always include proper form instructions and safety notes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', openaiResponse.status, await openaiResponse.text())
      // Fallback to basic workout if OpenAI fails
      const workout = generateBasicWorkout(goals)
      const savedWorkout = await saveWorkout(supabaseClient, workout, goals, userId, trainerId)
      
      return new Response(
        JSON.stringify(savedWorkout),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiResponse.json()
    let workoutData

    try {
      // Try to parse the AI response as JSON
      const aiResponse = openaiData.choices[0]?.message?.content
      console.log('AI Response:', aiResponse)
      workoutData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // If parsing fails, use basic workout
      workoutData = generateBasicWorkout(goals)
    }

    // Save workout to database
    const savedWorkout = await saveWorkout(supabaseClient, workoutData, goals, userId, trainerId)

    return new Response(
      JSON.stringify(savedWorkout),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-ai-workout function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate workout',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function createWorkoutPrompt(goals: any): string {
  return `Create a ${goals.timeAvailable}-minute ${goals.workoutType} workout for a ${goals.fitnessLevel} level person.

Primary goal: ${goals.primary}
Equipment available: ${goals.equipment.join(', ')}
${goals.targetMuscles?.length ? `Target muscles: ${goals.targetMuscles.join(', ')}` : ''}

Return ONLY a JSON object with this exact structure:
{
  "title": "Workout title",
  "description": "Brief description",
  "totalDuration": ${goals.timeAvailable},
  "warmup": [
    {
      "name": "Exercise name",
      "sets": 1,
      "reps": "10 each side",
      "instructions": "Detailed form instructions",
      "muscleGroups": ["muscle1", "muscle2"]
    }
  ],
  "mainWorkout": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "10-12",
      "restTime": 60,
      "instructions": "Detailed form instructions",
      "muscleGroups": ["muscle1", "muscle2"],
      "modifications": {
        "easier": "Easier variation",
        "harder": "Harder variation"
      }
    }
  ],
  "cooldown": [
    {
      "name": "Exercise name",
      "sets": 1,
      "reps": "30 seconds",
      "instructions": "Detailed form instructions",
      "muscleGroups": ["muscle1", "muscle2"]
    }
  ],
  "notes": ["Safety tip 1", "Safety tip 2"],
  "difficulty": "${goals.fitnessLevel}",
  "estimatedCalories": ${Math.round(goals.timeAvailable * 7)}
}

Include 3-4 warmup exercises, 4-6 main exercises, and 3-4 cooldown exercises. Focus on ${goals.primary.toLowerCase()}.`
}

function generateBasicWorkout(goals: any) {
  const workoutTypes = {
    strength: {
      warmup: [
        { name: 'Arm Circles', sets: 1, reps: '10 forward, 10 backward', instructions: 'Stand with arms extended, make circles', muscleGroups: ['shoulders'] },
        { name: 'Leg Swings', sets: 1, reps: '10 each leg', instructions: 'Hold wall for support, swing leg front to back', muscleGroups: ['hips'] },
        { name: 'Torso Twists', sets: 1, reps: '10 each direction', instructions: 'Stand with feet hip-width apart, rotate torso', muscleGroups: ['core'] }
      ],
      main: [
        { name: 'Push-ups', sets: 3, reps: '8-12', restTime: 60, instructions: 'Start in plank, lower chest to floor, push up', muscleGroups: ['chest', 'triceps'], modifications: { easier: 'On knees or wall', harder: 'Add clap or single arm' } },
        { name: 'Squats', sets: 3, reps: '10-15', restTime: 60, instructions: 'Feet shoulder-width apart, lower as if sitting', muscleGroups: ['quadriceps', 'glutes'], modifications: { easier: 'Use chair for support', harder: 'Add jump' } },
        { name: 'Plank', sets: 3, reps: '30-60 seconds', restTime: 45, instructions: 'Hold push-up position, keep body straight', muscleGroups: ['core'], modifications: { easier: 'On knees', harder: 'Add leg lifts' } },
        { name: 'Lunges', sets: 3, reps: '8 each leg', restTime: 60, instructions: 'Step forward, lower back knee toward ground', muscleGroups: ['quadriceps', 'glutes'], modifications: { easier: 'Hold wall for balance', harder: 'Add jump' } }
      ],
      cooldown: [
        { name: 'Forward Fold', sets: 1, reps: '30 seconds', instructions: 'Stand, slowly fold forward, let arms hang', muscleGroups: ['hamstrings', 'back'] },
        { name: 'Child\'s Pose', sets: 1, reps: '45 seconds', instructions: 'Kneel, sit back on heels, fold forward', muscleGroups: ['back', 'shoulders'] },
        { name: 'Seated Twist', sets: 1, reps: '30 seconds each side', instructions: 'Sit cross-legged, twist to each side', muscleGroups: ['spine'] }
      ]
    }
  }

  const workout = workoutTypes.strength
  
  return {
    title: `${goals.timeAvailable}-Minute ${goals.primary} Workout`,
    description: `A ${goals.fitnessLevel} level workout focused on ${goals.primary.toLowerCase()}`,
    totalDuration: goals.timeAvailable,
    warmup: workout.warmup,
    mainWorkout: workout.main,
    cooldown: workout.cooldown,
    notes: ['Listen to your body', 'Maintain proper form', 'Stay hydrated'],
    difficulty: goals.fitnessLevel,
    estimatedCalories: Math.round(goals.timeAvailable * 7)
  }
}

async function saveWorkout(supabaseClient: any, workout: any, goals: any, userId: string, trainerId?: string) {
  try {
    console.log('Attempting to save workout for user:', userId)
    console.log('Trainer ID:', trainerId)

    const workoutData = {
      user_id: userId,
      trainer_id: trainerId || null,
      title: workout.title,
      description: workout.description,
      goals: [goals.primary, ...(goals.secondary || [])],
      fitness_level: goals.fitnessLevel,
      duration_minutes: workout.totalDuration,
      equipment_needed: goals.equipment,
      workout_structure: workout,
      generated_prompt: JSON.stringify(goals),
      is_custom: true
    }

    console.log('Prepared workout data for insertion:', JSON.stringify(workoutData, null, 2))

    const { data, error } = await supabaseClient
      .from('ai_generated_workouts')
      .insert([workoutData])
      .select()
      .single()

    if (error) {
      console.error('Database insertion error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('Successfully saved workout:', data)
    return { ...workout, id: data.id }
  } catch (error) {
    console.error('Error in saveWorkout function:', error)
    throw error
  }
}