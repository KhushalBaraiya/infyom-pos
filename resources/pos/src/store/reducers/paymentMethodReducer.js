import { paymentMethodActionType } from "../../constants";

export default (state = [], action) => {
    switch (action.type) {
        case paymentMethodActionType.FETCH_PAYMENT_METHOD:
            return action.payload;
        case paymentMethodActionType.ADD_PAYMENT_METHOD:
            return [...state, action.payload];
        case paymentMethodActionType.EDIT_PAYMENT_METHOD:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        case paymentMethodActionType.DELETE_PAYMENT_METHOD:
            return state.filter(item => item.id !== action.payload);
        default:
            return state;
    }
};