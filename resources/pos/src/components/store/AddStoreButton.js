import React, { useState } from 'react'
import { Button } from 'react-bootstrap-v5'
import { getFormattedMessage } from '../../shared/sharedMethod';
import StoreForm from './StoreForm';

const AddStoreButton = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(!show);

    return (
        <div className='text-end w-sm-auto'>
            <Button variant='primary mb-lg-0 mb-4' onClick={handleClose}>
                {getFormattedMessage('create.store.title')}
            </Button>
            <StoreForm handleClose={handleClose} show={show}
                title={getFormattedMessage('create.store.title')} />
        </div>
    )
}

export default AddStoreButton