import React, { Component } from 'react'
import {
  View,
  TouchableNativeFeedback,
  StyleSheet,
  Image
} from 'react-native'

import {Text, Icon} from 'native-base';
import {url} from '../server'

const SideBar = (props)=>{
    // console.log(props.navigation.state);
    return(
    <View style={styles.mainContainer}>
        <View style={styles.header}>
            <View style={styles.avatar}>
                <Image 
                    source={{uri:`${url}/students/getStudentImage/${props.navigation.getParam('studentID')}`}} 
                    style={{width:'100%', height:'100%'}}
                />
            </View>
            <View style={styles.studentParticulars}>
                <Text style={{textAlign:'center', fontWeight:'bold', color:'white'}}>{props.navigation.getParam('studentID')}</Text>
                <Text style={{textAlign:'center', fontWeight:'bold', color:'white'}}>{props.navigation.getParam('studentName')}</Text>
            </View>
        </View>
        <View>
            <TouchableNativeFeedback onPress={()=>{props.navigation.navigate('upcomingClassSessions')}}>
                <View style={{...styles.navItems, backgroundColor:props.navigation.state.index === 0 ? '#D3D3D3': 'white'}}>
                    <Icon style={{marginRight:10, color:'grey'}} name='book'></Icon>
                    <Text style={{fontWeight:'bold', color:'grey'}}>Upcoming Class Sessions</Text>
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={()=>{props.navigation.navigate('classSchedule')}}>
                <View style={{...styles.navItems, backgroundColor:props.navigation.state.index === 2 ? '#D3D3D3': 'white'}}>
                    <Icon style={{marginRight:10, color:'grey'}} name='calendar'></Icon>
                    <Text style={{fontWeight:'bold', color:'grey'}}>Class Schedule</Text>
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={()=>{props.navigation.navigate('attendancePercentage')}}>
                <View style={{...styles.navItems, backgroundColor:props.navigation.state.index === 3 ? '#D3D3D3': 'white'}}>
                    <Icon style={{marginRight:10, color:'grey'}} name='stats'></Icon>
                    <Text style={{fontWeight:'bold', color:'grey'}}>Attendance Percentage</Text>
                </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={()=>{props.navigation.navigate('logIn')}}>
                <View style={{...styles.navItems}}>
                    <Icon style={{marginRight:10, color:'grey'}} name='log-out'></Icon>
                    <Text style={{fontWeight:'bold', color:'grey'}}>Log Out</Text>
                </View>
            </TouchableNativeFeedback>
            
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    mainContainer:{
        flex:1, 
    },
    header:{
        height: 250,
        width:'100%',
        padding:10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'center',
        backgroundColor:'#455a64',
    },
    avatar:{
        width: 140,
        height:140,
        borderRadius: 70,
        overflow:'hidden'
    },
    studentParticulars:{
        marginVertical:20
    },

    navItems:{
        padding:10,
        marginBottom:10,
        flexDirection:'row',
        justifyContent: 'flex-start'
    }
});

export default SideBar