//Defaults
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Image,StatusBar, StyleSheet, View, Text, TextInput, Dimensions, KeyboardAvoidingView, PermissionsAndroid,
  TouchableOpacity, Keyboard, Platform, ViewPagerAndroidComponent, FlatList, ScrollView
} from 'react-native';

// Navigation
import { Shadow } from 'react-native-neomorph-shadows';
import { StartMenuIcon , BackIcon, MenuIcon, TimeLine } from '../components/MenuIcons';
//Extra
import Animated, {useSharedValue, withTiming , Easing , withSpring , interpolate, Extrapolate ,
  runOnJS ,useAnimatedGestureHandler, useAnimatedStyle, withDelay} from 'react-native-reanimated'
import {PanGestureHandler} from 'react-native-gesture-handler'
import { Coachmark } from 'react-native-coachmark'
//Data
import AsyncStorage from '@react-native-community/async-storage'
import server from './server/server'
import transform from '../functions/transform';
import moment from 'moment';

const heightCorrection = StatusBar.currentHeight;
const screenHeight = Dimensions.get('screen').height;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function CreatePost({navigation,route}) {


  const acessStat=()=>navigation.navigate('Start',{user:user})
  const acessLogin=()=>navigation.navigate('Login')
  const accessPostDetails=(item)=>navigation.navigate('PostDetails',{post:item})

  //User
  const [user,setUser] = useState(null)
  const [states,setStates] = useState({
    title:undefined,
    description:undefined,
    focused:undefined
  })
  const [data,setData] = useState({

  })
  const titleRef = useRef()
  const descriptionRef = useRef()

  useEffect(()=>{
    try{
      const {post} = route.params
      data.post = post
      setData({...data})
    }catch(er){}
  },[])


  const focus=(type)=>{
    if(!type) Keyboard.dismiss()
    if(type==='title') titleRef.current.focus()
    else if (type==='description') descriptionRef.current.focus()
    states.focused = type?type:undefined
    setStates({...states})
  }


  //functions
  const changeText=(text,type)=>{
    states[type]=text
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
  const createPost=async()=>{
    const post = {
      title:states.title,
      description:states.description
    }
    const res = await server.set('posts',undefined,post)
    if(res.status){
      console.log('res',res)
      navigation.navigate('Start')
    }
  }
  

  const trueIcon=require('../assets/icons/true.png')
  const renderLine=(color,width)=>{
    return(
      <View style={{height:windowHeight*0.003,width:width?width:windowWidth,alignSelf:'center',backgroundColor:color?color:'#eee8'}}/>
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
        <Text style={styles.headerTitle}>Criar Post</Text>
        {renderLine()}
      </View>
    )
  }
  const renderPost=()=>{
    const renderTitle=()=>{
      if(states.focused){
        var focused = states.focused==='title'
      }
      return(
        <View style={{maxHeight:windowHeight*0.1}}>
          <View style={[styles.form,focused?{borderColor:'#3e1f5c'}:null]}>
            <TextInput
            style={styles.formText}
            ref={titleRef}
            placeholder='Título do post'
            placeholderTextColor='#999'
            onChangeText={text=>changeText(text,'title')}
            value={states.title||''}
            onFocus={()=>focus('title')}
            />
          </View>
          {/* {states.alerts[type] && renderVerify(alert)} */}
        </View>
      )
    }
    const renderDescription=()=>{
      if(states.focused){
        var focused = states.focused==='description'
      }
      return(
        <View >
          <View style={[styles.form,{height:windowHeight*0.3},focused?{borderColor:'#3e1f5c'}:null]}>
            <TextInput
            style={[styles.formText,{textAlignVertical:'top'}]}
            ref={descriptionRef}
            placeholder='Digite a descrição'
            placeholderTextColor='#999'
            onChangeText={text=>changeText(text,'description')}
            value={states.description||''}
            onFocus={()=>focus('description')}
            />
          </View>
          {/* {states.alerts[type] && renderVerify(alert)} */}
        </View>
      )
    }
    return(
      <Animated.View style={styles.postSection}>
        {renderTitle()}
        {renderDescription()}
      </Animated.View>
    )
  }
  const renderEnd=()=>{
    const renderButtom=()=>{
      return(
        <TouchableOpacity style={styles.buttom} onPress={()=>createPost()}>
          <Text style={styles.buttomText}>
            Salvar
          </Text>
        </TouchableOpacity>
      )
    }
    return(
      <View style={styles.endSection}>
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        {renderButtom()}
      </View>
    )
  }

  return(
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' hidden={false} backgroundColor="#0000" translucent={true}/>
      {renderHeader()}
      {/* <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS == "ios" ? "padding" : "height"} > */}
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        <ScrollView>
          {renderPost()}
        </ScrollView>
      {/* </KeyboardAvoidingView> */}
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

  postSection:{
    width:windowWidth*0.9,
    alignSelf:'center',
    justifyContent:'flex-start',
  },
  postTitle:{
    marginHorizontal:windowWidth*0.025,
    marginVertical:windowHeight*0.01,
    marginTop:windowHeight*0.02,
    fontWeight:'600',
    color:'#aaa'
  },
  postExpandRetractText:{
    width:windowWidth*0.3,
    height:'100%',
    alignSelf:'flex-end',
    textAlignVertical:'center',
    textAlign:'center',
    fontWeight:'600' ,
    color:'#ACA5F4',
    // backgroundColor:'#666',
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
  
  listItemText:{
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
    height:windowHeight*0.18,
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
})
