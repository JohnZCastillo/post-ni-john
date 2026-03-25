import { useState } from "react";

export default function LoadingBtn({onClick, children}){

    const [isLoading, setIsLoading] = useState(false);

    const handleOnClick  = async (e) => {

        setIsLoading(true);

        await onClick();

        setTimeout(()=>{
            setIsLoading(false)
        },500)
    }

    return <>
        <button onClick={handleOnClick} type="button" className={`${isLoading ? 'animate-spin' : ''}  `}>
         {children}
        </button>
    </>

}