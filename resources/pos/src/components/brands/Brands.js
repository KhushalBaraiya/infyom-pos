import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MasterLayout from '../MasterLayout';
import {fetchBrands} from '../../store/action/brandsAction';
import ReactDataTable from '../../shared/table/ReactDataTable';
import ActionButton from '../../shared/action-buttons/ActionButton';
import DeleteBrands from './DeleteBrands';
import user from '../../assets/images/brand_logo.png';
import CreateBrands from './CreateBrands.js';
import EditBrands from './EditBrands';
import TabTitle from '../../shared/tab-title/TabTitle';
import {getFormattedMessage, getPermission, placeholderText} from '../../shared/sharedMethod';
import { Permissions, Tokens } from '../../constants';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal.js';

const Brands = () => {
    const {brands, totalRecord, isLoading, isCallFetchDataApi, allConfigData} = useSelector(state => state);
    const Dispatch = useDispatch();
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [edit, setEdit] = useState(false);
    const [brand, setBrand] = useState();
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE)

    const handleClose = (item) => {
        setEdit(!edit);
        setBrand(item);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        Dispatch(fetchBrands(filter, true));
    };

    const itemsValue = brands.length >= 0 && brands.map(item => ({
        name: item.attributes.name,
        image: item.attributes.image,
        product_count: item.attributes.product_count,
        id: item.id
    }));

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
            name: getFormattedMessage('brand.table.brand-name.column.label'),
            selector: row => row.name,
            sortable: true,
            sortField: 'name',
            cell: row => {
                const imageUrl = row.image ? row.image : user;
                return (
                    <div className='d-flex align-items-center'>
                        <div className='me-2'>
                            <img src={imageUrl} height='50' width='50' alt='Brand Image'
                                 className='image image-circle image-mini'/>
                        </div>
                        <div className='d-flex flex-column'>
                            <span>{row.name}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            name: getFormattedMessage('brand.table.product-count.column.label'),
            selector: row => row.product_count ? row.product_count : 0,
            style: updatedLanguage === 'ar' ? {paddingRight: '87px'} : {paddingLeft: '130px'},
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_BRANDS) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_BRANDS)
        ) ? [{
            name: getFormattedMessage('react-data-table.action.column.label'),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: row =>
                <ActionButton
                    item={row}
                    goToEditProduct={handleClose}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_BRANDS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_BRANDS)}
                />
        }] : [])
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('brands.title')}/>
            <ReactDataTable 
                columns={columns} 
                items={itemsValue} 
                onChange={onChange} 
                totalRows={totalRecord} 
                isLoading={isLoading} 
                isCallFetchDataApi={isCallFetchDataApi}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 0}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
                AddButton={getPermission(allConfigData?.permissions, Permissions.CREATE_BRANDS) && <CreateBrands />}
            />
            <EditBrands handleClose={handleClose} show={edit} brand={brand}/>
            <DeleteBrands clearSelectedDeleteItem={clearSelectedDeleteItem} onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel} onDelete={isDelete} setNotDeletedItemModal={setNotDeletedItemModal} />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    )
};

export default Brands;

