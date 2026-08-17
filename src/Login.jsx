import { useState } from 'react'
import { supabase } from './supabase'
import hellfireLogo from './assets/logo-hellfire.jpeg'


export default function Login(){

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')


  async function handleLogin(e){

    e.preventDefault()

    if(!email || !password){

      setErrorMessage(
        'Ingresa tu correo y contraseña'
      )

      return
    }


    setLoading(true)
    setErrorMessage('')


    try{

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password
        })


      if(error){

        console.error(
          'ERROR LOGIN:',
          error
        )

        setErrorMessage(
          'Correo o contraseña incorrectos'
        )

        return
      }


    }catch(error){

      console.error(
        'ERROR GENERAL LOGIN:',
        error
      )

      setErrorMessage(
        'No se pudo iniciar sesión'
      )


    }finally{

      setLoading(false)

    }

  }


  return (

    <div
      className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        px-5
        relative
        overflow-hidden
      "
    >


      {/* GLOW DE FONDO */}

      <div
        className="
          absolute
          w-[500px]
          h-[500px]
          rounded-full
          bg-fuchsia-600/10
          blur-[120px]
        "
      />


      <div
        className="
          relative
          w-full
          max-w-[460px]
          bg-zinc-950
          border
          border-fuchsia-500/40
          rounded-[32px]
          p-8
          md:p-10
          shadow-[0_0_45px_rgba(255,0,170,0.18)]
        "
      >


        {/* LOGO */}

        <div
          className="
            flex
            justify-center
            mb-6
          "
        >

          <img
            src={hellfireLogo}
            alt="HELLFIRE"
            className="
              w-full
              max-w-[300px]
              max-h-[190px]
              object-contain
              drop-shadow-[0_0_25px_rgba(255,0,180,0.5)]
            "
          />

        </div>


        {/* TITULO */}

        <div className="text-center mb-8">

          <h1
            className="
              text-4xl
              font-black
              tracking-wide
              bg-clip-text
              text-transparent
            "
            style={{
              backgroundImage:
                'linear-gradient(90deg,#ff1744,#ff9100,#ffee00,#00e676,#00b0ff,#7c4dff,#ff1493)'
            }}
          >
            HELLFIRE
          </h1>


          <p className="
            text-zinc-500
            mt-2
            text-sm
            uppercase
            tracking-[0.2em]
          ">
            Acceso al sistema
          </p>

        </div>


        {/* FORMULARIO */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >


          {/* CORREO */}

          <div>

            <label
              className="
                block
                text-zinc-400
                mb-2
                text-sm
                font-bold
              "
            >
              Correo
            </label>


            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="correo@hellfire.com"
              autoComplete="email"
              className="
                w-full
                bg-black
                border
                border-fuchsia-500/25
                rounded-2xl
                px-5
                py-4
                text-white
                outline-none
                transition-all
                duration-200
                placeholder:text-zinc-700
                focus:border-fuchsia-400
                focus:shadow-[0_0_20px_rgba(255,0,180,0.18)]
              "
            />

          </div>


          {/* CONTRASEÑA */}

          <div>

            <label
              className="
                block
                text-zinc-400
                mb-2
                text-sm
                font-bold
              "
            >
              Contraseña
            </label>


            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              autoComplete="current-password"
              className="
                w-full
                bg-black
                border
                border-fuchsia-500/25
                rounded-2xl
                px-5
                py-4
                text-white
                outline-none
                transition-all
                duration-200
                placeholder:text-zinc-700
                focus:border-fuchsia-400
                focus:shadow-[0_0_20px_rgba(255,0,180,0.18)]
              "
            />

          </div>


          {/* ERROR */}

          {
            errorMessage && (

              <div
                className="
                  bg-red-950/40
                  border
                  border-red-500/30
                  text-red-300
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  text-center
                "
              >
                {errorMessage}
              </div>

            )
          }


          {/* BOTON */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              mt-2
              py-4
              rounded-2xl
              font-black
              text-lg
              transition-all
              duration-200
              hover:scale-[1.02]
              disabled:opacity-50
              disabled:cursor-not-allowed
              shadow-[0_0_25px_rgba(255,0,180,0.3)]
            "
            style={{
              background:
                'linear-gradient(90deg,#ff1744,#ff1493,#9c27ff)'
            }}
          >

            {
              loading
                ? 'Entrando...'
                : 'Entrar'
            }

          </button>

        </form>


        {/* PIE */}

        <div
          className="
            mt-8
            pt-5
            border-t
            border-fuchsia-500/10
            text-center
          "
        >

          <p className="
            text-zinc-600
            text-xs
            tracking-[0.2em]
            uppercase
          ">
            Hellfire · Point of Sale
          </p>

        </div>

      </div>

    </div>

  )

}