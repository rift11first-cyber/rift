import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { QUIZ_QUESTIONS, CHARACTERS, CharacterTypeValue, GenderValue } from '@shared/schema';
import { CharacterAvatar } from '@/components/character-avatar';
import { useToast } from '@/hooks/use-toast';

export default function QuizPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [assignedCharacter, setAssignedCharacter] = useState<CharacterTypeValue | null>(null);

  const handleNext = () => {
    if (!selectedAnswer) return;
    
    setAnswers(prev => ({ ...prev, [QUIZ_QUESTIONS[currentQuestion].id]: selectedAnswer }));
    setSelectedAnswer('');
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateCharacter();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[QUIZ_QUESTIONS[currentQuestion - 1].id] || '');
    }
  };

  const calculateCharacter = async () => {
    setLoading(true);
    
    try {
      // Count character mentions from all answers
      const characterCounts: Record<string, number> = {};
      
      Object.values(answers).forEach(answer => {
        const characters = answer.split(',');
        characters.forEach(char => {
          characterCounts[char] = (characterCounts[char] || 0) + 1;
        });
      });
      
      // Add current question's answer
      if (selectedAnswer) {
        const characters = selectedAnswer.split(',');
        characters.forEach(char => {
          characterCounts[char] = (characterCounts[char] || 0) + 1;
        });
      }
      
      // Find the character with the highest count, filtering by gender if available
      let possibleCharacters = Object.entries(characterCounts);
      
      if (user?.gender) {
        possibleCharacters = possibleCharacters.filter(([char]) => 
          CHARACTERS[char as CharacterTypeValue]?.gender === user.gender
        );
      }
      
      possibleCharacters.sort((a, b) => b[1] - a[1]);
      const topCharacter = possibleCharacters[0]?.[0] as CharacterTypeValue;
      
      if (topCharacter) {
        setAssignedCharacter(topCharacter);
        
        // Update user profile
        await updateUser({
          character: topCharacter,
          profileComplete: true,
        });
        
        setShowResult(true);
        
        toast({
          title: "Character Assigned!",
          description: `You've been assigned the ${CHARACTERS[topCharacter].name} character.`,
        });
      }
    } catch (error) {
      console.error('Error calculating character:', error);
      toast({
        title: "Error",
        description: "Failed to assign character. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  if (showResult && assignedCharacter) {
    const characterData = CHARACTERS[assignedCharacter];
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Your Character</CardTitle>
            <CardDescription>Welcome to CollegeVibe!</CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <CharacterAvatar character={assignedCharacter} size="xl" showGlow />
            
            <div>
              <h2 className="text-2xl font-bold mb-2">{characterData.name}</h2>
              <p className="text-muted-foreground mb-4">
                {characterData.traits.join(' • ')}
              </p>
              <p className="text-sm">
                Your character will help you connect with like-minded students and discover new perspectives!
              </p>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
              data-testid="button-continue"
            >
              Start Exploring
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personality Quiz</CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {QUIZ_QUESTIONS[currentQuestion].question}
            </h3>
            
            <RadioGroup 
              value={selectedAnswer} 
              onValueChange={setSelectedAnswer}
              className="space-y-4"
            >
              {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              data-testid="button-previous"
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={!selectedAnswer || loading}
              data-testid="button-next"
            >
              {loading ? 'Calculating...' : 
               currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
