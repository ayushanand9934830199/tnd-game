import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Join() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)
  const navigate = useNavigate()

  const handleJoin = async (e: any) => {
    e.preventDefault()
    if (!code || !name) return
    
    // Find session
    const { data: sessionData } = await supabase.from('sessions').select('id').eq('join_code', code).single()
    if (!sessionData) {
        alert("opps! game code isn't right.")
        return
    }

    const { error } = await supabase.from('session_guests').insert([{ session_id: sessionData.id, guest_name: name, score: 0 }])
    if (error) {
        alert("could not join: " + error.message)
    } else {
        setJoined(true)
    }
  }

  return (
    <div className="flex-center">
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        {!joined ? (
          <>
            <h1 className="title-text" style={{ textAlign: 'center' }}>join game.</h1>
            <form onSubmit={handleJoin} style={{ marginTop: '1.5rem' }}>
              <input className="glass-input" placeholder="invite code" value={code} onChange={e => setCode(e.target.value)} required />
              <input className="glass-input" placeholder="your name" value={name} onChange={e => setName(e.target.value)} required />
              <button className="glass-button" style={{ width: '100%' }} type="submit">join in</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', opacity: 0.8, color: '#701a75' }} onClick={() => navigate('/')}>
              back to host login.
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2 className="title-text">you're in!</h2>
            <p style={{ fontSize: '1.2rem', color: '#701a75', marginTop: '1rem' }}>watch the main screen.</p>
          </div>
        )}
      </div>
    </div>
  )
}
