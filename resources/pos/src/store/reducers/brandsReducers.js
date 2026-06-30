import {brandsActionType} from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case brandsActionType.FETCH_BRANDS:
            return action.payload;
        case brandsActionType.FETCH_BRAND:
            return [action.payload];
        case brandsActionType.ADD_BRANDS:
            return state.length >= 10
                ? [action.payload, ...state.slice(0, -1)]
                : [action.payload, ...state];
        case brandsActionType.EDIT_BRANDS:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        case brandsActionType.DELETE_BRANDS:
            return state.filter(item => item.id !== action.payload);
        case brandsActionType.FETCH_ALL_BRANDS:
            return action.payload;
        default:
            return state;
    }
};
