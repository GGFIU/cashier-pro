
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobeIcon, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";


const translations = {
  en: {
    signIn: "Sign In",
    signInDescription: "Enter your email below to sign in to your account",
    signUp: "Sign Up",
    signUpDescription: "Create your account",
    firstNameLabel: "First Name",
    lastNameLabel: "Last Name",
    emailLabel: "Email",
    emailPlaceholder: "m@example.com",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    signInAction: "Sign In",
    signUpAction: "Create Account",
    noAccount: "Don't have an account?",
    createOne: "Create one",
    language: "AR",
    confirmPasswordLabel: "Confirm Password",
    alreadyHaveAccount: "Already have an account?",
    passwordMismatch: "Passwords do not match.",
    genericError: "An unexpected error occurred. Please try again.",
    passwordResetSuccess: "Password reset email sent! Check your inbox.",
    passwordResetPrompt: "Please enter your email to receive a reset link.",
    fillAllFields: "Please fill in all fields.",
    emailInUse: "This email is already registered. Please sign in.",
    invalidEmail: "The email address is not valid.",
    weakPassword: "Password should be at least 6 characters.",
    invalidCredential: "Incorrect email or password.",
    userNotFound: "No account found with this email.",
    signingIn: "Signing in...",
    creatingAccount: "Creating Account...",
  },
  ar: {
    signIn: "تسجيل الدخول",
    signInDescription: "أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك",
    signUp: "إنشاء حساب",
    signUpDescription: "قم بإنشاء حسابك",
    firstNameLabel: "الاسم الأول",
    lastNameLabel: "الاسم الأخير",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "m@example.com",
    passwordLabel: "كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    signInAction: "تسجيل الدخول",
    signUpAction: "إنشاء حساب",
    noAccount: "ليس لديك حساب؟",
    createOne: "أنشئ حساباً",
    language: "EN",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    passwordResetSuccess: "تم إرسال بريد إعادة تعيين كلمة المرور! تحقق من بريدك الوارد.",
    passwordResetPrompt: "الرجاء إدخال بريدك الإلكتروني لتلقي رابط إعادة التعيين.",
    fillAllFields: "الرجاء ملء جميع الحقول.",
    emailInUse: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.",
    invalidEmail: "صيغة البريد الإلكتروني غير صحيحة.",
    weakPassword: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    invalidCredential: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    userNotFound: "لا يوجد حساب بهذا البريد الإلكتروني.",
    signingIn: "جارِ تسجيل الدخول...",
    creatingAccount: "جارِ إنشاء الحساب...",
  },
};

export default function LoginPage() {
  const [language, setLanguage] = useState<"en" | "ar">("ar");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const t = translations[language];
  const appName = "Cashier Pro";

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const clearMessages = () => {
    setError("");
    setNotification("");
  };

  const handleAuthError = (authError: AuthError) => {
    switch (authError.code) {
      case 'auth/email-already-in-use':
        setError(t.emailInUse);
        break;
      case 'auth/invalid-email':
        setError(t.invalidEmail);
        break;
      case 'auth/weak-password':
        setError(t.weakPassword);
        break;
      case 'auth/user-not-found':
        setError(t.userNotFound);
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        setError(t.invalidCredential);
        break;
      default:
        setError(t.genericError);
        break;
    }
  };

  const handleAuthAction = async () => {
    clearMessages();
    setIsLoading(true);

    try {
        if (isSignUpMode) {
          if (!firstName || !lastName || !email || !password || !confirmPassword) {
              setError(t.fillAllFields);
              return;
          }
          if (password !== confirmPassword) {
            setError(t.passwordMismatch);
            return;
          }
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, {
            displayName: `${firstName} ${lastName}`
          });
          router.push('/dashboard/pos');
        } else {
          if (!email || !password) {
              setError(t.fillAllFields);
              return;
          }
          await signInWithEmailAndPassword(auth, email, password);
          router.push('/dashboard/pos');
        }
    } catch (e) {
        handleAuthError(e as AuthError);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    clearMessages();
    if (!email) {
      setError(t.passwordResetPrompt);
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotification(t.passwordResetSuccess);
    } catch (e) {
      handleAuthError(e as AuthError);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen bg-background" dir="ltr">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <Button variant="outline" onClick={toggleLanguage} className="w-24">
          <GlobeIcon className="h-[1.2rem] w-[1.2rem] mx-2" />
          {t.language}
        </Button>
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center">
            <h1 className="pb-4 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent-foreground/80 bg-clip-text text-transparent">
              {appName}
            </h1>
            <CardTitle className="text-2xl font-bold pt-2">{isSignUpMode ? t.signUp : t.signIn}</CardTitle>
            <CardDescription>{isSignUpMode ? t.signUpDescription : t.signInDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignUpMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t.firstNameLabel}</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t.lastNameLabel}</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading}/>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input id="email" type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t.passwordLabel}</Label>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                {!isSignUpMode && (
                    <div className="flex justify-end pt-2">
                        <Button variant="link" className="p-0 h-auto text-xs" onClick={handlePasswordReset} disabled={isLoading}>
                            {t.forgotPassword}
                        </Button>
                    </div>
                )}
            </div>
            {isSignUpMode && (
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />
                </div>
            )}
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {notification && <p className="text-sm text-green-600 dark:text-green-500 text-center">{notification}</p>}

            <Button onClick={handleAuthAction} className="w-full" disabled={isLoading}>
                {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoading ? (isSignUpMode ? t.creatingAccount : t.signingIn) : (isSignUpMode ? t.signUpAction : t.signInAction)}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {isSignUpMode ? t.alreadyHaveAccount : t.noAccount}{" "}
              <Button variant="link" className="p-0" onClick={() => { setIsSignUpMode(!isSignUpMode); clearMessages(); }} disabled={isLoading}>
                {isSignUpMode ? t.signIn : t.createOne}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
