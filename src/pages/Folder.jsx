import { useEffect, useMemo, useState } from "react";
import {  useDispatch, useSelector } from "react-redux";
import { Folder, FolderOpen, LinkAlt } from '@boxicons/react';
import { addFile, addFolder, updateFileDetails, updateFilename } from "../redux-slice/slice";
import useFilename from "../hooks/useFilename";
import { Plus, PlusCircle } from '@boxicons/react';
import Item from './Item';
import { isAction } from "@reduxjs/toolkit";
import { v4 } from "uuid";

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

    const handleOnAddFile = (e) =>{
        dispatch(addFile({ids: ids, filename: 'file'}))
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
        <Item  
            otherActions={[
                {title: 'Add Folder', action: ()=> handleOnAddFolder()},
                {title: 'Add File', action: ()=> handleOnAddFile()},
            ]} 
            ids={ids} filename={file?.name} 
            handleOnChangeFilename={handleOnChangeFileName} 
            Icon={Icon} 
            onClick={handleOnClick}
        />
        {isContentShowing && (<div className='ps-4'>{children}</div>)} 
    </div>
}

export default ItemWrapper;