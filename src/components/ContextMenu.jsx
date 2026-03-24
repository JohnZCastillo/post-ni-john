import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ContextMenu({ref, options = []}){

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef();
    const menuPosition = useRef();

    const handleContextMenu = (e)=>{
            e.preventDefault();

        menuPosition.current = {
            left: `${e.pageX}px`,
            top: `${e.pageY}px`,
        }

        setIsOpen(true);
    }

    const handleOnBlur = (e)=> {
        
        e.preventDefault();

        setIsOpen(false);
    }
    
    useEffect(()=>{

        ref.current?.addEventListener("contextmenu", handleContextMenu)
        ref.current?.addEventListener("blur", handleOnBlur)

        return ()=>{
            ref.current?.removeEventListener("contextmenu", handleContextMenu)
            ref.current?.removeEventListener("blur", handleOnBlur)
        }

    },[]);

    return createPortal(<>
     {isOpen && (
            <div  onContextMenu={(e) => {
                e.preventDefault();
            }} className="absolute top-0 h-screen w-screen" onClick={()=> setIsOpen(false)} >
                <div className="absolute block bg-gray-200 border border-gray-100 p-2 rounded min-w-[200px]" style={menuPosition.current} ref={menuRef}>
                    {options.map(option => {
                        return <div onClick={option.action} className="cursor-pointer border-gray-400 border-b">{option.title}</div>
                    })}
                </div>
            </div>
        )}
    </>, document.body)
}