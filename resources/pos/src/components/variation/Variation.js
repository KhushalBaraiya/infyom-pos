import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MasterLayout from '../MasterLayout';
import TopProgressBar from '../../shared/components/loaders/TopProgressBar';
import TabTitle from '../../shared/tab-title/TabTitle';
import ReactDataTable from '../../shared/table/ReactDataTable';
import { getFormattedMessage, getPermission, placeholderText } from '../../shared/sharedMethod';
import CreateVariation from './CreateVariation';
import { fetchVariations } from '../../store/action/variationAction';
import ActionButton from '../../shared/action-buttons/ActionButton';
import EditVariation from './EditVariation';
import DeleteVariation from './DeleteVariation';
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal';
import { Permissions } from '../../constants';


const Variation = (props) => {

    const dispatch = useDispatch();
    const { variations, isLoading, totalRecord, isCallFetchDataApi, allConfigData } = useSelector(state => state);
    const [editModel, setEditModel] = useState(false);
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [variation, setVariation] = useState();
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    useEffect(() => {
        dispatch(fetchVariations());
    }, []);

    const handleClose = (item) => {
        setEditModel(!editModel)
        setVariation(item);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        dispatch(fetchVariations(filter, true));
    };


    const itemsValue = variations.length >= 0 && variations.map(variation => ({
        name: variation.attributes.name,
        id: variation.id,
        variation_types: variation.attributes.variation_types,
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
            name: placeholderText('variation.name'),
            selector: row => row.name,
            sortField: 'name',
            sortable: true,
        },
        {
            name: placeholderText('variation.variation_types'),
            selector: row => row.variation_types.map(type => type.name).join(' , '),
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_VARIATIONS) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_VARIATIONS)
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
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_VARIATIONS)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_VARIATIONS)}
                    />
            }] : [])
    ]

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('variations.title')} />
            <ReactDataTable 
                columns={columns} 
                items={itemsValue} 
                onChange={onChange} 
                isLoading={isLoading}
                AddButton={getPermission(allConfigData?.permissions, Permissions.CREATE_VARIATIONS) && <CreateVariation />}
                totalRows={totalRecord} 
                isCallFetchDataApi={isCallFetchDataApi}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 0}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <EditVariation handleClose={handleClose} show={editModel} variation={variation} />
            <DeleteVariation clearSelectedDeleteItem={clearSelectedDeleteItem} onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                onDelete={isDelete} setNotDeletedItemModal={setNotDeletedItemModal} />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>
        </MasterLayout>
    )

}
export default Variation;
