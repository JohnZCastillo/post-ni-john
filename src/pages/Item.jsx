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
        className='min-w-25 flex items-center gap-1 hover:bg-gray-100 px-1 cursor-pointer'
        onClick={handleOnClick}
        >

        <ContextMenu options={options} ref={contextmenu}/>

         {TextIcon == null && (
            <Icon size='base' className="cursor-pointer" />
        )}

        {TextIcon && (TextIcon)}

        {!isEditable && (
            <p className="p-1">{filename}</p>
        )}    

        {isEditable && (
            <form className="block w-full" onSubmit={(e)=> {
                e.preventDefault();
                setEditable(false)
            } }>
                <input 
                    onBlur={()=> setEditable(false)} 
                    ref={inputRef} 
                    className='w-full p-1 border-gray-300 border-b outline-none' 
                    value={filename} 
                    onChange={handleOnChangeFilename}
                />
            </form>
        )}     

     
    </div>
}

export default Item;