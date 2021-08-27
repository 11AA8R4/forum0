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


export default function CreateUser({ navigation }) {


  const acessStat=()=>navigation.navigate('Start',{user:user})
  const acessLogin=()=>navigation.navigate('Login')

  //User
  const [user,setUser] = useState(null)
  const [states,setStates] = useState({
    // email:undefined,
    // password:undefined,
    forms:{
      name:undefined,
      email:undefined,
      password:undefined,
      confirmPassword:undefined,
    },
    focused:undefined,
    termsVerification:false,
    alerts:{
      email:undefined,
      password:undefined,
      confirmPassword:undefined,
      terms:undefined,
    }
  })
  const nameRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()


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
    if(states.alerts[type]) states.alerts[type] = undefined
    states.forms[type]=text
    setStates({...states})
  }
  const verifyForms=()=>{
    const emailsplit = (states.forms.email.split('@') && states.forms.email.split('.'))
    console.log(emailsplit?.length)
    if(emailsplit?.length<2) states.alerts.email=true
    else if(states.forms.password.length<6) states.alerts.password=true
    else if(states.forms.password!==states.forms.confirmPassword) states.alerts.confirmPassword=true
    else return true
    setStates({...states})
  }
  const CreateUser=async()=>{
    if(!states.termsVerification)
    return(
      states.alerts.terms = true,
      console.log(states.terms),
      setStates({...states})
    )
    let allow = verifyForms()
    if(allow){
      setStates({...states})
      const own = {
        name:states.forms.name,
        email:states.forms.email,
        password:states.forms.password,
      }
      const res = await server.set('users',undefined,own)
      console.log('res',res)
      if(res.status){
        navigation.navigate('Login',{email:states.forms.email,password:states.forms.password})
      }
    }
  }
  

  const trueIcon=require('../assets/icons/true.png')
  const renderLine=(color)=>{
    return(
      <View style={{height:windowHeight*0.003,backgroundColor:color?color:'#eee8'}}/>
    )
  }
  const renderVerify=(label)=>{
    !label?label='Verifique este campo':null
    return(
      <Text style={[styles.termsText,{position:label?'relative':'absolute',bottom:label?0:-windowHeight*0.01,alignSelf:'center',color:'#f009',fontStyle:'italic'}]}>
        {label}
      </Text>
    )
  }
  //
  const renderHeader=()=>{
    return(
      <View style={styles.headerSection}>
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        <Text style={styles.headerTitle}>Criar</Text>
        {renderLine()}
      </View>
    )
  }
  const renderForms=()=>{
    const renderForm=(type)=>{
      if(states.focused){
        var focused = states.focused===type
      }
      var placeholder = ''
      var ref
      var alert
      var keyboardType='default'
      var autoCapitalize = type==='name'?'words':'none'
      switch(type){
        case 'name':placeholder='David Jackson';ref=nameRef;break
        case 'email':placeholder='hello@redqteam.io';ref=emailRef;alert='E-mail inválido ou em uso';keyboardType='email-address';break
        case 'password':placeholder='Senha';ref=passwordRef;alert='Use uma senha maior que 5 dígitos';break
        case 'confirmPassword':placeholder='Confirmar senha';ref=confirmPasswordRef;alert='As senhas não são iguais';break
      }
      return(
        <View style={{maxHeight:windowHeight*0.1}}>
          <View style={[styles.form,focused?{borderColor:'#3e1f5c'}:null]}>
            <TextInput
            style={styles.formText}
            ref={ref}
            placeholder={placeholder}
            placeholderTextColor='#999'
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={type==='password' || type==='confirmPassword'}
            onChangeText={text=>changeText(text,type)}
            value={states.forms[type]||''}
            onFocus={()=>focus(type)}
            />
          </View>
          {states.alerts[type] && renderVerify(alert)}
        </View>
      )
    }
    return(
      <Animated.View >
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        <View style={{height:windowHeight*0.04}}/>
        {renderForm('name')}
        {renderForm('email')}
        {renderForm('password')}
        {renderForm('confirmPassword')}
      </Animated.View>
    )
  }
  const renderTerms=()=>{
    const check=()=>{
      if(states.alerts.terms) states.alerts.terms=undefined
      states.termsVerification=!states.termsVerification
      setStates({...states})
    }
    return(
      <TouchableOpacity style={styles.termsSection} onPress={()=>check()}>
        <View style={{justifyContent:'center',flexDirection:'row'}}>
          <View style={[styles.checkBox,states.termsVerification && {borderColor:'#ACA5F49'}]}>
            <Image style={{width:'100%',height:'100%'}} source={states.termsVerification?trueIcon:undefined}/>
          </View>
          <Text style={[styles.termsText,{marginRight:windowWidth*0.007}]}>
            Li e concorodo com os 
          </Text>
          <TouchableOpacity onPress={()=>alert('render contract')}>
            <Text style={[styles.termsText,{color:'#ACA5F4'}]}>
              Termos de privacidade
            </Text>
          </TouchableOpacity>
        </View>
        {states.alerts.terms && renderVerify()}
      </TouchableOpacity>
    )
  }
  const renderEnd=()=>{
    const renderButtom=()=>{
      return(
        <TouchableOpacity style={styles.buttom} onPress={()=>CreateUser()}>
          <Text style={styles.buttomText}>
            Criar
          </Text>
        </TouchableOpacity>
      )
    }
    const renderAccLabel=()=>{
      return(
        <View style={{marginTop:windowHeight*0.04,alignItems:'center'}}>
          <Text style={{color:'#000',fontWeight:'bold'}}>
            Já tem uma conta?
          </Text>
          <TouchableOpacity>
            <Text style={{color:'#ACA5F4',marginTop:windowHeight*0.01,fontWeight:'bold'}} onPress={acessLogin}>
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
    return(
      <View style={styles.endSection}>
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        {renderButtom()}
        {renderAccLabel()}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' hidden={false} backgroundColor="#0000" translucent={true}/>
      <KeyboardAvoidingView style={{width:windowWidth,height:'auto'}} behavior={Platform.OS == "ios" ? "padding" : "height"} keyboardVerticalOffset={-windowHeight*0.13}>
        {renderHeader()}
        {renderForms()}
      </KeyboardAvoidingView>
      {renderTerms()}
      {renderEnd()}
    </View>
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
    marginVertical:windowHeight*0.005,
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

  termsSection:{
    width:windowWidth,
    height:windowHeight*0.07,
    marginVertical:windowHeight*0.01,
    justifyContent:'center',
  },
  termsText:{
    color:'#ccc',
    alignSelf:'flex-start',
    fontSize:12
  },
  checkBox:{
    width:windowWidth*0.06,
    height:windowWidth*0.06,
    marginRight:windowWidth*0.01,
    alignSelf:'center',
    borderRadius:8,
    borderColor:'#ccc8',
    borderWidth:windowWidth*0.006,
  },
 
  endSection:{
    position:'absolute',
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
