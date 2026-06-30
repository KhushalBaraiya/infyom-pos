import {posProductActionType, productActionType} from '../../../constants'

export default (state = [], action) => {
    switch (action.type) {
        case posProductActionType.POS_ALL_PRODUCT:
            return action.payload;
        case posProductActionType.POS_ALL_PRODUCTS:
            return action.payload;
        case productActionType.FETCH_BRAND_CLICKABLE:
          const updatedState = state.map((existingProduct) => {
                const newProduct = action.payload.find(
                    (p) => p.id === existingProduct.id
                );
                return newProduct
                    ? { ...existingProduct, ...newProduct }
                    : existingProduct;
            });

            const newProducts = action.payload.filter(
                (newProduct) =>
                    !state.some(
                        (existingProduct) =>
                            existingProduct.id === newProduct.id
                    )
            );

            return [...updatedState, ...newProducts];
        case productActionType.RESET_PRODUCT:
            return [];
        case 'POS_ALL_PRODUCTS_APPEND':
            return [...state, ...action.payload];
        default:
            return state;
    }
};
