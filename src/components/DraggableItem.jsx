import { useRef } from "react"
import Draggable from 'react-draggable';

export default function DraggableItem({ children, parent }) {

    const ref = useRef();

    const handleOnDragStart = () => {
        ref.current?.classList?.add('z-50');
    }

    const handleOnDragEnd = () => {
        ref.current?.classList?.remove('z-50');
    }

    return <>
        <Draggable onDrag={handleOnDragStart} onStop={handleOnDragEnd} nodeRef={ref} bounds={parent} axis="y">
            <div className="z-1" ref={ref}>{children}</div>
        </Draggable>
    </>
}
