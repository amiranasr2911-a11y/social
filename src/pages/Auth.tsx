// // import { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { User, Mail, Lock, Calendar, Users, AtSign, Loader2 } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { useAuth } from "@/context/AuthContext";
// // import { authApi } from "@/lib/api";
// // import { useToast } from "@/hooks/use-toast";

// // const Auth = () => {
// //   const [tab, setTab] = useState<"login" | "register">("login");
// //   const navigate = useNavigate();
// //   const { login, token } = useAuth();
// //   const { toast } = useToast();

// //   // Login state
// //   const [loginEmail, setLoginEmail] = useState("");
// //   const [loginPassword, setLoginPassword] = useState("");
// //   const [loginLoading, setLoginLoading] = useState(false);

// //   // Register state
// //   const [regName, setRegName] = useState("");
// //   const [regUsername, setRegUsername] = useState("");
// //   const [regEmail, setRegEmail] = useState("");
// //   const [regGender, setRegGender] = useState("");
// //   const [regDob, setRegDob] = useState("");
// //   const [regPassword, setRegPassword] = useState("");
// //   const [regRePassword, setRegRePassword] = useState("");
// //   const [regLoading, setRegLoading] = useState(false);

// //   // Redirect if already logged in
// //   if (token) {
// //     navigate("/feed", { replace: true });
// //     return null;
// //   }

// //   const handleLogin = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoginLoading(true);
// //     try {
// //       const data = await authApi.signin({ email: loginEmail, password: loginPassword });
// //       login(data.token);
// //       toast({ title: "مرحباً! 👋", description: "تم تسجيل الدخول بنجاح" });
// //       navigate("/feed");
// //     } catch (err: any) {
// //       toast({ title: "خطأ", description: err.message, variant: "destructive" });
// //     } finally {
// //       setLoginLoading(false);
// //     }
// //   };

// //   const handleRegister = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (regPassword !== regRePassword) {
// //       toast({ title: "خطأ", description: "كلمة المرور غير متطابقة", variant: "destructive" });
// //       return;
// //     }
// //     setRegLoading(true);
// //     try {
// //       const data = await authApi.signup({
// //         name: regName,
// //         email: regEmail,
// //         password: regPassword,
// //         rePassword: regRePassword,
// //         dateOfBirth: regDob,
// //         gender: regGender,
// //       });
// //       login(data.token);
// //       toast({ title: "أهلاً بيك! 🎉", description: "تم إنشاء الحساب بنجاح" });
// //       navigate("/feed");
// //     } catch (err: any) {
// //       toast({ title: "خطأ", description: err.message, variant: "destructive" });
// //     } finally {
// //       setRegLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-background flex items-center justify-center p-4">
// //       <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
// //         {/* Left - Branding */}
// //         <div className="space-y-6">
// //           <h1 className="text-5xl md:text-6xl font-extrabold text-primary leading-tight">
// //             Route Posts
// //           </h1>
// //           <p className="text-xl text-muted-foreground leading-relaxed">
// //             Connect with friends and the world around you on Route Posts.
// //           </p>

// //           <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
// //             <p className="text-xs font-semibold uppercase tracking-wider text-primary">
// //               About Route Academy
// //             </p>
// //             <h3 className="text-lg font-bold text-foreground">
// //               Egypt's Leading IT Training Center Since 2012
// //             </h3>
// //             <p className="text-sm text-muted-foreground leading-relaxed">
// //               Route Academy is the premier IT training center in Egypt. We specialize in delivering high-quality training courses in programming, web development, and application development.
// //             </p>
// //             <div className="grid grid-cols-3 gap-3">
// //               {[
// //                 { num: "2012", label: "FOUNDED" },
// //                 { num: "40K+", label: "GRADUATES" },
// //                 { num: "50+", label: "PARTNERS" },
// //               ].map((stat) => (
// //                 <div key={stat.label} className="bg-muted rounded-xl p-3">
// //                   <p className="text-lg font-bold text-primary">{stat.num}</p>
// //                   <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
// //                     {stat.label}
// //                   </p>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right - Auth Form */}
// //         <div className="bg-card rounded-2xl shadow-card-hover p-6 space-y-6">
// //           {/* Tabs */}
// //           <div className="grid grid-cols-2 bg-muted rounded-xl p-1">
// //             <button
// //               onClick={() => setTab("login")}
// //               className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
// //                 tab === "login"
// //                   ? "bg-card text-foreground shadow-sm"
// //                   : "text-muted-foreground hover:text-foreground"
// //               }`}
// //             >
// //               Login
// //             </button>
// //             <button
// //               onClick={() => setTab("register")}
// //               className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
// //                 tab === "register"
// //                   ? "bg-card text-foreground shadow-sm"
// //                   : "text-muted-foreground hover:text-foreground"
// //               }`}
// //             >
// //               Register
// //             </button>
// //           </div>

