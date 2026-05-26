import { useEffect, useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import Login from './Login'
import { supabase } from './supabase'

export default function App() {

  const qrRef = useRef()

  const [user, setUser] = useState(null)

  const [showQR, setShowQR] = useState(false)

  const [salesHistory, setSalesHistory] = useState([])

  const products = [
    { id: 1, name: 'Cerveza', price: 80 },
    { id: 2, name: 'VIP', price: 1500 },
    { id: 3, name: 'Whisky', price: 2500 },
    { id: 4, name: 'Vodka', price: 1800 },
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

  useEffect(() => {

    checkUser()

    loadSales()

  }, [])

  async function checkUser() {

    const { data } =
      await supabase.auth.getUser()

    if (data.user) {

      setUser(data.user)
    }
  }

  async function loadSales() {

    const { data, error } =
      await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })

    if (!error) {

      setSalesHistory(data)
    }
  }

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

    const updatedSelected =
      updatedTables.find(
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

    const updatedSelected =
      updatedTables.find(
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

  async function payTable(method) {

    if (!selectedTable) return

    const total =
      getTotal(selectedTable.items)

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

    const updatedSelected =
      updatedTables.find(
        table => table.id === selectedTable.id
      )

    setSelectedTable(updatedSelected)

    setShowQR(true)

    await supabase
      .from('sales')
      .insert([
        {
          customer: selectedTable.number,
          total: total,
          payment_method: method,
          employee: user.email,
        }
      ])

    loadSales()
  }

  async function downloadQR() {

    if (!qrRef.current) return

    const dataUrl =
      await toPng(qrRef.current)

    const link =
      document.createElement('a')

    link.download =
      `HELLFIRE-${selectedTable.number}.png`

    link.href = dataUrl

    link.click()
  }

  async function logout() {

    await supabase.auth.signOut()

    setUser(null)
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

  if (!user) {

    return <Login onLogin={setUser} />
  }

  return (

    <div className="min-h-screen bg-black text-white p-6">

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-6xl font-black text-pink-500">
            HELLFIRE POS
          </h1>

          <p className="text-zinc-400 mt-2">
            Usuario: {user.email}
          </p>

        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-2xl font-black"
        >
          Cerrar Sesión
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* CLIENTES */}

        <div>

          <h2 className="text-3xl font-bold mb-5">
            Clientes
          </h2>

          <div className="grid grid-cols-2 gap-3 h-[700px] overflow-y-scroll pr-2">

            {tables.map(table => (

              <button
                key={table.id}
                onClick={() => selectTable(table)}
                className={`p-4 rounded-2xl transition
                ${
                  selectedTable?.id === table.id
                  ? 'bg-pink-600'
                  : table.paid
                  ? 'bg-green-600'
                  : 'bg-zinc-900 hover:bg-zinc-800'
                }
                `}
              >

                <h3 className="text-xl font-black">
                  #{table.number}
                </h3>

                <p className="text-sm mt-1">
                  ${getTotal(table.items)}
                </p>

              </button>

            ))}

          </div>

        </div>

        {/* PRODUCTOS */}

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
                  onClick={() => addProduct(product)}
                  className="bg-pink-500 hover:bg-pink-600 px-5 py-3 rounded-xl font-bold"
                >
                  Agregar
                </button>

              </div>

            ))}

          </div>

        </div>

        {/* COBRO */}

        <div>

          <h2 className="text-3xl font-bold mb-5">
            Cobro
          </h2>

          <div className="bg-zinc-900 rounded-2xl p-5 min-h-[700px]">

            {!selectedTable && (

              <p className="text-zinc-400">
                Selecciona un cliente
              </p>

            )}

            {selectedTable && (

              <>

                <h3 className="text-4xl font-black text-pink-500 mb-5">
                  Cliente #{selectedTable.number}
                </h3>

                <div className="space-y-3">

                  {selectedTable.items.map((item, index) => (

                    <div
                      key={index}
                      className="flex justify-between items-center border-b border-zinc-700 pb-2"
                    >

                      <div>

                        <span>
                          {item.name}
                        </span>

                        <span className="ml-3 text-pink-400">
                          ${item.price}
                        </span>

                      </div>

                      {!selectedTable.paid && (

                        <button
                          onClick={() => removeProduct(index)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg"
                        >
                          ❌
                        </button>

                      )}

                    </div>

                  ))}

                </div>

                <div className="mt-10">

                  <h3 className="text-4xl font-black text-pink-500">
                    Total:
                    ${getTotal(selectedTable.items)}
                  </h3>

                  {!selectedTable.paid && (

                    <div className="space-y-3 mt-5">

                      <button
                        onClick={() => payTable('Efectivo')}
                        className="w-full bg-green-500 hover:bg-green-600 py-4 rounded-2xl text-xl font-black"
                      >
                        Pago Efectivo
                      </button>

                      <button
                        onClick={() => payTable('Tarjeta')}
                        className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-2xl text-xl font-black"
                      >
                        Pago Tarjeta
                      </button>

                      <button
                        onClick={() => payTable('Transferencia')}
                        className="w-full bg-purple-500 hover:bg-purple-600 py-4 rounded-2xl text-xl font-black"
                      >
                        Transferencia
                      </button>

                    </div>

                  )}

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

        {/* HISTORIAL */}

        <div>

          <h2 className="text-3xl font-bold mb-5">
            Ventas
          </h2>

          <div className="bg-zinc-900 rounded-2xl p-5 h-[700px] overflow-y-scroll">

            {salesHistory.map((sale, index) => (

              <div
                key={index}
                className="border-b border-zinc-700 py-4"
              >

                <h3 className="text-xl font-black text-pink-500">
                  Cliente #{sale.customer}
                </h3>

                <p>
                  ${sale.total}
                </p>

                <p className="text-green-400">
                  {sale.payment_method}
                </p>

                <p className="text-zinc-400 text-sm">
                  {sale.employee}
                </p>

                <p className="text-zinc-500 text-xs">
                  {new Date(
                    sale.created_at
                  ).toLocaleString()}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}