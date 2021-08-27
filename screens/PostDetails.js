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


export default function PostDetails({navigation,route}) {


  const acessStat=()=>navigation.navigate('Start',{user:user})
  const acessLogin=()=>navigation.navigate('Login')
  const accessPostDetails=(item)=>navigation.navigate('PostDetails',{post:item})

  //User
  const [user,setUser] = useState(null)
  const [states,setStates] = useState({
    descriptionExpanded:false,
    descriptionLines:undefined,
    isLiked:undefined,
    comment:undefined
  })
  const [data,setData] = useState({
    post:undefined,
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
  const changeText=(text)=>{
    states.comment=text
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
  const like=async()=>{
    const res = await server.update('like/'+data.post.id)
    if(res.status){
      if(res.res){
        data.post.likes.push(user.user.uid)
        states.isLiked=true
      }else{
        const index = data.post.likes.findIndex(found=>found===user.user.uid)
        data.post.likes.splice(index,1)
        states.isLiked=false
      }
      setStates({...states})
      setData({...data})
    }
  }
  const publishComment=async()=>{
    Keyboard.dismiss()
    const res = await server.set('comments/'+data.post.id,undefined,states.comment)
    if(res.status){
      if(res){
        data.post.comments.push(res)
        states.comment=undefined
      }else{

      }
      setStates({...states})
      setData({...data})
    }
  }


  useEffect(()=>{
    const unsubscribe = navigation.addListener('focus',async()=>{
      const res = await server.authenticate()
      if(res.status) {
        setUser(res.user)

        try{
          const {post} = route.params
          data.post = post
          const isLiked = post.likes.find(found=>found===res.user.user.uid)
          if(isLiked) states.isLiked=true
          setData({...data})
          setStates({...states})
        }catch(er){}
      }
    })
    return unsubscribe;
  },[navigation])
  

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
        <Text style={styles.headerTitle}>Detalhes do post</Text>
        {renderLine()}
      </View>
    )
  }
  const renderPost=()=>{
    const renderTitle=()=>{
      return(
        <Text style={[styles.postTitle,{fontWeight:'700',fontSize:16}]}>
          {data.post?.title}
        </Text>
      )
    }
    const renderPostDate=()=>{
      return(
        <Text style={[styles.postTitle,{fontSize:12,fontWeight:'200',marginVertical:undefined,marginLeft:windowWidth*0.04}]}>
          Data da postagem - {moment(data.post?.createdAt).format('DD/MM/YYYY')}
        </Text>
      )
    }
    const renderDescription=()=>{
      const setLines=(lines)=>{
        console.log('lines',lines)
        states.descriptionLines=lines
        setStates({...states})
      }
      const expandRetract=()=>{
        states.descriptionExpanded = !states.descriptionExpanded
        setStates({...states})
      }
      const renderExpandRetractLabel=()=>{
        const label = states.descriptionExpanded?'retrair':`expandir (+${states.descriptionLines-12})`
        return(
          <TouchableOpacity style={{height:windowHeight*0.04,marginHorizontal:windowWidth*0.03}}
          onPress={()=>expandRetract()}>
            <Text style={styles.postExpandRetractText}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      }
      return(
        <View style={{minHeight:windowHeight*0.2}}>
          <Text style={[styles.postTitle,{marginTop:undefined}]} numberOfLines={states.descriptionExpanded?undefined:12} onTextLayout={e=>setLines(e.nativeEvent.lines.length)}>
            {data.post?.description}
          </Text>
          {states.descriptionLines>12 && renderExpandRetractLabel()}
        </View>
      )
    }
    const renderLikes=()=>{
      const renderButtom=()=>{
        let label = states.isLiked?'Curtido':'Curtir'
        return(
            <TouchableOpacity style={[styles.likeButtom,states.isLiked?{backgroundColor:'#8a67a6'}:null]} onPress={()=>like()}>
              <Text style={[styles.likeButtomText,states.isLiked?{color:'#e7d2f7'}:null]}>
                {label}
              </Text>
            </TouchableOpacity>
        )
      }
      return(
        <View style={{flexDirection:'row',alignItems:'center'}}>
          {renderButtom()}
          <Text style={[styles.postTitle,{marginTop:0,marginVertical:0,marginLeft:windowWidth*0.05,color:'#552a80',fontWeight:'700'}]}>
            {transform.hexaAbreviation(data.post?.likes.length||'')} likes
          </Text>
        </View>
      )
    }
    return(
      <Animated.View style={styles.postSection}>
        {renderTitle()}
        {renderPostDate()}
        {renderDescription()}
        {renderLikes()}
      </Animated.View>
    )
  }
  const renderComments=()=>{
    const renderTitle=()=>{
      return(
        <View>
          <Text style={[styles.postTitle,{fontSize:15,fontWeight:'500',marginLeft:windowWidth*0.04}]}>
            Comentários
          </Text>
          {renderLine('#ccc8','90%')}
        </View>
      )
    }
    const renderItem=({item,index})=>{
      return(
        <View>
          <View style={{flexDirection:'row'}}>
            <Text style={[styles.postTitle,{fontSize:15,fontWeight:'normal',marginLeft:windowWidth*0.08}]}>
              {item.name}
            </Text>
            <Text style={[styles.postTitle,{fontSize:15,marginLeft:0,fontWeight:'normal'}]}>
              - {moment(item.timestamp).format('DD/MM/YYYY')}
            </Text>
          </View>
          <Text style={[styles.postTitle,{fontSize:15,marginTop:0,fontWeight:'normal',marginLeft:windowWidth*0.12}]}>
            {item.comment}
          </Text>
          {renderLine('#ccc8','90%')}
        </View>
      )
    }
    const renderList=()=>{
      return(
        <FlatList
        data={data.post?.comments||[]}
        keyExtractor={(item,index)=>index.toString()}
        renderItem={renderItem}
        />
      )
    }
    return(
      <View style={styles.commentsSection}>
        <ScrollView>
          {renderTitle()}
          {renderList()}
        </ScrollView>
      </View>
    )
  }
  const renderInput=()=>{
    return(
      <View style={{flexDirection:'row',width:windowWidth,height:windowHeight*0.1}}>
        <View style={{position:'absolute',width:'100%',height:1,elevation:1,zIndex:1,backgroundColor:'#000'}}/>
        <View style={{width:'100%',height:'100%',flexDirection:'row',justifyContent:'space-between'}}>
          <TextInput
          style={{height:'100%',flex:1,alignItems:'center',marginLeft:windowWidth*0.06,color:'#000'}}
          numberOfLines={3}
          placeholder='Insira seu comentário aqui...'
          placeholderTextColor='#aaa'
          onChangeText={text=>changeText(text)}
          value={states.comment||''}
          // onFocus={()=>focus(type)}
          />
          <TouchableOpacity style={{height:'100%',width:windowWidth*0.2}} onPress={()=>publishComment()}>
            <Text style={[styles.headerTitle,{top:0,width:'100%',fontSize:16,textAlignVertical:'center'}]}>
              Publicar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return(
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' hidden={false} backgroundColor="#0000" translucent={true}/>
      {renderHeader()}
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS == "ios" ? "padding" : "height"} keyboardVerticalOffset={windowHeight*0.03}>
        <ScrollView>
          {renderPost()}
          {renderComments()}
        </ScrollView>
          {renderInput()}
      </KeyboardAvoidingView>
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

  listCard:{
    flexDirection:'row',
    justifyContent:'space-between',
    width:windowWidth*0.87,
    height:windowHeight*0.08,
    margin:windowHeight*0.01,
    alignSelf:'center',
    alignItems:'center',
    shadowOffset:{width:0,height:10},
    shadowOpacity:1,
    shadowColor:'#000',
    shadowRadius:10,
    borderRadius:12,
    backgroundColor:'#fff',
    elevation:7,
    zIndex:7
  },
  listCardText:{
    // marginVertical:windowHeight*0.01,
    // flex:1,
    marginLeft:windowWidth*0.06,
    height:'100%',
    textAlignVertical:'center',
    fontWeight:'bold',
    color:'#777'
  },

  commentsSection:{
    width:windowWidth*0.9,
    marginTop:windowHeight*0.03,
    alignSelf:'center',
  },
  commentsList:{

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
    // position:'absolute',
    // bottom:0,
    width:windowWidth,
    marginVertical:windowHeight*0.01,
    marginBottom:windowHeight*0.05,
    // height:windowHeight*0.15,
    alignItems:'center',
    justifyContent:'center',
    
  },
  likeButtom:{
    width:windowWidth*0.25,
    height:windowHeight*0.09,
    justifyContent:'center',
    alignSelf:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:'#552a80'
  },
  likeButtomText:{
    fontSize:17,
    color:'#fff',

  }
})
