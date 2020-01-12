import React from 'react';
import {View, ActivityIndicator, StyleSheet, AsyncStorage} from 'react-native';
import LoadingIndicator from '../components/LoadingIndicator'
import {url} from '../server'

class UserAuthenticator extends React.Component{
    
    constructor(props){
        super(props);
        this.state={
            studentID: '1151101633',
            studentName: 'Mohamad Harith Bin Habib Rahman'
        }
    }

    authenticateUser = async()=>{

    }
    
    isValidUser = async()=>{
        //const userToken = await AsyncStorage.getItem('userToken');
        //this.props.navigation.navigate(userToken?'App':'logIn');
        //this.props.navigation.navigate(false?'main':'logIn');
        return true;
    }

    hasEnrolledFace = async ()=>{
        // const response = await fetch(`${url}/students/checkFaceEnrolment`,{
        //                     method: 'POST',
        //                     headers: {'Content-Type':'application/json'},
        //                     body: JSON.stringify({studentID: this.state.studentID}),
        //                 });
        // if(response.status == 200){
        //     const data = await response.json();
        //     if(data[0].Face_Enrolment_Status == true){return true;}
        //     else{return false;}
        // }
        // else{throw new Error('Something went wrong');}
        return true;
    }


    async componentDidMount(){
        const isValidUser = await this.isValidUser();
        const hasEnrolledFace = await this.hasEnrolledFace();
        
        if(isValidUser && hasEnrolledFace){
            this.props.navigation.navigate('main', {studentID: this.state.studentID, studentName:this.state.studentName});
        }
        else if(isValidUser && ! hasEnrolledFace){
            this.props.navigation.navigate('enrolFace');
        }
        else if(!isValidUser){
            this.props.navigation.navigate('logIn');
        }
    }

    render(){
        return(
            <View style={{flex:1}}>
                <LoadingIndicator/>
            </View>
        );
    }
}

export default UserAuthenticator;