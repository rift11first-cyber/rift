import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function ProfileCompletionPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    username: '',
    college: '',
    gender: ''
  });

  const collegeOptions = [
    // IITs
    { value: 'IIT Delhi', label: 'IIT Delhi' },
    { value: 'IIT Bombay', label: 'IIT Bombay' },
    { value: 'IIT Madras', label: 'IIT Madras' },
    { value: 'IIT Kanpur', label: 'IIT Kanpur' },
    { value: 'IIT Roorkee', label: 'IIT Roorkee' },
    { value: 'IIT Kharagpur', label: 'IIT Kharagpur' },
    { value: 'IIT Guwahati', label: 'IIT Guwahati' },
    
    // NITs
    { value: 'NIT Trichy', label: 'NIT Trichy' },
    { value: 'NIT Surathkal', label: 'NIT Surathkal' },
    { value: 'NIT Warangal', label: 'NIT Warangal' },
    { value: 'NIT Calicut', label: 'NIT Calicut' },
  
    // IIITs
    { value: 'IIIT Hyderabad', label: 'IIIT Hyderabad' },
    { value: 'IIIT Delhi', label: 'IIIT Delhi' },
  
    // Private Universities
    { value: 'VIT', label: 'VIT University' },
    { value: 'SRM', label: 'SRM Institute of Science and Technology' },
    { value: 'BITS Pilani', label: 'BITS Pilani' },
    { value: 'BITS Goa', label: 'BITS Goa' },
    { value: 'BITS Hyderabad', label: 'BITS Hyderabad' },
  
    // Amrita Campuses
    { value: 'Amrita Coimbatore', label: 'Amrita Vishwa Vidyapeetham - Coimbatore' },
    { value: 'Amrita Bengaluru', label: 'Amrita Vishwa Vidyapeetham - Bengaluru' },
    { value: 'Amrita Chennai', label: 'Amrita Vishwa Vidyapeetham - Chennai' },
    { value: 'Amrita Amritapuri', label: 'Amrita Vishwa Vidyapeetham - Amritapuri' },
  
    // Popular Colleges
    { value: 'Anna University', label: 'Anna University' },
    { value: 'Christ University', label: 'Christ University' },
    { value: 'Loyola College', label: 'Loyola College, Chennai' },
    { value: 'St Josephs', label: 'St. Joseph’s College, Bengaluru' },
    { value: 'Mount Carmel', label: 'Mount Carmel College, Bengaluru' },
    { value: 'Delhi University', label: 'University of Delhi' },
    { value: 'Jamia Millia Islamia', label: 'Jamia Millia Islamia' },
    { value: 'Jawaharlal Nehru University', label: 'JNU Delhi' },
    { value: 'Ashoka University', label: 'Ashoka University' },
    { value: 'Shiv Nadar University', label: 'Shiv Nadar University' },
    { value: 'OP Jindal', label: 'O.P. Jindal Global University' },
    { value: 'Presidency University', label: 'Presidency University, Kolkata' },
    { value: 'Jadavpur University', label: 'Jadavpur University, Kolkata' },
    { value: 'Manipal University', label: 'Manipal Academy of Higher Education' },
    { value: 'Symbiosis Pune', label: 'Symbiosis International University, Pune' },
    { value: 'FLAME University', label: 'FLAME University, Pune' },
  ];
  
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.fullName.trim() || !profileData.username.trim() || !profileData.college || !profileData.gender) {
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
        fullName: profileData.fullName.trim(),
        username: profileData.username.trim(),
        college: profileData.college,
        gender: profileData.gender,
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

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                data-testid="input-fullname"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                data-testid="input-username"
              />
              <p className="text-xs text-muted-foreground">
                This will be your display name on posts and messages
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={profileData.gender} 
                onValueChange={(value) => handleInputChange('gender', value)}
                required
              >
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Select 
                value={profileData.college} 
                onValueChange={(value) => handleInputChange('college', value)}
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