// //           {tab === "login" ? (
// //             <form onSubmit={handleLogin} className="space-y-4">
// //               <div>
// //                 <h2 className="text-2xl font-bold text-foreground">Log in to Route Posts</h2>
// //                 <p className="text-sm text-muted-foreground mt-1">Log in and continue your social journey.</p>
// //               </div>

// //               <div className="relative">
// //                 <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   placeholder="Email address"
// //                   type="email"
// //                   value={loginEmail}
// //                   onChange={(e) => setLoginEmail(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                   required
// //                 />
// //               </div>
// //               <div className="relative">
// //                 <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   placeholder="Password"
// //                   type="password"
// //                   value={loginPassword}
// //                   onChange={(e) => setLoginPassword(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                   required
// //                 />
// //               </div>

// //               <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loginLoading}>
// //                 {loginLoading ? <Loader2 className="animate-spin" size={20} /> : "Log In"}
// //               </Button>

// //               <p className="text-center text-sm text-primary cursor-pointer hover:underline">
// //                 Forgot password?
// //               </p>
// //             </form>
// //           ) : (
// //             <form onSubmit={handleRegister} className="space-y-3">
// //               <div>
// //                 <h2 className="text-2xl font-bold text-foreground">Create a new account</h2>
// //                 <p className="text-sm text-muted-foreground mt-1">It is quick and easy.</p>
// //               </div>

// //               <div className="relative">
// //                 <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   placeholder="Full name"
// //                   value={regName}
// //                   onChange={(e) => setRegName(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                   required
// //                 />
// //               </div>
// //               <div className="relative">
// //                 <AtSign className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   placeholder="Username (optional)"
// //                   value={regUsername}
// //                   onChange={(e) => setRegUsername(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                 />
// //               </div>
// //               <div className="relative">
// //                 <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   placeholder="Email address"
// //                   type="email"
// //                   value={regEmail}
// //                   onChange={(e) => setRegEmail(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                   required
// //                 />
// //               </div>
// //               <div className="relative">
// //                 <Users className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <select
// //                   value={regGender}
// //                   onChange={(e) => setRegGender(e.target.value)}
// //                   className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted text-sm text-foreground appearance-none outline-none"
// //                   required
// //                 >
// //                   <option value="">Select gender</option>
// //                   <option value="male">Male</option>
// //                   <option value="female">Female</option>
// //                 </select>
// //               </div>
// //               <div className="relative">
// //                 <Calendar className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   type="date"
// //                   value={regDob}
// //                   onChange={(e) => setRegDob(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                   required
// //                 />
// //               </div>
// //               <div className="relative">
// //                 <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   placeholder="Password"
// //                   type="password"
// //                   value={regPassword}
// //                   onChange={(e) => setRegPassword(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                   required
// //                 />
// //               </div>
// //               <div className="relative">
// //                 <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
// //                 <Input
// //                   placeholder="Confirm password"
// //                   type="password"
// //                   value={regRePassword}
// //                   onChange={(e) => setRegRePassword(e.target.value)}
// //                   className="pl-10 h-12 rounded-xl bg-muted border-0"
// //                   required
// //                 />
// //               </div>

// //               <Button type="submit" size="lg" className="w-full rounded-xl" disabled={regLoading}>
// //                 {regLoading ? <Loader2 className="animate-spin" size={20} /> : "Create New Account"}
// //               </Button>
// //             </form>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Auth;









