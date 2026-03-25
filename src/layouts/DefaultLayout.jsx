import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router";
import { md5 } from 'js-md5';
import { updateContent } from "../redux-slice/slice";
import * as jsondiffpatch from 'jsondiffpatch';

export default function DefaultLayout(){
    
    const dispatch = useDispatch();

    const appState = useSelector((state) => state.appState)
    
    const syncUpstream = async (workspace)=>{

        const response =  await fetch(`${import.meta.env.VITE_WEB_AGENT}/sync/${workspace}`, {
            method: 'POST',
            body: JSON.stringify({
                content: appState.content
            })
        })
        .then( res => res.json());

        const localCopy = [...response.content];

        const diffpatcher = jsondiffpatch.create({
            objectHash: function (obj) {
                return obj.id;
            },
        });

        const delta = diffpatcher.diff(localCopy, appState.content);

        if(delta){
            jsondiffpatch.patch(localCopy, delta);
        }

        dispatch(updateContent({content:  localCopy ?? [], isUpstream: true}))
    }

    const syncDownstream = async (workspace)=>{

        const result =  await fetch(`${import.meta.env.VITE_WEB_AGENT}/sync/${workspace}`)
            .then( response => response.json());

        const localHash = md5(JSON.stringify(appState.content ?? []));
            
        if(result.hash != localHash || 1 == 1){
           
            const localCopy =  jsondiffpatch.clone(appState.content);

            const diffpatcher = jsondiffpatch.create({
                objectHash: function (obj) {
                    return obj.id
                },
            });

            const delta = diffpatcher.diff(localCopy, result.data);

            if(delta){
                console.log(delta);
                jsondiffpatch.patch(localCopy, delta);
            }

            dispatch(updateContent({content:  localCopy}))
        }
    }

    useEffect(()=>{
        syncDownstream('Cow');
    },[])
    
    return <>
        <Outlet context={{syncUpstream,syncDownstream}}/>
    </>
}