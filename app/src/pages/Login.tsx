import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUP, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUP) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else if (data.user) {
        await supabase.from('profiles').insert([{ id: data.user.id, email }])
        alert('check your email for confirmation link if enabled.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else navigate('/dashboard')
    }
  }

  return (
    <div className="flex-center">
      <div className="glass-panel">
        <h1 className="title-text" style={{ textAlign: 'center' }}>{isSignUP ? 'join as host.' : 'host login.'}</h1>
        <form onSubmit={handleAuth} style={{ marginTop: '1.5rem' }}>
          <input className="glass-input" type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="glass-input" type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="glass-button" style={{ width: '100%', marginTop: '0.5rem' }} type="submit">{isSignUP ? 'sign up' : 'login'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', opacity: 0.8, color: '#701a75' }} onClick={() => setIsSignUp(!isSignUP)}>
          {isSignUP ? 'already have an account? login.' : "don't have an account? sign up."}
        </p>
      </div>
    </div>
  )
}
