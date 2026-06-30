import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import MasterLayout from '../MasterLayout';
import { fetchSuppliers } from '../../store/action/supplierAction';
import ReactDataTable from '../../shared/table/ReactDataTable';
import DeleteSupplier from './DeleteSupplier';
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedDate, getFormattedMessage, getPermission, placeholderText } from '../../shared/sharedMethod';
import ActionButton from '../../shared/action-buttons/ActionButton';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import ImportSuppliersModel from './ImportSuppliersModel'
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal';
import { Permissions } from '../../constants';

const Suppliers = ( props ) => {
    const { fetchSuppliers, suppliers, totalRecord, isLoading, allConfigData, callAPIAfterImport, isCallFetchDataApi } = props;
    const [ deleteModel, setDeleteModel ] = useState( false );
    const [ isDelete, setIsDelete ] = useState( null );
    const [ importSuppliers, setImportSuppliers ] = useState( false );
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const handleClose = () => {
        setImportSuppliers( !importSuppliers );
    };
    const navigate = useNavigate()

    const onClickDeleteModel = ( isDelete = null ) => {
        setDeleteModel( !deleteModel );
        setIsDelete( [isDelete?.id] );
    };

    const onChange = ( filter ) => {
        fetchSuppliers( filter, true );
    };

    const goToEditProduct = ( item ) => {
        const id = item.id
        navigate( `/app/suppliers/edit/${id}` )
    };

    const itemsValue = suppliers.length >= 0 && suppliers.map( supplier => ( {
        date: getFormattedDate( supplier.attributes.created_at, allConfigData && allConfigData ),
        time: moment( supplier.attributes.created_at ).format( 'LT' ),
        name: supplier.attributes.name,
        phone: supplier.attributes.phone || '-',
        country: supplier.attributes.country || '-',
        city: supplier.attributes.city || '-',
        email: supplier.attributes.email,
        id: supplier.id
    } ) );

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
            name: getFormattedMessage( 'supplier.title' ),
            selector: row => row.name,
            sortable: true,
            sortField: 'name',
            cell: row => {
                return <div>
                    <div className='text-primary'>{row.name}</div>
                    <div>{row.email}</div>
                </div>
            }
        },
        {
            name: getFormattedMessage( 'globally.input.phone-number.label' ),
            selector: row => row.phone,
            sortField: 'phone',
            sortable: true,
        },
        {
            name: getFormattedMessage( 'globally.react-table.column.created-date.label' ),
            selector: row => row.date,
            sortField: 'created_at',
            sortable: true,
            cell: row => {
                return (
                    <span className='badge bg-light-info'>
                        <div className='mb-1'>{row.time}</div>
                        {row.date}
                    </span>
                )
            }
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_SUPPLIERS) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_SUPPLIERS)
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
                        goToEditProduct={goToEditProduct}
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_SUPPLIERS)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_SUPPLIERS)}
                    />
            }] : [])
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText( 'suppliers.title' )} />
            <ReactDataTable 
                columns={columns} 
                items={itemsValue} 
                onChange={onChange} 
                isLoading={isLoading}
                ButtonValue={getFormattedMessage( 'supplier.create.title' )} 
                buttonImport={getPermission(allConfigData?.permissions, Permissions.CREATE_SUPPLIERS)}
                goToImport={handleClose}
                totalRows={totalRecord} 
                importBtnTitle={'suppliers.import.title'}
                isCallFetchDataApi={isCallFetchDataApi}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_SUPPLIERS) &&
                {
                    to: "#/app/suppliers/create",
                    ButtonValue: getFormattedMessage("supplier.create.title")
                }
                )}
                callAPIAfterImport={callAPIAfterImport}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 0}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <DeleteSupplier clearSelectedDeleteItem={clearSelectedDeleteItem} onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel} onDelete={isDelete} setNotDeletedItemModal={setNotDeletedItemModal} />
            {importSuppliers && <ImportSuppliersModel handleClose={handleClose} show={importSuppliers} />}
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    )
};

const mapStateToProps = ( state ) => {
    const { suppliers, totalRecord, isLoading, allConfigData, callAPIAfterImport, isCallFetchDataApi } = state;
    return { suppliers, totalRecord, isLoading, allConfigData, callAPIAfterImport, isCallFetchDataApi }
};

export default connect( mapStateToProps, { fetchSuppliers } )( Suppliers );

