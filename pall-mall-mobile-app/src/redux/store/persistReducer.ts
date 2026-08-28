import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reducer } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer } from 'redux-persist';
import rootSlice from '@redux/slice/routeSlice';

export type RootState = ReturnType<typeof rootSlice>;

export default function persistReducers(reducers: Reducer<RootState>) {
  const persistConfig: PersistConfig<RootState> = {
    key: 'pall-mall-mapp',
    storage: AsyncStorage,
    // whitelist: ['authSlice'],
    // blacklist: ['booking'],
  };

  return persistReducer<RootState>(persistConfig, reducers);
}
