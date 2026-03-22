import { useEffect, useMemo, useState } from 'react';
import Item from './Item';
import useFilename from '../hooks/useFilename';
import { setSelection, updateFilename } from '../redux-slice/slice';
import { useDispatch } from 'react-redux';


const RequestItem = ({type, ids})=> {

    const file = useFilename(ids);
    const dispatch = useDispatch();
    
    const [requestDetails, setRequestDetails] = useState({
        type: 'Get',
        name: 'Test',
    })

    const handleOnChangeFileName = (e) =>{
        dispatch(updateFilename({ids: ids, filename: e.target.value}))
    }

    useEffect(()=>{
        setRequestDetails(prev => ({...prev, type: type}))
    },[type])
    
    const handleOnClick = (e) => {
        dispatch(setSelection({ids}))
    }

    const TextIcon = useMemo(()=>{

        switch(requestDetails.type){
            case 'post':
                return <span className='text-yellow-500 font-bold text-xs uppercase cursor-pointer' onClick={handleOnClick}>{requestDetails.type}</span>
            case 'put':
                return <span className='text-blue-500 font-bold text-xs uppercase cursor-pointer' onClick={handleOnClick}>{requestDetails.type}</span>
            case 'patch':
                return <span className='text-indigo-500 font-bold text-xs uppercase cursor-pointer' onClick={handleOnClick}>{requestDetails.type}</span>
            case 'delete':
                return <span className='text-red-500 font-bold text-xs uppercase cursor-pointer' onClick={handleOnClick}>{requestDetails.type}</span>
            default: 
                return <span className='text-green-500 font-bold text-xs uppercase cursor-pointer' onClick={handleOnClick}>{requestDetails.type}</span>
        }
    },[requestDetails.type])

    return <div>
        <Item filename={file?.name} handleOnChangeFilename={handleOnChangeFileName} TextIcon={TextIcon}/>
    </div>
}


export default RequestItem;