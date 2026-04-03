import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Play } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<any[]>([])
  const [text, setText] = useState('')
  const [category, setCategory] = useState('truth')
  const [userId, setUserId] = useState<string|null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
      else navigate('/')
    })
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false })
    if (data) setQuestions(data)
  }

  const handleAdd = async (e: any) => {
    e.preventDefault()
    if (!text || !userId) return
    const { error } = await supabase.from('questions').insert([{ text, category, author_id: userId }])
    if (!error) {
      setText('')
      fetchQuestions()
    } else {
        alert(error.message)
    }
  }

  const startSession = async (mode: 'tnd' | 'rapid_fire') => {
    if (!userId) return
    const joinCode = Math.random().toString(36).substring(2, 6)
    
    let hostName = 'host'
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user?.email) {
      hostName = userData.user.email.split('@')[0]
    }

    const { data, error } = await supabase.from('sessions').insert([{ host_id: userId, name: 'Game Night', status: 'active', join_code: joinCode, game_mode: mode }]).select()
    if (data && data[0]) {
      await supabase.from('session_guests').insert([{ session_id: data[0].id, guest_name: hostName, score: 0 }])
      navigate(`/session/${data[0].id}`)
    } else if (error) {
        alert(error.message)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="title-text" style={{ fontSize: '2rem', marginBottom: 0 }}>dashboard.</h1>
        <div style={{ display: 'flex', gap: '1rem'}}>
          <button className="glass-button btn-truth" onClick={() => startSession('tnd')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={16} /> truth & dare
          </button>
          <button className="glass-button btn-rapid" onClick={() => startSession('rapid_fire')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={16} /> rapid fire
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', maxWidth: '100%' }}>
        <h3>add a prompt.</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <select className="glass-input" style={{ width: 'auto', marginBottom: 0 }} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="truth" style={{color: 'black'}}>truth</option>
            <option value="dare" style={{color: 'black'}}>dare</option>
            <option value="rapid_fire" style={{color: 'black'}}>rapid fire</option>
          </select>
          <input className="glass-input" style={{ marginBottom: 0 }} placeholder="type question here..." value={text} onChange={e => setText(e.target.value)} required />
          <button className="glass-button" type="submit" style={{ width: '56px', height: '56px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', flexShrink: 0 }}>
            <PlusCircle size={24} />
          </button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ opacity: 0.8, marginBottom: '1rem', color: '#701a75' }}>question bank ({questions.length})</h3>
        <div className="card-grid">
          {questions.map(q => (
            <div key={q.id} className="question-card">
              <span className={`badge ${q.category}`}>{q.category.replace('_', ' ')}</span>
              <p style={{ marginTop: '0.5rem', fontSize: '1.2rem' }}>{q.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
