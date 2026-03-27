import { useEffect, useMemo, useState } from 'react';
import Item from './Item';
import useFilename from '../hooks/useFilename';
import { setSelection, updateFilename } from '../redux-slice/slice';
import { useDispatch, useSelector } from 'react-redux';

const METHOD_COLORS = {
    get: '#49cc90',
    post: '#fca130',
    put: '#61affe',
    patch: '#50e3c2',
    delete: '#f93e3e',
};

const RequestItem = ({ type, ids }) => {
    const file = useFilename(ids);
    const dispatch = useDispatch();

    const activeSelection = useSelector((state) => state.appState?.activeSelection);

    const isActive = activeSelection?.id === file?.id;

    const [requestDetails, setRequestDetails] = useState({ type: 'get', name: 'Request' });

    const handleOnChangeFileName = (value) => dispatch(updateFilename({ ids, filename: value }));

    useEffect(() => { setRequestDetails(prev => ({ ...prev, type })) }, [type]);

    const handleOnClick = () => dispatch(setSelection({ ids }));

    const TextIcon = useMemo(() => {
        const color = METHOD_COLORS[requestDetails.type] || METHOD_COLORS.get;
        return (
            <span style={{
                color,
                fontWeight: 700,
                fontSize: '10px',
                textTransform: 'uppercase',
                minWidth: '36px',
                flexShrink: 0,
                letterSpacing: '0.3px'
            }}>
                {requestDetails.type}
            </span>
        );
    }, [requestDetails.type]);

    return (
        <div style={{ background: isActive ? 'var(--pm-surface-2)' : 'transparent', borderRadius: '4px' }}>
            <Item
                ids={ids}
                onClick={handleOnClick}
                filename={file?.name}
                handleOnChangeFilename={handleOnChangeFileName}
                TextIcon={TextIcon}
            />
        </div>
    );
};

export default RequestItem;
