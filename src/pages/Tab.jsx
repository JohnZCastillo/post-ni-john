import { useDispatch, useSelector } from "react-redux";
import useFilename from "../hooks/useFilename"
import { removeSelection, setSelection } from "../redux-slice/slice";
import { TrashX } from '@boxicons/react';
import { useState } from "react";

export default function Tab({ids}){

    const workSpace = useFilename(ids);

    const activeSelection = useSelector((state) => state.appState?.activeSelection);

    const [isDeleteShowing, setIsDeleteShowing] = useState(false);

    const dispatch = useDispatch();

    const handleOnClick = ()=>{
        dispatch(setSelection({ids}));
    }

    const handleOnDelete = (e) => {
        e.stopPropagation();

        dispatch(removeSelection({id: workSpace.id}));
    }

    return <>
        <div 
            onMouseEnter={()=> setIsDeleteShowing(true)}
            onMouseLeave={()=> setIsDeleteShowing(false)}
            onClick={handleOnClick} 
            className={`${activeSelection.id == workSpace.id ? 'bg-gray-500 text-white' : 'bg-gray-300' } relative px-2 py-1 rounded cursor-pointer`}>
                
                <span className="max-w-[10ch] truncate">
                    {workSpace?.name ?? workSpace?.url}
                </span>

                {isDeleteShowing && (
                    <span className="absolute top-[-10px] right-[-10px] text-red-500">
                        <TrashX onClick={handleOnDelete} />
                    </span>
                )}

        </div>
    </>
}