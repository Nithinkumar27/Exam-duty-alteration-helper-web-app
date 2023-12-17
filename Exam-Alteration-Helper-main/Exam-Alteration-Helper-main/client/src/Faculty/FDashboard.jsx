import React, { useEffect } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'

import NavItem from '../NavItem';

function FDashboard() {
	const navigate = useNavigate()
	axios.defaults.withCredentials = true;
	useEffect(()=>{
		axios.get('http://localhost:8081/fdashboard')
		.then(res => {
			if(res.data.Status === "Success") {
				if(res.data.role === "faculty") {
					navigate('/fdashboard');
				} else {
					const id = res.data.id;
					navigate('/employeedetail/'+id)
				}
			} else {
				navigate('/start')
			}
		})
	}, [])

	const handleLogout = () => {
		axios.get('http://localhost:8081/logout')
		.then(res => {
			navigate('/start')
		}).catch(err => console.log(err));
	}
	return (
		<div className="container-fluid">
			<div className="row flex-nowrap">
				<div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
					<div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
						<a href="/fdashboard" className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none">
							<span className="fs-5 fw-bolder d-none d-sm-inline">Faculty Dashboard</span>
						</a>
						<ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
							<NavItem link="/fdashboard/employeedetail" name="Profile" icon="speedometer2"/>
							<NavItem link="/fdashboard/changepass" name="Change Password" icon="speedometer2"/>
							<NavItem link="/fdashboard/dispPDFFaculty" name="Exam Schedule" icon="speedometer2"/>
							<NavItem link="/fdashboard/calender" name="View Exams" icon="speedometer2"/>
							<NavItem link="/fdashboard/status" name="Requested Status" icon="speedometer2"/>
							<NavItem link="/fdashboard/inboxrequest" name="Inbox Request" icon="speedometer2"/>
							<NavItem link="/fdashboard/leader" name="Leaderboard" icon="speedometer2"/>
							<li onClick={handleLogout}>
								<a href="#" className="nav-link px-0 align-middle text-white">
									<i className="fs-4 bi-power"></i> <span className="ms-1 d-none d-sm-inline">Logout</span></a>
							</li>
						</ul>
					</div>
				</div>
				<div class="col p-0 m-0">
					<div className='p-2 d-flex justify-content-center shadow'>
						<h4>Exam Alteration Helper</h4>						
					</div>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default FDashboard