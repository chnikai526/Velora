import { ADD_TRANSACTION, REMOVE_TRANSACTION, SET_TRANSACTIONS, UPDATE_TRANSACTION } from '../ActionTypes';

const initialState = { transactions: [] };

export default function transactionsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TRANSACTIONS: return { ...state, transactions: action.payload };
    case ADD_TRANSACTION: return { ...state, transactions: [action.payload, ...state.transactions] };
    case UPDATE_TRANSACTION: return { ...state, transactions: state.transactions.map((item) => item.id === action.payload.id ? action.payload : item) };
    case REMOVE_TRANSACTION: return { ...state, transactions: state.transactions.filter((item) => item.id !== action.payload) };
    default: return state;
  }
}
