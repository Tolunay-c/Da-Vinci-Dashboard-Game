import Sidebar from "./components/sidebar"
import UserDetail from "./components/userDetail"

import UserTable from "./components/UserTable"

function App() {


  return (
    <>
    <div className="grid grid-cols-[20%_60%_20%]">
      <div className="">
        <Sidebar />
     
      </div>
      <div className="bg-green-200">center
        <UserTable />
             <UserDetail />
      </div>
      <div className="bg-blue-200">right
 

      </div>
    </div>
    </>
  )
}

export default App
