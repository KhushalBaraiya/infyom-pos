import {settingActionType} from '../../constants';

export default (state = {}, action) => {
    switch (action.type) {
        case settingActionType.GET_FISCAL_YEAR:
            return action.payload.data;
        default:
            return state;
    }
};
