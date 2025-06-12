import React, { useState } from 'react';
import { Clock, Target, Info, CheckCircle, RotateCcw, Play } from 'lucide-react';
import Button from './ui/Button';

interface Exercise {
  name: string;
  instructions: string;
  sets?: number;
  reps?: string;
  duration?: number;
  restTime?: number;
  muscleGroups?: string[];
  modifications?: {
    easier: string;
    harder: string;
  };
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onComplete?: () => void;
  isActive?: boolean;
  showDetails?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  index, 
  onComplete, 
  isActive = false,
  showDetails = true 
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showModifications, setShowModifications] = useState(false);

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  };

  return (
    <div className={`bg-card rounded-xl border p-6 transition-all duration-300 ${
      isActive ? 'border-primary bg-primary/5' : 'border-background hover:border-primary/50'
    }`}>
      {/* Exercise Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-grow">
          {/* Exercise Number */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold">{index + 1}</span>
          </div>
          
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-text-primary mb-2">{exercise.name}</h3>
            
            {/* Exercise Stats */}
            <div className="flex items-center space-x-6 mb-3">
              {exercise.sets && (
                <div className="flex items-center text-text-secondary">
                  <Target className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{exercise.sets} sets</span>
                </div>
              )}
              {exercise.reps && (
                <div className="flex items-center text-text-secondary">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{exercise.reps} reps</span>
                </div>
              )}
              {exercise.duration && (
                <div className="flex items-center text-text-secondary">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{formatDuration(exercise.duration)}</span>
                </div>
              )}
              {exercise.restTime && (
                <div className="flex items-center text-text-secondary">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{exercise.restTime}s rest</span>
                </div>
              )}
            </div>

            {/* Muscle Groups */}
            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {exercise.muscleGroups.map((muscle, idx) => (
                  <span key={idx} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium capitalize">
                    {muscle}
                  </span>
                ))}
              </div>
            )}

            {/* Basic Instructions Preview */}
            <p className="text-text-secondary text-sm leading-relaxed">
              {exercise.instructions}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Instructions */}
      {showInstructions && (
        <div className="mb-4 p-4 bg-background rounded-lg border border-background">
          <h4 className="font-medium text-text-primary mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Detailed Instructions:
          </h4>
          <p className="text-text-secondary text-sm leading-relaxed">
            {exercise.instructions}
          </p>
        </div>
      )}

      {/* Exercise Modifications */}
      {showModifications && exercise.modifications && (
        <div className="mb-4 p-4 bg-background rounded-lg border border-background">
          <h4 className="font-medium text-text-primary mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Exercise Variations:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 font-medium text-sm mb-1">Easier Version:</p>
              <p className="text-text-secondary text-sm">{exercise.modifications.easier}</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 font-medium text-sm mb-1">Harder Version:</p>
              <p className="text-text-secondary text-sm">{exercise.modifications.harder}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showDetails && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex-1 flex items-center justify-center"
            >
              <Info className="h-3 w-3 mr-1" />
              {showInstructions ? 'Hide Details' : 'Show Details'}
            </Button>
            
            {exercise.modifications && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModifications(!showModifications)}
                className="flex-1 flex items-center justify-center"
              >
                <Target className="h-3 w-3 mr-1" />
                {showModifications ? 'Hide Variations' : 'Show Variations'}
              </Button>
            )}
          </div>

          {onComplete && (
            <Button
              variant="primary"
              className="w-full flex items-center justify-center"
              onClick={onComplete}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Exercise
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;