import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Calendar, Users, AtSign, Loader2 } from "lucide-react";
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
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regGender, setRegGender] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRePassword, setRegRePassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Redirect if already logged in
  if (token) {
    navigate("/feed", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const data = await authApi.signin({ email: loginEmail, password: loginPassword });
      login(data.token); // تخزين الـ token
      toast({ title: "مرحباً! 👋", description: "تم تسجيل الدخول بنجاح" });
      navigate("/feed");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regRePassword) {
      toast({ title: "خطأ", description: "كلمة المرور غير متطابقة", variant: "destructive" });
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
      toast({ title: "أهلاً بيك! 🎉", description: "تم إنشاء الحساب بنجاح" });
      navigate("/feed");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
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
              <Input placeholder="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              <Input placeholder="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              <Button type="submit" disabled={loginLoading}>{loginLoading ? <Loader2 className="animate-spin" /> : "Log In"}</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <Input placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} required />
              <Input placeholder="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              <select value={regGender} onChange={e => setRegGender(e.target.value)} required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <Input type="date" value={regDob} onChange={e => setRegDob(e.target.value)} required />
              <Input placeholder="Password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
              <Input placeholder="Confirm Password" type="password" value={regRePassword} onChange={e => setRegRePassword(e.target.value)} required />
              <Button type="submit" disabled={regLoading}>{regLoading ? <Loader2 className="animate-spin" /> : "Create New Account"}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;









// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { User, Mail, Lock, Calendar, Users, AtSign, Loader2 } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import { useAuth } from "../context/AuthContext";
// import { authApi } from "../lib/api";
// import { useToast } from "../hooks/use-toast";

// const Auth = () => {
//   const [tab, setTab] = useState<"login" | "register">("login");
//   const navigate = useNavigate();
//   const { login, token } = useAuth(); 
//   const { toast } = useToast();

//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [loginLoading, setLoginLoading] = useState(false);

//   const [regName, setRegName] = useState("");
//   const [regUsername, setRegUsername] = useState("");
//   const [regEmail, setRegEmail] = useState("");
//   const [regGender, setRegGender] = useState("");
//   const [regDob, setRegDob] = useState("");
//   const [regPassword, setRegPassword] = useState("");
//   const [regRePassword, setRegRePassword] = useState("");
//   const [regLoading, setRegLoading] = useState(false);

//   useEffect(() => {
//     if (token) {
//       navigate("/feed", { replace: true });
//     }
//   }, [token, navigate]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoginLoading(true);
//     try {
//       const data = await authApi.signin({ email: loginEmail, password: loginPassword });
//       login(data.token); 
//       toast({ title: "مرحباً!", description: "تم تسجيل الدخول بنجاح" });
//     } catch (err: any) {
//       const message = err?.response?.data?.message || err.message || "حدث خطأ";
//       toast({ title: "خطأ", description: message, variant: "destructive" });
//     } finally {
//       setLoginLoading(false);
//     }
//   };

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (regPassword !== regRePassword) {
//       toast({ title: "خطأ", description: "كلمة المرور غير متطابقة", variant: "destructive" });
//       return;
//     }
//     setRegLoading(true);
//     try {
//       const data = await authApi.signup({
//         name: regName,
//         email: regEmail,
//         password: regPassword,
//         rePassword: regRePassword,
//         dateOfBirth: regDob,
//         gender: regGender,
//       });
//       login(data.token); 
//       toast({ title: "أهلاً بيك!", description: "تم إنشاء الحساب بنجاح" });
//     } catch (err: any) {
//       const message = err?.response?.data?.message || err.message || "حدث خطأ";
//       toast({ title: "خطأ", description: message, variant: "destructive" });
//     } finally {
//       setRegLoading(false);
//     }
//   };

//    return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
//         <div className="space-y-6">
//           <h1 className="text-5xl md:text-6xl font-extrabold text-primary leading-tight">
//             Route Posts
//           </h1>
//           <p className="text-xl text-muted-foreground leading-relaxed">
//             Connect with friends and the world around you on Route Posts.
//           </p>

//           <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
//             <p className="text-xs font-semibold uppercase tracking-wider text-primary">
//               About Route Academy
//             </p>
//             <h3 className="text-lg font-bold text-foreground">
//               Egypt's Leading IT Training Center Since 2012
//             </h3>
//             <p className="text-sm text-muted-foreground leading-relaxed">
//               Route Academy is the premier IT training center in Egypt. We specialize in delivering high-quality training courses in programming, web development, and application development.
//             </p>
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 { num: "2012", label: "FOUNDED" },
//                 { num: "40K+", label: "GRADUATES" },
//                 { num: "50+", label: "PARTNERS" },
//               ].map((stat) => (
//                 <div key={stat.label} className="bg-muted rounded-xl p-3">
//                   <p className="text-lg font-bold text-primary">{stat.num}</p>
//                   <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
//                     {stat.label}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="bg-card rounded-2xl shadow-card-hover p-6 space-y-6">
//           <div className="grid grid-cols-2 bg-muted rounded-xl p-1">
//             <button
//               onClick={() => setTab("login")}
//               className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
//                 tab === "login"
//                   ? "bg-card text-foreground shadow-sm"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               Login
//             </button>
//             <button
//               onClick={() => setTab("register")}
//               className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
//                 tab === "register"
//                   ? "bg-card text-foreground shadow-sm"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               Register
//             </button>
//           </div>

//           {tab === "login" ? (
//             <form onSubmit={handleLogin} className="space-y-4">
//               <div>
//                 <h2 className="text-2xl font-bold text-foreground">Log in to Route Posts</h2>
//                 <p className="text-sm text-muted-foreground mt-1">Log in and continue your social journey.</p>
//               </div>

//               <div className="relative">
//                 <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   placeholder="Email address"
//                   type="email"
//                   value={loginEmail}
//                   onChange={(e) => setLoginEmail(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                   required
//                 />
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   placeholder="Password"
//                   type="password"
//                   value={loginPassword}
//                   onChange={(e) => setLoginPassword(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                   required
//                 />
//               </div>

//               <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loginLoading}>
//                 {loginLoading ? <Loader2 className="animate-spin" size={20} /> : "Log In"}
//               </Button>

//               <p className="text-center text-sm text-primary cursor-pointer hover:underline">
//                 Forgot password?
//               </p>
//             </form>
//           ) : (
//             <form onSubmit={handleRegister} className="space-y-3">
//               <div>
//                 <h2 className="text-2xl font-bold text-foreground">Create a new account</h2>
//                 <p className="text-sm text-muted-foreground mt-1">It is quick and easy.</p>
//               </div>

//               <div className="relative">
//                 <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   placeholder="Full name"
//                   value={regName}
//                   onChange={(e) => setRegName(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                   required
//                 />
//               </div>
//               <div className="relative">
//                 <AtSign className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   placeholder="Username (optional)"
//                   value={regUsername}
//                   onChange={(e) => setRegUsername(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                 />
//               </div>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   placeholder="Email address"
//                   type="email"
//                   value={regEmail}
//                   onChange={(e) => setRegEmail(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                   required
//                 />
//               </div>
//               <div className="relative">
//                 <Users className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <select
//                   value={regGender}
//                   onChange={(e) => setRegGender(e.target.value)}
//                   className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted text-sm text-foreground appearance-none outline-none"
//                   required
//                 >
//                   <option value="">Select gender</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                 </select>
//               </div>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   type="date"
//                   value={regDob}
//                   onChange={(e) => setRegDob(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                   required
//                 />
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   placeholder="Password"
//                   type="password"
//                   value={regPassword}
//                   onChange={(e) => setRegPassword(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                   required
//                 />
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
//                 <Input
//                   placeholder="Confirm password"
//                   type="password"
//                   value={regRePassword}
//                   onChange={(e) => setRegRePassword(e.target.value)}
//                   className="pl-10 h-12 rounded-xl bg-muted border-0"
//                   required
//                 />
//               </div>

//               <Button type="submit" size="lg" className="w-full rounded-xl" disabled={regLoading}>
//                 {regLoading ? <Loader2 className="animate-spin" size={20} /> : "Create New Account"}
//               </Button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

  

// export default Auth;