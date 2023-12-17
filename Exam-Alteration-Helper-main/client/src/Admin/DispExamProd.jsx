export function Products(props) {
    const trimmedDate = props.date.slice(0, 10);
    return(
        <div style={{ fontSize: '10px' }} className='productList'>
            <div key={props.id} className='productCard'>
                {/* <img src={props.image} alt='product-img' className='productImage'></img> */}



                <div className='productCard__content'>
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
                    <div className='productTime'>{props.faculty}</div>

                    
                </div>
            </div>
        </div>   
    )
}