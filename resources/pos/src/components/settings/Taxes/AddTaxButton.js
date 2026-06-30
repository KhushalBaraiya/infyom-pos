import React, { useState } from 'react'
import { Button } from 'react-bootstrap-v5'
import { getFormattedMessage } from '../../../shared/sharedMethod';
import TaxesForm from './TaxesForm';

const AddTaxButton = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(!show);
    };

    return (
        <div className='text-end w-sm-auto'>
            <Button variant='primary mb-lg-0 mb-4' onClick={handleClose}>
                {getFormattedMessage('add.tax.title')}
            </Button>
            <TaxesForm handleClose={handleClose} show={show}
                title={getFormattedMessage('add.tax.title')} />
        </div>
    )
}

export default AddTaxButton