import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Eye, EyeOff, Lock, Mail, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SignInFormData {
  email: string;
  password: string;
}

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ForgotPasswordFormData {
  email: string;
}

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const signInForm = useForm<SignInFormData>();
  const signUpForm = useForm<SignUpFormData>();
  const forgotPasswordForm = useForm<ForgotPasswordFormData>();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;
    
    if (score < 2) return { strength: "weak", color: "text-destructive" };
    if (score < 4) return { strength: "medium", color: "text-orange-500" };
    return { strength: "strong", color: "text-green-500" };
  };

  const handleSignIn = async (data: SignInFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Welcome back!"
      });
      navigate("/");
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Check your email for confirmation link!"
      });
      signUpForm.reset();
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth`
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setForgotPasswordSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions"
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };

  const PasswordInput = ({ 
    id, 
    value, 
    onChange, 
    showPassword, 
    togglePassword, 
    placeholder = "Password",
    showStrength = false,
    ...props 
  }: {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    togglePassword: () => void;
    placeholder?: string;
    showStrength?: boolean;
    [key: string]: any;
  }) => {
    const strength = showStrength ? getPasswordStrength(value) : null;
    
    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="pr-10"
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {showStrength && value && (
          <div className="space-y-1">
            <div className={cn("text-xs font-medium", strength?.color)}>
              Password strength: {strength?.strength}
            </div>
            <div className="grid grid-cols-4 gap-1">
              <div className={cn("h-1 rounded-full", value.length >= 8 ? "bg-green-500" : "bg-muted")} />
              <div className={cn("h-1 rounded-full", /[a-z]/.test(value) && /[A-Z]/.test(value) ? "bg-green-500" : "bg-muted")} />
              <div className={cn("h-1 rounded-full", /[0-9]/.test(value) ? "bg-green-500" : "bg-muted")} />
              <div className={cn("h-1 rounded-full", /[^A-Za-z0-9]/.test(value) ? "bg-green-500" : "bg-muted")} />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                {value.length >= 8 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-1">
                {(/[a-z]/.test(value) && /[A-Z]/.test(value)) ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                <span>Upper & lowercase letters</span>
              </div>
              <div className="flex items-center gap-1">
                {/[0-9]/.test(value) ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                <span>At least one number</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-accent to-primary/20">
      <Card className="w-full max-w-md mx-auto bg-card/90 backdrop-blur-2xl border border-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_16px_rgba(0,0,0,0.08)] before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-primary/40 before:via-accent/30 before:to-primary/40 before:-z-10 relative overflow-hidden animate-fade-in hover:shadow-[0_12px_48px_rgba(0,0,0,0.15),0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-card/50 via-transparent to-accent/5 pointer-events-none"></div>
        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Simple Anki</h1>
          </div>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="forgot">Reset</TabsTrigger>
            </TabsList>
            
            {/* Sign In Tab */}
            <TabsContent value="signin">
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full"
                  disabled={googleLoading}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...signInForm.register("email", { required: "Email is required" })}
                      />
                    </div>
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <PasswordInput
                        id="signin-password"
                        value={signInForm.watch("password") || ""}
                        onChange={(e) => signInForm.setValue("password", e.target.value)}
                        showPassword={showPassword}
                        togglePassword={() => setShowPassword(!showPassword)}
                        placeholder="Enter your password"
                        className="pl-10"
                        {...signInForm.register("password", { required: "Password is required" })}
                      />
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={signInForm.formState.isSubmitting}
                  >
                    {signInForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full"
                  disabled={googleLoading}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or create account with
                    </span>
                  </div>
                </div>

                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...signUpForm.register("email", { required: "Email is required" })}
                      />
                    </div>
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <PasswordInput
                        id="signup-password"
                        value={signUpForm.watch("password") || ""}
                        onChange={(e) => signUpForm.setValue("password", e.target.value)}
                        showPassword={showPassword}
                        togglePassword={() => setShowPassword(!showPassword)}
                        placeholder="Create a strong password"
                        className="pl-10"
                        showStrength={true}
                        {...signUpForm.register("password", { 
                          required: "Password is required",
                          minLength: { value: 8, message: "Password must be at least 8 characters" }
                        })}
                      />
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <PasswordInput
                        id="confirm-password"
                        value={signUpForm.watch("confirmPassword") || ""}
                        onChange={(e) => signUpForm.setValue("confirmPassword", e.target.value)}
                        showPassword={showConfirmPassword}
                        togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        placeholder="Confirm your password"
                        className="pl-10"
                        {...signUpForm.register("confirmPassword", { 
                          required: "Please confirm your password",
                          validate: (value) => value === signUpForm.watch("password") || "Passwords do not match"
                        })}
                      />
                    </div>
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={signUpForm.formState.isSubmitting}
                  >
                    {signUpForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            {/* Forgot Password Tab */}
            <TabsContent value="forgot">
              <div className="space-y-4">
                {forgotPasswordSent ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Check your email</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        We've sent password reset instructions to your email address.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setForgotPasswordSent(false);
                        forgotPasswordForm.reset();
                      }}
                      className="w-full"
                    >
                      Send another email
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 text-center">
                      <h3 className="text-lg font-medium">Forgot your password?</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    
                    <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            {...forgotPasswordForm.register("email", { required: "Email is required" })}
                          />
                        </div>
                        {forgotPasswordForm.formState.errors.email && (
                          <p className="text-sm text-destructive">{forgotPasswordForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={forgotPasswordForm.formState.isSubmitting}
                      >
                        {forgotPasswordForm.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;