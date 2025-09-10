import GenderChart from "./components/genderChart"
import Sidebar from "./components/sidebar"
import UserAdd from "./components/userAdd"
import UserDetail from "./components/userDetail"

import UserTable from "./components/UserTable"

function App() {


  return (
    <>
    <div className="grid grid-cols-[15%_50%_35%]">
      <div className="">
        <Sidebar />
     
      </div>
      <div className="bg-green-200">
        <UserTable />
         
      </div>
      <div className="bg-blue-200">  
        <GenderChart />

      </div>
    </div>
    </>
  )
}

export default App
