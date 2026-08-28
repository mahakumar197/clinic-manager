import { AnyAction, configureStore, ReducersMapObject } from '@reduxjs/toolkit';

const createStore = <S>(reducers: ReducersMapObject<S, AnyAction>) => {
  const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: true,
  });

  return store;
};

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<AppStore['getState']>;

export default createStore;
