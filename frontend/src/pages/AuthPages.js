import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="login-page">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors font-mono text-sm uppercase tracking-wider"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <Card className="rounded-none border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="font-heading text-3xl uppercase tracking-tight">Login</CardTitle>
            <CardDescription className="font-body text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="founder@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-none border-border bg-background/50 focus:border-primary font-mono"
                  data-testid="login-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-none border-border bg-background/50 focus:border-primary"
                  data-testid="login-password-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full rounded-none font-heading uppercase tracking-wider font-bold glow-primary"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-muted-foreground font-body text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-primary hover:underline font-semibold"
                  data-testid="register-link"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name, companyName);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="register-page">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors font-mono text-sm uppercase tracking-wider"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <Card className="rounded-none border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="font-heading text-3xl uppercase tracking-tight">Create Account</CardTitle>
            <CardDescription className="font-body text-muted-foreground">
              Join Ventur to get AI-powered pitch deck analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-none border-border bg-background/50 focus:border-primary"
                  data-testid="register-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="font-mono text-xs uppercase tracking-wider">Company Name (Optional)</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Acme Inc"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-none border-border bg-background/50 focus:border-primary"
                  data-testid="register-company-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="founder@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-none border-border bg-background/50 focus:border-primary font-mono"
                  data-testid="register-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-none border-border bg-background/50 focus:border-primary"
                  data-testid="register-password-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full rounded-none font-heading uppercase tracking-wider font-bold glow-primary"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-muted-foreground font-body text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-semibold"
                  data-testid="login-link"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
