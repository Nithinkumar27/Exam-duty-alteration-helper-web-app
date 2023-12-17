import React from 'react'

export default function profiles({ Leaderboard }) {
  return (
        <div id="profile">
            {Item(Leaderboard)}
        </div>
  )
}

function Item(data){
    return (

        <>
            {
                data.map((value, index) => (
                    <div className="flex" key={index}>
                        <div className="item">
                            <img src={`http://localhost:3000/images/`+value.image} alt="" />
            
                            <div className="info">
                                <h3 className='name'>{value.name}</h3>    
                                <span>{value.department}</span>
                            </div>                
                        </div>
                        <div className="item">
                            <span>{value.rating}</span>
                        </div>
                    </div>
                    )
                )
            }
        </>

        
    )
}