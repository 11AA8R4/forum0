//Defaults
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Image,StatusBar, StyleSheet, View, Text, TextInput, Dimensions, KeyboardAvoidingView, PermissionsAndroid,
  TouchableOpacity, Keyboard, Platform, ViewPagerAndroidComponent
} from 'react-native';

// Navigation
import { DrawerActions } from '@react-navigation/native';
import { StartMenuIcon , BackIcon, MenuIcon, TimeLine } from '../components/MenuIcons';
//Extra
import Animated, {useSharedValue, withTiming , Easing , withSpring , interpolate, Extrapolate ,
  runOnJS ,useAnimatedGestureHandler, useAnimatedStyle, withDelay} from 'react-native-reanimated'
import {PanGestureHandler} from 'react-native-gesture-handler'
import { Coachmark } from 'react-native-coachmark'
//Data
import AsyncStorage from '@react-native-community/async-storage'
import server from './server/server'

const heightCorrection = StatusBar.currentHeight;
const screenHeight = Dimensions.get('screen').height;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

TouchableOpacity.defaultProps = {...(TouchableOpacity.defaultProps || {}), delayPressIn: 0};
TouchableOpacity.defaultProps = {...(TouchableOpacity.defaultProps || {}), delayPressOut: 0};


export default function Start({ navigation,route }) {


  const accessStart=()=>navigation.navigate('Start')
  const accessCreateUser=()=>navigation.navigate('CreateUser')

  //User
  const [user,setUser] = useState(null)
  const [states,setStates] = useState({
    email:undefined,
    password:undefined,
    // email:'a@a.com',
    // password:'123456',
    focused:undefined
  })
  const emailRef = useRef()
  const passwordRef = useRef()


  const focus=(type)=>{
    if(!type) Keyboard.dismiss()
    if(type==='email') emailRef.current.focus()
    else if (type==='password') passwordRef.current.focus()
    states.focused = type?type:undefined
    console.log(states)
    setStates({...states})
  }


  //functions
  const changeText=(text,type)=>{
    states[type]=text
    setStates({...states})
  }
  const login=async()=>{
    const res = await server.logIn(states.email,states.password)
    if(res.status){
      states.email = undefined
      states.password = undefined
      setStates({...states})
      accessStart()
    }
  }


  useEffect(()=>{
    const unsubscribe = navigation.addListener('focus',async()=>{
      console.log(route.params)
      try{
        const {email,password} = route.params
        if(email){
          states.email = email
          states.password = password
          setStates({...states})
        }
      }catch(er){}
    })
    return unsubscribe;
  },[navigation])


  const renderLine=(color)=>{
    return(
      <View style={{height:windowHeight*0.003,backgroundColor:color?color:'#eee8'}}/>
    )
  }
  //
  const renderHeader=()=>{
    return(
      <View style={styles.headerSection} onPress={()=>accessCreateUser()}>
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        <Text style={styles.headerTitle}>Entrar</Text>
        {renderLine()}
      </View>
    )
  }
  const renderForms=()=>{
    const renderForm=(type)=>{
      if(states.focused){
        var focused = states.focused===type
      }
      var keyboardType = type==='email'?'email-address':'default'
      var placeholder = type==='email'?'E-mail':'Senha'
      return(
        <View style={[styles.form,focused?{borderColor:'#3e1f5c'}:null]}>
          <TextInput
          style={styles.formText}
          ref={type==='email'?emailRef:passwordRef}
          placeholder={placeholder}
          autoCapitalize='none'
          placeholderTextColor='#999'
          keyboardType={keyboardType}
          secureTextEntry={type==='password'}
          onChangeText={text=>changeText(text,type)}
          value={states[type]||''}
          onFocus={()=>focus(type)}
          />
        </View>
      )
    }
    return(
      <Animated.View style={styles.formsSection}>
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        <View style={{height:windowHeight*0.04}}/>
        {renderForm('email')}
        {renderForm('password')}
      </Animated.View>
    )
  }
  const renderEnd=()=>{
    const renderButtom=()=>{
      return(
        <TouchableOpacity style={styles.buttom} onPress={()=>login()}>
          <Text style={styles.buttomText}>
            Entrar
          </Text>
        </TouchableOpacity>
      )
    }
    const renderCreateAccLabel=()=>{
      return(
        <View style={{marginTop:windowHeight*0.04,alignItems:'center'}}>
          <Text style={{color:'#000',fontWeight:'bold'}}>
            Não tem uma conta ainda?
          </Text>
          <TouchableOpacity onPress={()=>accessCreateUser()}>
            <Text style={{color:'#ACA5F4',marginTop:windowHeight*0.01,fontWeight:'bold'}}>
              Criar Conta
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
    return(
      <View style={styles.endSection}>
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        {renderButtom()}
        {renderCreateAccLabel()}
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS == "ios" ? "padding" : "height"} keyboardVerticalOffset={-windowHeight*0.13}>
      {/* <View style={{width:windowWidth,height:windowHeight,alignItems:'center'}}> */}
        <StatusBar barStyle='dark-content' hidden={false} backgroundColor="#0000" translucent={true}/>
        {renderHeader()}
        {renderForms()}
        {renderEnd()}
      {/* </View> */}
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    width:windowWidth,
    height:windowHeight,
    top:heightCorrection,
    backgroundColor: '#fff'
  },
  headerSection:{
    width:windowWidth,
    height:windowHeight*0.12,
    justifyContent:'center'
  },
  headerTitle:{
    height:'100%',
    top:windowHeight*0.025,
    textAlignVertical:'center',
    alignSelf:'center',
    color:'#552a80',
    fontSize:22,
    fontWeight:'bold'
  },

  formsSection:{
    flex:1
  },
  form:{
    width:windowWidth*0.85,
    height:windowHeight*0.07,
    alignSelf:'center',
    marginVertical:windowHeight*0.01,
    borderColor:'#eee8',
    borderWidth:2,
    borderRadius:5
  },
  formText:{
    width:'90%',
    height:'100%',
    alignSelf:'center',
    textAlignVertical:'center',
    textAlign:'left',
    color:'#000'
  },
 
  endSection:{
    // position:'absolute',
    bottom:0,
    width:windowWidth,
    height:windowHeight*0.3,
    alignItems:'center',
    justifyContent:'center',
    
  },
  buttom:{
    width:windowWidth*0.85,
    height:windowHeight*0.08,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:'#552a80'
  },
  buttomText:{
    fontSize:17,
    color:'#fff',

  }
});
