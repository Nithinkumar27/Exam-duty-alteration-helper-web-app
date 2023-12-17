import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function InboxProducts(props) {
    const navigate = useNavigate()
  const trimmedDate = props.date.slice(0, 10);
  const trimmedDate1 = props.date1.slice(0, 10);

  const handleAccept = () => {
    alert(`Accepted request with ID: ${props.id} ${props.id1}`);
    axios.put('http://localhost:8081/approverequest/'+props.id1+'/'+props.id+'/'+props.faculty1+'/'+props.faculty+'/'+props.mail1+'/'+props.mail)
          .then(res => {
            if (res.data.Status === "Success") {
                alert("Request Approved Successfully");
                navigate('/fdashboard')
            } else {
              alert("Error");
            }
          })
          .catch(err => console.log(err)); 
    };

  const handleReject = () => {
    alert(`Rejected request with ID: ${props.id}`);
    axios.put('http://localhost:8081/rejectrequest/'+props.id1+'/'+props.id)
          .then(res => {
            if (res.data.Status === "Success") {
                alert("Rejected Successfully");
                navigate('/fdashboard')
            } else {
              alert("Error");
            }
          })
          .catch(err => console.log(err)); 
  };

  return (
    <div className="crct">
      <div className="row main-content">
        <div className="col-12 col-sm-12">
          <div className="swap">
            <div className="card poncho">
              <div className="card-content">
                <div className="row">
                  <div className="col-8 plan-name">
                    <strong>{props.course}</strong>
                  </div>
                  <div className="col-4 plan-cost">
                    <p className="plan-amount">
                      <strong>{props.dept}</strong>
                    </p>
                  </div>
                </div>
                <div className="row description content">
                  <div className="col-sm-12">
                    ROOM: {props.roomnumber}
                  </div>
                  <div className="col-sm-12">
                    Slot: {props.slot}
                  </div>
                  <div className="col-sm-12">
                    Faculty: {props.faculty}
                  </div>
                </div>
                <div className="row content">
                  <div className="divButton">
                    {trimmedDate}
                  </div>
                </div>
                <div className="row content">
                  <div className="divButton">
                    {props.starttime}
                  </div>
                </div>
              </div>
            </div>

            <div className="card poncho">
              <div className="card-content">
                <div className="row">
                  <div className="col-8 plan-name">
                    <strong>{props.course1}</strong>
                  </div>
                  <div className="col-4 plan-cost">
                    <p className="plan-amount">
                      <strong>{props.dept1}</strong>
                    </p>
                  </div>
                </div>
                <div className="row description content">
                  <div className="col-sm-12">
                    ROOM: {props.roomnumber1}
                  </div>
                  <div className="col-sm-12">
                    Slot: {props.slot1}
                  </div>
                  <div className="col-sm-12">
                    Faculty: {props.faculty1}
                  </div>
                </div>
                <div className="row content">
                  <div className="divButton">
                    {trimmedDate1}
                  </div>
                </div>
                <div className="row content">
                  <div className="divButton">
                    {props.starttime1}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
      <div className="button-container">
        <button className="accept-button" onClick={handleAccept}>
          Accept
        </button>
        <button className="reject-button" onClick={handleReject}>
          Reject
        </button>
      </div>
    </div>
  );
}