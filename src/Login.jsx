import { useState } from 'react'
import { supabase } from './supabase'

export default function Login({ onLogin }) {

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  async function login() {

    const { data, error } =
      await supabase.auth.signInWithPassword({

        email,
        password
      })

    if (error) {

      alert('Usuario incorrecto')

      return
    }

    onLogin(data.user)
  }

  return (

    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="bg-zinc-900 p-10 rounded-3xl w-[400px]">

        <h1 className="text-5xl font-black text-pink-500 mb-10 text-center">
          HELLFIRE
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white mb-4"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white mb-6"
        />

        <button
          onClick={login}
          className="w-full bg-pink-500 hover:bg-pink-600 py-4 rounded-2xl text-2xl font-black"
        >
          Entrar
        </button>

      </div>

    </div>
  )
}