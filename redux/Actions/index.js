import {
  ADD_TRANSACTION,
  CLEAR_TRANSACTIONS,
  REMOVE_TRANSACTION,
  SET_CLOUD_DATA_LOADING,
  SET_CURRENT_USER,
  SET_TRANSACTIONS,
  START_POST_LOGIN_LOADING,
  FINISH_POST_LOGIN_LOADING,
  UPDATE_TRANSACTION,
  SETTLE_TRANSACTION,
  REQUEST_EXCHANGE_RATES,
  RECEIVE_EXCHANGE_RATES,
  FAIL_EXCHANGE_RATES,
  SET_CONVERTER_AMOUNT,
  SET_FROM_CURRENCY,
  SET_TO_CURRENCY,
  SWAP_CURRENCIES,
} from '../ActionTypes';

export const setCurrentUser = (user) => ({ type: SET_CURRENT_USER, payload: user });
export const setTransactions = (transactions) => ({ type: SET_TRANSACTIONS, payload: transactions });
export const addTransaction = (transaction) => ({ type: ADD_TRANSACTION, payload: transaction });
export const updateTransaction = (transaction) => ({ type: UPDATE_TRANSACTION, payload: transaction });
export const removeTransaction = (transactionId) => ({ type: REMOVE_TRANSACTION, payload: transactionId });
export const clearTransactions = () => ({ type: CLEAR_TRANSACTIONS });
export const setCloudDataLoading = (isLoaded) => ({
  type: SET_CLOUD_DATA_LOADING,
  payload: isLoaded,
});
export const startPostLoginLoading = () => ({ type: START_POST_LOGIN_LOADING });
export const finishPostLoginLoading = () => ({ type: FINISH_POST_LOGIN_LOADING });
export const settleTransaction = (transaction) => ({ type: SETTLE_TRANSACTION, payload: transaction });
export const requestExchangeRates = () => ({ type: REQUEST_EXCHANGE_RATES });
export const receiveExchangeRates = (payload) => ({ type: RECEIVE_EXCHANGE_RATES, payload });
export const failExchangeRates = (message) => ({ type: FAIL_EXCHANGE_RATES, payload: message });
export const setConverterAmount = (amount) => ({ type: SET_CONVERTER_AMOUNT, payload: amount });
export const setFromCurrency = (currency) => ({ type: SET_FROM_CURRENCY, payload: currency });
export const setToCurrency = (currency) => ({ type: SET_TO_CURRENCY, payload: currency });
export const swapCurrencies = () => ({ type: SWAP_CURRENCIES });
