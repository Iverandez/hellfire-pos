import { useState } from 'react'
import { supabase } from './supabase'


export default function Login(){

  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)

  async function signIn(){

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({

      email,
      password

    })

    if(error){

      alert(error.message)

    }

    setLoading(false)

  }

  return(

    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="bg-zinc-900 p-10 rounded-3xl w-full max-w-md border border-pink-500">

        <h1 className="text-5xl font-black text-pink-500 text-center mb-10">

          HELLFIRE

        </h1>

        <input

          type="email"

          placeholder="Correo"

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

          className="w-full bg-black border border-zinc-700 p-4 rounded-2xl mb-4 text-white"

        />

        <input

          type="password"

          placeholder="Contraseña"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

          className="w-full bg-black border border-zinc-700 p-4 rounded-2xl mb-6 text-white"

        />

        <button

          onClick={signIn}

          disabled={loading}

          className="w-full bg-pink-500 hover:bg-pink-600 py-4 rounded-2xl font-black text-xl"

        >

          {

            loading
            ? 'Entrando...'
            : 'Entrar'

          }

        </button>

      </div>

    </div>

  )

}