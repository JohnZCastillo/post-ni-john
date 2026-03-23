import { useDispatch } from "react-redux"
import { updateFileDetails, updateMethod } from "../redux-slice/slice";
import useFilename from "../hooks/useFilename";
import { Trash } from '@boxicons/react';
import { v4 } from 'uuid';
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Editor from '@monaco-editor/react';

export default function Workspace({ids}){

    
    const trafficController = useRef();
    const dispatch = useDispatch();

    const request = useFilename(ids);

    const [toolBar, setToolBar] = useState({
        activateTool: null,
        tools: [
                'Params',
                'Authorization',
                'Headers',
                'Body'
            ]
    });
  
    const [fetchDetails , setFetchDetails] = useState({
        isFetching: false,
        result: null,
        isError: null
    });

    const startFetching = ()=>{
        setFetchDetails(prev => ({...prev, isFetching: true}))
    }

    const setFetchResult = (result, isError = false)=>{
        setFetchDetails(prev => ({...prev, result, isError}))
    }

    const endFetch = ()=>{
        setFetchDetails(prev => ({...prev, isFetching: false}))
    }

    const [params, setParams] = useState([])

    useEffect(()=>{
        trafficController.current = 'initial'
    },[])

    const handleOnChangeMethod = (e)=>{
        dispatch(updateFileDetails({method: e.target.value, ids}))
    }
    
    const handleOnChangeUrl = (e) => {
        trafficController.current = 'search'
        dispatch(updateFileDetails({url: e.target.value.trim(), ids}))
    }

    const fetch = ()=> {

        const {method, url, options} =  request;

        if(method == null){
            return
        }

        startFetching();

        switch(method){
            case 'get':
                 axios.get(url, options).then(res => {
                    setFetchResult(res.data)
                }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
            case 'put':
                 axios.put(url, options).then(res => {
                    setFetchResult(res)
               }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
            case 'patch':
                 axios.patch(url, options).then(res => {
                    setFetchResult(res)
               }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
            case 'post':
                 axios.post(url, options).then(res => {
                    setFetchResult(res)
              }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
            case 'delete':
                 axios.delete(url, options).then(res => {
                    setFetchResult(res)
               }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
        }       
    }
    
    const getParam = (id) => {
        return params.find(input => input.id == id)
    }

    const deleteParam = (id) => {

        trafficController.current = 'delete';

        if(params.length <= 1){
            setParams([
                    {
                    id: v4(),
                    key: '',
                    value: '',
                }
            ])
        }else{
            setParams(prev => {
                return prev.filter(input => input.id !== id)
            })
        }
    }

    const updateParams = (values) => {

        const {id, index} = values;

        trafficController.current = 'inputs';
        
        setParams(prev => {
            return prev.map(data => {
                if(data.id == id){
                    return {...data, ...values}
                }
                return data
            })
        })

        // Add another row below if change is from last index
        if(index === params.length - 1){
            setParams(prev => ([
                ...prev, 
                {
                    id: v4(),
                    key: '',
                    value: '',
                }
            ]))
        }
    }

    const handleOnChangeToken = (e) => {
        dispatch(updateFileDetails({auth: e.target.value, ids, options: {
            headers: {
                'Authorization': `Bearer ${e.target.value}`
            } 
        }}))
    }

    useEffect(()=>{

         trafficController.current = 'initial';
         
        setParams([
            {
                id: v4(),
                key: '',
                value: '',
            }
        ]);

        setFetchDetails({
            isFetching: false,
            result: null,
            isError: null
        })
    },[ids])

    
    useEffect(()=>{

        if(trafficController.current != 'search' &&  trafficController.current != 'initial'){
            return;
        }

        if(request?.url == null || request?.url.length <= 0){
            return;
        }

        const url = URL.parse(request.url);

        if( url?.searchParams?.entries == null){
            return;
        }

        const values = [];

        for (const [key, value] of url.searchParams.entries()) {
            values.push({
                    id: v4(),
                    key: key, 
                    value: value
            })
        }

        if(values.length <= 1){
             setParams([...values, {
                    id: v4(),
                    key: '', 
                    value: ''
            }])
        }else{
            setParams(values)
        }

    }, [request])

    useEffect(()=>{

        if(trafficController.current != 'inputs' && trafficController.current != 'delete'  ){
            return
        }

        if(request?.url == null || request?.url?.length <= 0){
            return;
        }

        if(request.url.slice(-1) == '&'){
            return;
        }

        const url1 = URL.parse(request.url);
        const url2 = URL.parse(url1.href.split('?')[0]);

        let url = null;

        if(trafficController.current == 'delete'){
            url = url2;
        }else{
            url = url1
        }

        params.forEach(input => {

            if(input.value.length <= 0 || input.key.length <= 0){
                return
            }

            if(url.searchParams.has(input.key)){
                url.searchParams.set(input.key, input.value)
            }else{
                url.searchParams.append(input.key, input.value)
            }
        })

        trafficController.current = 'inputs';

        dispatch(updateFileDetails({url: decodeURIComponent(url), ids}))

    }, [params])

    return <>
        <div className='grid grid-cols-[1fr_auto] gap-1'>
            <div className='flex items-center p-1 gap-2 border rounded'>
                <span className='border-r border-gray-300 pe-2'>
                    <select 
                        onChange={handleOnChangeMethod} 
                        value={request?.method} 
                        className='outline-none'
                    >
                        <option value="get">Get</option>
                        <option value="post">Post</option>
                        <option value="delete">Delete</option>
                        <option value="patch">Patch</option>
                        <option value="put">Put</option>
                    </select>
                </span>
                <input  
                    onChange={handleOnChangeUrl} 
                    value={request?.url} 
                    className='w-full outline-none'
                />
            </div>
            <button onClick={fetch} className='px-3 py-2 bg-indigo-500 text-white rounded cursor-pointer'>Send</button>
        </div>

        <section className="flex gap-2 p-1">
            {toolBar?.tools.map(tool => (
              <button 
                className={`px-2 py-1 rounded cursor-pointer ${toolBar.activateTool == tool ? 'bg-gray-300' : ''}`}
                onClick={()=> setToolBar(prev => ({...prev, activateTool: tool}))}>
                {tool}
              </button>
            ))}
        </section>

        {toolBar.activateTool == 'Params' && (
            <table className='w-full border'>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {params.map((input, index) => {
                        return <>
                            <tr key={input.id} className='border'> 
                            <td className='border'>
                                <input
                                    value={getParam(input.id)?.key} 
                                    onChange={(e)=> updateParams({id: input.id, key: e.target.value, index: index    })} 
                                    className='w-full outline-none text-sm p-1'
                                />
                            </td>
                            <td className='border'>
                                <input
                                    value={getParam(input.id)?.value} 
                                    onChange={(e)=> updateParams({id: input.id, value: e.target.value, index: index})} 
                                    className='w-full outline-none text-sm p-1'
                                />
                            </td>
                            <td className='border'>
                                <Trash 
                                    onClick={()=> deleteParam(input.id)} 
                                    className='text-red-500 cursor-pointer' 
                                    type='button'
                                />
                            </td>
                        </tr>
                        </>
                    })}
                </tbody>
            </table>
        )}


        {toolBar.activateTool == 'Authorization' && (
            <div className="grid grid-cols-[120px_1fr] items-center">
                <input readOnly value="Bearer Token" className="p-1 border w-full outline-none"/>
                <input onChange={handleOnChangeToken} value={request?.auth} className="p-1 border-t border-b border-e w-full outline-none"/>
            </div>
        )}

        {fetchDetails?.isFetching && (<span>Loading</span>)}

        {!fetchDetails?.isFetching && (
            <Editor options={{readOnly: true}} height={"80vh"} defaultLanguage="json" value={ JSON.stringify( fetchDetails?.result, null, 2)}  />
        )}
    </>
}