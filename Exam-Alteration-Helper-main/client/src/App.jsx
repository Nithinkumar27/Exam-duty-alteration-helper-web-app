import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

import Dashboard from './Admin/Dashboard'
import Employee from './Admin/Employee'
import Home from './Admin/Home'
import AddEmployee from './Admin/AddEmployee'
import Exam from './Admin/Exam'
import DispExam from './Admin/DispExam'
import DispPDF from './Admin/DispPDF'

import Login from './Login'
import Start from './Start'
import EmployeeLogin from './EmployeeLogin'

import FDashboard from './Faculty/FDashboard'
import FHome from './Faculty/FHome'
import Calender from './Faculty/Calender'
import EmployeeDetail from './Faculty/EmployeeDetail'
import EditEmployee from './Faculty/EditEmployee'
import Request from './Faculty/Request'
import Status from './Faculty/Status'
import ChangePass from './Faculty/ChangePass'
import DispPDFFaculty from './Faculty/DispPDFFaculty'
import Inbox from './Faculty/InboxRequest'
import Board from './Faculty/Board'


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Dashboard />}>
        <Route path='' element={<Home />}></Route>
        <Route path='/employee' element={<Employee />}></Route>
        <Route path='/create' element={<AddEmployee />}></Route>
        <Route path='/exam' element={<Exam />}></Route>
        <Route path='/dispexam' element={<DispExam />}></Route>
        <Route path='/dispPDF' element={<DispPDF />}></Route>
      </Route>

      <Route path='/login' element={<Login />}></Route>
      <Route path='/start' element={<Start />}></Route>
      <Route path='/employeeLogin' element={<EmployeeLogin />}></Route>

      <Route path='/fdashboard' element={<FDashboard />}>
        <Route path='/fdashboard/' element={<FHome />}></Route>
        <Route path='/fdashboard/calender' element={<Calender />}></Route>
        <Route path='/fdashboard/employeedetail' element={<EmployeeDetail />}></Route>        
        <Route path='/fdashboard/employeeEdit' element={<EditEmployee />}></Route>
        <Route path='/fdashboard/request/:id' element={<Request />}></Route>                
        <Route path='/fdashboard/status' element={<Status />}></Route>
        <Route path='/fdashboard/changepass' element={<ChangePass />}></Route>
        <Route path='/fdashboard/dispPDFFaculty' element={<DispPDFFaculty />}></Route>
        <Route path='/fdashboard/inboxrequest' element={<Inbox />}></Route>
        <Route path='/fdashboard/leader' element={<Board />}></Route>
      </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App