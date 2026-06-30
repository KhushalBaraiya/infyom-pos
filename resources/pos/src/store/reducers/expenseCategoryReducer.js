import {expenseCategoriesActionType} from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case expenseCategoriesActionType.FETCH_EXPENSES_CATEGORIES:
            return action.payload;
        case expenseCategoriesActionType.FETCH_EXPENSE_CATEGORIES:
            return [action.payload];
        case expenseCategoriesActionType.ADD_EXPENSE_CATEGORIES:
            return state.length >= 10
                ? [action.payload, ...state.slice(0, -1)]
                : [action.payload, ...state];
        case expenseCategoriesActionType.EDIT_EXPENSE_CATEGORIES:
            return state.map(item => item.id === +action.payload.id ? action.payload : item);
        case expenseCategoriesActionType.DELETE_EXPENSE_CATEGORIES:
            return state.filter(item => item.id !== action.payload);
        case expenseCategoriesActionType.FETCH_ALL_EXPENSES_CATEGORIES:
            return action.payload;
        default:
            return state;
    }
};
