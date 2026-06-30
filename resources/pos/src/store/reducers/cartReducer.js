import { SET_CART_PRODUCT } from "../action/cartAction";

const initialState = {
    cartData: {
        cartProduct: [],
        customer: null,
        cartItemValue: null,
        subTotal: 0,
        grandTotal: 0,
        paymentMethod: null,
    },
};

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CART_PRODUCT:
            return {
                ...state,
                cartData: {
                    ...state.cartData,
                    ...action.payload,
                },
            };
        default:
            return state;
    }
};
