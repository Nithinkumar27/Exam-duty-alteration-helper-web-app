import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function ChangePass() {
	const [data, setData] = useState({
		current: '',
        new: ''
	})
    const [error, setError] = useState('')
	const navigate = useNavigate()

	const handleSubmit = (event) => {
		event.preventDefault();
		var id1;
		axios.get('http://localhost:8081/fdashboard')
		.then(res => {
			id1 = res.data.id;
			axios.put('http://localhost:8081/changepass/'+id1, data)
			.then(res => {
				if(res.data.Status === "Success") {
                    alert('Password Changed Successfully');
					navigate('/fdashboard')
				}
                else {
                    setError(res.data.Error);
                }
			})
			.catch(err => console.log(err));
		})
		.catch(err => console.log(err));
	}
  return (
    <div className='d-flex flex-column align-items-center pt-4'>
			<h2>Change Password</h2><br></br>
			<form class="row g-3 w-50" onSubmit={handleSubmit}>
				<div class="col-12">
					<label for="current" class="form-label">Current Password</label>
					<input type="password" class="form-control" id="current" placeholder="Password" autoComplete='off'
					onChange={e => setData({...data, current: e.target.value})}/>
				</div>

                <div class="col-12">
					<label for="new" class="form-label">New Password</label>
					<input type="password" class="form-control" id="new" placeholder="Password" autoComplete='off'
					onChange={e => setData({...data, new: e.target.value})}/>
				</div>
				<div class="col-12">
					<button type="submit" class="btn btn-primary">Update</button>
				</div>
                <div className='text-danger'>
                    {error && error}
                </div>
			</form>
		</div>
  )
}

export default ChangePass