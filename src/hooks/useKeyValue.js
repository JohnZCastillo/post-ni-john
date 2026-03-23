import { useEffect, useState } from "react";
import { v4 } from "uuid";

export default function useKeyValue({initialContents = [], addOnEmpty = false}){

    const [contents, setContents] = useState([]);

    useEffect(()=>{
        setContents(initialContents)
    },[])

    const addBlankContent = () => {
        addContent('','');
    }

    const addContent = (key, value) => {
        setContents(prev => ([...prev, {
            id: v4(),
            key, 
            value
        }]))
    }

    const getContent = (id) => {
        return contents.find(content => content.id == id)
    }

    const deleteContent = (id) => {
        
        if(contents.length <= 1 && addOnEmpty){
            setContents([{
                id: v4(),
                key: '',
                value: ''
            }])
        }

        setContents(prev => {
            return prev.filter(content => content.id != id)
        })
    }

    const updateContent = (props) => {

        const {id, index} = props;

        if(index != null && index == contents.length - 1 ){
            addBlankContent();
        }

        setContents(prev => {
            return prev.map(content => {
                if(content.id == id){
                    return {
                        ...content,
                        ...props
                    }
                }

                return content;
            })
         })
    }

    return  {
        addBlankContent,
        addContent,
        getContent,
        deleteContent,
        updateContent,
        setContents,
        contents, 
    }
}