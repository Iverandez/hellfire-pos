import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'

export default function App() {

  const qrRef = useRef()

  const products = [
{ id: 1, name: 'Entrada', price: 100 },
    { id: 2, name: 'Barra Libre', price: 300 },
    { id: 3, name: 'Cerveza Lata', price: 80 },
    { id: 4, name: 'Caribe', price: 60 },
    { id: 5, name: 'Sky', price: 50 },
    { id: 6, name: 'Cigarros', price: 10 },
    { id: 7, name: 'Perla Negra', price: 200 },
    { id: 8, name: 'Mojito', price: 150 },
    { id: 9, name: 'Paleta', price: 5 },
    { id: 10, name: 'Poppers', price: 350 },
  ]

  const initialTables = Array.from(
    { length: 1000 },
    (_, index) => ({
      id: index + 1,
      number: index + 1,
      items: [],
      paid: false,
      paymentMethod: '',
    })
  )

  const [tables, setTables] = useState(initialTables)

  const [selectedTable, setSelectedTable] = useState(null)

  const [showQR, setShowQR] = useState(false)

  function selectTable(table) {

    setSelectedTable(table)

    setShowQR(false)
  }

  function addProduct(product) {

    if (!selectedTable) return

    const updatedTables = tables.map(table => {

      if (table.id === selectedTable.id) {

        return {
          ...table,
          items: [...table.items, product]
        }
      }

      return table
    })

    setTables(updatedTables)

    const updatedSelected = updatedTables.find(
      table => table.id === selectedTable.id
    )

    setSelectedTable(updatedSelected)
  }

  function removeProduct(indexToRemove) {

    if (!selectedTable) return

    const updatedTables = tables.map(table => {

      if (table.id === selectedTable.id) {

        return {
          ...table,
          items: table.items.filter(
            (_, index) => index !== indexToRemove
          )
        }
      }

      return table
    })

    setTables(updatedTables)

    const updatedSelected = updatedTables.find(
      table => table.id === selectedTable.id
    )

    setSelectedTable(updatedSelected)
  }

  function getTotal(items) {

    return items.reduce(
      (sum, item) => sum + item.price,
      0
    )
  }

  function payTable(method) {

    if (!selectedTable) return

    const updatedTables = tables.map(table => {

      if (table.id === selectedTable.id) {

        return {
          ...table,
          paid: true,
          paymentMethod: method,
        }
      }

      return table
    })

    setTables(updatedTables)

    const updatedSelected = updatedTables.find(
      table => table.id === selectedTable.id
    )

    setSelectedTable(updatedSelected)

    setShowQR(true)
  }

  async function downloadQR() {

    if (!qrRef.current) return

    const dataUrl = await toPng(qrRef.current)

    const link = document.createElement('a')

    link.download = `HELLFIRE-CLIENTE-${selectedTable.number}.png`

    link.href = dataUrl

    link.click()
  }

  const qrData = selectedTable
    ? `
HELLFIRE POS
Cliente: ${selectedTable.number}
Total: $${getTotal(selectedTable.items)}
Metodo: ${selectedTable.paymentMethod}
Estado: PAGADO
`
    : ''

  return (

  <div className="min-h-screen bg-black text-white">

    {/* HEADER */}

    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">

      <h1 className="text-5xl font-black text-pink-500">
        HELLFIRE POS
      </h1>

      <div className="text-right">

        <p className="text-zinc-400">
          Cliente Actual
        </p>

        <h2 className="text-3xl font-black text-green-400">

          {

            selectedTable
            ? `#${selectedTable.number}`
            : 'Ninguno'

          }

        </h2>

      </div>

    </div>

    {/* CONTENIDO */}

    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[90vh]">

      {/* CLIENTES */}

      <div className="p-6 border-r border-zinc-800">

        <h2 className="text-4xl font-black mb-6">
          Clientes
        </h2>

        <div className="grid grid-cols-3 gap-3 h-[75vh] overflow-y-scroll pr-2">

          {tables.map(table => (

            <button

              key={table.id}

              onClick={() => selectTable(table)}

              className={`p-5 rounded-2xl transition-all

              ${
                selectedTable?.id === table.id
                ? 'bg-pink-600 scale-105'
                : table.paid
                ? 'bg-green-600'
                : 'bg-zinc-900 hover:bg-zinc-800'
              }

              `}

            >

              <h3 className="text-2xl font-black">
                #{table.number}
              </h3>

              <p className="text-sm mt-2">

                ${
                  getTotal(table.items)
                }

              </p>

            </button>

          ))}

        </div>

      </div>

      {/* PRODUCTOS + COBRO */}

      <div className="p-6">

        {!selectedTable && (

          <div className="h-full flex items-center justify-center">

            <div className="text-center">

              <h2 className="text-5xl font-black text-pink-500">
                Selecciona un Cliente
              </h2>

              <p className="text-zinc-500 mt-4 text-xl">
                Para comenzar a agregar productos
              </p>

            </div>

          </div>

        )}

        {selectedTable && (

          <>

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-4xl font-black text-pink-500">

                Cliente #{selectedTable.number}

              </h2>

              <h2 className="text-4xl font-black text-green-400">

                ${
                  getTotal(selectedTable.items)
                }

              </h2>

            </div>

            {/* PRODUCTOS */}

            <div className="grid grid-cols-2 gap-4 mb-8">

              {products.map(product => (

                <button

                  key={product.id}

                  onClick={() => addProduct(product)}

                  className="bg-zinc-900 hover:bg-pink-600 transition-all p-5 rounded-2xl text-left"

                >

                  <h3 className="text-2xl font-black">

                    {product.name}

                  </h3>

                  <p className="text-pink-400 text-xl mt-2">

                    ${product.price}

                  </p>

                </button>

              ))}

            </div>

            {/* CARRITO */}

            <div className="bg-zinc-900 rounded-2xl p-5">

              <h2 className="text-3xl font-black mb-5">
                Consumo
              </h2>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">

                {selectedTable.items.map((item, index) => (

                  <div

                    key={index}

                    className="flex justify-between items-center bg-black p-4 rounded-xl"

                  >

                    <div>

                      <p className="font-bold">

                        {item.name}

                      </p>

                      <p className="text-pink-400">

                        ${item.price}

                      </p>

                    </div>

                    {!selectedTable.paid && (

                      <button

                        onClick={() => removeProduct(index)}

                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"

                      >

                        X

                      </button>

                    )}

                  </div>

                ))}

              </div>

              {/* PAGOS */}

              {!selectedTable.paid && (

                <div className="grid grid-cols-3 gap-3 mt-6">

                  <button

                    onClick={() => payTable('Efectivo')}

                    className="bg-green-500 hover:bg-green-600 py-4 rounded-2xl text-xl font-black"

                  >

                    Efectivo

                  </button>

                  <button

                    onClick={() => payTable('Tarjeta')}

                    className="bg-blue-500 hover:bg-blue-600 py-4 rounded-2xl text-xl font-black"

                  >

                    Tarjeta

                  </button>

                  <button

                    onClick={() => payTable('Transferencia')}

                    className="bg-purple-500 hover:bg-purple-600 py-4 rounded-2xl text-xl font-black"

                  >

                    Transferencia

                  </button>

                </div>

              )}

              {/* QR */}

              {selectedTable.paid && showQR && (

                <div className="mt-10 flex flex-col items-center">

                  <div

                    ref={qrRef}

                    className="bg-black p-6 rounded-2xl border border-pink-500"

                  >

                    <h3 className="text-2xl font-black text-green-400 mb-5 text-center">

                      PAGADO

                    </h3>

                    <QRCodeSVG

                      value={qrData}

                      size={250}

                      bgColor="#000000"

                      fgColor="#ffffff"

                    />

                    <p className="mt-5 text-center">

                      Cliente #{selectedTable.number}

                    </p>

                    <p className="text-pink-400 text-center mt-2">

                      {selectedTable.paymentMethod}

                    </p>

                    <p className="text-green-400 text-center mt-2">

                      ${getTotal(selectedTable.items)}

                    </p>

                  </div>

                  <button

                    onClick={downloadQR}

                    className="mt-5 bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-2xl font-black"

                  >

                    Descargar QR

                  </button>

                </div>

              )}

            </div>

          </>

        )}

      </div>

    </div>

  </div>

)

}