import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function AddEmployee() {
	const [data, setData] = useState({
		name: '',
		email: '',
		department: '',
	})
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const handleSubmit = (event) => {
		event.preventDefault();
		axios.post('http://localhost:8081/create', data)
		.then(res => {
			if(res.data.Status === "Success") {
				alert('New Faculty Created Successfully');
				navigate('/employee')
			}
			else {
				setError(res.data.Error);
			}
		})
		.catch(err => console.log(err));
	}
	return (
		<div className='d-flex flex-column align-items-center pt-4'>
			<h2>Add Employee</h2>
			<form class="row g-3 w-50" onSubmit={handleSubmit}>
			<div class="col-12">
					<label for="inputName" class="form-label">Name</label>
					<input type="text" class="form-control" id="inputName" placeholder='Enter Name' autoComplete='off'
					onChange={e => setData({...data, name: e.target.value})}/>
				</div>
				<div class="col-12">
					<label for="inputEmail4" class="form-label">Email</label>
					<input type="email" class="form-control" id="inputEmail4" placeholder='Enter Email' autoComplete='off'
					onChange={e => setData({...data, email: e.target.value})}/>
				</div>
				<div class="col-12">
					<label for="inputdepartment4" class="form-label">Department</label>
					<input type="text" class="form-control" id="inputdepartment4" placeholder='Enter Department' autoComplete='off'
					 onChange={e => setData({...data, department: e.target.value})}/>
				</div>
				<div class="col-12">
					<button type="submit" class="btn btn-primary">Create</button>
				</div>
                <div className='text-danger'>
                    {error && error}
                </div>
			</form>
		</div>

	)
}

export default AddEmployee