import { useDispatch, useSelector } from 'react-redux';
import TestFolder from './Folder';
import RequestItem from './Request';
import { addRootFolder } from '../redux-slice/slice';
import { PlusCircle } from '@boxicons/react';
import Workspace from './Workspace';
import Tab from './Tab';

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
    <main className='grid grid-cols-[auto_1fr]'>
        <aside className='h-screen border w-full'> 
            <table className="w-full">
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
        <section className='p-1'>
            <div className='flex items-center gap-4 mb-2 overflow-hidden px-2 py-2'>
                {appState?.selections?.map(selection => (
                    <Tab ids={selection.ids}/>
                ))}
            </div>
            {appState?.activeSelection?.ids && (
                <Workspace ids={appState?.activeSelection?.ids}/>
            )}
        </section>
    </main>
    </>
}