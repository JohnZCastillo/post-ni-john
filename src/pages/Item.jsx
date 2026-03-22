const Item =  ({onClick, Icon, TextIcon, filename, handleOnChangeFilename}) => {

    return <div  className='flex items-center gap-1'>
        {TextIcon == null && (
            <Icon type='button' onClick={onClick} size='base' className="cursor-pointer" />
        )}

        {TextIcon && (TextIcon)}
        
        <input className='p-1 outline-none' value={filename} onChange={handleOnChangeFilename} />
    </div>
}

export default Item;