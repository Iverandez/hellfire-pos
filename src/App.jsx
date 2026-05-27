import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const products = [

  { id:1, name:'Entrada', price:100 },

  { id:2, name:'Barra Libre', price:300 },

  { id:3, name:'Cerveza', price:60 },

  { id:4, name:'Caribe', price:60 },

  { id:5, name:'Sky', price:80 },

  { id:6, name:'Cigarros', price:10 },

  { id:7, name:'Paleta', price:5 },

  { id:8, name:'Papas', price:15 },

  { id:9, name:'Condones', price:15 },

  { id:10, name:'Perla Negra', price:200 },

  { id:11, name:'Wiski', price:100 },

]

export default function App() {

  const [orders, setOrders] = useState([])

  const [selectedCustomer, setSelectedCustomer] =
    useState(null)

  const [cart, setCart] = useState([])

  const [tab, setTab] = useState('clientes')

  useEffect(()=>{

    fetchOrders()

    const channel = supabase

      .channel('orders-live')

      .on(
        'postgres_changes',
        {
          event:'*',
          schema:'public',
          table:'orders'
        },
        ()=>{

          fetchOrders()

        }
      )

      .subscribe()

    return ()=>{

      supabase.removeChannel(channel)

    }

  },[])

  async function fetchOrders(){

    const { data } = await supabase

      .from('orders')

      .select('*')

      .order('id',{ ascending:false })

    setOrders(data || [])

  }

  function addProduct(product){

    setCart(prev=>[
      ...prev,
      product
    ])

  }

  function removeProduct(index){

    const updated = [...cart]

    updated.splice(index,1)

    setCart(updated)

  }

  const total = cart.reduce(

    (acc,item)=>acc + item.price,

    0

  )

  async function pay(method){

    if(!selectedCustomer){

      alert('Selecciona cliente')
      return

    }

    if(cart.length===0){

      alert('Agrega productos')
      return

    }

    const { error } = await supabase

      .from('orders')

      .insert([{

        customer_number:selectedCustomer,

        items:cart,

        total,

        payment_method:method,

        paid:true

      }])

    if(error){

      console.log(error)

      alert(error.message)

      return

    }

    alert('Pago realizado')

    setCart([])

  }

  return (

    <div
      style={{
        minHeight:'100vh',
        background:'#050505',
        color:'white',
        fontFamily:'Arial',
        paddingBottom:'120px'
      }}
    >

      <div
        style={{
          padding:'20px'
        }}
      >

        <h1
          style={{

            textAlign:'center',

            fontSize:'45px',

            marginBottom:'20px',

            background:
              'linear-gradient(90deg,#ff0080,#ff4d00,#8a2be2)',

            WebkitBackgroundClip:'text',

            WebkitTextFillColor:'transparent'

          }}
        >
          HELLFIRE POS
        </h1>

        <div
          style={{

            display:'flex',

            gap:'10px',

            marginBottom:'25px'

          }}
        >

          <button
            onClick={()=>setTab('clientes')}
            style={
              tab==='clientes'
              ? activeTab
              : tabStyle
            }
          >
            Clientes
          </button>

          <button
            onClick={()=>setTab('productos')}
            style={
              tab==='productos'
              ? activeTab
              : tabStyle
            }
          >
            Productos
          </button>

          <button
            onClick={()=>setTab('ventas')}
            style={
              tab==='ventas'
              ? activeTab
              : tabStyle
            }
          >
            Ventas
          </button>

        </div>

        {

          tab==='clientes' && (

            <div>

              <h2>
                Selecciona Cliente
              </h2>

              <div
                style={{

                  display:'grid',

                  gridTemplateColumns:
                    'repeat(5,1fr)',

                  gap:'10px',

                  maxHeight:'500px',

                  overflowY:'scroll'

                }}
              >

                {

                  Array.from(
                    { length:1000 },
                    (_,i)=>i+1
                  )

                  .map(number=>(

                    <button

                      key={number}

                      onClick={()=>
                        setSelectedCustomer(number)
                      }

                      style={{

                        padding:'20px',

                        borderRadius:'15px',

                        border:'none',

                        fontWeight:'bold',

                        cursor:'pointer',

                        background:
                          selectedCustomer===number
                          ? '#ff0080'
                          : '#111',

                        color:'white'

                      }}
                    >

                      Cliente {number}

                    </button>

                  ))

                }

              </div>

            </div>

          )

        }

        {

          tab==='productos' && (

            <div>

              <h2>
                Productos
              </h2>

              <div
                style={{

                  display:'grid',

                  gridTemplateColumns:
                    'repeat(auto-fit,minmax(150px,1fr))',

                  gap:'15px'

                }}
              >

                {

                  products.map(product=>(

                    <div

                      key={product.id}

                      style={{

                        background:'#111',

                        border:
                          '1px solid #ff0080',

                        borderRadius:'20px',

                        padding:'20px',

                        textAlign:'center'

                      }}
                    >

                      <h3>
                        {product.name}
                      </h3>

                      <p
                        style={{
                          color:'#00ff99',
                          fontSize:'22px'
                        }}
                      >
                        ${product.price}
                      </p>

                      <button

                        onClick={()=>
                          addProduct(product)
                        }

                        style={addButton}

                      >

                        Agregar

                      </button>

                    </div>

                  ))

                }

              </div>

            </div>

          )

        }

        {

          tab==='ventas' && (

            <div>

              <h2>
                Ventas Tiempo Real
              </h2>

              {

                orders.map(order=>(

                  <div

                    key={order.id}

                    style={{

                      background:'#111',

                      borderRadius:'15px',

                      padding:'20px',

                      marginBottom:'15px',

                      border:
                        '1px solid #ff0080'

                    }}
                  >

                    <h3>
                      Cliente #{order.customer_number}
                    </h3>

                    <p>
                      Total:
                      ${order.total}
                    </p>

                    <p>
                      Método:
                      {order.payment_method}
                    </p>

                    <p>
                      {
                        new Date(
                          order.created_at
                        ).toLocaleString()
                      }
                    </p>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

      <div
        style={{

          position:'fixed',

          bottom:0,

          left:0,

          right:0,

          background:'#111',

          padding:'20px',

          borderTop:
            '2px solid #ff0080'

        }}
      >

        <h2>
          Cliente:
          {' '}
          {selectedCustomer || 'Ninguno'}
        </h2>

        {

          cart.map((item,index)=>(

            <div

              key={index}

              style={{

                display:'flex',

                justifyContent:'space-between',

                marginBottom:'10px'

              }}
            >

              <span>
                {item.name}
              </span>

              <div>

                ${item.price}

                <button

                  onClick={()=>
                    removeProduct(index)
                  }

                  style={removeButton}

                >
                  X
                </button>

              </div>

            </div>

          ))

        }

        <h1
          style={{
            color:'#00ff99'
          }}
        >
          TOTAL: ${total}
        </h1>

        <div
          style={{
            display:'flex',
            gap:'10px'
          }}
        >

          <button
            onClick={()=>pay('Efectivo')}
            style={payButton}
          >
            Efectivo
          </button>

          <button
            onClick={()=>pay('Tarjeta')}
            style={payButton}
          >
            Tarjeta
          </button>

          <button
            onClick={()=>pay('Transferencia')}
            style={payButton}
          >
            Transferencia
          </button>

        </div>

      </div>

    </div>

  )

}

const tabStyle = {

  flex:1,

  padding:'15px',

  background:'#111',

  border:'none',

  color:'white',

  borderRadius:'12px',

  cursor:'pointer'

}

const activeTab = {

  ...tabStyle,

  background:'#ff0080',

  fontWeight:'bold'

}

const addButton = {

  background:'#ff0080',

  color:'white',

  border:'none',

  padding:'12px',

  borderRadius:'10px',

  cursor:'pointer',

  width:'100%'

}

const payButton = {

  flex:1,

  background:'#ff0080',

  color:'white',

  border:'none',

  padding:'15px',

  borderRadius:'12px',

  fontWeight:'bold',

  cursor:'pointer'

}

const removeButton = {

  marginLeft:'10px',

  background:'red',

  border:'none',

  color:'white',

  borderRadius:'5px',

  cursor:'pointer'

}