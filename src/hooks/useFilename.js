import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function useFilename(ids = []){

    let target = useSelector((state) => state.appState.content) 

    for (let index = 0; index < ids.length; index++) {
        
        const key = ids[index];

        target = target?.find(x => x.id == key);
        
        if(target == null){
            return null;
        }

        if(index != (ids.length - 1)){
            target = target.contents
        }
    }

    return target;

}