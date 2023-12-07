import React from 'react';

export function Products(props) {
    const trimmedDate = props.date.slice(0, 10);
    const trimmedDate1 = props.date1.slice(0, 10);
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
      {/* <div className="row main-content">
        <div className="col-12 col-sm-12">
          <div className="swap">
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
      </div> */}
        {/* <div className="button-container">
          <button className="accept-button">Accept</button>
          <button className="reject-button">Reject</button>
        </div> */}
    </div>
  );
};