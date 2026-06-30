import { walletActionType } from "../../constants";

export default (state = [], action) => {
    switch (action.type) {
        case walletActionType.FETCH_WALLET_TRANSACTIONS:
            return action.payload;
        default:
            return state;
    }
};