import { ADD_TRANSACTION, CLEAR_TRANSACTIONS, REMOVE_TRANSACTION, SET_CLOUD_DATA_LOADING, SET_TRANSACTIONS, SETTLE_TRANSACTION, UPDATE_TRANSACTION } from '../ActionTypes';

const initialState = { hasLoadedCloudData: false, transactions: [] };

export default function transactionsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TRANSACTIONS: return { ...state, transactions: action.payload };
    case ADD_TRANSACTION: return { ...state, transactions: [action.payload, ...state.transactions] };
    case UPDATE_TRANSACTION:
    case SETTLE_TRANSACTION: return { ...state, transactions: state.transactions.map((item) => item.id === action.payload.id ? action.payload : item) };
    case REMOVE_TRANSACTION: return { ...state, transactions: state.transactions.filter((item) => item.id !== action.payload) };
    case CLEAR_TRANSACTIONS: return { ...state, transactions: [] };
    case SET_CLOUD_DATA_LOADING: return { ...state, hasLoadedCloudData: action.payload };
    default: return state;
  }
}
