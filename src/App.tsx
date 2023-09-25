import { FormEvent, useEffect, useRef, useState } from 'react'
import { formatSocketData, getPercent, parseSocketData } from "./utils/hepler";

function App() {
  const socket = useRef<WebSocket>()
  const [scanStatus, setScanStatus] = useState(false)
  const [data, setData] = useState<{
    url: string, time: string, status: 'success' | 'warning' | 'error'
  }[]>([])
  const [process, setProcess] = useState({ current: 5, total: 10 })

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

  const [isOpenModal, setIsOpenModal] = useState(false)
  const [message, setMessage] = useState('')
  const openMessage = (msg: string) => {
    setIsOpenModal(true)
    setMessage(msg)
  }

  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:3000/ws');

    socket.current.addEventListener('open', () => {
      socket.current?.send(formatSocketData("status"))
    });

    socket.current.addEventListener('message', (event) => {
      const data = parseSocketData(event.data)

      switch (data?.type) {
        case "status":
          setScanStatus(data.value)
          break;
        case "url":
          setData(state => [...state, data.value])
          break;
        case "message":
          openMessage(data.value)
          break;
      }

      console.log(`Received message from server: ${data?.value}`)
    })
  }, [])

  return (
    <div className='bg-gray-100'>
      <div className="w-full max-w-3xl mx-auto h-screen flex flex-col space-y-6 p-8">
        <div className="flex-none bg-white rounded p-8 py-4 shadow">
          <form onSubmit={handelSubmit} className='flex space-x-4 items-center'>
            <input type="text" name='url' className='flex-grow min-w-0 px-4 py-1.5 rounded border' defaultValue="https://thanhnien.vn" />
            
            <button
              className={`flex-none w-16 h-16 rounded-full text-white shadow-md bg-gradient-to-t font-semibold
              ${scanStatus ? 'from-green-600 via-green-500 to-green-400 hover:from-green-500 hover:via-green-400 hover:to-green-300' 
              : 'from-blue-600 via-blue-500 to-blue-400 hover:from-blue-600 hover:via-blue-400 hover:to-blue-300'}`}
            >{!scanStatus ? 'Scan' : 'Stop'}</button>
          </form>
        </div>

        <div className="flex-grow min-h-0 bg-white rounded p-8 py-6 shadow flex flex-col space-y-6">
          { !scanStatus
            ? <div className="flex-none relative w-full h-4 rounded-full bg-gray-200 shadow-inner text-xs text-center">
              <div className="absolute h-full top-0 left-0 rounded-full bg-green-500 shadow-inner" style={{ width: `${getPercent(process.current, process.total)}%` }}></div>
              <div className="absolute -top-4 left-0 w-full flex">
                <div className="flex-none" style={{ width: `${getPercent(process.current, process.total)}%` }}>{process.current}</div>
                <div className="flex-grow min-h-0">{process.total}</div>
              </div>
            </div>
            : null
          }

          <div className="flex-grow min-h-0 shadow-inner bg-gray-100 rounded px-4 py-2 flex flex-col space-y-1 overflow-y-auto">
            { data.length > 0 ? data.map((v,i) =>
                <div key={i} 
                  className={ v.status == 'success' ? 'text-green-600' : v.status == 'warning' ? 'text-yellow-600' : 'text-red-600'}
                >{v.url} - {v.time}</div>
              )
              : <p>Chưa có dữ liệu</p>
            }
          </div>
        </div>
      </div>

      { isOpenModal
        ? <div className="absolute w-full h-full top-0 left-0 bg-black/50" onClick={() => setIsOpenModal(false)}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8 rounded bg-white shadow"
            onClick={(e) => {e.stopPropagation()}}
          >
            <div className="text-green-600 font-semibold text-center text-xl">{message}</div>
          </div>
        </div>
        : null
      }
    </div>
  )
}

export default App
