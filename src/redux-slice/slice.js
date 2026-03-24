import { createSlice, current } from '@reduxjs/toolkit'
import { v4 as uuidv4, v4 } from 'uuid';

const initialState = JSON.parse(localStorage.getItem('redux-store'))?.appState ?? {content: [], activeSelection: null};


export const counterSlice = createSlice({
  name: 'counter',
  initialState: initialState,    
  reducers: {
    updateFilename: (state, action) => {

        const { filename, ids} = action.payload;

        let target = state.content;

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }

        const isFile = filename.includes('.');
        
        if(isFile){
            target.type = 'file';
            target.method = 'get';
            target.url = '';
            target.contents = []
            target.options = {}
        }else{
            target.type = 'folder'
        }

        target.name = filename;
    },
    setSelection: (state, action) => {

        const { ids} = action.payload;

        let target = state.content;

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }
        
        target.ids = ids;


        state.activeSelection = target;

        if(state?.selections == null){
            state.selections = [target];
        }else{

            const isExisting = state.selections.find(selection => selection.id == target.id );

            if(!isExisting){
                state.selections.push(target);
            }
        }

    },
    updateMethod: (state, action) => {

        const { method } = action.payload;

        let target = state.content;

        const {ids} = state.activeSelection;

        if(ids == null){
            return;
        }

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }
        
        // console.log('called: ', method);

        target.method = method;
        state.activeSelection = target
    },
    updateUrl: (state, action) => {

        const { url, caller } = action.payload;

        let target = state.content;

        const {ids} = state.activeSelection;

        if(ids == null){
            return;
        }

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }
        
        target.url = url;
        target.caller = caller;
        state.activeSelection = target
    },
    addFolder: (state, action) => {

        const { filename, ids } = action.payload;

        let target = state.content;

        if(ids == null){
            return;
        }

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }
        
        target.isOpen = true;

        target?.contents?.push({
            id: v4(),
            type: 'folder',
            name: filename,
            contents: []
        })
    },
    addRootFolder: (state, action) => {

        const { filename } = action.payload;
        
        state.content.push({
            id: v4(),
            type: 'folder',
            name: filename,
            contents: []
        })
    },
    updateFileDetails: (state, action) => {

        const {ids, name} = action.payload;

        let target = state.content;

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }

        if(name != null && name.includes('.')){
            target.type = 'file';
            target.method = 'get';
            target.url = '';
            target.contents = [];
        }

        Object.keys(action.payload).forEach(key => {
            target[key] = action.payload[key];
        })

    },
    deleteFile: (state, action) => {

        const { ids } = action.payload;

        let target = state.content;

        
        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index == 0 && ids.length == 1){
                counterSlice.caseReducers.removeSelection(state, { type: 'counter/removeSelection', payload: {id: key} });
                state.content = state.content?.filter(content => content?.id != key) ?? [];
                return;
            }

            if(index == (ids.length - 2)){
                counterSlice.caseReducers.removeSelection(state, { type: 'counter/removeSelection', payload: { id:  ids[ids.length - 1] } });
                target.contents = target?.contents?.filter(contents => contents.id != ids[ids.length - 1]) ?? [];
                return;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }
    },
    removeSelection: (state, action) => {

        const {id} = action.payload;

        if(state?.selections == null){
            return;
        }

        state.selections = state.selections.filter(selection => selection.id != id);
    }   
  },
})

export const { updateFilename, setSelection, updateMethod, updateUrl, addFolder, addRootFolder, updateFileDetails, removeSelection, deleteFile} = counterSlice.actions

export default counterSlice.reducer