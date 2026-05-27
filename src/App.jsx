import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function App() {

  const [orders, setOrders] = useState([])

  const [selectedCustomer, setSelectedCustomer] =
    useState(null)

  const [cart, setCart] = useState([])

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

   useEffect(()=>{

    fetchOrders()

    const channel =
      supabase

        .channel('realtime-orders')

        .on(
          'postgres_changes',
          {
            event:'*',
            schema:'public',
            table:'orders'
          },

          (payload)=>{

            console.log(payload)

            fetchOrders()

          }

        )

        .subscribe()

    return ()=>{

      supabase.removeChannel(channel)

    }

  },[])

  async function fetchOrders(){

    const { data, error } =
      await supabase

        .from('orders')

        .select('*')

        .order('id',{ ascending:false })

    if(error){

      console.log(error)

      return
    }

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

  const total =
    cart.reduce(
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

    const { error } =

      await supabase

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

      alert('Error guardando venta')

      return
    }

    alert('Pago realizado')

    setCart([])
  }

  return (

    <div
      style={{
        minHeight:'100vh',
        background:'black',
        color:'white',
        padding:20
      }}
    >

      <h1
        style={{
          color:'#ff0080',
          fontSize:40
        }}
      >
        HELLFIRE POS
      </h1>

      <h2>
        Clientes
      </h2>

      <div
        style={{
          display:'grid',

          gridTemplateColumns:
            'repeat(10,1fr)',

          gap:10,

          maxHeight:'400px',

          overflowY:'scroll',

          padding:10
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

                padding:15,

                background:
                  selectedCustomer===number
                  ? '#ff0080'
                  : '#111',

                color:'white',

                border:'none',

                borderRadius:10,

                cursor:'pointer'
              }}
            >
              {number}
            </button>

          ))
        }

      </div>

      <h2
        style={{
          marginTop:30
        }}
      >
        Productos
      </h2>

      <div
        style={{
          display:'flex',
          gap:10,
          flexWrap:'wrap'
        }}
      >

        {
          products.map(product=>(

            <button
              key={product.id}

              onClick={()=>
                addProduct(product)
              }

              style={{

                padding:20,

                background:'#111',

                color:'white',

                border:
                  '1px solid #ff0080',

                borderRadius:10,

                cursor:'pointer'
              }}
            >

              {product.name}

              <br/>

              ${product.price}

            </button>

          ))
        }

      </div>

      <h2
        style={{
          marginTop:30
        }}
      >
        Cliente #{selectedCustomer}
      </h2>

      {

        cart.map((item,index)=>(

          <div
            key={index}

            style={{

              display:'flex',

              justifyContent:'space-between',

              background:'#111',

              padding:10,

              marginTop:10,

              borderRadius:10
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

                style={{
                  marginLeft:10,
                  background:'red',
                  color:'white',
                  border:'none',
                  borderRadius:5,
                  cursor:'pointer'
                }}
              >
                X
              </button>

            </div>

          </div>

        ))
      }

      <h1
        style={{
          marginTop:20,
          color:'#00ff99'
        }}
      >
        TOTAL: ${total}
      </h1>

      <div
        style={{
          display:'flex',
          gap:10
        }}
      >

        <button
          onClick={()=>pay('Efectivo')}
        >
          Efectivo
        </button>

        <button
          onClick={()=>pay('Tarjeta')}
        >
          Tarjeta
        </button>

        <button
          onClick={()=>pay('Transferencia')}
        >
          Transferencia
        </button>

      </div>

      <h2
        style={{
          marginTop:40
        }}
      >
        Ventas Tiempo Real
      </h2>

      {

        orders.map(order=>(

          <div
            key={order.id}

            style={{

              background:'#111',

              padding:20,

              marginTop:10,

              borderRadius:10,

              border:
                '1px solid #ff0080'
            }}
          >

            <h3>
              Cliente #{order.customer_number}
            </h3>

            <p>
              Total: ${order.total}
            </p>

            <p>
              Pago:
              {' '}
              {order.payment_method}
            </p>

            <p>
              Fecha:
              {' '}
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