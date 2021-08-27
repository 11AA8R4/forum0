//Mus be on top:
//import 'react-native-gesture-handler'
//Core
import * as React from 'react'
import { useState, useEffect } from 'react'
import { LogBox } from 'react-native'
//Extra
import SplashScreen from 'react-native-splash-screen'
import { NavigationContainer } from '@react-navigation/native'
//import AppLoading from 'expo-app-loading'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import NavigationBar from 'react-native-navbar-color' // <-- ta funcionando...
//Imports
import StackScreens from './screens/routes/StackScreens'
//Data


LogBox.ignoreLogs(['Setting a timer','Remote debugger','VirtualizedLists should never',
'componentWillReceiveProps has been','RNDatePickerAndroid.dismiss',
'Cannot update a component from inside','%s: Calling %s','Trying to load empty source','source.uri should not be an empty string'])

LogBox.ignoreAllLogs()


// const Stack = createStackNavigator()

export default function App() {


  // const [fontsLoaded,setFontsLoaded] = useState(true);


  NavigationBar.setColor('#bbbbbb')


  useEffect(()=>{
    SplashScreen.hide();
  },[]);


  return(
    <SafeAreaProvider>
      <NavigationContainer>
        <StackScreens/>
        {/* <Drawer.Navigator drawerPosition={'right'} drawerContent={props=> <DrawerScreens {...props}/>}> */}
          {/* <Stack.Screen name="stackScreens" component={stackScreens} /> */}
        {/* </Drawer.Navigator> */}
      </NavigationContainer>
    </SafeAreaProvider>
  )
}