import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function App() {

  const [orders, setOrders] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [cart, setCart] = useState([])

  const products = [

    { id:1, name:'Entrada', price:100 },

    { id:2, name:'Barra Libre', price:300 },

    { id:3, name:'Cerveza Lata', price:80 },

    { id:4, name:'Caribe', price:60 },

    { id:5, name:'Sky', price:50 },

    { id:6, name:'Cigarros', price:10 },

    { id:7, name:'Perla Negra', price:200 },

    { id:8, name:'Mojito', price:150 },

    { id:9, name:'Paleta', price:5 },

    { id:10, name:'Poppers', price:350 },

  ]

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

    setCart(prev=>[...prev,product])

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
        background:'#000',
        color:'white',
        padding:'20px',
        fontFamily:'Arial'
      }}
    >

      <h1
        style={{

          fontSize:'55px',

          textAlign:'center',

          marginBottom:'20px',

          background:
            'linear-gradient(90deg,#ff0080,#ff4d00,#8a2be2)',

          WebkitBackgroundClip:'text',

          WebkitTextFillColor:'transparent',

          fontWeight:'bold'

        }}
      >
        HELLFIRE POS
      </h1>

      <h2 style={{ color:'#ff0080' }}>
        Clientes
      </h2>

      <div
        style={{

          display:'grid',

          gridTemplateColumns:
            'repeat(10,1fr)',

          gap:'10px',

          maxHeight:'420px',

          overflowY:'scroll',

          marginBottom:'30px'

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

                padding:'15px',

                border:'1px solid #ff0080',

                borderRadius:'12px',

                background:
                  selectedCustomer===number
                  ? '#ff0080'
                  : '#111',

                color:'white',

                cursor:'pointer',

                fontWeight:'bold'

              }}
            >

              {number}

            </button>

          ))

        }

      </div>

      <h2 style={{ color:'#ff0080' }}>
        Productos
      </h2>

      <div
        style={{

          display:'flex',

          flexWrap:'wrap',

          gap:'12px',

          marginBottom:'30px'

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

                background:'#111',

                border:'1px solid #ff0080',

                borderRadius:'15px',

                color:'white',

                padding:'20px',

                width:'140px',

                cursor:'pointer'

              }}
            >

              <strong>
                {product.name}
              </strong>

              <br/>

              ${product.price}

            </button>

          ))

        }

      </div>

      <h2 style={{ color:'#ff0080' }}>
        Cliente #{selectedCustomer}
      </h2>

      {

        cart.map((item,index)=>(

          <div

            key={index}

            style={{

              background:'#111',

              padding:'15px',

              borderRadius:'12px',

              marginBottom:'10px',

              display:'flex',

              justifyContent:'space-between',

              alignItems:'center'

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

                  marginLeft:'15px',

                  background:'red',

                  border:'none',

                  borderRadius:'8px',

                  color:'white',

                  padding:'5px 10px',

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
          color:'#00ff99'
        }}
      >
        TOTAL: ${total}
      </h1>

      <div
        style={{
          display:'flex',
          gap:'15px',
          marginBottom:'40px'
        }}
      >

        <button
          onClick={()=>pay('Efectivo')}
          style={buttonStyle}
        >
          Efectivo
        </button>

        <button
          onClick={()=>pay('Tarjeta')}
          style={buttonStyle}
        >
          Tarjeta
        </button>

        <button
          onClick={()=>pay('Transferencia')}
          style={buttonStyle}
        >
          Transferencia
        </button>

      </div>

      <h2 style={{ color:'#ff0080' }}>
        Ventas Tiempo Real
      </h2>

      {

        orders.map(order=>(

          <div

            key={order.id}

            style={{

              background:'#111',

              border:'1px solid #ff0080',

              borderRadius:'15px',

              padding:'20px',

              marginBottom:'15px'

            }}
          >

            <h3>
              Cliente #{order.customer_number}
            </h3>

            <p>
              Total: ${order.total}
            </p>

            <p>
              Método: {order.payment_method}
            </p>

            <p>
              {new Date(
                order.created_at
              ).toLocaleString()}
            </p>

          </div>

        ))

      }

    </div>

  )

}

const buttonStyle = {

  background:'#ff0080',

  border:'none',

  borderRadius:'12px',

  color:'white',

  padding:'15px 25px',

  fontWeight:'bold',

  cursor:'pointer'

}