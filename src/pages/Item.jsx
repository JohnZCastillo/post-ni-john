import { useEffect, useRef } from "react";
import { useState } from "react";
import ContextMenu from "../components/ContextMenu";
import { useDispatch } from "react-redux";
import { deleteFile } from "../redux-slice/slice";


const Item =  ({onClick, Icon, TextIcon, filename, handleOnChangeFilename, ids = [], otherActions = []}) => {

    const inputRef = useRef();
    const [isEditable, setEditable] = useState(false);
    const contextmenu = useRef();

    const dispatch = useDispatch();

    const [options, setOptions] = useState( [
        {
            title: 'Rename',
            action: function () {
                setEditable(true);
            },
        },
        {
            title: 'Delete',
            action: function () {
                dispatch(deleteFile({ids: ids}))
            },
        },
    ]);

    const handleOnClick = (e)=>{
        if(isEditable){
            e.stopPropagation();
        }else{
            onClick();
        }
    }

    useEffect(()=>{
        if(isEditable){
            inputRef.current?.focus();
        }
    },[isEditable])

    useEffect(()=>{

        if(otherActions.length <= 0 ){
            return
        }

        setOptions(prev => ([...prev, ...otherActions]))
            
    },[])

    return <div     
         ref={contextmenu}
        className='flex items-center gap-1 hover:bg-gray-100 px-1 cursor-pointer'
        >

        <ContextMenu options={options} ref={contextmenu}/>

         {TextIcon == null && (
            <Icon type='button' onClick={onClick} size='base' className="cursor-pointer" />
        )}

        {TextIcon && (TextIcon)}

        {!isEditable && (
            <p onClick={onClick} className="p-1">{filename}</p>
        )}    

        {isEditable && (
            <input onBlur={()=> setEditable(false)} ref={inputRef} className='p-1 outline-none' value={filename} onChange={handleOnChangeFilename} />
        )}     

     
    </div>
}

export default Item;