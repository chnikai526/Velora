import { combineReducers } from 'redux';
import authReducer from './authReducer';
import exchangeRatesReducer from './exchangeRatesReducer';
import transactionsReducer from './transactionsReducer';

export default combineReducers({ auth: authReducer, exchangeRates: exchangeRatesReducer, transactions: transactionsReducer });
