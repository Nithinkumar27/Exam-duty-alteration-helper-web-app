import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState([]);

  useEffect(() => {
    var id;
    axios
      .get('http://localhost:8081/fdashboard')
      .then((res) => {
        id = res.data.id;
        axios
          .get('http://localhost:8081/get/' + id)
          .then((res) => setEmployee(res.data.Result[0]))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-center flex-column align-items-center mt-3">
        {employee.image ? (
          <img
            src={`http://localhost:3000/images/` + employee.image}
            alt=""
            className="empImg"
            style={{ width: '500px', height: '300px', objectFit: 'cover', objectPosition: 'center', borderRadius: '20px' }}
          />
        ) : (
          <div className="bi-person-square" style={{ fontSize: '200px' }}></div>
        )}
        <div className="d-flex align-items-center flex-column mt-5">
          <h3>Name: {employee.name}</h3>
          <h3>Email: {employee.email}</h3>
          <h3>Department: {employee.department ? employee.department : 'Not updated'}</h3>
          <h3>Address: {employee.address ? employee.address : 'null'}</h3>
        </div>
        <br></br>
        <div>
          <Link to={`/fdashboard/employeeEdit`} className="btn btn-primary me-2">
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetail;
