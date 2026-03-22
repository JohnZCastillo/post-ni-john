import { useDispatch, useSelector } from 'react-redux';
import TestFolder from './Folder';
import RequestItem from './Request';
import { addFolder, addRootFolder, updateMethod, updateUrl } from '../redux-slice/slice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { Trash } from '@boxicons/react';
import { useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { PlusCircle } from '@boxicons/react';
import Workspace from './Workspace';

export default function Homepage(){

    const appState = useSelector((state) => state.appState)

    const dispatch = useDispatch();

    const queryClient = useQueryClient();

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

    const fetch = ()=> {

        const {method, url, options} =  appState.activeSelection;

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
                    console.log(res)
                }).then(res => {
                    setFetchResult(res)
               }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
            case 'patch':
                 axios.patch(url, options).then(res => {
                    console.log(res)
                }).then(res => {
                    setFetchResult(res)
               }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
            case 'post':
                 axios.post(url, options).then(res => {
                    console.log(res)
                }).then(res => {
                    setFetchResult(res)
              }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
            case 'delete':
                 axios.delete(url, options).then(res => {
                    console.log(res)
                }).then(res => {
                    setFetchResult(res)
               }).catch(err => {
                    setFetchResult(err.message, true)
                }).finally(()=>{
                    endFetch()
                })
            break;
        }       
    }

    const renderer = (item, parentIds = []) => {

        if(item.type == 'file'){
            return <RequestItem type={item?.method} ids={[...parentIds, item.id]}/>
        } 

        if(item.contents?.length <= 0){
            return <TestFolder  ids={[...parentIds, item.id]}/>
        }

        return <TestFolder ids={[...parentIds, item.id]}>
            {item.contents?.map(content => renderer(content, [...parentIds, item.id]))}
        </TestFolder>
    }

    const [inputs, setInputs] = useState([{
        id: v4(),
        key: '',
        value: '',
    }])

    const getInputValue = (id) => {
        return inputs.find(input => input.id == id)
    }

    const deleteInput = (id) => {

        trafficController.current = 'delete';

        if(inputs.length <= 1){
            setInputs([
                 {
                    id: v4(),
                    key: '',
                    value: '',
                }
            ])
        }else{
            setInputs(prev => {
                return prev.filter(input => input.id !== id)
            })
        }
    }

    const trafficController = useRef();

    const changeInput = (values) => {

        const {id, index} = values;

        trafficController.current = 'inputs';
        
        setInputs(prev => {
            return prev.map(data => {
                if(data.id == id){
                    return {...data, ...values}
                }
                return data
            })
        })

        // Add another row below if change is from last index
        if(index === inputs.length - 1){
            setInputs(prev => ([
                ...prev, 
                {
                    id: v4(),
                    key: '',
                    value: '',
                }
            ]))
        }
    }

    useEffect(()=>{

        trafficController.current = 'search';

        if(appState?.activeSelection?.caller == null ||  appState?.activeSelection?.caller != 'search'){
            return;
        }

        if(appState?.activeSelection?.url == null || appState?.activeSelection?.url.length <= 0){
            return;
        }

        const url = URL.parse(appState.activeSelection.url);

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
            setInputs([...values, {
                    id: v4(),
                    key: '', 
                    value: ''
            }])
        }else{
            setInputs(values)
        }

    }, [appState.activeSelection])

     useEffect(()=>{


        if(trafficController.current != 'inputs' && trafficController.current != 'delete'  ){
            return
        }

        if(appState?.activeSelection?.url == null || appState?.activeSelection?.url.length <= 0){
            return;
        }

        if(appState.activeSelection.url.slice(-1) == '&'){
            return;
        }

        const url1 = URL.parse(appState.activeSelection.url);
        const url2 = URL.parse(url1.href.split('?')[0]);

        let url = null;

        if(trafficController.current == 'delete'){
            url = url2;
        }else{
            url = url1
        }

        inputs.forEach(input => {

            if(input.value.length <= 0 || input.key.length <= 0){
                return
            }

            if(url.searchParams.has(input.key)){
                url.searchParams.set(input.key, input.value)
            }else{
                url.searchParams.append(input.key, input.value)
            }
        })

        dispatch(updateUrl({url: decodeURIComponent(url)}))

    }, [inputs])
    
    return <>
    <main className='flex'>
        <aside className='h-screen overflow-y-auto  border'> 
            <table className="w-[300px]">
                <tbody>
                    <tr>
                        <td>
                            <div className=''>
                                <div className='bg-gray-500 p-2 flex items-center gap-1'>
                                    <PlusCircle onClick={()=> dispatch(addRootFolder({filename: 'Folder'}))} type='button' />
                                </div>
                                {appState.content.map(content => {
                                    return renderer(content)
                                })}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </aside>
        <section className='grow'>
            <Workspace ids={appState?.activeSelection?.ids}/>
        </section>
    </main>
    </>
}