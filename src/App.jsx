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

  const [customerCarts, setCustomerCarts] =
    useState({})

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

  const currentCart =
    customerCarts[selectedCustomer] || []

  function addProduct(product){

    if(!selectedCustomer){

      alert('Selecciona cliente')

      return

    }

    setCustomerCarts(prev=>({

      ...prev,

      [selectedCustomer]:[

        ...(prev[selectedCustomer] || []),

        product

      ]

    }))

  }

  function removeProduct(index){

    const updated = [...currentCart]

    updated.splice(index,1)

    setCustomerCarts(prev=>({

      ...prev,

      [selectedCustomer]:updated

    }))

  }

  const total = currentCart.reduce(

    (acc,item)=>acc + item.price,

    0

  )

  async function pay(method){

    if(!selectedCustomer){

      alert('Selecciona cliente')
      return

    }

    if(currentCart.length===0){

      alert('No hay productos')
      return

    }

    const { error } = await supabase

      .from('orders')

      .insert([{

        customer_number:selectedCustomer,

        items:currentCart,

        total,

        payment_method:method,

        paid:true

      }])

    if(error){

      alert(error.message)

      return

    }

    alert('Pago realizado')

    setCustomerCarts(prev=>({

      ...prev,

      [selectedCustomer]:[]

    }))

  }

  return (

    <div
      style={{
        minHeight:'100vh',
        background:'#050505',
        color:'white',
        padding:'20px',
        fontFamily:'Arial'
      }}
    >

      <h1
        style={{
          color:'#ff0080',
          fontSize:'45px',
          textAlign:'center'
        }}
      >
        HELLFIRE POS
      </h1>

      <h2>
        Cliente:
        {' '}
        {selectedCustomer || 'Ninguno'}
      </h2>

      <div
        style={{

          display:'grid',

          gridTemplateColumns:
            'repeat(5,1fr)',

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

                border:
                  '1px solid #ff0080',

                color:'white',

                padding:'20px',

                borderRadius:'15px'

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
        Consumo
      </h2>

      {

        currentCart.map((item,index)=>(

          <div

            key={index}

            style={{

              display:'flex',

              justifyContent:'space-between',

              background:'#111',

              padding:'15px',

              marginTop:'10px',

              borderRadius:'10px'

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
                  border:'none',
                  color:'white',
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

    </div>

  )

}