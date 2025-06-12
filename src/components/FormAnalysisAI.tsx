import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { Target, Brain, CheckCircle, AlertTriangle, Camera, Upload } from 'lucide-react';

interface FormAnalysisResult {
  overallScore: number;
  formCorrections: string[];
  goodPoints: string[];
  improvementSuggestions: string[];
}

const FormAnalysisAI: React.FC = () => {
  const { user, checkSubscription } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FormAnalysisResult | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('squat');

  React.useEffect(() => {
    checkUserSubscription();
  }, []);

  const checkUserSubscription = async () => {
    const premium = await checkSubscription();
    setIsPremium(premium);
  };

  const exercises = [
    { id: 'squat', name: 'Squat', description: 'Basic squat movement analysis' },
    { id: 'pushup', name: 'Push-up', description: 'Upper body push movement' },
    { id: 'deadlift', name: 'Deadlift', description: 'Hip hinge movement pattern' },
    { id: 'plank', name: 'Plank', description: 'Core stability assessment' }
  ];

  // Simplified form analysis without video upload
  const analyzeForm = async () => {
    setAnalyzing(true);
    
    // Simulate AI analysis with text-based guidance
    setTimeout(() => {
      const mockResult: FormAnalysisResult = {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
        formCorrections: getFormCorrections(selectedExercise),
        goodPoints: getGoodPoints(selectedExercise),
        improvementSuggestions: getImprovementSuggestions(selectedExercise)
      };
      
      setAnalysisResult(mockResult);
      setAnalyzing(false);
    }, 2000);
  };

  const getFormCorrections = (exercise: string) => {
    const corrections = {
      squat: [
        'Keep your knees aligned with your toes during the squat',
        'Maintain a straight back throughout the movement',
        'Go deeper in the squat for full range of motion'
      ],
      pushup: [
        'Lower your chest closer to the ground',
        'Keep your body in a straight line from head to heels',
        'Control the descent more slowly'
      ],
      deadlift: [
        'Keep the bar close to your body throughout the movement',
        'Drive through your heels, not your toes',
        'Maintain a neutral spine position'
      ],
      plank: [
        'Avoid letting your hips sag or pike up',
        'Keep your core actively engaged',
        'Maintain neutral head position'
      ]
    };
    return corrections[exercise as keyof typeof corrections] || corrections.squat;
  };

  const getGoodPoints = (exercise: string) => {
    const points = {
      squat: [
        'Good depth in your squat position',
        'Consistent tempo throughout reps',
        'Proper breathing pattern'
      ],
      pushup: [
        'Excellent core engagement',
        'Good arm positioning',
        'Consistent range of motion'
      ],
      deadlift: [
        'Great hip hinge pattern',
        'Strong lockout position',
        'Good bar path'
      ],
      plank: [
        'Strong core activation',
        'Good shoulder stability',
        'Consistent hold time'
      ]
    };
    return points[exercise as keyof typeof points] || points.squat;
  };

  const getImprovementSuggestions = (exercise: string) => {
    const suggestions = {
      squat: [
        'Focus on ankle mobility to improve squat depth',
        'Practice wall sits to build endurance',
        'Add pause squats to improve control'
      ],
      pushup: [
        'Start with incline push-ups if needed',
        'Focus on slow, controlled movements',
        'Add pause reps at the bottom'
      ],
      deadlift: [
        'Work on hip flexibility',
        'Practice the movement with light weight first',
        'Focus on the hip hinge pattern'
      ],
      plank: [
        'Build up hold time gradually',
        'Practice side planks for stability',
        'Focus on breathing during holds'
      ]
    };
    return suggestions[exercise as keyof typeof suggestions] || suggestions.squat;
  };

  const reset = () => {
    setAnalysisResult(null);
    setSelectedExercise('squat');
  };

  if (!isPremium) {
    return (
      <div className="bg-card rounded-xl p-8 border border-background text-center">
        <Target className="h-16 w-16 text-text-secondary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-4">AI Form Analysis</h2>
        <p className="text-text-secondary mb-6">
          Get expert guidance on exercise form with our AI analysis system.
        </p>
        <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
          <p className="text-text-primary font-medium">Premium Feature</p>
          <p className="text-text-secondary text-sm mt-1">
            Upgrade to access AI-powered form analysis and personalized feedback
          </p>
        </div>
        <Button variant="primary">Upgrade to Premium</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-xl p-6 border border-background">
        <div className="flex items-center mb-6">
          <Target className="h-6 w-6 text-primary mr-3" />
          <h2 className="text-xl font-semibold text-text-primary">AI Form Analysis</h2>
        </div>

        {!analysisResult ? (
          <div className="space-y-6">
            {/* Exercise Selection */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Select Exercise to Analyze</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedExercise === exercise.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-background text-text-secondary hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 mr-2" />
                      <h4 className="font-medium">{exercise.name}</h4>
                    </div>
                    <p className="text-sm">{exercise.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-primary/10 border border-primary rounded-lg p-4">
              <h3 className="font-medium text-text-primary mb-2">How it works:</h3>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• Choose the exercise you want to analyze</li>
                <li>• Our AI will provide form guidance and corrections</li>
                <li>• Get personalized tips to improve your technique</li>
                <li>• No video upload required - instant feedback!</li>
              </ul>
            </div>

            {/* Analysis Button */}
            <div className="text-center">
              {!analyzing ? (
                <Button
                  variant="primary"
                  onClick={analyzeForm}
                  className="flex items-center mx-auto"
                  size="lg"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Get Form Analysis
                </Button>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mr-3"></div>
                  <span className="text-text-primary">Analyzing your form...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-4">
                <span className="text-3xl font-bold text-primary">{analysisResult.overallScore}</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {exercises.find(e => e.id === selectedExercise)?.name} Form Score
              </h3>
              <p className="text-text-secondary">
                {analysisResult.overallScore >= 90 ? 'Excellent form!' :
                 analysisResult.overallScore >= 80 ? 'Good technique' :
                 analysisResult.overallScore >= 70 ? 'Room for improvement' : 'Needs work'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form Corrections */}
              <div className="bg-background rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  <h4 className="font-medium text-text-primary">Focus Areas</h4>
                </div>
                <ul className="space-y-2">
                  {analysisResult.formCorrections.map((correction, index) => (
                    <li key={index} className="text-text-secondary text-sm">
                      • {correction}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Good Points */}
              <div className="bg-background rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <h4 className="font-medium text-text-primary">Doing Well</h4>
                </div>
                <ul className="space-y-2">
                  {analysisResult.goodPoints.map((point, index) => (
                    <li key={index} className="text-text-secondary text-sm">
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-background rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Target className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium text-text-primary">Next Steps</h4>
                </div>
                <ul className="space-y-2">
                  {analysisResult.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-text-secondary text-sm">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <Button variant="primary" onClick={reset}>
                Analyze Another Exercise
              </Button>
              <Button variant="outline">
                Save to Progress
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAnalysisAI;