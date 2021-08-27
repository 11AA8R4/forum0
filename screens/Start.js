//Defaults
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Image,StatusBar, StyleSheet, View, Text, TextInput, Dimensions, KeyboardAvoidingView, PermissionsAndroid,
  TouchableOpacity, Keyboard, Platform, ViewPagerAndroidComponent, FlatList
} from 'react-native';

// Navigation
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

const heightCorrection = StatusBar.currentHeight;
const screenHeight = Dimensions.get('screen').height;
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function Start({ navigation }) {


  const acessStat=()=>navigation.navigate('Start',{user:user})
  const acessLogin=()=>navigation.navigate('Login')
  const accessPostDetails=(item)=>navigation.navigate('PostDetails',{post:item})
  const accessCreatePost=(item)=>navigation.navigate('CreatePost')

  //User
  const [user,setUser] = useState(null)
  const [states,setStates] = useState({
    firstRead:true,
    forms:{
      name:'aaa',
      email:'a@a.com',
      password:'123456',
      confirmPassword:'123456',
    },
    focused:undefined,
    termsVerification:false,
    alerts:{
      email:undefined,
      password:undefined,
      confirmPassword:undefined,
      terms:undefined,
    },
    startAt:0,
    pids:[-1],
    refreshing:false
  })
  const [data,setData] = useState({
    teste:'',
    posts:[
      // {
      //   title:'Titulo teste bem longo pra garantir concatenização',
      //   description:'',
      //   likes:1004378944
      // },
      // {
      //   title:'Titulo teste bem longo pra garantir concatenização',
      //   description:'Text messages are used for personal, family, business and social purposes. Governmental and non-governmental organizations use text messaging for communication between colleagues. In the 2010s, the sending of short informal messages became an accepted part of many cultures, as happened earlier with emailing.[1] This makes texting a quick and easy way to communicate with friends, family and colleagues, including in contexts where a call would be impolite or inappropriate (e.g., calling very late at night or when one knows the other person is busy with family or work activities). Like e-mail and voicemail and unlike calls (in which the caller hopes to speak directly with the recipient), texting does not require the caller and recipient to both be free at the same moment; this permits communication even between busy individuals. Text messages can also be used to interact with automated systems, for example, to order products or services from e-commerce websites, or to participate in online contests. Advertisers and service providers use direct text marketing to send messages to mobile users about promotions, payment due dates, and other notifications instead of using postal mail, email, or voicemail.',
      //   likes:333,
      //   comments:[{
      //     name:'Saas',
      //     timestamp:new Date().valueOf(),
      //     comment:'unlike calls (in which the caller hopes to speak directly with the recipient), texting does not require the caller and recipient to both be free at the same moment; this permits communication even between busy individuals. Text messages can also be used to interact with automated systems, for example, to order products or services from e-commerce websites, or to participate in online contests. Advertisers and service providers use direct text marketing to send messages to mobile users about promotions, payment due dates, and other notifications instead of using postal mail, email, or voicemail.'
      //   }]
      // },
    ]
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
  const logout=()=>{
    server.signOut().then(()=>{
      navigation.navigate('Login',{email:'',password:''})
    })
  }
  const getPosts=async()=>{
    states.refreshing=true
    setStates({...states})
    const res = await server.read('posts',undefined,{startAt:states.startAt,pids:states.pids})
    if(res.status){
      console.log('res.pids',res.pids)
      console.log('res.results[0]',res.results[0])
      states.startAt = res.startAt
      states.pids = res.pids
      res.results.length>0?data.posts.push(...res.results):null
      states.firstRead=false
      states.refreshing=false
      setData({...data})
      setStates({...states})
    }
  }

  useEffect(()=>{
    if(states.firstRead){
      const unsubscribe = navigation.addListener('focus',()=>{
        getPosts()
      })
      return unsubscribe;
    }
  },[navigation])
  

  const logoutIcon=require('../assets/icons/logout.png')
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
  const renderLogout=()=>{
    return(
      <TouchableOpacity style={{position:'absolute',height:windowHeight*0.04,width:windowHeight*0.04,right:windowWidth*0.03,top:windowHeight*0.02,elevation:1,zIndex:1}}
      onPress={()=>logout()}>
        <Image style={{height:'100%',width:'100%',opacity:1}} source={logoutIcon} resizeMode='contain'/>
      </TouchableOpacity>
    )
  }
  const renderHeader=()=>{
    return(
      <View style={styles.headerSection}>
        <TouchableOpacity style={{position:'absolute',width:'100%',height:'100%'}} activeOpacity={1} onPressIn={()=>focus()}/>
        {renderLogout()}
        <Text style={styles.headerTitle}>Início</Text>
        {renderLine()}
      </View>
    )
  }
  
  const renderList=()=>{
    const renderHeader=()=>{
      return(
        <View >
          <Text style={styles.listTitle}>
            Lista de posts
          </Text>
        </View>
      )
    }
    const renderItem=({item,index})=>{
      console.log('item.createdAt',(new Date(item.createdAt)).valueOf())
      return(
        <TouchableOpacity style={styles.listCard} onPress={()=>accessPostDetails(item)}>
          <Text style={[styles.listCardText,{flex:1}]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.listCardText,{marginRight:windowWidth*0.04,color:'#552a80',fontWeight:'200'}]} numberOfLines={1}>
            {transform.hexaAbreviation(item.likes.length)} likes
          </Text>
        </TouchableOpacity>
      )
    }
    const renderEndList=()=>{
      return(
        <View style={{height:windowHeight*0.05}}>
          <Text style={[styles.listCardText,{alignSelf:'center',marginLeft:undefined,fontWeight:'300',color:'#bbb'}]}>
            Fim da lista
          </Text>
        </View>
      )
    }
    return(
      <Animated.View style={styles.listSection}>
        {renderHeader()}
        <FlatList
        style={{top:0}}
        contentContainerStyle={{justifyContent:'flex-start'}}
        data={data.posts.sort((a,b)=>(new Date(b.createdAt).valueOf())-(new Date(a.createdAt).valueOf()))}
        keyExtractor={(item,index)=>index.toString()}
        renderItem={renderItem}
        onEndReached={()=>getPosts()}
        onEndReachedThreshold={0.2}
        refreshing={states.refreshing}
        onRefresh={console.log('e')}
        ListFooterComponent={renderEndList}
        />
      </Animated.View>
    )
  }
  const renderEnd=()=>{
    const renderButtom=()=>{
      return(
        <TouchableOpacity style={styles.buttom} onPress={()=>accessCreatePost()}>
          <Text style={styles.buttomText}>
            Criar
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
      {renderList()}
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

  listSection:{
    flex:1,
    width:windowWidth*0.9,
    top:0,
    alignSelf:'center',
    // justifyContent:'flex-start',
  },
  listTitle:{
    marginHorizontal:windowWidth*0.025,
    marginVertical:windowHeight*0.01,
    marginTop:windowHeight*0.02,
    fontWeight:'600' ,
    color:'#aaa'
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

  form:{
    width:windowWidth*0.85,
    height:windowHeight*0.07,
    alignSelf:'center',
    marginVertical:windowHeight*0.005,
    borderColor:'#eee8',
    borderWidth:2,
    borderRadius:5
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
