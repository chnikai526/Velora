import { FAIL_EXCHANGE_RATES, RECEIVE_EXCHANGE_RATES, REQUEST_EXCHANGE_RATES, SET_CONVERTER_AMOUNT, SET_FROM_CURRENCY, SET_TO_CURRENCY, SWAP_CURRENCIES } from '../ActionTypes';

const initialState = { amount: '100', error: '', fromCurrency: 'CAD', isLoading: false, rates: { CAD: 1 }, toCurrency: 'USD', updatedAt: null };

export default function exchangeRatesReducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_EXCHANGE_RATES: return { ...state, error: '', isLoading: true };
    case RECEIVE_EXCHANGE_RATES: return { ...state, ...action.payload, error: '', isLoading: false };
    case FAIL_EXCHANGE_RATES: return { ...state, error: action.payload, isLoading: false };
    case SET_CONVERTER_AMOUNT: return { ...state, amount: action.payload };
    case SET_FROM_CURRENCY: return { ...state, fromCurrency: action.payload };
    case SET_TO_CURRENCY: return { ...state, toCurrency: action.payload };
    case SWAP_CURRENCIES: return { ...state, fromCurrency: state.toCurrency, toCurrency: state.fromCurrency };
    default: return state;
  }
}
