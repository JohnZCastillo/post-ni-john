import { createSlice, current } from '@reduxjs/toolkit'
import { v4 as uuidv4, v4 } from 'uuid';

const initialState = JSON.parse(localStorage.getItem('redux-store'))?.appState;

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
        content: [],
        activeSelection: null,
        selections: [],
        actionType: '',
        // ...initialState
    },    
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

        target.name = filename;
        state.actionType = 'updateFilename';
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
        state.actionType = 'setSelection';

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
        
        target.method = method;
        state.activeSelection = target
        state.actionType = 'updateMethod';
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
        state.actionType = 'updateUrl';
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
        state.actionType = 'addFolder';

        target?.contents?.push({
            id: v4(),
            type: 'folder',
            name: filename,
            contents: []
        })
    },
    addFile: (state, action) => {

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
        state.actionType = 'addFile';

        target?.contents?.push({
            id: v4(),
            method: 'get',
            url: '',
            type: 'file',
            name: filename,
            contents: []
        })
    },
    addRootFile: (state, action) => {

        const { filename } = action.payload;
        state.actionType = 'addRootFile';
      
        state?.content?.push({
            id: v4(),
            method: 'get',
            url: '',
            type: 'file',
            name: filename,
            contents: []
        })
    },
    addRootFolder: (state, action) => {

        const { filename } = action.payload;
        
        state.actionType = 'addRootFolder';

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

        Object.keys(action.payload).forEach(key => {
            target[key] = action.payload[key];
        })

        state.actionType = 'updateFileDetails';

    },
    deleteFile: (state, action) => {

        const { ids } = action.payload;

        let target = state.content;

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                console.log('ids: ', ids);
                console.log('key: ', key);  
                alert('unable to delete file')
                return;
            }

            if(index == 0 && ids.length == 1){
                counterSlice.caseReducers.removeSelection(state, { type: 'counter/removeSelection', payload: {id: key} });
                state.content = state.content?.filter(content => content?.id != key) ?? [];
                state.actionType = 'deleteFile';
                return;
            }

            if(index == (ids.length - 2)){
                counterSlice.caseReducers.removeSelection(state, { type: 'counter/removeSelection', payload: { id:  ids[ids.length - 1] } });
                target.contents = target?.contents?.filter(contents => contents.id != ids[ids.length - 1]) ?? [];
                state.actionType = 'deleteFile';
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

        state.actionType = 'removeSelection';
        state.selections = state.selections.filter(selection => selection.id != id);
    },
    updateContent: (state, action) => {

        const {isUpstream = false} = action.payload;

        state.actionType = 'updateContent';
        state.content = action.payload.content;
        
        if(!isUpstream){
            state.selected = null;
            state.selections = []
        }
    },
    duplicateFile: (state, action) => {

        const { ids } = action.payload;

        let target = state.content;
        let parent = state.content;

        if(ids == null){
            return;
        }

        if(ids.length == 1){

            target = state.content.find(x => x.id == ids[0]);

            const id = v4();

            state.content.push({
                ...target,
                id: id,
                ids: [id] 
            })

            return;
        }

        for (let index = 0; index < ids.length; index++) {
            const key = ids[index];

            target = target.find(x => x.id == key);

            if(target == null){
                return;
            }

            if(index == ids.length - 2){
                parent = target;
            }

            if(index != (ids.length - 1)){
                target = target.contents
            }
        }

        parent.contents.push({
            ...target,
            name: target.name + ' copy',
            id: v4(),
            ids:  target?.ids?.pop() ?? []
        })
    },
  },
})

export const { 
        updateFilename, 
        setSelection, 
        updateMethod, 
        updateUrl, 
        addFolder, 
        addRootFolder, 
        updateFileDetails, 
        removeSelection, 
        deleteFile, 
        addFile, 
        addRootFile,
        updateContent,
        duplicateFile
    } = counterSlice.actions

export default counterSlice.reducer