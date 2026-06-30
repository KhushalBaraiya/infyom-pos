import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link } from "react-router-dom"
import MasterLayout from '../MasterLayout';
import { fetchLanguages, toggleLanguageStatus } from '../../store/action/languageAction';
import { addToast } from '../../store/action/toastAction';
import ReactDataTable from '../../shared/table/ReactDataTable';
import DeleteLanguage from './DeleteLanguage';
import EditLanguage from './EditLanguage';
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedMessage, getPermission, placeholderText } from '../../shared/sharedMethod';
import { Permissions, Tokens } from '../../constants';
import ActionButton from '../../shared/action-buttons/ActionButton';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import CreateLanguage from "./CreateLanguage";

const Languages = ( props ) => {
    const { fetchLanguages, languages, totalRecord, isLoading, allConfigData } = props;
    const dispatch = useDispatch();
    const [ deleteModel, setDeleteModel ] = useState( false );
    const [ isDelete, setIsDelete ] = useState( null );
    const [ editModel, setEditModel ] = useState( false );
    const [ language, setLanguage ] = useState();

    const handleClose = ( item ) => {
        setEditModel( !editModel );
        setLanguage( item );
    };

    const onClickDeleteModel = ( isDelete = null ) => {
        setDeleteModel( !deleteModel );
        setIsDelete( isDelete );
    };

    const onChange = ( filter ) => {
        fetchLanguages( filter, false );
    };

    const itemsValue = languages.length >= 0 && languages.map( language => {
        return (
            {
                name: language.attributes?.name,
                iso_code: language.attributes?.iso_code,
                status: language.attributes.status === null ? true : language.attributes.status,
                id: language?.id
            }
        )
    } );

    const handleStatusChange = (id) => {
        // Get current user's language
        const currentUserLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);

        // Find the language being toggled
        const languageToToggle = languages.find(lang => lang.id === id);

        // Check if user is trying to disable their current language
        if (languageToToggle && languageToToggle.attributes.status &&
            languageToToggle.attributes.iso_code === currentUserLanguage) {
            // Show error message - user cannot disable their current language
            dispatch(addToast({
                text: getFormattedMessage('language.current-language-disable.error.message') ||
                      'You cannot disable your currently selected language.',
                type: 'error'
            }));
            return;
        }

        dispatch(toggleLanguageStatus(id));
    }

    const columns = [
        {
            name: getFormattedMessage( 'globally.input.name.label' ),
            selector: row => row.name,
        },
        {
            name: getFormattedMessage( 'react-data-table.iso-date.column.label' ),
            selector: row => row.iso_code,
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_LANGUAGE)
        ) ? [
            {
                name: getFormattedMessage("globally.detail.status"),
                selector: (row) => row.status,
                sortable: false,
                cell: (row) => {
                    return (
                        <div className="d-flex align-items-center">
                            <label className="form-check form-switch form-switch-sm">
                                <input
                                    type="checkbox"
                                    checked={row.status}
                                    onChange={() =>
                                        handleStatusChange(row.id)
                                    }
                                    className="me-3 form-check-input cursor-pointer"
                                />
                                <div className="control__indicator" />
                            </label>
                        </div>
                    );
                },
            },
            {
                name: getFormattedMessage("react-data-table.translation.column.label"),
                cell: row => <Link to={`/app/languages/${row.id}`} className={"text-decoration-none"}>{getFormattedMessage('edit-translation.title')}</Link>
            }] : []),
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_LANGUAGE) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_LANGUAGE)
        ) ? [
            {
                name: getFormattedMessage('react-data-table.action.column.label'),
                right: true,
                ignoreRowClick: true,
                allowOverflow: true,
                button: true,
                cell: row =>
                    <ActionButton
                        item={row}
                        goToEditProduct={handleClose}
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_LANGUAGE)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_LANGUAGE)}
                    />
            }] : []),
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('languages.title')} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                AddButton={getPermission(allConfigData?.permissions, Permissions.CREATE_LANGUAGE) && <CreateLanguage />}
                title={getFormattedMessage('languages.title')}
                totalRows={totalRecord}
            />
            <EditLanguage handleClose={handleClose} show={editModel} language={language} />
            <DeleteLanguage onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                onDelete={isDelete} />
        </MasterLayout>
    )
};

const mapStateToProps = ( state ) => {
    const { languages, totalRecord, isLoading, allConfigData } = state;
    return { languages, totalRecord, isLoading, allConfigData }
};

export default connect( mapStateToProps, { fetchLanguages, toggleLanguageStatus, addToast } )( Languages );

