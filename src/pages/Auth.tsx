import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../lib/api";
import { useToast } from "../hooks/use-toast";

const Auth = () => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const { toast } = useToast();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regGender, setRegGender] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRePassword, setRegRePassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  if (token) {
    navigate("/feed", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const data = await authApi.signin({ email: loginEmail, password: loginPassword });
      login(data.token);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      navigate("/feed");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Incorrect email or password.", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regRePassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setRegLoading(true);
    try {
      const data = await authApi.signup({
        name: regName,
        email: regEmail,
        password: regPassword,
        rePassword: regRePassword,
        dateOfBirth: regDob,
        gender: regGender,
      });
      login(data.token);
      toast({ title: "Welcome!", description: "Your account has been created successfully." });
      navigate("/feed");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left - Branding */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary leading-tight">
            Route Posts
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Connect with friends and the world around you on Route Posts.
          </p>
        </div>

        {/* Right - Auth Form */}
        <div className="bg-card rounded-2xl shadow-card-hover p-6 space-y-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 bg-muted rounded-xl p-1">
            <button
              onClick={() => setTab("login")}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? <Loader2 className="animate-spin" /> : "Log In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up now
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <Input
                placeholder="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
              <select
                value={regGender}
                onChange={(e) => setRegGender(e.target.value)}
                required
                className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <Input
                type="date"
                value={regDob}
                onChange={(e) => setRegDob(e.target.value)}
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                value={regRePassword}
                onChange={(e) => setRegRePassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={regLoading}>
                {regLoading ? <Loader2 className="animate-spin" /> : "Create New Account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-primary font-semibold hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;