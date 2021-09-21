import { combineReducers } from "redux";
import userReducer from "./reducer.user";
import wordsReducer from "./reducer.words";
import gameReducer from "./games/reducer";
import bookReducer from "./reducer.book";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import localforage from "localforage";
import vocabularySearchReducer from "./reducer.vocabularySearch";
import unsavedReducer from "./reducer.book";

const rootPersistConfig = {
  key: "root",
  storage: localforage,
  whitelist: ["words"],
  blacklist: ["user"],
};

const userPersistConfig = {
  key: "user",
  storage: localforage,
  whitelist: ["words"],
};

const bookPersistConfig = {
  key: "userBookConfig",
  storage,
  whitelist: ["savedUserSettings"],
};

const reducers = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  words: wordsReducer,
  gameWords: gameReducer,
  book: persistReducer(bookPersistConfig, bookReducer),
  vocabularySearch: vocabularySearchReducer,
});

export const rootReducer = persistReducer(rootPersistConfig, reducers);
