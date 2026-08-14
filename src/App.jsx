import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import Login from './Login'

export default function App() {

function getTotal(items){

  if(!items) return 0

  return items.reduce(
    (sum,item)=>sum + Number(item.price || 0),
    0
  )

}

  const qrRef = useRef()

  const paymentLockRef = useRef(false)
  const [isPaying, setIsPaying] = useState(false)

  const [tables, setTables] = useState([])
  const [todaySales, setTodaySales] = useState(0)
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [session,setSession] = useState(null)

  const selectedTable = tables.find(
    table => table.id === selectedTableId
  )

  const products = [

    { id: 1, name: 'Entrada', price: 150 },
    { id: 2, name: 'Barra Libre', price: 400 },
    { id: 3, name: 'Cerveza Lata', price: 60 },
    { id: 4, name: 'Cigarros', price: 10 },
    { id: 5, name: 'Poppers', price: 450 },
    { id: 6, name: 'Sky', price: 80 },
    { id: 7, name: 'New Mix', price: 50 },
    { id: 8, name: 'Caribe', price: 60 },
    { id: 9, name: 'Perla Negra', price: 200 },
    { id: 10, name: 'Agua', price: 10 },
    { id: 11, name: 'Papas', price: 15 },
    { id: 12, name: 'Maruchan', price: 25 },
    { id: 13, name: 'Paleta', price: 5 },
    { id: 14, name: 'Chicles', price: 5 },
    { id: 15, name: 'Condones', price: 10 },
    { id: 16, name: 'Refresco', price: 25 },

  ]

useEffect(()=>{

  supabase.auth.getSession()

    .then(({ data:{ session } })=>{

      setSession(session)

    })


  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, session)=>{

      setSession(session)

    }
  )


  fetchTables()
  fetchTodaySales()


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

    .on(
      'postgres_changes',
      {
        event:'*',
        schema:'public',
        table:'sales'
      },
      ()=>{

        fetchTodaySales()

      }
    )

    .subscribe()


  return ()=>{

    supabase.removeChannel(channel)

    authListener.subscription.unsubscribe()

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


  setTables(data || [])

}

async function fetchTodaySales(){

  try{

    // Buscar último corte de caja
    const { data: cut, error: cutError } = await supabase
      .from('daily_cuts')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if(cutError){
      console.error('ERROR BUSCANDO CORTE:', cutError)
    }

    console.log('ULTIMO CORTE:', cut)

    let query = supabase
      .from('sales')
      .select('id, total, created_at, payment_method')

    // Si existe un corte, contar desde ese momento
    if(cut?.created_at){

      console.log('BUSCANDO VENTAS DESDE:', cut.created_at)

      query = query.gte(
        'created_at',
        cut.created_at
      )

    }else{

      // Si nunca se ha hecho un corte,
      // contar desde el inicio del día
      const inicio = new Date()

      inicio.setHours(0,0,0,0)

      console.log(
        'BUSCANDO VENTAS DESDE INICIO DEL DIA:',
        inicio.toISOString()
      )

      query = query.gte(
        'created_at',
        inicio.toISOString()
      )

    }

    const { data, error } = await query

    if(error){

      console.error(
        'ERROR CONSULTANDO VENTAS:',
        error
      )

      return

    }

    console.log(
      'VENTAS ENCONTRADAS:',
      data
    )

    const total = (data || []).reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    )

    console.log(
      'TOTAL CALCULADO:',
      total
    )

    setTodaySales(total)

  }catch(error){

    console.error(
      'ERROR fetchTodaySales:',
      error
    )

  }

}

async function resetSales(){

  const confirmacion = confirm(
    "¿Reiniciar ventas del día?"
  )

  if(!confirmacion) return


  const { error } = await supabase

    .from('daily_cuts')

    .insert({})


  if(error){

    alert(error.message)
    return

  }


  setTodaySales(0)

}

  async function addProduct(product){

  if(!selectedTable) return


  const updatedItems = [
    ...(selectedTable.items || []),
    product
  ]


  // Actualización inmediata en pantalla
  setTables(prevTables =>
    prevTables.map(table =>
      table.id === selectedTable.id
        ? {
            ...table,
            items: updatedItems
          }
        : table
    )
  )


  // Guardar en Supabase después
  const { error } = await supabase

    .from('tables')

    .update({
      items: updatedItems
    })

    .eq('id', selectedTable.id)


  if(error){

    alert(error.message)

    // Si falla, recargar datos reales
    fetchTables()

  }

}

  async function removeProduct(index){

  if(!selectedTable) return


  const updatedItems =
    (selectedTable.items || []).filter(
      (_,i)=>i !== index
    )


  setTables(prevTables =>
    prevTables.map(table =>
      table.id === selectedTable.id
        ? {
            ...table,
            items: updatedItems
          }
        : table
    )
  )


  const { error } = await supabase

    .from('tables')

    .update({
      items: updatedItems
    })

    .eq('id', selectedTable.id)


  if(error){

    alert(error.message)

    fetchTables()

  }

}

 async function payTable(method){

  if(!selectedTable) return

  if(paymentLockRef.current) return

  if(selectedTable.paid){
    alert('Este cliente ya fue cobrado')
    return
  }

  paymentLockRef.current = true
  setIsPaying(true)

  try {

    const total = getTotal(selectedTable.items)

    if(total <= 0){
      alert('El cliente no tiene consumo')
      return
    }

    const { data: claimedTable, error: tableError } = await supabase
      .from('tables')
      .update({
        paid: true,
        payment_method: method
      })
      .eq('id', selectedTable.id)
      .or('paid.eq.false,paid.is.null')
      .select('id')
      .maybeSingle()

    if(tableError){
      throw tableError
    }

    if(!claimedTable){
      alert('Este cliente ya fue cobrado')
      await fetchTables()
      return
    }

  const { error: saleError } = await supabase
    if(saleError){

      await supabase
        .from('tables')
        .update({
          paid: false,
          payment_method: ''
        })
        .eq('id', selectedTable.id)

      throw saleError
    }

    await fetchTables()
    await fetchTodaySales()

    setShowQR(true)

  } catch(error){

    console.error('Error al cobrar:', error)
    alert('Error al realizar el cobro: ' + error.message)

  } finally {

    paymentLockRef.current = false
    setIsPaying(false)

  }
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

                 <h1 className="text-5xl font-black text-pink-500">

                HELLFIRE
  
              </h1>

              <div className="mt-2">
    <p className="text-zinc-400">
        Venta del día
    </p>

    <h2 className="text-3xl font-black text-green-400">
        ${todaySales}
    </h2>

    <button

  onClick={resetSales}

  className="mt-3 bg-red-600 px-4 py-2 rounded-xl font-black"

>

  Reiniciar Ventas

</button>

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
                   onClick={() => payTable('Efectivo')}
                   disabled={isPaying || selectedTable?.paid}
                   className="bg-green-500 py-4 rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                  {isPaying ? 'Cobrando...' : 'Efectivo'}
                 </button>

                  <button
                  onClick={() => payTable('Tarjeta')}
                       disabled={isPaying || selectedTable?.paid}
                          className="bg-blue-500 py-4 rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                                {isPaying ? 'Cobrando...' : 'Tarjeta'}

                              </button>

                             <button
                            onClick={() => payTable('Transferencia')}
                           disabled={isPaying || selectedTable?.paid}
                             className="bg-purple-500 py-4 rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                            {isPaying ? 'Cobrando...' : 'Transferencia'}
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