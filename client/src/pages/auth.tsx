import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { COLLEGE_DOMAINS } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { signIn, signUp, error } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Sign in form
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Sign up form
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    college: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(signInData.email, signInData.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (err) {
      // Error handled by useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await signUp(signUpData.email, signUpData.password, {
        username: signUpData.username,
        college: signUpData.college,
        profileComplete: false,
        connections: [],
      });
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account, then sign in.",
      });
      
      // Reset form
      setSignUpData({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        college: ''
      });
    } catch (err) {
      // Error handled by useAuth hook
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle>Join Your Campus Community</CardTitle>
          <CardDescription>
            Connect with students from your college through personality-based matching
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email Address</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    data-testid="input-signin-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    data-testid="input-signin-password"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  data-testid="button-signin"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    data-testid="input-signup-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    data-testid="input-username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Select 
                    value={signUpData.college} 
                    onValueChange={(value) => setSignUpData(prev => ({ ...prev, college: value }))}
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    data-testid="input-signup-password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    data-testid="input-confirm-password"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  data-testid="button-signup"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
