import { useEffect, useMemo, useState } from "react";
import {  useDispatch, useSelector } from "react-redux";
import { Folder, FolderOpen, LinkAlt } from '@boxicons/react';
import { addFolder, updateFileDetails, updateFilename } from "../redux-slice/slice";
import useFilename from "../hooks/useFilename";
import { Plus, PlusCircle } from '@boxicons/react';

const Item =  ({onClick, Icon, TextIcon, filename, handleOnChangeFilename}) => {

    return <div  className='flex items-center gap-1'>
        {TextIcon == null && (
            <Icon type='button' onClick={onClick} size='base' className="cursor-pointer" />
        )}

        {TextIcon && (TextIcon)}
        
        <input className='p-1 outline-none' value={filename} onChange={handleOnChangeFilename} />
    </div>
}

const ItemWrapper = ({children, ids}) => {

    const dispatch = useDispatch();

    const [isContentShowing, setIsContentShowing] = useState(false);

    const file = useFilename(ids);

    const handleOnClick = ()=> {
        setIsContentShowing(prev => !prev)
    }
    
    const handleOnChangeFileName = (e) =>{
        dispatch(updateFileDetails({ids: ids, name: e.target.value}))
    }

    const handleOnAddFolder = (e) =>{
        dispatch(addFolder({ids: ids, filename: 'file'}))
    }

    useEffect(()=>{
        
        if(file?.isOpen == null){
            return;
        }

        if(isContentShowing ){
            return
        }

        if(!file.isOpen){
            return
        }

        setIsContentShowing(true)

    },[file])

    useEffect(()=>{

        if(isContentShowing){
            return
        }

        if(!file?.isOpen){
            return
        }

        dispatch(updateFileDetails({ids, isOpen: false}))
    
    },[isContentShowing])

    const Icon = useMemo(()=>{
        if(isContentShowing){
            return FolderOpen
        }
        return Folder
    },[isContentShowing])

    return <div>
        <div className="flex items-center justify-between">
            <Item filename={file?.name} handleOnChangeFilename={handleOnChangeFileName} Icon={Icon} onClick={handleOnClick}/>
            <PlusCircle type="button" onClick={handleOnAddFolder} className="text-gray-500 cursor-pointer" size="sm" />
        </div>

        {isContentShowing && (<div className='ps-4'>{children}</div>)} 
    </div>
}

export default ItemWrapper;