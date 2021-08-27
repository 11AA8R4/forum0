import React, { useState } from 'react'
import { CardStyleInterpolators, createStackNavigator, TransitionPresets, TransitionSpecs } from '@react-navigation/stack'
// Start //
import Login from '../Login'
import CreateUser from '../CreateUser'
import Start from '../Start'
import CreatePost from '../CreatePost'
import PostDetails from '../PostDetails'
//Extra

const StackNavigator = createStackNavigator()

const StackScreens = () => (
  <StackNavigator.Navigator screenOptions={{headerShown:false,presentation:'card'}}>
    <StackNavigator.Screen name="Login" component={Login} />
    <StackNavigator.Screen name="CreateUser" component={CreateUser} />
    <StackNavigator.Screen name="Start" component={Start} />
    <StackNavigator.Screen name="CreatePost" component={CreatePost} />
    <StackNavigator.Screen name="PostDetails" component={PostDetails} />
  </StackNavigator.Navigator>
)

export default StackScreens;