import { useNavigate, useParams } from 'react-router-dom';
import React from 'react'
import axios from 'axios'

export function Products(props) {
    const {id} = useParams();
	const navigate = useNavigate()

    const handleLogout = () => {
		axios.post('http://localhost:8081/setrequest/'+id+'/'+props.id+'/'+props.mail)
		.then(res => {
			navigate('/fdashboard/status')
		}).catch(err => console.log(err));
	}
    
    const trimmedDate = props.date.slice(0, 10);
    return(
        <div style={{ fontSize: '10px' }} className='productList'>
            <div key={props.id} className='productCard'>
                {/* <img src={props.image} alt='product-img' className='productImage'></img> */}



                <div className='productCard__content' style={{ fontSize: '20px' }}>
                    <h3 className='productName'>{props.course}</h3>
                    <div className='productSales'>{props.name}</div>
                    <div className='displayStack__1'>
                        <div className='productSales1'>{props.dept}</div>
                        <div className='productSales1'>{props.roomnumber}</div>
                        
    
                    </div>
                    <div className='displayStack__1'>
                    <div className='productSales'>{trimmedDate}</div>
                        <div className='productSales'>{props.starttime}     -     {props.endtime}</div>
                        <div className='productSales'>{props.slot}</div>
                    </div>
                    <div style={{ textAlign: 'center' }} className='productName'>{props.faculty}</div>
                    <br />

                    {/* <button onClick={handleLogout} className='btn btn-dark'>Request</button> */}
                    <div>
                    {props.status ? (
                        <button className='btn btn-dark'>{props.status}</button>
                    ) : (
                        <button onClick={handleLogout} className='btn btn-dark'>
                        Request
                        </button>
                    )}
                    </div>

                    <div className="d-flex justify-content-center">
                    {/* <Link to={`/fdashboard/request/${props.id}`} className="btn btn-primary btn-sm me-2">Request for change</Link> */}
                    </div>
                </div>
            </div>
        </div>   
    )
}