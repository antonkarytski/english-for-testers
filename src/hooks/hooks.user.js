import { useDispatch, useSelector } from "react-redux"
import { useCallback, useState, useEffect } from "react"
import { addUserWord, updateExistingUserWord } from "../redux/actions.user"
import {
	getUserWordsGroup as getUserWordsGroupHelper,
	getUserWordsChunk as getUserWordsChunkHelper } from "../helpers/utils.words"
import {useWords, useWordsGroup} from "./hooks.words"

//Usage
// const { update, updatedWord, onError } = useUserWordUpdate()
// update(word, data)
// update get word object from words array (not user array) and additional data
// data = {
//  difficulty: weak | normal | hard,
//	successCounter: Number,
//	failCounter: Number,
//  deleted: boolean,
// }
//

export function useUserWordUpdate(){
	const user = useSelector(store => store.user)
	const dispatch = useDispatch()
	const [updatedWord, setUpdatedWord] = useState(null)
	const [onError, setOnError] = useState(null)

	const update = useCallback(async (word, data = {}) => {
		if (user.words[word.group] && user.words[word.group][word.page]) {
			const wordForUpdate = user.words[word.group][word.page].find(userWord => userWord.wordId === word.id)
			if (wordForUpdate) {
				const localData = {...data}
				delete localData.difficulty
				const updateWord = {
					...wordForUpdate,
					difficulty: data.difficulty || wordForUpdate.difficulty || 'normal',
					optional: {
						...wordForUpdate.optional,
						...localData,
					},
				}
				return dispatch(updateExistingUserWord(updateWord)).then(() => {
					setUpdatedWord(updatedWord)
				}).catch(e => {
					setOnError({
						word: updateWord,
						e
					})
				})
			}
		}

		return dispatch(addUserWord(word, data)).then((word) => {
			setUpdatedWord(word)
		}).catch(e => setOnError({word, e}))

	}, [user, dispatch, updatedWord])
	return { update, updatedWord, onError }
}


//Usage
//const {currentUserWords, getUserWordsChunk, subscribedUserWords, onLoading} = useUserWords()
//currentUserWords -
// if user and words array have words in requested words - will be set immediately
// getUserWordsChunk return this value too
// if user have, but words array doesn't have requested words - will be set after response come from server
// and getUserWordsChunk return Promise
// if user doesn't have requested words - will never set for this group-page
// and getUserWordsChunk return False
// BUT when user get at least one word on this page, value will be set in subscribedUserWords

export function useUserWords(){
	const user = useSelector(store => store.user)
	const words = useSelector(store => store.words)

	const {getWordsChunk} = useWords()
	const [onLoading, setOnLoading] = useState(false)
	const [currentUserWords, setCurrentUserWords] = useState(null)
	const [subscribedUserWords, setSubscribedUserWords] = useState(null)
 	const [subscription, setSubscription] = useState(null)

	const getUserWordsChunk = useCallback((group, page, filters = {}) => {
		if(user.words[group] && user.words[group][page]){
			if(words && words[group] && words[group][page]){
				const chunk = getUserWordsChunkHelper(words[group][page], user.words[group][page], filters)
				setCurrentUserWords(chunk)
				return chunk
			} else {
				setOnLoading(true)
				return getWordsChunk(group, page).then((resWords) => {
					setCurrentUserWords(
						getUserWordsChunkHelper(resWords, user.words[group][page], filters)
					)
				})
			}
		} else {
			setSubscription({group, page})
			return false
		}
	}, [user.words, words, getWordsChunk])

	useEffect(() => {
		if(subscription && user.words[subscription.group] && user.words[subscription.group][subscription.page]){
			setSubscribedUserWords(user.words[subscription.group][subscription.page])
			setSubscription(null)
		}
	}, [user.words, subscription])

	useEffect(() => {
		if(onLoading && currentUserWords){
			setOnLoading(false)
		}
	}, [currentUserWords, onLoading])

return {currentUserWords, getUserWordsChunk, subscribedUserWords}
}

//Usage
//const {getUserWordsGroup, subscribedUserWordsGroup, onLoading, currentUserWordsGroup} = useUserWordsGroup()
export function useUserWordsGroup(){
	const user = useSelector(store => store.user)
	const words = useSelector(store => store.words)
	const {getWordsGroup} = useWordsGroup()
	const [currentUserWordsGroup, setCurrentUserWordsGroup] = useState(null)
	const [onLoading, setOnLoading] = useState(false)
	const [subscribedUserWordsGroup, setSubscribedUserWordsGroup] = useState(null)
	const [subscription, setSubscription] = useState(null)


	const getUserWordsGroup = useCallback((group, filters) => {
		if(user.words[group]){
			if(words && words[group]){
				const userGroup = getUserWordsGroupHelper(words[group], user.words[group], filters)
				setCurrentUserWordsGroup(userGroup)
				return userGroup
			} else {
				setOnLoading(true)
				return getWordsGroup(group).then((resGroup) => {
					setCurrentUserWordsGroup(
						getUserWordsGroupHelper(resGroup, user.words[group], filters)
					)
				})
			}
		} else {
			setSubscription({group})
			return false
		}
	}, [getWordsGroup, user.words, words])

	useEffect(() => {
		if(subscription && user.words[subscription.group]){
			setSubscribedUserWordsGroup(user.words[subscription.group])
			setSubscription(null)
		}
	}, [user.words, subscription])

	useEffect(() => {
		if(onLoading && currentUserWordsGroup){
			setOnLoading(false)
		}
	}, [currentUserWordsGroup, onLoading])

	return {getUserWordsGroup, subscribedUserWordsGroup, onLoading, currentUserWordsGroup}
}