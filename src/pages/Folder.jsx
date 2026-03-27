import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { addFile, addFolder, updateFileDetails } from "../redux-slice/slice";
import useFilename from "../hooks/useFilename";
import Item from './Item';

const ItemWrapper = ({ children, ids }) => {
    const dispatch = useDispatch();
    const [isContentShowing, setIsContentShowing] = useState(false);
    const file = useFilename(ids);

    const handleOnClick = () => setIsContentShowing(prev => !prev);

    const handleOnChangeFileName = (value) => dispatch(updateFileDetails({ ids, name: value }));
    const handleOnAddFolder = () => dispatch(addFolder({ ids, filename: 'New Folder' }));
    const handleOnAddFile = () => dispatch(addFile({ ids, filename: 'New Request' }));

    useEffect(() => {
        if (file?.isOpen == null) return;
        if (isContentShowing) return;
        if (!file.isOpen) return;
        setIsContentShowing(true);
    }, [file]);

    useEffect(() => {
        if (isContentShowing) return;
        if (!file?.isOpen) return;
        dispatch(updateFileDetails({ ids, isOpen: false }));
    }, [isContentShowing]);

    const FolderIcon = useMemo(() => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fca130', flexShrink: 0 }}>
            {isContentShowing
                ? <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></>
                : <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            }
        </svg>
    ), [isContentShowing]);

    const ChevronIcon = (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{
            color: 'var(--pm-text-muted)',
            flexShrink: 0,
            transform: isContentShowing ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s'
        }}>
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );

    return (
        <div>
            <Item
                otherActions={[
                    { title: 'Add Folder', action: handleOnAddFolder },
                    { title: 'Add Request', action: handleOnAddFile },
                ]}
                ids={ids}
                filename={file?.name}
                handleOnChangeFilename={handleOnChangeFileName}
                Icon={() => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {ChevronIcon}
                        {FolderIcon}
                    </div>
                )}
                onClick={handleOnClick}
            />
            {isContentShowing && (
                <div style={{ paddingLeft: '16px', borderLeft: '1px solid var(--pm-border)', marginLeft: '18px' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default ItemWrapper;
