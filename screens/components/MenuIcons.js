import React from 'react'
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { StatusBar } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';

const heightCorrection = StatusBar.currentHeight;
const windowHeight = Dimensions.get('window').height+heightCorrection;
const windowWidth = Dimensions.get('window').width;

export function StartMenuIcon({onPress,style}) {
  return (
    <TouchableOpacity style={[S.a1Logo,style]} onPress={onPress}>
      <Image style={{width:windowHeight*0.04,height:windowHeight*0.04}} source={require('.././assets/images/logo/A1Green120x121.png')}/>
    </TouchableOpacity>
  )
};

export function BackIcon({onPress,style,source}){
  return (
    <TouchableOpacity style={[S.backIcon,style]} onPress={onPress}>
      <Image source={source?source:require('.././assets/images/icons/default/backIcon23x30.png')}/>
    </TouchableOpacity>
  )
};

export function Customization({onPress,style}){
  return (
    <TouchableOpacity style={[S.customizationIcon,style]} onPress={onPress}>
      <Image source={require('.././assets/images/icons/provider/customizationGreen30x30.png')}/>
    </TouchableOpacity>
  )
};

export function MenuIcon({onPress,style}){
  return (
    <TouchableOpacity style={[S.sideMenuIcon,style]} onPress={onPress}>
      <View style={{justifyContent:'center',height:windowHeight*0.06}}>
        <View style={{width:30,height:5,alignSelf:'center',backgroundColor:'white',marginVertical:windowHeight*0.005}}/>
        <View style={{width:22,height:5,alignSelf:'center',backgroundColor:'white',marginVertical:windowHeight*0.005}}/>
        <View style={{width:14,height:5,alignSelf:'center',backgroundColor:'white',marginVertical:windowHeight*0.005}}/>
      </View>
    </TouchableOpacity>
  )
};

export function TimeLine({steps,colorTheme,colors,onPress,style}){
  const color = colorTheme;
  console.log('steps',steps)
  console.log('colorTheme',colorTheme)
  return(
    <TouchableOpacity onPress={onPress}>
      <LinearGradient style={S.line} colors={colors} start={{x:0,y:0}} end={{x:0.9,y:0}}>

      </LinearGradient>
    </TouchableOpacity>
  )
};

const S = StyleSheet.create({
  a1Logo:{
    position:'absolute',
    width:windowHeight*0.05,
    height:windowHeight*0.06,
    top:windowHeight*0.01,
    left:windowWidth*0.04,
    alignItems:'center',
    justifyContent:'center'
  },
  backIcon:{
    position:'absolute',

    width:windowHeight*0.05,
    height:windowHeight*0.06,
    top:windowHeight*0.01,
    left:windowWidth*0.14,
    alignItems:'center',
    justifyContent:'center'
  },
  sideMenuIcon:{
    position:'absolute',
    width:windowHeight*0.05,
    height:windowHeight*0.06,
    top:windowHeight*0.01,
    right:windowWidth*0.03,
    alignItems:'center',
    justifyContent:'center',
  },
  customizationIcon:{
    position:'absolute',

    width:windowHeight*0.05,
    height:windowHeight*0.06,
    top:windowHeight*0.01,
    right:windowWidth*0.13,
    alignItems:'center',
    justifyContent:'center',
    opacity:0.55
  },
  line:{
    position:'absolute',
    top:windowHeight*0.04,
    alignSelf:'center',
    flexDirection:'row',
    justifyContent:'space-between',
    width:windowWidth*0.9,
    height:1,
    backgroundColor:'#0000',
  },
});