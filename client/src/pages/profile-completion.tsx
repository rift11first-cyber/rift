import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function ProfileCompletionPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    college: ''
  });

  const collegeOptions = [
    { value: 'IIT Delhi', label: 'IIT Delhi' },
    { value: 'IIT Bombay', label: 'IIT Bombay' },
    { value: 'IIT Madras', label: 'IIT Madras' },
    { value: 'IIT Kanpur', label: 'IIT Kanpur' },
    { value: 'IIT Roorkee', label: 'IIT Roorkee' },
    { value: 'VIT', label: 'VIT University' },
    { value: 'SRM', label: 'SRM Institute' },
    { value: 'Christ University', label: 'Christ University' },
    { value: 'Loyola College', label: 'Loyola College' },
    { value: 'Anna University', label: 'Anna University' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.username.trim() || !profileData.college) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await updateUser({
        username: profileData.username.trim(),
        college: profileData.college,
        profileComplete: false, // Will be completed after quiz
      });
      
      toast({
        title: "Profile Updated!",
        description: "Now let's discover your personality character.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-lg">🎓</span>
            </div>
            <span className="text-2xl font-bold text-primary">CollegeVibe</span>
          </div>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome {user.fullName}! Let's set up your college profile
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                required
                data-testid="input-username"
              />
              <p className="text-xs text-muted-foreground">
                This will be your display name on posts and messages
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Select 
                value={profileData.college} 
                onValueChange={(value) => setProfileData(prev => ({ ...prev, college: value }))}
                required
              >
                <SelectTrigger data-testid="select-college">
                  <SelectValue placeholder="Select your college" />
                </SelectTrigger>
                <SelectContent>
                  {collegeOptions.map((college) => (
                    <SelectItem key={college.value} value={college.value}>
                      {college.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You'll only see students from your selected college
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              data-testid="button-complete-profile"
            >
              {loading ? 'Saving...' : 'Continue to Personality Quiz'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}