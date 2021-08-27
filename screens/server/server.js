import AsyncStorage from '@react-native-community/async-storage'
import { Platform } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
// import randomId from '../functions/randomId'

const uploadAsset=async(formData,assets)=>{
  console.log('uploading OBJECT of assets A1.js')
  await Promise.all(Object.keys(assets).map(async(key,index)=>{
    let asset = assets[key]
    if(typeof(asset)==='undefined') null
    else if(typeof(asset)==='string'){
      asset=asset.toLowerCase()
      ext = asset.split('.').pop().toLowerCase()
      fileName = key+'.'+asset.split('.').pop().toLowerCase()
      type='image/jpeg'
      switch(ext.toLowerCase()){
        case 'png':type='image/png';break
        case 'jpeg':type='image/jpeg';break
        case 'jpg':type='image/jpg';break
        case 'mp4':type='video/mp4';break
      }
      if(asset.slice(0,7)!=='file://' && Platform.OS==='android') asset = 'file://'+asset
      console.log('asset',asset)
      formData.append(index+'',{uri:asset,name:fileName,type:type})
      console.log('>>',index+'',{uri:asset,name:fileName,type:type})
    }
    else{
      return console.warn("\x1b[32m",'assets must be strings (solo,in array or in object)')
    }
  }))
  console.log('..k',formData)
  return formData
}

