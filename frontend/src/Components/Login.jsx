import { useSignIn, useSignUp, useUser } from "@clerk/clerk-react"
import { useRef, useState } from "react"

export default function Login() {
  const [activeTab, setActiveTab] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {signIn, isLoaded:signInLoaded} = useSignIn();
  const {signUp, isLoaded:signUpLoaded} = useSignUp();
  const [isVerifying, setIsVerifying] = useState(false);
  const [resetVerifying,setResetVerifying] = useState(false);
  
  const d1 = useRef(null);
  const d2 = useRef(null);
  const d3 = useRef(null);
  const d4 = useRef(null);
  const d5 = useRef(null);
  const d6 = useRef(null);

  const r1 = useRef(null);
  const r2 = useRef(null);
  const r3 = useRef(null);
  const r4 = useRef(null);
  const r5 = useRef(null);
  const r6 = useRef(null);

  const pswd = useRef(null)

  const handleLogin = async(e) => {
    e.preventDefault()
    setIsLoading(true)
    if(!signInLoaded){
      setIsLoading(false);
      return;
    }
    try{
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === "complete") {
        await signIn.authenticate();
        console.log(`Logged in as ${activeTab}`);
      }
    }catch(err){
      console.error("Login failed:", err);
      alert("Login failed: " + err.errors?.[0]?.longMessage || err.message);
    }finally {
      setIsLoading(false);
    }
  }

  const handleForgotPassword=async(e)=>{
    e.preventDefault();
    if (!signInLoaded) return;
    if (!email) return alert("Enter your email first!");

    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      alert("Password reset email sent!");
      setResetVerifying(true);
    } catch (err) {
      alert(err.errors?.[0]?.longMessage || "Reset failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateAccount=async(e)=>{
    e.preventDefault();
    setIsLoading(true);
    if(!signUpLoaded){
      setIsLoading(false);
      return;
    }
    try{
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification();
       setIsVerifying(true);
       alert("Verification code has been sent to your email.");
    }catch(err){
      console.error("Signup failed:", err);
      alert("Signup failed: " + err.errors?.[0]?.longMessage || err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault();
  const code = d1.current.value+d2.current.value+d3.current.value+d4.current.value+d5.current.value+d6.current.value
  setIsLoading(true);

  try {
    const result = await signUp.attemptEmailAddressVerification({code});
    if (result.status === "complete") {
      alert("Account verified! You can now log in.");
      setIsVerifying(false);
      setEmail("");
      setPassword("");
    }

  } catch (err) {
    alert(err.errors?.[0]?.longMessage || "Invalid code");
  } finally {
    setIsLoading(false);
  }
};

const handleResetVerification=async(e)=>{
  e.preventDefault();
  const code = r1.current.value+r2.current.value+r3.current.value+r4.current.value+r5.current.value+r6.current.value
  setIsLoading(true);

  try {
    await signIn.attemptResetPassword({ code, newPassword: pswd.current.value });
    alert("Password has been reset! You can now log in.");
    setResetVerifying(false);
    setEmail("");
    setPassword("");
  } catch (err) {
    alert(err.errors?.[0]?.longMessage || "Invalid code");
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="max-h-screen overflow-y-hidden bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div className="hidden lg:block h-full min-h-96">
            <img
              src="/img3.jpg"
              alt="WellNest"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center p-8 lg:p-10">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Welcome to <span className="text-emerald-600">WellNest</span>
              </h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg w-fit">
              {["user", "trainer"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab ? "bg-emerald-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "user" ? "User" : "Trainer"}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter the password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button onClick={handleForgotPassword} className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
                  Forgot password?
                </button>
              </div>

              {/* Login Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Logging in..." : `Login as ${activeTab === "user" ? "User" : "Trainer"}`}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Create Account */}
            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <button onClick={handleCreateAccount} className="text-emerald-600 font-semibold hover:text-emerald-700">
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
      {isVerifying && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-lg font-bold mb-4">Enter Verification Code</h2>
          <div className="flex gap-3 justify-center mb-4">
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={d1} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={d2} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={d3} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={d4} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={d5} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={d6} />
          </div>
          <button onClick={handleVerification}>Submit</button>
        </div>
        </div>
      )}
      {resetVerifying && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-lg font-bold mb-4">Enter Verification Code</h2>
          <div className="flex gap-3 justify-center mb-4">
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={r1} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={r2} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={r3} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={r4} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={r5} />
            <input maxLength={1} className="h-12 w-12 text-center text-xl border-2 border-black" ref={r6} />
          </div>
          <div className="m-4">
            <input type="password" placeholder="Enter new password" ref={pswd} className="w-full px-4 py-3 border-2 border-black text-black" />
          </div>
          <button onClick={handleResetVerification}>Submit</button>
        </div>
        </div>
      )}
    </div>
  )
}
