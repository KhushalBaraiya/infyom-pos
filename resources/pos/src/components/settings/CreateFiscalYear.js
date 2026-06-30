import React, { useState } from 'react';
import { Button } from 'react-bootstrap-v5';
import { getFormattedMessage } from '../../shared/sharedMethod';
import FiscalYearForm from './FiscalYearForm';

const CreateFiscalYear = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(!show);
    };

    return (
        <div className='text-end w-sm-auto'>
            <Button variant='primary mb-lg-0 mb-4' onClick={handleClose}>
                {getFormattedMessage('Create')}
            </Button>
            <FiscalYearForm handleClose={handleClose} show={show} />
        </div>
    );
};

export default CreateFiscalYear;
