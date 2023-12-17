import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Home() {
  const [adminCount, setAdminCount] = useState(0);
  const [adminEmail, setAdminEmail] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:8081/adminCount')
      .then(res => {
        setAdminCount(res.data.length);
        setAdminEmail(res.data);
      })
      .catch(err => console.log(err));

    axios.get('http://localhost:8081/employeeCount')
      .then(res => {
        setEmployeeCount(res.data[0].employee);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <div className='p-3 d-flex justify-content-around mt-3'>
        {/* Admin count */}
        <div className='px-3 pt-2 pb-3 border shadow-sm w-25'>
          <div className='text-center pb-1'>
            <h4>Admin</h4>
          </div>
          <hr />
          <div className=''>
            <h5>Total: {adminCount}</h5>
          </div>
        </div>

        {/* Employee count */}
        <div className='px-3 pt-2 pb-3 border shadow-sm w-25'>
          <div className='text-center pb-1'>
            <h4>Faculty</h4>
          </div>
          <hr />
          <div className=''>
            <h5>Total: {employeeCount}</h5>
          </div>
        </div>
      </div>

      {/* List of admin */}
      <div className='mt-4 px-5 pt-3'>
        <h3>List of Admins</h3>
        <table className='table'>
          <thead>
            <tr>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {adminEmail.map(admin => (
              <tr key={admin.id}>
                <td>{admin.email}</td>
                <td>Admin</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
