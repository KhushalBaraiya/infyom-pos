import { fieldConfigurationActionType } from '../../constants';

export default (state = {}, action) => {
    switch (action.type) {
        case fieldConfigurationActionType.FETCH_FIELD_CONFIGURATION:
            return action.payload;
        case fieldConfigurationActionType.UPDATE_FIELD_CONFIGURATION:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};