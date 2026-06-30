import React, {memo, useEffect} from 'react';
import {connect} from 'react-redux';
import {useParams} from 'react-router-dom';
import RoleFrom from './RoleForm';
import {fetchRole} from '../../store/action/roleAction';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import {fetchPermissions} from '../../store/action/permissionAction';
import {getFormattedMessage} from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import Spinner from "../../shared/components/loaders/Spinner";

const EditRole = (props) => {
    const {roles, fetchRole, fetchPermissions, isLoading, permissions} = props;
    const {id} = useParams();

    const mergeRolePermissions = (allPermissions, selectedPermissions) => {
        return allPermissions.map(permission => {
            const matchedPermission = selectedPermissions?.find(p => p.id === permission.id);
            const selectedChildPermissions = matchedPermission?.child_permissions || [];

            return {
                id: permission.id,
                name: permission.attributes.name,
                attributes: {
                    ...permission.attributes,
                    child_permissions: permission.attributes.child_permissions.map(child => ({
                        ...child,
                        selected: selectedChildPermissions.some(sel => sel.id === child.id && sel.selected)
                    }))
                }
            };
        });
    };

    const itemsValue = roles.length === 1 && roles.map((role) => ({
        name: role.attributes.name,
        permissions: mergeRolePermissions(permissions, role.attributes.permissions || [])
    }));

    useEffect(() => {
        fetchPermissions();
        fetchRole(id)
    }, []);

    return (
        <MasterLayout>
            <TopProgressBar/>
            <HeaderTitle title={getFormattedMessage("role.edit.title")} to='/app/roles'/>
            {isLoading ? <Spinner />:
                roles.length === 1 && <RoleFrom singleRole={itemsValue[0]} id={id}/>
            }
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {roles, permissions, isLoading} = state;
    return {
        roles,
        permissions,
        isLoading
    }
};

export default connect(mapStateToProps, {fetchRole, fetchPermissions})(memo(EditRole));
