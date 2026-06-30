import { walletActionType } from "../../constants";

export default (state = [], action) => {
    switch (action.type) {
        case walletActionType.FETCH_SINGLE_WALLET_TRANSACTION:
            return action.payload;
        default:
            return state;
    }
};