import { useState } from 'react'

export default function App() {

  const [cart, setCart] = useState([])

  const products = [
    {
      id: 1,
      name: 'Cerveza',
      price: 80
    },
    {
      id: 2,
      name: 'VIP',
      price: 1500
    },
    {
      id: 3,
      name: 'Whisky',
      price: 2500
    }
  ]

  function addToCart(product) {
    setCart([...cart, product])
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  )

  return (

    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-6xl font-black text-center text-pink-500 mb-10">
        HELLFIRE POS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div>

          <h2 className="text-3xl font-bold mb-5">
            Productos
          </h2>

          <div className="space-y-4">

            {products.map(product => (

              <div
                key={product.id}
                className="bg-zinc-900 rounded-2xl p-5 flex justify-between items-center"
              >

                <div>
                  <h3 className="text-2xl font-bold">
                    {product.name}
                  </h3>

                  <p className="text-pink-400 text-xl">
                    ${product.price}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="bg-pink-500 hover:bg-pink-600 px-5 py-3 rounded-xl font-bold"
                >
                  Agregar
                </button>

              </div>

            ))}

          </div>

        </div>

        <div>

          <h2 className="text-3xl font-bold mb-5">
            Cobro
          </h2>

          <div className="bg-zinc-900 rounded-2xl p-5 min-h-[400px]">

            <div className="space-y-3">

              {cart.map((item, index) => (

                <div
                  key={index}
                  className="flex justify-between border-b border-zinc-700 pb-2"
                >

                  <span>
                    {item.name}
                  </span>

                  <span>
                    ${item.price}
                  </span>

                </div>

              ))}

            </div>

            <div className="mt-10">

              <h3 className="text-4xl font-black text-pink-500">
                Total: ${total}
              </h3>

              <button
                className="w-full mt-5 bg-green-500 hover:bg-green-600 py-4 rounded-2xl text-2xl font-black"
              >
                Cobrar
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}