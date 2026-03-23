import { useDispatch, useSelector } from 'react-redux';
import TestFolder from './Folder';
import RequestItem from './Request';
import { addRootFolder } from '../redux-slice/slice';
import { PlusCircle } from '@boxicons/react';
import Workspace from './Workspace';

export default function Homepage(){

    const appState = useSelector((state) => state.appState)

    const dispatch = useDispatch();

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