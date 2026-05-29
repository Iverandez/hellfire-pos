import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import Login from './Login'

export default function App() {

  function getTotal(items){

    if(!items) return 0

    return items.reduce(
      (sum,item)=>sum + item.price,
      0
    )

  }

  const qrRef = useRef()

  const [tables, setTables] = useState([])
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [session,setSession] = useState(null)

  const selectedTable = tables.find(
    table => table.id === selectedTableId
  )

  const products = [

    { id: 1, name: 'Entrada', price: 100 },
    { id: 2, name: 'Barra Libre', price: 300 },
    { id: 3, name: 'Cerveza Lata', price: 60 },
    { id: 4, name: 'Caribe', price: 60 },
    { id: 5, name: 'Sky', price: 80 },
    { id: 6, name: 'New Mix', price: 50 },
    { id: 7, name: 'Servicio Extra', price: 150 },
    { id: 8, name: 'Poppers', price: 350 },
    { id: 9, name: 'Cigarros', price: 10 },
    { id: 10, name: 'Papas', price: 15 },
    { id: 11, name: 'Maruchan', price: 25 },
    { id: 12, name: 'Paleta', price: 5 },
    { id: 13, name: 'Condones', price: 0 },
    { id: 14, name: 'Agua', price: 10 },

  ]

  useEffect(()=>{

    supabase.auth.getSession()

      .then(({ data:{ session } })=>{

        setSession(session)

      })

    supabase.auth.onAuthStateChange(
      (_event,session)=>{

        setSession(session)

      }
    )

    fetchTables()

    const channel = supabase

      .channel('tables-realtime')

      .on(
        'postgres_changes',
        {
          event:'*',
          schema:'public',
          table:'tables'
        },
        ()=>{

          fetchTables()

        }
      )

      .subscribe()

    return ()=>{

      supabase.removeChannel(channel)

    }

  },[])

  async function fetchTables(){

    const { data, error } = await supabase

      .from('tables')

      .select('*')

      .order('number', { ascending:true })

    if(error){

      alert(error.message)

      return

    }

    setTables(data)

  }

  async function addProduct(product){

    if(!selectedTable) return

    const updatedItems = [

      ...(selectedTable.items || []),

      product

    ]

    await supabase

      .from('tables')

      .update({

        items:updatedItems

      })

      .eq('id',selectedTable.id)

  }

  async function removeProduct(index){

    if(!selectedTable) return

    const updatedItems =
      (selectedTable.items || []).filter(
        (_,i)=>i !== index
      )

    const { error } = await supabase

      .from('tables')

      .update({

        items: updatedItems

      })

      .eq('id', selectedTable.id)

    if(error){

      alert(error.message)

      return

    }

    fetchTables()

  }

  async function payTable(method){

    if(!selectedTable) return

    const total =
      getTotal(selectedTable.items)

    await supabase

      .from('sales')

      .insert([{

        table_number: selectedTable.number,

        items: selectedTable.items,

        total: total,

        payment_method: method

      }])

    await supabase

      .from('tables')

      .update({

        paid:true,

        payment_method:method

      })

      .eq('id',selectedTable.id)

    setShowQR(true)

  }

  async function resetTable(){

    if(!selectedTable) return

    await supabase

      .from('tables')

      .update({

        items:[],

        paid:false,

        payment_method:''

      })

      .eq('id',selectedTable.id)

    setShowQR(false)

  }

  async function downloadQR(){

    const dataUrl = await toPng(qrRef.current)

    const link =
      document.createElement('a')

    link.download =
      `CLIENTE-${selectedTable.number}.png`

    link.href = dataUrl

    link.click()

  }

  const qrData = selectedTable

    ? `
CLIENTE ${selectedTable.number}
TOTAL ${getTotal(selectedTable.items)}
METODO ${selectedTable?.payment_method || ''}
PAGADO
`

    : ''

  if(!session){

    return <Login />

  }

  return (

    <div className="min-h-screen bg-black text-white">

      <div className="p-6 border-b border-zinc-800 flex justify-between items-center">

        <div>

          <h1 className="text-5xl font-black text-pink-500">

            HELLFIRE POS

          </h1>

        </div>

        <div className="flex items-center gap-4">

          <div>

            <p className="text-zinc-400">
              Cliente
            </p>

            <h2 className="text-3xl font-black text-green-400">

              {

                selectedTable
                ? `#${selectedTable.number}`
                : 'Ninguno'

              }

            </h2>

          </div>

          <button

            onClick={()=>
              supabase.auth.signOut()
            }

            className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-black"

          >

            Salir

          </button>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* CLIENTES */}

        <div className="p-6 border-r border-zinc-800">

          <h2 className="text-4xl font-black mb-5">

            Clientes

          </h2>

          <div className="grid grid-cols-3 gap-3 h-[80vh] overflow-y-scroll">

            {

              tables.map(table=>(

                <button

                  key={table.id}

                  onClick={()=>
                    setSelectedTableId(table.id)
                  }

                  className={`p-5 rounded-2xl

                  ${
                    selectedTable?.id===table.id
                    ? 'bg-pink-600'
                    : table.paid
                    ? 'bg-green-600'
                    : 'bg-zinc-900'
                  }

                  `}

                >

                  <h3 className="text-2xl font-black">

                    #{table.number}

                  </h3>

                  <p>

                    ${
                      getTotal(table.items)
                    }

                  </p>

                </button>

              ))

            }

          </div>

        </div>

        {/* PRODUCTOS */}

        <div className="p-6">

          {

            !selectedTable && (

              <div className="h-full flex items-center justify-center">

                <h2 className="text-5xl font-black text-pink-500">

                  Selecciona Cliente

                </h2>

              </div>

            )

          }

          {

            selectedTable && (

              <>

                <div className="flex justify-between items-center mb-6">

                  <h2 className="text-4xl font-black text-pink-500">

                    Cliente #{selectedTable.number}

                  </h2>

                  <h2 className="text-4xl font-black text-green-400">

                    ${
                      getTotal(selectedTable?.items || [])
                    }

                  </h2>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  {

                    products.map(product=>(

                      <button

                        key={product.id}

                        onClick={()=>
                          addProduct(product)
                        }

                        className="bg-zinc-900 p-5 rounded-2xl hover:bg-pink-600"

                      >

                        <h3 className="text-2xl font-black">

                          {product.name}

                        </h3>

                        <p className="text-pink-400">

                          ${product.price}

                        </p>

                      </button>

                    ))

                  }

                </div>

                <div className="mt-8 bg-zinc-900 p-5 rounded-2xl">

                  <h2 className="text-3xl font-black mb-5">

                    Consumo

                  </h2>

                  <div className="space-y-3">

                    {

                      (selectedTable?.items || []).map(
                        (item,index)=>(

                          <div

                            key={index}

                            className="flex justify-between bg-black p-4 rounded-xl"

                          >

                            <div>

                              <p className="font-bold">

                                {item.name}

                              </p>

                              <p className="text-pink-400">

                                ${item.price}

                              </p>

                            </div>

                            <button

                              onClick={()=>
                                removeProduct(index)
                              }

                              className="bg-red-500 px-4 rounded-xl"

                            >

                              X

                            </button>

                          </div>

                        )

                      )

                    }

                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">

                    <button

                      onClick={()=>
                        payTable('Efectivo')
                      }

                      className="bg-green-500 py-4 rounded-2xl font-black"

                    >

                      Efectivo

                    </button>

                    <button

                      onClick={()=>
                        payTable('Tarjeta')
                      }

                      className="bg-blue-500 py-4 rounded-2xl font-black"

                    >

                      Tarjeta

                    </button>

                    <button

                      onClick={()=>
                        payTable('Transferencia')
                      }

                      className="bg-purple-500 py-4 rounded-2xl font-black"

                    >

                      Transferencia

                    </button>

                  </div>

                  {

                    selectedTable?.paid && showQR && (

                      <div className="mt-10 flex flex-col items-center">

                        <div
                          ref={qrRef}
                          className="bg-black p-6 rounded-2xl border border-pink-500"
                        >

                          <QRCodeSVG

                            value={qrData}

                            size={250}

                            bgColor="#000"

                            fgColor="#fff"

                          />

                        </div>

                        <button

                          onClick={downloadQR}

                          className="mt-5 bg-pink-500 px-6 py-3 rounded-2xl font-black"

                        >

                          Descargar QR

                        </button>

                        <button

                          onClick={resetTable}

                          className="mt-3 bg-red-500 px-6 py-3 rounded-2xl font-black"

                        >

                          Liberar Cliente

                        </button>

                      </div>

                    )

                  }

                </div>

              </>

            )

          }

        </div>

      </div>

    </div>

  )

}