const server={
  logIn:async function(email,password,remember){
    console.log('email,password',email,password)
    const response = await fetch('http://45.71.105.20:3071/sessions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })
    const json = await response.json()
    if(response.status===200){
      console.log('reveived user',json)
      const user = json
      if(remember){
        console.log('remember',remember)
        let logins = await AsyncStorage.getItem('@logins')
        if(logins){
          logins = JSON.parse(logins)
          logins.push(user)
          await AsyncStorage.setItem('@logins',JSON.stringify([...logins]))
        }else{
          await AsyncStorage.setItem('@logins',JSON.stringify([user]))
        }
      }
      await AsyncStorage.setItem('@currentUser', JSON.stringify(user))
      json.status=true
      return json
    }else{
      AsyncStorage.removeItem('@currentUser')
      return json
    }
  },

  authenticate:async function(user){
    if(!user) user = JSON.parse(await AsyncStorage.getItem('@currentUser'))
    if(user){
      console.log('a1.auth user',user)
      const a1Res = await fetch('http://45.71.105.20:3071/sessions', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          token: 'Bearer '+user.token,
        },
        body:{}
      })
      const json = await a1Res.json()
      console.log('json',json)
      if(a1Res.status===200){
        await AsyncStorage.setItem('@currentUser',JSON.stringify(user))

        return {status:true,json,user}
      }
    }else{
      AsyncStorage.removeItem('@currentUser')
      console.warn("\x1b[32m",'no offline stored token')
    }
  },

  // signIn:async function(user){await AsyncStorage.setItem('@currentUser', JSON.stringify(user))},
  signOut:async function(){await AsyncStorage.removeItem('@currentUser')},
  user:async function(){
    const user = await AsyncStorage.getItem('@currentUser')
    return (user!==null)?JSON.parse(user):null;
  },
  /**
   * 
   * eg: ( 'assets' , path/path , ['0','img1','img2'] )
   * 
   *@param root The Main folder 
   *
   *@param path The path to the folder
  **/
  download:async function(root,path){
    const user = JSON.parse(await AsyncStorage.getItem('@currentUser'))
    let token = ''
    if(!path){
      path=null
    }
    if(user){
      token = 'Bearer '+user.token
    }
    const response = await RNFetchBlob.fetch(
      'GET',
      'http://45.71.105.20:3071/'+root,
      {
        Accept:'application/json',
        token:token,
        path:path
      }
    ).then(async res=>{
      // console.log('res',res)
      if(res.data!=='Not found'){
        const contentType = res.respInfo.headers['Content-Type']
        const base64 = await res.base64()
        const asset = {base64:'data:'+contentType+';base64,'+base64,contentType:contentType}
        return asset
      }
    })
    .catch(err=>{
      console.warn('A1 READ ERROR',err)
      return err
    })
    return response
  },
  /**
   * 
   * eg: ( 'users' , null , null , 'uri///:' )
   * 
   *@param root The Main folder
   *
   *@param path The path of object to delete
   *
   *@param json json to use somehow
   *
   *@param instruction string instructing 'what to do' there
  **/
  read:async function(root,path,json,instructions){
    path && console.log('Sending path > ',path)
    json && console.log('Sending json > ',json)
    instructions && console.log('Sending instructions > ',instructions)
    const user = JSON.parse(await AsyncStorage.getItem('@currentUser'))
    let token = ''
    if(user){
      token = 'Bearer '+user.token
    }
    if(json && typeof(json)!=='string'){
      json=JSON.stringify(json)
    }
    if(instructions && typeof(instructions)!=='string'){
      instructions=JSON.stringify(instructions)
    }
    const response = await fetch('http://45.71.105.20:3071/'+root, {
      method:'GET',
      headers: Object.assign({},
        {Accept:'application/json'},
        {token:token},
        path && {path:path},
        json && {json:json},
        instructions && {instructions:instructions}
      )
    })
    let jsonRes = response
    try{
      jsonRes = await response.json()
    }catch(err){}
    try{
      jsonRes = await response.blob()
    }catch(err){}
    if((response.status+'').slice(0,1)!=='2') console.warn("\x1b[32m",jsonRes)
    else jsonRes.status=true
    return jsonRes
  },
  /**
   * 
   * eg: ( 'users' , null , null , 'uri///:' )
   * 
   *@param root The Main folder
   *
   *@param path The path inside the object
   *
   *@param json object,string,number,array...
   *
   *@param assets single, array, object...
  **/
  set:async function(root,path,json,assets){
    const user = JSON.parse(await AsyncStorage.getItem('@currentUser'))
    console.log('user',user)

    let formData = new FormData()
    if(user){
      formData.append('token','Bearer '+user.token)
    }
    if(path){
      if(typeof(path)==='object'){
        path = JSON.stringify(path)
      }
      formData.append('path',path)
    }
    if(json!==undefined){
      if(typeof(json)==='object') json=JSON.stringify(json)
      formData.append('json',json)
    }
    if(assets){
      if(typeof(assets)==='string') assets=[assets]
      console.log('assets',assets)
      if(Array.isArray(assets)){
        let newAssets = {}
        assets.forEach((asset,index)=>newAssets[index]=asset)
        assets=newAssets
      }
      formData = await uploadAsset(formData,assets)
    }
    console.log('root',root)
    const response = await fetch('http://45.71.105.20:3071/'+root, {
      method:'POST',
      body:formData
    }).catch(e=>console.log('e',e))
    const jsonRes = await response.json()
    if((response.status+'').slice(0,1)!=='2') console.warn("\x1b[32m",jsonRes)
    else jsonRes.status=true
    return jsonRes
  },
  /**
   * 
   * eg: ( 'users' , null , null , 'uri///:' )
   * 
   *@param root The Main folder
   *
   *@param path The path inside the object
   *
   *@param json object,string,number,array...
   *
   *@param assets single, array, object...
  **/
  update:async function(root,path,json,assets){
    const user = JSON.parse(await AsyncStorage.getItem('@currentUser'))
    console.log('user',user)

    let formData = new FormData()
    if(user){
      formData.append('token','Bearer '+user.token)
    }
    if(path){
      if(typeof(path)==='object'){
        path = JSON.stringify(path)
      }
      formData.append('path',path)
    }
    if(json!==undefined){
      if(typeof(json)==='object'){
        json=JSON.stringify(json)
      }
      formData.append('json',json)
    }
    if(assets){
      if(typeof(assets)==='string') assets=[assets]
      console.log('assets',assets)
      if(Array.isArray(assets)){
        let newAssets = {}
        assets.forEach((asset,index)=>newAssets[index]=asset)
        assets=newAssets
      }
      formData = await uploadAsset(formData,assets)
      console.log('formData',formData)
    }
    console.log('root',root)
    // console.log('formData',formData)
    const response = await fetch('http://45.71.105.20:3071/'+root, {
      method:'PUT',
      body:formData
    }).catch(e=>console.log('e',e))
    const jsonRes = await response.json()
    if((response.status+'').slice(0,1)!=='2') console.warn("\x1b[32m",jsonRes)
    else jsonRes.status=true
    return jsonRes
  },
  /**
   * 
   * eg: ( 'users' , null , null , 'uri///:' )
   * 
   *@param root The Main folder
   *
   *@param path The path of object to delete
  **/
  delete:async function(root,path,json,instruction){
    const user = JSON.parse(await AsyncStorage.getItem('@currentUser'))
    let token = ''
    if(user){
      token = 'Bearer '+user.token
    }
    if(json && typeof(json)!=='string'){
      json=JSON.stringify(json)
    }
    console.log('root',root)
    // console.log('formData',formData)
    const response = await fetch('http://45.71.105.20:3071/'+root, {
      method:'DELETE',
      headers: Object.assign({},
        {Accept:'application/json'},
        {token:token},
        path && {path:path},
        json && {json:json}
      )
    })
    console.log('response.status.slice(0,2)===20',response.status.slice(0,1))
    let jsonRes = response
    try {jsonRes = await response.json()}
    catch(er){console.log('error A1.js',er)}
    if((response.status+'').slice(0,1)!=='2') console.warn("\x1b[32m",jsonRes)
    else jsonRes.status=true
    return jsonRes
  }
}

export default server