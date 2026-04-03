import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function GameSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  
  const [questions, setQuestions] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  
  // Game States
  const [currentQ, setCurrentQ] = useState<any>(null)
  const [tndState, setTndState] = useState<'idle' | 'picked_player' | 'showing_question'>('idle')
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchGuests, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    const { data: s } = await supabase.from('sessions').select('*').eq('id', id).single()
    if (s) setSession(s)
    
    // Split logic based on DB setting
    const query = supabase.from('questions').select('*')
    if (s?.game_mode === 'rapid_fire') {
      query.eq('category', 'rapid_fire')
    } else {
      query.in('category', ['truth', 'dare'])
    }
    
    const { data: q } = await query
    if (q && q.length > 0) setQuestions(q)
    fetchGuests()
  }

  const fetchGuests = async () => {
    const { data } = await supabase.from('session_guests').select('*').eq('session_id', id).order('score', { ascending: false })
    if (data) setGuests(data)
  }

  // --- TRUTH AND DARE ENGINE ---
  const pickRandomPlayer = () => {
    if (guests.length === 0) return alert("waiting for players to join...")
    const randomG = guests[Math.floor(Math.random() * guests.length)]
    setCurrentPlayer(randomG)
    setTndState('picked_player')
    setCurrentQ(null)
  }

  const selectTndType = (_type: 'truth' | 'dare') => {
    // User requested choice doesn't dictate the question. Pull from ALL available tnd questions!
    if (questions.length === 0) {
        alert("no questions in bank!")
        return
    }
    const randQ = questions[Math.floor(Math.random() * questions.length)]
    setCurrentQ(randQ)
    setTndState('showing_question')
  }

  // --- RAPID FIRE ENGINE ---
  const nextRapidFire = () => {
    if (questions.length === 0) {
        alert("no rapid fire questions!")
        return
    }
    const randQ = questions[Math.floor(Math.random() * questions.length)]
    setCurrentQ(randQ)
  }

  const endSession = async () => {
    await supabase.from('sessions').update({ status: 'finished' }).eq('id', id)
    navigate('/dashboard')
  }

  const updateScore = async (guestId: string, delta: number, currentScore: number) => {
    await supabase.from('session_guests').update({ score: currentScore + delta }).eq('id', guestId)
    fetchGuests()
  }

  if (!session) return <div className="flex-center">loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className="title-text" style={{ fontSize: '2rem', marginBottom: 0 }}>
             code: <span style={{color: '#c084fc', background: 'rgba(255,255,255,0.5)', padding: '0.2rem 1rem', borderRadius: '8px'}}>{session.join_code}</span>
           </h2>
           <p style={{ opacity: 0.8, fontSize: '1.2rem', marginTop: '0.5rem' }}>
             {window.location.host}/join &nbsp; &bull; &nbsp; 
             <strong style={{color: '#d946ef'}}>{session.game_mode === 'tnd' ? 'truth & dare.' : 'rapid fire.'}</strong>
           </p>
        </div>
        <button className="glass-button danger" onClick={endSession}>
          end session.
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, marginTop: '2rem', gap: '2rem' }}>
        {/* LEADERBOARD */}
        <div className="glass-panel" style={{ width: '300px', flexShrink: 0 }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid rgba(192, 132, 252, 0.2)', paddingBottom: '0.5rem', color: '#701a75' }}>leaderboard.</h3>
          {guests.length === 0 && <p style={{ opacity: 0.6 }}>waiting for players...</p>}
          {guests.map(g => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.7)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
              <span style={{ fontWeight: 600 }}>{g.guest_name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', color: '#a855f7', width: '20px', textAlign: 'center' }}>{g.score}</span>
                <button onClick={() => updateScore(g.id, 1, g.score)} style={{ background: '#a78bfa', color: 'white', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>+</button>
                <button onClick={() => updateScore(g.id, -1, g.score)} style={{ background: '#f472b6', color: 'white', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>-</button>
              </div>
            </div>
          ))}
        </div>

        {/* GAME STAGE */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {session.game_mode === 'tnd' && (
            <>
              {tndState === 'idle' && (
                <button className="glass-button" style={{ fontSize: '2rem', padding: '2rem 4rem' }} onClick={pickRandomPlayer}>
                  spin for a player
                </button>
              )}

              {tndState === 'picked_player' && currentPlayer && (
                <div style={{ textAlign: 'center' }}>
                  <h2 className="title-text" style={{ fontSize: '4rem', color: '#d946ef' }}>it's {currentPlayer.guest_name}'s turn!</h2>
                  <p style={{ fontSize: '2rem', color: '#86198f', marginTop: '1rem' }}>ask them what they choose...</p>
                  <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem' }}>
                    <button className="glass-button btn-truth" style={{ fontSize: '2.5rem', padding: '1.5rem 3rem' }} onClick={() => selectTndType('truth')}>truth</button>
                    <button className="glass-button btn-dare" style={{ fontSize: '2.5rem', padding: '1.5rem 3rem' }} onClick={() => selectTndType('dare')}>dare</button>
                  </div>
                </div>
              )}

              {tndState === 'showing_question' && currentQ && currentPlayer && (
                <div style={{ textAlign: 'center' }}>
                  <h2 className="title-text" style={{ fontSize: '3rem', color: currentQ.category === 'dare' ? '#f472b6' : '#818cf8' }}>
                    {currentPlayer.guest_name}'s {currentQ.category.replace('_', ' ')}
                  </h2>
                  <p style={{ fontSize: '3.5rem', fontWeight: 500, lineHeight: 1.4, maxWidth: '900px', margin: '2rem auto', color: '#4a044e' }}>
                    {currentQ.text}
                  </p>
                  <button className="glass-button" style={{ fontSize: '1.5rem', marginTop: '2rem' }} onClick={() => setTndState('idle')}>next</button>
                </div>
              )}
            </>
          )}

          {session.game_mode === 'rapid_fire' && (
            <>
              {currentQ ? (
                <div style={{ textAlign: 'center' }}>
                  <h2 className="title-text" style={{ fontSize: '3rem', color: '#d946ef' }}>rapid fire.</h2>
                  <p style={{ fontSize: '3.5rem', fontWeight: 500, lineHeight: 1.4, maxWidth: '900px', margin: '2rem auto', color: '#4a044e' }}>
                    {currentQ.text}
                  </p>
                  <button className="glass-button btn-rapid" style={{ fontSize: '1.5rem', marginTop: '3rem' }} onClick={nextRapidFire}>next prompt</button>
                </div>
              ) : (
                <button className="glass-button btn-rapid" style={{ fontSize: '2rem', padding: '2rem 4rem' }} onClick={nextRapidFire}>
                  begin rapid fire!
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
