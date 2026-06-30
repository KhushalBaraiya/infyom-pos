import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import MasterLayout from '../MasterLayout';
import { fetchBaseUnits } from '../../store/action/baseUnitsAction';
import ReactDataTable from '../../shared/table/ReactDataTable';
import DeleteBaseUnits from './DeleteBaseUnits';
import CreateBaseUnits from './CreateBaseUnits';
import EditBaseUnits from './EditBaseUnits';
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedMessage, getPermission, placeholderText } from '../../shared/sharedMethod';
import ActionButton from '../../shared/action-buttons/ActionButton';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal';
import { Permissions } from '../../constants';

const BaseUnits = ( props ) => {
    const { fetchBaseUnits, baseUnits, totalRecord, isLoading, isCallFetchDataApi, allConfigData } = props;
    const [ deleteModel, setDeleteModel ] = useState( false );
    const [ isDelete, setIsDelete ] = useState( null );
    const [ editModel, setEditModel ] = useState( false );
    const [ unit, setUnit ] = useState();
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const handleClose = ( item ) => {
        setEditModel( !editModel );
        setUnit( item );
    };

    const onClickDeleteModel = ( isDelete = null ) => {
        setDeleteModel( !deleteModel );
        setIsDelete( [isDelete?.id] );
    };

    const onChange = ( filter ) => {
        fetchBaseUnits( filter, true );
    };

    const itemsValue = baseUnits.length >= 0 && baseUnits.map( unit => {
        return {
            name: unit.attributes.name,
            id: unit.id
        }
    } );

    const handleSelectedRowsChange = ({ selectedRows }) => {
        const ids = selectedRows.map(row => row.id);
        setSelectedIds(ids);
    };

    const handleDeleteMultiples = () => {
        setDeleteModel(!deleteModel);
        setIsDelete(selectedIds);
    };

    const clearSelectedDeleteItem = () => {
        setClearSelectedRows(true);
        setSelectedIds([]);
    };

    useEffect(() => {
        if (clearSelectedRows) {
            setClearSelectedRows(false);
        }
    }, [clearSelectedRows]);

    const columns = [
        {
            name: getFormattedMessage( 'globally.input.name.label' ),
            selector: row => row.name,
            sortField: 'name',
            sortable: true,
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_UNITS) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_UNITS)
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
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_UNITS)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_UNITS)}
                    />
            }] : [])
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText( 'base-units.title' )} />
            <ReactDataTable 
                columns={columns} 
                items={itemsValue}
                onChange={onChange} 
                isLoading={isLoading}
                totalRows={totalRecord} 
                isUnitFilter 
                isCallFetchDataApi={isCallFetchDataApi}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 0}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
                AddButton={getPermission(allConfigData?.permissions, Permissions.CREATE_UNITS) &&  <CreateBaseUnits />}
                title={getFormattedMessage('unit.modal.input.base-unit.label')}
            />
            <EditBaseUnits handleClose={handleClose} show={editModel} unit={unit} />
            <DeleteBaseUnits clearSelectedDeleteItem={clearSelectedDeleteItem} onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                onDelete={isDelete} setNotDeletedItemModal={setNotDeletedItemModal} />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    )
};

const mapStateToProps = ( state ) => {
    const { baseUnits, totalRecord, isLoading, isCallFetchDataApi, allConfigData } = state;
    return { baseUnits, totalRecord, isLoading, isCallFetchDataApi, allConfigData }
};

export default connect( mapStateToProps, { fetchBaseUnits } )( BaseUnits );

