import { frontCmsActionType } from '../../constants';

export default (state = {}, action) => {
    switch (action.type) {
        case frontCmsActionType.FETCH_FRONT_CMS:
            return action.payload;
        default:
            return state;
    }
};
