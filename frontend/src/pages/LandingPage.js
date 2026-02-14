import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ArrowRight, FileText, FolderOpen, BarChart3, Sparkles, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FileText,
      title: 'Pitch Deck Analysis',
      description: 'Get AI-powered feedback on your pitch deck with specific improvements for each slide.'
    },
    {
      icon: FolderOpen,
      title: 'Data Room Management',
      description: 'Organize all your investor-ready documents in one secure place.'
    },
    {
      icon: BarChart3,
      title: 'Visual Insights',
      description: 'Auto-generate charts and visualizations from your financial data.'
    },
    {
      icon: Sparkles,
      title: 'Smart Suggestions',
      description: 'Receive actionable recommendations to improve your fundraising materials.'
    }
  ];

  const dataRoomCategories = [
    'Pitch Deck & One Pager',
    'Financials & Cap Table',
    'Legal Documents',
    'Previous Funding Rounds',
    'Intellectual Property',
    'Team & Org Structure',
    'Metrics & KPIs'
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="font-heading font-bold text-primary-foreground text-lg">V</span>
            </div>
            <span className="font-heading font-bold text-xl uppercase tracking-tight">Ventur</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button className="rounded-none font-heading uppercase tracking-wider font-bold glow-primary" data-testid="dashboard-nav-btn">
                  Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="rounded-none font-heading uppercase tracking-wider" data-testid="login-nav-btn">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="rounded-none font-heading uppercase tracking-wider font-bold glow-primary" data-testid="register-nav-btn">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1675642728964-4937be75857b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHw0fHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMG9yYW5nZSUyMGJsYWNrJTIwYmFja2dyb3VuZCUyMG1pbmltYWxpc3R8ZW58MHx8fHwxNzcxMDkzNDQ4fDA&ixlib=rb-4.1.0&q=85)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-background/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">AI-Powered Startup Tools</p>
              <h1 className="font-heading font-bold text-5xl md:text-7xl tracking-tight uppercase leading-none">
                Perfect Your<br />
                <span className="text-primary">Pitch Deck</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground max-w-md">
                Get instant AI analysis on your pitch deck. Organize your data room. 
                Impress investors with polished, professional materials.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to={user ? "/pitch-deck" : "/register"}>
                <Button size="lg" className="rounded-none font-heading uppercase tracking-wider font-bold glow-primary" data-testid="hero-cta-btn">
                  Analyze Your Deck
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={user ? "/data-room" : "/register"}>
                <Button size="lg" variant="outline" className="rounded-none font-heading uppercase tracking-wider border-border hover:border-primary" data-testid="hero-secondary-btn">
                  Explore Data Room
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-none"></div>
            <img 
              src="https://images.unsplash.com/photo-1765438864227-288900d09d26?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHxzdGFydHVwJTIwZm91bmRlciUyMHByZXNlbnRpbmclMjBwaXRjaCUyMGRlY2slMjBmdXR1cmlzdGljJTIwb2ZmaWNlfGVufDB8fHx8MTc3MTA5MzQyNHww&ixlib=rb-4.1.0&q=85"
              alt="Startup founder presenting"
              className="w-full aspect-[4/3] object-cover border border-border"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Features</p>
            <h2 className="font-heading font-semibold text-3xl md:text-5xl tracking-tight uppercase">
              Everything You Need
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 border border-border bg-card hover:border-primary/50 transition-all duration-300"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-medium text-xl mb-2">{feature.title}</h3>
                <p className="font-body text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Room Section */}
      <section className="py-24 border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Data Room</p>
              <h2 className="font-heading font-semibold text-3xl md:text-5xl tracking-tight uppercase mb-6">
                Investor-Ready<br />Documentation
              </h2>
              <p className="font-body text-muted-foreground mb-8">
                Organize all your due diligence documents in a professional data room. 
                Get AI suggestions on what's missing and how to improve each document.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {dataRoomCategories.map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-3 border border-border bg-background/50"
                  >
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-mono text-xs uppercase tracking-wider">{category}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1573166364839-1bfe9196c23e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxpbnZlc3RvciUyMG1lZXRpbmclMjBib2FyZHJvb20lMjBzZXJpb3VzJTIwZGlzY3Vzc2lvbnxlbnwwfHx8fDE3NzEwOTM0MzV8MA&ixlib=rb-4.1.0&q=85"
                alt="Investor meeting"
                className="w-full aspect-[4/3] object-cover border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-5xl tracking-tight uppercase mb-6">
            Ready to <span className="text-primary">Fundraise</span>?
          </h2>
          <p className="font-body text-muted-foreground text-lg mb-8">
            Join hundreds of founders who've improved their pitch decks with Ventur.
          </p>
          <Link to={user ? "/dashboard" : "/register"}>
            <Button size="lg" className="rounded-none font-heading uppercase tracking-wider font-bold glow-primary" data-testid="cta-btn">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <span className="font-heading font-bold text-primary-foreground text-sm">V</span>
            </div>
            <span className="font-heading font-bold uppercase tracking-tight">Ventur</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            © 2024 Ventur. Built for Founders.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
