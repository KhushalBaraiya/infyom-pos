 import React from 'react';
import {Link} from 'react-router-dom';
import {getFormattedMessage} from '../../shared/sharedMethod';

const HeaderTitle = (props) => {
    const {title, to, editLink, addLink, description} = props;
    return (
    <div className='d-md-flex align-items-center justify-content-between mb-5'>
        <div>
          {title ? <h1 className='mb-0'>{title}</h1> : ''}
          {description && <p>{description}</p>}
        </div>
        <div className='text-en d mt-4 mt-md-0'>
            {editLink ? <Link to={editLink}
                              className='btn btn-outline-primary me-2'>{getFormattedMessage('globally.edit-btn')}</Link> : null}
            {to ? <Link to={to}
                        className='btn btn-outline-primary'>{getFormattedMessage('globally.back-btn')}</Link> : null}
                        {addLink ? <Link to={addLink}
                        className='btn btn-primary'> + {getFormattedMessage("create.hold.list.title")}</Link> : null}
                        
        </div>
    </div>
    )
};

export default HeaderTitle;
