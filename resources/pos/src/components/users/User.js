import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import moment from 'moment';
import MasterLayout from '../MasterLayout';
import ReactDataTable from '../../shared/table/ReactDataTable';
import {fetchUsers} from '../../store/action/userAction';
import DeleteUser from './DeleteUser';
import TabTitle from '../../shared/tab-title/TabTitle';
import {getAvatarName, getFormattedDate, getPermission} from '../../shared/sharedMethod';
import {getFormattedMessage} from '../../shared/sharedMethod';
import {placeholderText} from '../../shared/sharedMethod';
import ActionButton from '../../shared/action-buttons/ActionButton';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import NotDeletedItemModal from '../../shared/action-buttons/NotDeletedItemModal';
import { Permissions, ROLES } from '../../constants';
import ChangeUserPassword from '../auth/change-password/ChangeUserPassword';

const User = (props) => {
    const {users, fetchUsers, totalRecord, isLoading, allConfigData, isCallFetchDataApi, stores} = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [isUserId, setIsUserId] = useState(null);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };
    
    const [localItemsValue, setLocalItemsValue] = useState([]);
    
    useEffect(() => {
        if (users.length >= 0) {
            const mappedUsers = users.map((user) => {
                const roleNames = user.attributes.role.map(role => role.name)
                const isCustomer = roleNames.includes("customer")
                return{
                date: getFormattedDate(user.attributes.created_at, allConfigData && allConfigData),
                time: moment(user.attributes.created_at).format('LT'),
                image: user.attributes.image,
                first_name: user.attributes.first_name,
                last_name: user.attributes.last_name,
                email: user.attributes.email,
                phone: user.attributes.phone,
                password: user.attributes.password,
                confirm_password: user.attributes.confirm_password,
                // role_id: user.attributes.role.map(ro => ro.name),
                role_name: roleNames,
                isCustomer: isCustomer,
                id: user.id,
                stores: user?.attributes?.stores,
                store: stores
                }
            });
            setLocalItemsValue(mappedUsers);
        }
    }, [users, allConfigData, stores]);

    const onChange = (filter) => {
        fetchUsers(filter, true);
    };

    const goToChangePassword = (item) => {
        setIsChangePassword(true);
        setIsUserId(item);
    }

    const goToEdit = (item) => {
        const id = item.id;
        window.location.href = '#/app/users/edit/' + id;
    };

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
            name: getFormattedMessage('users.table.user.column.title'),
            selector: row => row.first_name,
            sortField: 'first_name',
            sortable: true,
            cell: row => {
                const imageUrl = row.image ? row.image : null;
                const lastName = row.last_name ? row.last_name : '';
                return <div className='d-flex align-items-center'>
                    <div className='me-2'>
                        <Link to={getPermission(allConfigData?.permissions, Permissions.VIEW_USERS) && `/app/users/detail/${row.id}`}>
                            {imageUrl ?
                                <img src={imageUrl} height='50' width='50' alt='User Image'
                                     className='image image-circle image-mini'/> :
                                <span className='custom-user-avatar fs-5'>
                                        {getAvatarName(row.first_name + ' ' + row.last_name)}
                                </span>
                            }
                        </Link>
                    </div>
                    <div className='d-flex flex-column'>
                        <Link to={getPermission(allConfigData?.permissions, Permissions.VIEW_USERS) && `/app/users/detail/${row.id}`} 
                        className='text-decoration-none'>{row.first_name + ' ' + lastName}</Link>
                        <span>{row.email}</span>
                    </div>
                </div>
            }
        },
        {
            name: getFormattedMessage("user.input.role.label"),
            selector: row => row.role_name,
            sortField: 'role_name',
            sortable: false,
        },
        {
            name: getFormattedMessage('users.table.phone-number.column.title'),
            selector: row => row.phone,
            sortField: 'phone',
            sortable: true,
        },
        {
            name: getFormattedMessage("store.title"),
            selector: (row) => row?.stores,
            className: "",
            sortField: "stores",
            sortable: false,
            cell: (row) => {
                const userStores = row?.store?.filter(store => row?.stores?.includes(store.id));
                const storeNames = userStores?.map(store => store.attributes.name);
                return (
                    <OverlayTrigger
                        trigger={['click']}
                        rootClose
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-store-${row.id}`} className="custom-light">
                                {storeNames?.length > 0 ? (
                                    <div className="bg-white border rounded shadow-sm p-2">
                                        <div className="fw-semibold text-primary mb-2">
                                            <i className="bi bi-shop me-2"></i>{getFormattedMessage("store.assigned.title")}
                                        </div>
                                        <ul className="list-group list-group-flush store-tooltip-item">
                                            {storeNames?.map((name, idx) => (
                                                <li key={idx} className="list-group-item px-2 py-1 d-flex align-items-center gap-2">
                                                    <i className="bi bi-dot text-primary fw-bold fs-1 pt-2"></i>
                                                    <span className="text-truncate d-inline-block">
                                                        {name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-white text-muted border rounded shadow-sm p-2">
                                        <i className="bi bi-info-circle me-1"></i> {getFormattedMessage("no.store.title")}
                                    </div>
                                )}
                            </Tooltip>
                        }
                    >
                        {
                            row?.isCustomer ?  <span> - </span> : <span className="badge bg-light-info btn" >
                                                  <span>{row?.stores.length}</span>
                                               </span> 
                        }
             
                    </OverlayTrigger>
                )
            }
        },
        // {
        //     name: getFormattedMessage('users.table.role.column.title'),
        //     selector: row => row.role_id,
        //     sortField: 'role_id',
        //     sortable: false,
        // },
        {
            name: getFormattedMessage('globally.react-table.column.created-date.label'),
            selector: row => row.date,
            sortField: 'created_at',
            sortable: true,
            cell: row => {
                return (
                    <span className='badge bg-light-info'>
                        <div className='mb-1'>{row.time}</div>
                        <div>{row.date}</div>
                    </span>
                )
            }
        },
        ...((
            getPermission(allConfigData?.permissions, Permissions.EDIT_USERS) ||
            getPermission(allConfigData?.permissions, Permissions.DELETE_USERS)
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
                        goToChangePassword={goToChangePassword}
                        isPasswordShow={getPermission(allConfigData?.permissions, Permissions.EDIT_USERS)}
                        goToEditProduct={goToEdit}
                        isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_USERS)}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_USERS)}
                    />
            }] : [])
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('users.title')}/>
            <ReactDataTable 
                columns={columns} 
                items={localItemsValue} 
                onChange={onChange}
                ButtonValue={getFormattedMessage('user.create.title')}
                isCallFetchDataApi={isCallFetchDataApi}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_USERS) &&
                {
                    to: "#/app/users/create",
                    ButtonValue: getFormattedMessage("user.create.title")
                }
                )}
                totalRows={totalRecord} 
                isLoading={isLoading}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 0}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <DeleteUser clearSelectedDeleteItem={clearSelectedDeleteItem} onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel} onDelete={isDelete} setNotDeletedItemModal={setNotDeletedItemModal}/>
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} data={notDeletedItemModal} setNotDeletedItemModal={setNotDeletedItemModal}/>


            {isChangePassword && (
                <ChangeUserPassword
                    handleClose={() => setIsChangePassword(false)}
                    show={isChangePassword}
                    userDetails={isUserId}
                    role={ROLES.ADMIN}
                />
            )}
        </MasterLayout>
    )
};

const mapStateToProps = (state) => {
    const {users, totalRecord, isLoading, allConfigData, isCallFetchDataApi, stores} = state;
    return {users, totalRecord, isLoading, allConfigData, isCallFetchDataApi, stores}
};
export default connect(mapStateToProps, {fetchUsers})(User);
