import { useDispatch, useSelector } from 'react-redux';
import TestFolder from './Folder';
import RequestItem from './Request';
import { addRootFile, addRootFolder } from '../redux-slice/slice';
import { PlusCircle, Plus, Folder} from '@boxicons/react';
import Workspace from './Workspace';
import Tab from './Tab';
import { Allotment } from 'allotment';

export default function Homepage(){

    const appState = useSelector((state) => state.appState)

    const dispatch = useDispatch();

    const renderer = (item, parentIds = []) => {

        if(item.type == 'file'){
            return <RequestItem  key={item?.id} type={item?.method} ids={[...parentIds, item.id]}/>
        } 

        if(item.contents?.length <= 0){
            return <TestFolder  key={item?.id} ids={[...parentIds, item.id]}/>
        }

        return <TestFolder  key={item?.id} ids={[...parentIds, item.id]}>
            {item.contents?.map(content => renderer(content, [...parentIds, item.id]))}
        </TestFolder>
    }

    return <>
    <div className='h-[100vh]'>
        <Allotment>
            <Allotment.Pane minSize={200} maxSize={400}>
            <aside className='h-screen'> 
                <table className="w-full">
                    <tbody>
                        <tr>
                            <td>
                                <div className=''>
                                    <div className='p-2 flex items-center justify-end gap-2 border-gray-300 border-b'>
                                        <Plus size='xs' onClick={()=> dispatch(addRootFile({filename: 'Request'}))} type='button' />
                                        <Folder  size='xs' onClick={()=> dispatch(addRootFolder({filename: 'Folder'}))} type='button' />
                                    </div>

                                    <div className='px-1'>
                                        {appState.content.map(content => {
                                            return renderer(content)
                                        })}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </aside>
            </Allotment.Pane>

            <section className='p-1 h-full'>
                {appState?.activeSelection?.ids != null && (
                    <>
                        <div className='flex items-center gap-4 mb-2 overflow-hidden px-2 py-2'>
                            {appState?.selections?.map(selection => (
                                <Tab ids={selection?.ids}/>
                            ))}
                        </div>
                        {appState?.activeSelection?.ids && (
                            <Workspace ids={appState?.activeSelection?.ids}/>
                        )}
                    </>
                )}

                {appState?.activeSelection?.ids == null && (<>
                    <div className='flex items-center justify-center h-full'>
                        <span className='text-gray-400 font-semibold text-lg'>Select or Create a Request </span>
                    </div>
                </>)}
            </section>
        </Allotment>
    </div>
    </>
}