









const transform={
  minsToTime:(mins)=>{
    if(!mins) return mins
    const minsString = Number(mins)%60
    const time = (Number(mins)-Number(mins)%60)/60+':'+(minsString>=10?minsString:'0'+minsString)
    return time
  },
  timeToMins:(time)=>{
    if(!time) return time
    const hours = time.split(':')[0]
    const mins = time.split(':')[1]
    return Number(hours)*60+Number(mins)
  },
  hexaAbreviation:(val)=>{
    val=val+''
    if(!val) return val
    val = val.replace(/[^0-9]/,'')
    if(val.length>9) val=val.slice(0,val.length-9)+'B'
    else if(val.length>6) val=val.slice(0,val.length-6)+'M'
    else if(val.length>3) val=val.slice(0,val.length-3)+'K'
    return val
  }
}

export default transform