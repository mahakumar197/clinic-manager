import { AppStack } from '@navigation/index';
import React from 'react';

const App: React.FC = () => {
  // return (
  //    <Provider store={store}>
  //    <PersistGate loading={null} persistor={persistor}>
  //   <AppStack />
  //    </PersistGate>
  //    </Provider>
  // );
  return <AppStack />;
};

export default App;
