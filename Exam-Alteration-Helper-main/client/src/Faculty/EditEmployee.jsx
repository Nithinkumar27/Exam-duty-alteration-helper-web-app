import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function EditEmployee() {
	const [data, setData] = useState({
		address: '',
	})
	const [image, setImage] = useState(null);

	const handleImageChange = (e) => {
		setImage(e.target.files[0]);
	};

	const navigate = useNavigate()
	
	const {id} = useParams();

	useEffect(()=> {
		var id;
        axios.get('http://localhost:8081/fdashboard')
            .then(res => {
                id = res.data.id;
				axios.get('http://localhost:8081/get/'+id)
				.then(res => {
					setData({...data,
						name: res.data.Result[0].name,
						email: res.data.Result[0].email,
						address: res.data.Result[0].address,
						department: res.data.Result[0].department
					})
				})
				.catch(err =>console.log(err));
            })
            .catch(err => console.log(err));
	}, [])

	const handleSubmit = (event) => {
		event.preventDefault();
		const formData = new FormData();
		if (data.address) {
			formData.append('address', data.address);
		}
		if (image) {
			formData.append('image', image);
		}
		var id1;
		axios.get('http://localhost:8081/fdashboard')
		.then(res => {
			id1 = res.data.id;
			axios.put('http://localhost:8081/update/'+id1, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			.then(res => {
				if(res.data.Status === "Success") {
					alert('Profile updated successfully');
					navigate('/fdashboard/employeedetail')
				}
			})
			.catch(err => console.log(err));
		})
		.catch(err => console.log(err));
	}
  return (
    <div className='d-flex flex-column align-items-center pt-4'>
			<h2>Update Faculty</h2>
			<form class="row g-3 w-50" onSubmit={handleSubmit}>
				<div class="col-12">
					<label for="inputName" class="form-label">Name</label>
					<input type="text" class="form-control" id="inputName" placeholder='Enter Name' autoComplete='off' value={data.name} readOnly />
				</div>
				<div class="col-12">
					<label for="inputEmail4" class="form-label">Email</label>
					<input type="email" class="form-control" id="inputEmail4" placeholder='Enter Email' autoComplete='off' value={data.email} readOnly />
				</div>

				<div class="col-12">
					<label for="inputdepart" class="form-label">Department</label>
					<input type="text" class="form-control" id="inputdepart" placeholder="Department" autoComplete='off' value={data.department} readOnly />
				</div>

				<div class="col-12">
					<label for="inputAddress" class="form-label">Address</label>
					<input type="text" class="form-control" id="inputAddress" placeholder="1234 Main St" autoComplete='off'
					onChange={e => setData({...data, address: e.target.value})} value={data.address}/>
				</div>

				<div class="col-12">
					<label class="form-label" for="inputGroupFile01">Select Image</label>
					<input type="file" class="form-control" id="inputGroupFile01"
					onChange={handleImageChange}/>
				</div>

				<div class="col-12">
					<button type="submit" class="btn btn-primary">Update</button>
				</div>
			</form>
		</div>
  )
}

export default EditEmployee