import { FormEvent, useEffect, useRef, useState } from 'react'
import { formatSocketData, parseSocketData } from "./utils/hepler";

function App() {
  const socket = useRef<WebSocket>()
  const [scanStatus, setScanStatus] = useState(false)
  const [data, setData] = useState<any[]>([])

  const handelSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!scanStatus) {
      const { url } = Object.fromEntries(new FormData(e.target as any).entries())
  
      socket.current?.send(formatSocketData("scan", url))
    }
    else {
      socket.current?.send(formatSocketData("stop"))
    }

  }

  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:3000/ws');

    socket.current.addEventListener('open', () => {
      socket.current?.send(formatSocketData("status"))
    });

    socket.current.addEventListener('message', (event) => {
      const data = parseSocketData(event.data)

      if (data?.type == "status") {
        setScanStatus(data.value)
      }
      else if (data?.type == "url") {
        setData(state => [...state, data.value])
      }
      console.log(`Received message from server: ${data?.value}`)
    })
  }, [])

  return (
    <div>
      <div className='pt-10'>
        <form onSubmit={handelSubmit} className='w-full max-w-xl mx-auto bg-white rounded p-8 shadow'>
          <h3 className="text-3xl text-center pb-6">Scan</h3>
          <div className="flex space-x-4">
            <input type="text" name='url' className='flex-grow min-w-0 px-4 py-1.5 rounded border' defaultValue="https://thanhnien.vn" />
            <button 
              className={`flex-none px-4 py-2 rounded bg-blue-600 text-white ${scanStatus ? 'bg-slate-600 hover:bg-slate-500' : ''}`}
            >{!scanStatus ? 'Scan' : 'Stop'}</button>
          </div>
        </form>
      </div>

      { scanStatus
        ? <div className="mt-10 w-full max-w-4xl mx-auto bg-white rounded p-8 shadow">
          <div className="flex flex-col space-y-2">
            { data.map((v,i) =>
              <div key={i} className="">{i}</div>
            )}
          </div>
        </div>
        : null
      }
    </div>
  )
}

export default App
