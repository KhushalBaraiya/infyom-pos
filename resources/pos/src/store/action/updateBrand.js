import {constants} from '../../constants';

export const callFetchDataApi = (isCall) => {
    return {type: constants.CALL_UPDATE_BRAND_API, payload: isCall};
};
