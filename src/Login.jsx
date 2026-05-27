import { useState } from 'react'
import { supabase } from './supabase'

export default function Login({ onLogin }) {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e) {

    e.preventDefault()

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    if (error) {
      setError(error.message)
      return
    }

    onLogin(data.user)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >

      <form
        onSubmit={handleLogin}
        style={{
          background: '#111',
          padding: 30,
          borderRadius: 20,
          width: 320
        }}
      >

        <h1
          style={{
            color: '#ff0080',
            textAlign: 'center'
          }}
        >
          HELLFIRE LOGIN
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{
            width:'100%',
            padding:12,
            marginTop:20
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{
            width:'100%',
            padding:12,
            marginTop:10
          }}
        />

        <button
          type="submit"
          style={{
            width:'100%',
            padding:14,
            marginTop:20,
            background:'#ff0080',
            color:'white',
            border:'none',
            borderRadius:10
          }}
        >
          Entrar
        </button>

        <p style={{ color:'red' }}>
          {error}
        </p>

      </form>

    </div>
  )
}