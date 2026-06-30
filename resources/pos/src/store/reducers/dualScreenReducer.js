import {dualScreenSettingActionType} from '../../constants';

export default (state = {}, action) => {
    switch (action.type) {
        case dualScreenSettingActionType.FETCH_DUAL_SETTING:
            return action.payload;
        default:
            return state;
    }
};
