import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-gold/20 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-primary/20 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Scissors className="w-8 h-8 text-white" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-playfair bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                {import.meta.env.VITE_SALON_NAME || 'SalonX'}
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to manage your salon
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@salon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-primary to-gold hover:opacity-90 transition-all text-white font-medium shadow-lg shadow-primary/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Default Credentials Hint */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground text-center">
                  <strong className="text-foreground">Default credentials:</strong>
                  <br />
                  Email: admin@salon.com | Password: password123
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Powered by SalonX Management System
        </motion.p>
      </motion.div>
    </div>
  );
}
