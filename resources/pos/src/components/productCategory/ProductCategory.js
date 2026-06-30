import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import MasterLayout from '../MasterLayout'
import { fetchProductCategories } from '../../store/action/productCategoryAction'
import ReactDataTable from '../../shared/table/ReactDataTable'
import DeleteProductCategory from './DeleteProductCategory'
import CreateProductCategory from './CreateProductCategory'
import EditProductCategory from './EditProductCategory'
import TabTitle from '../../shared/tab-title/TabTitle'
import { getFormattedMessage, getPermission, placeholderText } from '../../shared/sharedMethod'
import user from '../../assets/images/productCategory_logo.jpeg'
import ActionButton from '../../shared/action-buttons/ActionButton'
import { Permissions, Tokens } from '../../constants';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal'

const ProductCategory = (props) => {
    const {
        fetchProductCategories,
        productCategories,
        totalRecord,
        isLoading,
        isCallFetchDataApi,
        allConfigData
    } = props
    const [deleteModel, setDeleteModel] = useState(false)
    const [isDelete, setIsDelete] = useState(null)
    const [editModel, setEditModel] = useState(false)
    const [productCategory, setProductCategory] = useState()
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE)

    const handleClose = (item) => {
        setEditModel(!editModel)
        setProductCategory(item);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchProductCategories(filter, true);
    };

    const itemsValue = productCategories.length >= 0 && productCategories.map(product => ({
        name: product.attributes.name,
        image: product.attributes.image,
        products_count: product.attributes.products_count,
        id: product.id,
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
            name: getFormattedMessage('product-category.title'),
            selector: row => row.name,
            sortField: 'name',
            sortable: true,
            cell: row => {
                const imageUrl = row.image ? row.image : user;
                return (
                    <div className='d-flex align-items-center'>
                        <div className='me-2 outline-box'>
                            <img src={imageUrl} height='50' width='50' alt='Product Category Image'
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
            selector: row => row.products_count,
            style: updatedLanguage === 'ar' ? {paddingRight: '87px'} : {paddingLeft: '130px'},
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCT_CAREGORIES) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_PRODUCT_CAREGORIES)
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
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCT_CAREGORIES)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_PRODUCT_CAREGORIES)}
                    />
            }] : []),
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('product-categories.title')}/>
                <ReactDataTable 
                    columns={columns} 
                    items={itemsValue} 
                    onChange={onChange} 
                    isLoading={isLoading}
                    AddButton={getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCT_CAREGORIES) && <CreateProductCategory />}
                    totalRows={totalRecord}
                    isCallFetchDataApi={isCallFetchDataApi}
                    selectableRows
                    onSelectedRowsChange={handleSelectedRowsChange}
                    isShowDeleteButton={selectedIds.length > 0}
                    handleDeleteMultiples={handleDeleteMultiples}
                    clearSelectedRows={clearSelectedRows}
                />
                <EditProductCategory handleClose={handleClose} show={editModel} productCategory={productCategory}/>
                <DeleteProductCategory clearSelectedDeleteItem={clearSelectedDeleteItem} onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                       onDelete={isDelete} setNotDeletedItemModal={setNotDeletedItemModal} />
                <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const {productCategories, totalRecord, isLoading, isCallFetchDataApi, allConfigData} = state;
    return {productCategories, totalRecord, isLoading, isCallFetchDataApi, allConfigData}
};

export default connect(mapStateToProps, {fetchProductCategories})(ProductCategory);

