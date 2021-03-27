import moment from "moment"
import { getUserWords } from "./actions.user"
import { syncUserWords } from "./actions.words"
import { authRequest, tokenRequest, userDataRequest } from "./requests/server"
import { LOADING, LOG_OUT, SIGN_IN } from "./types"

const setLoading = status => ({type: LOADING, payload: status ?? true})
const setUser = userData => ({type: SIGN_IN, payload: userData})
const unsetUser = () => ({type: LOG_OUT})


const getNextExpireTime = () => moment().add(10, "seconds").toISOString()


export function createUser(user){
	return async dispatch => {
		dispatch(setLoading())
		const rawRes = await authRequest("/users", user)
		if (rawRes.ok) {
			dispatch(signIn(user, true))
		} else {
			dispatch(setLoading(false))
		}
	}
}

//onLoading - when call from another action and don't need to set onLoading one more time

export function signIn(user, onLoading = false){
	return async (dispatch) => {
		if (!onLoading) dispatch(setLoading())
		const rawRes = await authRequest("/signin", user)
		if (rawRes.ok) {
			const userAuthData = await rawRes.json()
			const userRawData = await userDataRequest({token: userAuthData.token, id: userAuthData.userId})
			if (userRawData.ok) {
				const userData = await userRawData.json()
				userAuthData.tokenExpire = getNextExpireTime()
				const fullUserData = {...userAuthData, ...userData, words: {}}
				dispatch(setUser(fullUserData))
				await dispatch(getUserWords())
				await dispatch(syncUserWords())
				try {
					localStorage.setItem("userData", JSON.stringify(fullUserData))
				} catch (e) {
				}
			}
		}
		dispatch(setLoading(false))
	}
}

export function logOut(){
	return dispatch => {
		try {
			localStorage.setItem("userData", "{}")
		} catch (e) {
		}
		dispatch(unsetUser())
	}
}

export function checkToken(){
	return async (dispatch, getState) => {
		const {token, id, tokenExpire, refreshToken} = getState().user
		if (moment().isAfter(tokenExpire)) {
			const rawRes = await tokenRequest({token: refreshToken, id})
			const res = await rawRes.json()
			const updateUserData = {
				...res,
				tokenExpire: getNextExpireTime()
			}
			localStorage.setItem("userData", JSON.stringify({
				...JSON.parse(localStorage.getItem("userData")),
				...updateUserData
			}))
			dispatch(setUser(updateUserData))
			return updateUserData.token
		}
		return token
	}
}