import { storeActionType } from "../../constants";


export default (state = [], action) => {
    switch (action.type) {
        case storeActionType.FETCH_STORE:
            return action.payload;
        case storeActionType.DELETE_STORE:
            return state.filter(item => item.id !== action.payload);
        default:
            return state;
    }
};