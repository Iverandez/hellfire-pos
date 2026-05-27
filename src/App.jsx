import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const products = [

  { id:1, name:'Entrada', price:100 },

  { id:2, name:'Barra Libre', price:300 },

  { id:3, name:'Cerveza', price:80 },

  { id:4, name:'Sky', price:50 },

]

export default function App() {

  const [orders, setOrders] = useState([])

  const [selectedCustomer, setSelectedCustomer] =
    useState(null)

  const [cart, setCart] = useState([])

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

    try {

      if(!selectedCustomer){

        alert('Selecciona cliente')

        return

      }

      if(cart.length===0){

        alert('Agrega productos')

        return

      }

      const orderData = {

        customer_number:Number(selectedCustomer),

        items:cart,

        total:Number(total),

        payment_method:String(method),

        paid:true

      }

      const { data, error } = await supabase

        .from('orders')

        .insert([orderData])

        .select()

      if(error){

        console.log(error)

        alert(error.message)

        return

      }

      console.log(data)

      alert('Pago realizado')

      setCart([])

    }

    catch(err){

      console.log(err)

      alert(err.message)

    }

  }

  return (

    <div
      style={{
        minHeight:'100vh',
        background:'#000',
        color:'white',
        padding:'20px'
      }}
    >

      <h1
        style={{
          fontSize:'50px',
          color:'#ff0080'
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

          gap:'10px',

          maxHeight:'300px',

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

                padding:'15px',

                border:'none',

                borderRadius:'10px',

                background:
                  selectedCustomer===number
                  ? '#ff0080'
                  : '#111',

                color:'white'

              }}
            >

              {number}

            </button>

          ))

        }

      </div>

      <h2
        style={{
          marginTop:'30px'
        }}
      >
        Productos
      </h2>

      <div
        style={{
          display:'flex',
          gap:'10px',
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

                background:'#111',

                color:'white',

                border:
                  '1px solid #ff0080',

                borderRadius:'10px',

                padding:'20px'

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
          marginTop:'30px'
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

              padding:'15px',

              borderRadius:'10px',

              marginTop:'10px'

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
                  marginLeft:'10px',
                  background:'red',
                  color:'white',
                  border:'none',
                  borderRadius:'5px'
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
          marginTop:'20px',
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
          marginTop:'40px'
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

              padding:'20px',

              borderRadius:'10px',

              marginTop:'10px'

            }}
          >

            Cliente:
            #{order.customer_number}

            <br/>

            Total:
            ${order.total}

            <br/>

            Método:
            {order.payment_method}

          </div>

        ))

      }

    </div>

  )

}