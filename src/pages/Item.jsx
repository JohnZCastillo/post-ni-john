import { useEffect, useRef, useState } from "react";
import ContextMenu from "../components/ContextMenu";
import { useDispatch } from "react-redux";
import { deleteFile, duplicateFile } from "../redux-slice/slice";
import { useDebouncedCallback } from 'use-debounce';

const Item = ({ onClick, Icon, TextIcon, filename, handleOnChangeFilename, ids = [], otherActions = [] }) => {
    const inputRef = useRef();
    const [isEditable, setEditable] = useState(false);
    const contextmenu = useRef();
    const dispatch = useDispatch();
    const [text, setText] = useState(filename);

    useEffect(() => { setText(filename) }, [filename]);

    const debounced = useDebouncedCallback(handleOnChangeFilename, 1000);

    const handleChangeName = (e) => {
        e.preventDefault();
        const value = e.target.value;
        setText(value);
        debounced(value);
    };

    const [options] = useState([
        { title: 'Rename', action: () => setEditable(true) },
        { title: 'Delete', action: () => dispatch(deleteFile({ ids })) },
        { title: 'Duplicate', action: () => dispatch(duplicateFile({ ids })) },
        ...otherActions
    ]);

    const handleOnClick = (e) => {
        if (isEditable) { e.stopPropagation(); } else { onClick(); }
    };

    useEffect(() => {
        if (isEditable) inputRef.current?.focus();
    }, [isEditable]);

    return (
        <div
            ref={contextmenu}
            onClick={handleOnClick}
            className="hover:bg-[var(--pm-hover)] bg-transparent"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.1s',
                minWidth: 0
            }}
        >
            <ContextMenu options={options} ref={contextmenu} />

            {TextIcon == null && Icon && (
                <Icon size={14} style={{ color: 'var(--pm-text-muted)', flexShrink: 0 }} />
            )}
            {TextIcon && TextIcon}

            {!isEditable ? (
                <span style={{
                    color: 'var(--pm-text)',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                }}>
                    {text}
                </span>
            ) : (
                <form style={{ flex: 1 }} onSubmit={(e) => { e.preventDefault(); setEditable(false); }}>
                    <input
                        onBlur={() => setEditable(false)}
                        ref={inputRef}
                        style={{
                            width: '100%',
                            background: 'var(--pm-input-bg)',
                            border: '1px solid var(--pm-accent)',
                            borderRadius: '3px',
                            color: 'var(--pm-text)',
                            padding: '2px 6px',
                            fontSize: '12px',
                            outline: 'none'
                        }}
                        value={text}
                        onChange={handleChangeName}
                    />
                </form>
            )}
        </div>
    );
};

export default Item;
