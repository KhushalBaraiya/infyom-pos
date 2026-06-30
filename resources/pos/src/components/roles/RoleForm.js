import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap-v5';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { editRole } from '../../store/action/roleAction';
import { getFormattedMessage, placeholderText } from "../../shared/sharedMethod";
import { Table } from 'react-bootstrap';
import TabTitle from '../../shared/tab-title/TabTitle';

const RoleForm = (props) => {
    const { addRolesData, singleRole, editRole, permissionsArray, id } = props;
    const navigate = useNavigate();
    const [rolesValue, setRolesValue] = useState({
        name: '',
        permissions: []
    });
    const [saveButtonEnable, setSaveButtonEnable] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [errors, setErrors] = useState({ name: '', permissions: '' });

    useEffect(() => {
        setRolesValue({
            name: singleRole?.name || '',
            permissions: singleRole?.permissions ? singleRole.permissions : permissionsArray
        });
    }, [singleRole]);

    useEffect(() => {
        const selectedIds = rolesValue.permissions.flatMap(p =>
            p.attributes.child_permissions.filter(cp => cp.selected).map(cp => cp.id)
        );
        setSaveButtonEnable(selectedIds);
        setAllChecked(
            rolesValue.permissions.every(p =>
                p.attributes.child_permissions.every(cp => cp.selected)
            )
        );
    }, [rolesValue]);

    const handleValidation = () => {
        const errors = {};
        let isValid = true;

        if (!rolesValue.name) {
            errors.name = getFormattedMessage("globally.input.name.validate.label");
            isValid = false;
        } else if (rolesValue.name.length > 50) {
            errors.name = getFormattedMessage("brand.input.name.valid.validate.label");
            isValid = false;
        }

        if (saveButtonEnable.length === 0) {
            errors.permissions = getFormattedMessage("globally.select.permissions.validate.label");
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    const onChangeInput = (e) => {
        setRolesValue({ ...rolesValue, [e.target.name]: e.target.value });
        setErrors({});
    };

    const handleChanged = (e, permission = null, child = null) => {
        const checked = e.target.checked;
        const updatedPermissions = rolesValue.permissions.map(p => {
            if (e.target.name === 'all_check') {
                return {
                    ...p,
                    attributes: {
                        ...p.attributes,
                        child_permissions: p.attributes.child_permissions.map(cp => ({
                            ...cp,
                            selected: checked
                        }))
                    }
                };
            }

            // Handle "Select All" for individual permission row
            if (e.target.name === `select_all_${permission.id}`) {
                return {
                    ...p,
                    attributes: {
                        ...p.attributes,
                        child_permissions: p.id === permission.id
                            ? p.attributes.child_permissions.map(cp => ({
                                ...cp,
                                selected: checked
                            }))
                            : p.attributes.child_permissions
                    }
                };
            }

            if (p.id === permission.id) {
                const updatedChildren = p.attributes.child_permissions.map(cp => {
                    if (cp.id === child.id) {
                        return { ...cp, selected: checked };
                    }

                    if (
                        (child.name.startsWith('create_') || child.name.startsWith('edit_') || child.name.startsWith('delete_')) &&
                        cp.name.startsWith('view_') &&
                        checked
                    ) {
                        return { ...cp, selected: true };
                    }

                    if (
                        cp.name.startsWith('view_') &&
                        (child.name.startsWith('create_') || child.name.startsWith('edit_') || child.name.startsWith('delete_')) &&
                        !checked
                    ) {
                        return cp;
                    }
                    return cp;
                });
                return {
                    ...p,
                    attributes: {
                        ...p.attributes,
                        child_permissions: updatedChildren
                    }
                };
            }
            return p;
        });

        setRolesValue(prev => ({ ...prev, permissions: updatedPermissions }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (handleValidation()) {
            const formattedPermissions = rolesValue.permissions.flatMap(p => {
                const selected = p.attributes.child_permissions.filter(cp => cp.selected).map(cp => cp.id);
                return selected.length ? { id: p.id, child_permission: selected } : [];
            });

            const payload = {
                ...rolesValue,
                permissions: formattedPermissions
            };

            addRolesData(payload);
        }
    };

    const onEdit = (e) => {
        e.preventDefault();
        if (handleValidation()) {
            const formattedPermissions = rolesValue.permissions.map(permission => {
                const selectedChildren = permission.attributes.child_permissions
                    .filter(cp => cp.selected)
                    .map(cp => cp.id);

                return {
                    id: permission.id,
                    child_permission: selectedChildren
                };
            }).filter(p => p.child_permission.length > 0);

            const payload = {
                ...rolesValue,
                permissions: formattedPermissions
            };
            editRole(id, payload, navigate);
        }
    };

    return (
        <div className='container-fluid pt-10'>
            <TabTitle title={placeholderText(singleRole ? "role.edit.title" : "role.create.title")} />
            <div className='card custom-card p-5 bg-white'>
                <Form className='m-4'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <Form.Group className='mb-5 form-group'>
                                <Form.Label className='form-label fs-6 fw-bolder text-gray-700 mb-3'>
                                    {getFormattedMessage("globally.input.name.label")}:
                                </Form.Label>
                                <span className='required' />
                                <Form.Control
                                    type='text'
                                    name='name'
                                    placeholder={placeholderText("globally.input.name.placeholder.label")}
                                    className='form-control-solid'
                                    autoFocus={true}
                                    onChange={onChangeInput}
                                    value={rolesValue.name}
                                />
                                <span className='text-danger'>{errors.name}</span>
                            </Form.Group>
                        </div>

                        <Form.Group className='mb-5 form-group'>
                            <div className='d-flex col-md-12 flex-wrap align-items-center'>
                                <Form.Label className='form-label fs-6 fw-bolder text-gray-700 mb-0'>
                                    {getFormattedMessage("role.input.permission.label")}:
                                </Form.Label>
                                <span className='required' />
                                <div className='d-flex col-md-6 flex-wrap ps-5'>
                                    <label className='form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label'>
                                        <input
                                            type='checkbox'
                                            checked={allChecked}
                                            name='all_check'
                                            onChange={handleChanged}
                                            className='me-3 form-check-input cursor-pointer'
                                        />
                                        <div className='control__indicator' />
                                        {getFormattedMessage("role.select.all-permission.label")}
                                    </label>
                                </div>
                            </div>

                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>{getFormattedMessage("role.input.permission.label")}</th>
                                        <th className='text-center'>{getFormattedMessage("globally.select.all.title")}</th>
                                        <th className='text-center'>{getFormattedMessage("globally.view.title")}</th>
                                        <th className='text-center'>{getFormattedMessage("globally.create.title")}</th>
                                        <th className='text-center'>{getFormattedMessage("globally.update.title")}</th>
                                        <th className='text-center'>{getFormattedMessage("globally.delete.title")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rolesValue && rolesValue.permissions
                                        .sort((a, b) => a?.attributes?.display_name.localeCompare(b?.attributes?.display_name))
                                        .map((permission) => {
                                            const childPermissionsMap = {};
                                            permission.attributes.child_permissions.forEach((child) => {
                                                if (child.name.startsWith("view_")) childPermissionsMap.view = child;
                                                if (child.name.startsWith("create_")) childPermissionsMap.create = child;
                                                if (child.name.startsWith("edit_")) childPermissionsMap.update = child;
                                                if (child.name.startsWith("delete_")) childPermissionsMap.delete = child;
                                            });

                                            const hasCreateOrEditSelected =
                                                (childPermissionsMap.create && childPermissionsMap.create.selected) ||
                                                (childPermissionsMap.update && childPermissionsMap.update.selected) ||
                                                (childPermissionsMap.delete && childPermissionsMap.delete.selected);

                                            // Check if all permissions for this row are selected
                                            const allPermissionsSelected = Object.values(childPermissionsMap)
                                                .every(permission => permission && permission.selected);

                                            return (
                                                <tr key={permission.id}>
                                                    <td>{permission?.attributes?.display_name}</td>

                                                    <td className='text-center'>
                                                        <input
                                                            type="checkbox"
                                                            name={`select_all_${permission.id}`}
                                                            checked={allPermissionsSelected}
                                                            onChange={(e) => handleChanged(e, permission)}
                                                            className="form-check-input cursor-pointer"
                                                        />
                                                    </td>

                                                    <td className='text-center'>
                                                        {childPermissionsMap.view ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={childPermissionsMap.view.selected || false}
                                                                disabled={hasCreateOrEditSelected}
                                                                onChange={(e) =>
                                                                    handleChanged(e, permission, childPermissionsMap.view)
                                                                }
                                                                className="form-check-input cursor-pointer"
                                                            />
                                                        ) : null}
                                                    </td>

                                                    <td className='text-center'>
                                                        {childPermissionsMap.create ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={childPermissionsMap.create.selected || false}
                                                                onChange={(e) =>
                                                                    handleChanged(e, permission, childPermissionsMap.create)
                                                                }
                                                                className="form-check-input cursor-pointer"
                                                            />
                                                        ) : null}
                                                    </td>

                                                    <td className='text-center'>
                                                        {childPermissionsMap.update ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={childPermissionsMap.update.selected || false}
                                                                onChange={(e) =>
                                                                    handleChanged(e, permission, childPermissionsMap.update)
                                                                }
                                                                className="form-check-input cursor-pointer"
                                                            />
                                                        ) : null}
                                                    </td>

                                                    <td className='text-center'>
                                                        {childPermissionsMap.delete ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={childPermissionsMap.delete.selected || false}
                                                                onChange={(e) =>
                                                                    handleChanged(e, permission, childPermissionsMap.delete)
                                                                }
                                                                className="form-check-input cursor-pointer"
                                                            />
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </Table>
                            <span className='text-danger'>{errors.permissions}</span>
                        </Form.Group>

                        <div className='d-flex mt-5'>
                            {singleRole ? (
                                <div onClick={onEdit}>
                                    <input
                                        className='btn btn-primary me-3'
                                        type='submit'
                                        value={placeholderText("globally.save-btn")}
                                    />
                                </div>
                            ) : (
                                <div onClick={onSubmit}>
                                    <input
                                        className='btn btn-primary me-3'
                                        type='submit'
                                        value={placeholderText("globally.save-btn")}
                                    />
                                </div>
                            )}
                            <Link
                                to='/app/roles'
                                className='btn btn-light btn-active-light-primary me-3'
                            >
                                {getFormattedMessage("globally.cancel-btn")}
                            </Link>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default connect(null, { editRole })(RoleForm);