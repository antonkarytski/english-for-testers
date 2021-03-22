//1. Как брать данные о словах
//1.1 Нерптимизированный способ:

import { useDispatch, useSelector } from "react-redux"

const dispatch = useDispatch()
const words = useSelector(state => state.words)

// в words хранится все дерево слов в формате:

const wordTreeFormat = {
	0: {        //0 - номер группы (всего 6, отсчет начинается с 0)
		1: [],    //1 - номер страницы (всего 20, отсчет начинается с 0)
		2: [],    //в каждом массиве 20 объектов слова
		3: [],
	},
	//...
	5:{
		2:[],
		3:[],
		4:[]
	}
}

//API позволяет скачивать слова из базы чанками (по 20 штук), таким образом, в самом начале words будет пустой
//для того чтобы получить значение вы использовать экшн getWords и передавать в него номер группы и номер страницы
//после выполнения запроса в words появится соответствующий чанк слова

import { getWords } from "../redux/actions"
dispatch(getWords(group, page))

//минус такого подхода заключается в том что getWords делает запрос к базе данных каждый раз, независимо оттого есть
//у нас уже этот чанк слов или нет


//1.2 Оптимизированный способ:
//использование хука useWords

import useWords from "./src/hooks/useWords"
const {currentWords, getWordsChunk, onLoading} = useWords()

//если используется этот хук то диспатч и юзселектор использовать не надо
//для получения нужного чанка необходимо вызвать функцию:

const res = getWordsChunk(group, page)

//getWordsChunk осуществляет поиск по дереву words нужного чанка и возвращает его, а также записывает в
//currentWords текущий чанк (в случае если чанк уже находится в words).
//В случае если такой чанк еще не был загружен, функция делает запрос и загружает
//данные с сервера. При этом вам будет возвращена строка "loading", а флаг onLoading будет установлен в true,
//это можно использовать для индикатора загрузки страницы
//когда придет ответ с сервера в currentWords запишется текущий чанк, а флаг onLoading будет установлен
//в false.






