import { useState } from 'react'
import { Zap, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'USER' })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (form.password !== form.confirmPassword) {
        return setError('Passwords do not match')
      }
      if (form.password.length < 6) {
        return setError('Password must be at least 6 characters')
      }
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(form.email, form.password)
        if (error) throw new Error(error)
        navigate('/')
      } else {
        const userRole = form.email.toLowerCase() === 'admin@smartcart.com' ? 'ADMIN' : 'USER'
        const { error } = await signUp(form.email, form.password, userRole)
        if (error) throw new Error(error)
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white p-8 shadow-sm border border-surface-200 rounded-sm animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
           <Link to="/" className="flex flex-col -gap-1 items-center hover:opacity-90 transition-opacity">
              <h1 className="font-bold text-3xl italic tracking-tight leading-none text-brand-500">SmartCart</h1>
              <span className="text-[12px] italic text-accent-500 font-bold ml-1 uppercase">Explore Plus</span>
           </Link>
           <div className="text-center">
              <h2 className="text-lg font-bold text-surface-900 uppercase tracking-wide">
                 {mode === 'signin' ? 'Login' : 'Signup'}
              </h2>
              <p className="text-surface-500 text-xs mt-1 font-medium">
                 Get access to your Orders, Wishlist and Recommendations
              </p>
           </div>
        </div>

        {/* Toggle - Flipkart Style */}
        <div className="flex border-b border-surface-100 mb-6">
           <button 
              onClick={() => { setMode('signin'); setError('') }}
              className={`flex-1 pb-3 text-sm font-bold transition-all ${mode === 'signin' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-surface-400'}`}
           >
              LOGIN
           </button>
           <button 
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 pb-3 text-sm font-bold transition-all ${mode === 'signup' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-surface-400'}`}
           >
              SIGNUP
           </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
             <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="peer w-full h-10 border-b-2 border-surface-200 text-surface-900 focus:outline-none focus:border-brand-500 placeholder-transparent transition-all"
                  placeholder="Email"
                  id="email"
                />
                <label 
                  htmlFor="email"
                  className="absolute left-0 -top-3.5 text-surface-400 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-surface-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-brand-500 peer-focus:text-xs font-medium"
                >
                  Enter Email/Mobile number
                </label>
             </div>

             <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="peer w-full h-10 border-b-2 border-surface-200 text-surface-900 focus:outline-none focus:border-brand-500 placeholder-transparent transition-all"
                  placeholder="Password"
                  id="password"
                />
                <label 
                  htmlFor="password"
                  className="absolute left-0 -top-3.5 text-surface-400 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-surface-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-brand-500 peer-focus:text-xs font-medium"
                >
                  Enter Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-2 text-brand-500 font-bold text-[10px] hover:text-brand-600 uppercase"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
             </div>

             {mode === 'signup' && (
               <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="peer w-full h-10 border-b-2 border-surface-200 text-surface-900 focus:outline-none focus:border-brand-500 placeholder-transparent transition-all"
                    placeholder="Confirm Password"
                    id="confirmPassword"
                  />
                  <label 
                    htmlFor="confirmPassword"
                    className="absolute left-0 -top-3.5 text-surface-400 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-surface-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-brand-500 peer-focus:text-xs font-medium"
                  >
                    Confirm Password
                  </label>
               </div>
             )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-sm border border-red-200">
               <AlertCircle size={14} />
               <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
             <p className="text-[10px] text-surface-400 font-medium">
                By continuing, you agree to SmartCart's <span className="text-brand-500 cursor-pointer">Terms of Use</span> and <span className="text-brand-500 cursor-pointer">Privacy Policy</span>.
             </p>
             
             <button
               type="submit"
               disabled={loading}
               className="w-full h-12 bg-accent-500 text-white font-bold rounded-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center uppercase tracking-wider"
             >
               {loading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                 mode === 'signin' ? 'Login' : 'Signup'
               )}
             </button>

             {mode === 'signin' && (
               <div className="mt-2 p-4 bg-surface-50 border border-surface-100 rounded-sm">
                  <p className="text-[11px] font-bold text-surface-400 mb-2 uppercase flex items-center gap-2">
                     <ShieldCheck size={14} className="text-green-500" /> Administrative Access
                  </p>
                  <p className="text-[12px] text-surface-700">
                     <span className="font-bold">Email:</span> akurathikranthi12@gmail.com<br/>
                     <span className="font-bold">Pass:</span> (Use your set password)
                  </p>
               </div>
             )}
          </div>
        </form>
      </div>
    </div>
  )
}

