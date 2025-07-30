import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ArrowLeft, User, Mail, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasNumberOrSymbol: /[\d!@#$%^&*(),.?":{}|<>]/.test(password),
    hasLowerAndUpper: /[a-z]/.test(password) && /[A-Z]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailValid) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive"
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    console.log("Supabase signUp response:", { error });

    if (error) {
      console.log("Error message:", error.message);
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
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailValid) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log("Sign in error:", error.message);
      
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Invalid Credentials",
          description: "Email or password is incorrect. Please try again.",
          variant: "destructive"
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email Not Confirmed",
          description: "Please check your email and click the confirmation link before signing in.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error", 
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
      navigate("/");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
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
      setLoading(false);
    }
    // Note: Loading state will be handled by auth state change on redirect
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 relative overflow-hidden">
      {/* Background decoration circles */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-sm"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full blur-sm"></div>
      <div className="absolute top-40 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
      
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center">
        <Card className="w-full max-w-lg bg-white shadow-2xl border-0 rounded-3xl animate-fade-in relative z-10">
          {/* Header with back arrow and dynamic sign in/up link */}
          <CardHeader className="text-left pb-2">
            <div className="flex items-center justify-end mb-6">
              <div className="text-sm text-gray-500">
                {activeTab === "signup" ? (
                  <>Already member? <button onClick={() => setActiveTab("signin")} className="text-blue-600 cursor-pointer hover:underline">Sign in</button></>
                ) : (
                  <>New here? <button onClick={() => setActiveTab("signup")} className="text-blue-600 cursor-pointer hover:underline">Sign up</button></>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {activeTab === "signup" ? "Sign Up" : "Sign In"}
              </h1>
              <p className="text-gray-500">
                {activeTab === "signup" 
                  ? "Secure Your Communications with EasyMail" 
                  : "Welcome back! Please sign in to your account"
                }
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">

                  {/* Email Field */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="HDanielajhmadi@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 pr-10 h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          email.length > 0 && !isEmailValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          email.length > 0 && isEmailValid ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''
                        }`}
                        required
                      />
                      <div className="absolute right-3 top-3">
                        {email.length > 0 && (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isEmailValid ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isEmailValid ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <X className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {email.length > 0 && !isEmailValid && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <X className="w-4 h-4" />
                        <span>Please enter a valid email address</span>
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-4">
                    <div className="relative">
                      <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.minLength ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasNumberOrSymbol ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasNumberOrSymbol ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Least one number (0-9) or a symbol</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasLowerAndUpper ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasLowerAndUpper ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Lowercase (a-z) and uppercase (A-Z)</span>
                      </div>
                    </div>
                  </div>

                  {/* Re-type Password */}
                  <div className="space-y-2">
                    <div className="relative">
                      <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-type Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          confirmPassword.length > 0 && !passwordsMatch ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className={`flex items-center gap-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordsMatch ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                      </div>
                    )}
                  </div>

                  {/* Sign Up Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>

                  {/* OR Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">Or</span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-gray-200"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signin" className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 pr-10 h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          email.length > 0 && !isEmailValid ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          email.length > 0 && isEmailValid ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''
                        }`}
                        required
                      />
                      <div className="absolute right-3 top-3">
                        {email.length > 0 && (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isEmailValid ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isEmailValid ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <X className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {email.length > 0 && !isEmailValid && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <X className="w-4 h-4" />
                        <span>Please enter a valid email address</span>
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="relative">
                      <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => {
                        // TODO: Implement forgot password functionality
                        toast({
                          title: "Feature Coming Soon",
                          description: "Forgot password functionality will be available soon.",
                        });
                      }}
                    >
                      Forgot your password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>

                  {/* OR Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">Or</span>
                    </div>
                  </div>

                  {/* Google Sign In Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-gray-200"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;