import { FINISH_POST_LOGIN_LOADING, SET_CURRENT_USER, START_POST_LOGIN_LOADING } from '../ActionTypes';

const initialState = { currentUser: null, isPostLoginLoading: false };

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return { ...state, currentUser: action.payload, isPostLoginLoading: action.payload ? state.isPostLoginLoading : false };
    case START_POST_LOGIN_LOADING:
      return { ...state, isPostLoginLoading: true };
    case FINISH_POST_LOGIN_LOADING:
      return { ...state, isPostLoginLoading: false };
    default:
      return state;
  }
}
