import React from 'react';
import {View, ToastAndroid} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../components/LoadingIndicator'
import {url} from '../server'

class UserAuthenticator extends React.Component{
    
    constructor(props){
        super(props);
        this.state={
            studentID: '',
            studentName: '',
        }
    }

    authenticateUser = async(studentID, studentName)=>{
       
    }
    
    isValidUser = async()=>{
        const userID = await AsyncStorage.getItem('studentID');
        const userName = await AsyncStorage.getItem('studentName');

        console.log('isvalid', userID)
        if(userID != null && userName != null){
            this.setState({studentID: userID, studentName: userName});
            return true;
        }
        else{
            return false;
        }
    }

    hasEnrolledFace = async ()=>{
      try{
        const response = await fetch(`${url}/students/checkFaceEnrolment`,{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({studentID: this.state.studentID}),
        });
        if(response.status == 200){
            const data = await response.json();
            if(data[0].Face_Enrolment_Status == true){
                return true;
            }
            else{
                return false;
            }
        }
        else{
        throw new Error('Something went wrong');
        }
      }catch(error){
        ToastAndroid.showWithGravityAndOffset(
            error.message,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50,
          );
      }
        
        
        // fetch(`${url}/students/checkFaceEnrolment`, {
        //     method: 'POST',
        //     headers: {'Content-Type':'application/json'},
        //     body: JSON.stringify({studentID: this.state.studentID})
        // }).then((res)=>{
        //     if(res.status == 200){
        //         res.json().then((data)=>{
        //             if(data[0].Face_Enrolment_Status == true){
        //                 this.setState({isFaceEnroled:true});
        //             }
        //              else{
        //                 this.setState({isFaceEnroled:false});
        //                 }
        //         })
        //     }
        //     else{
        //         throw new Error('Error in checking face enrolment')
        //     }
        // }).catch((error)=>{
        //     this.setState({isFaceEnroled:false});
        //     ToastAndroid.showWithGravityAndOffset(
        //         error.message,
        //         ToastAndroid.LONG,
        //         ToastAndroid.BOTTOM,
        //         25,
        //         50,
        //       );
        // });
    }

    authenticate = async()=>{
        const isValidUser = await this.isValidUser();
        
       let hasEnrolledFace;
        if(isValidUser){
            hasEnrolledFace = await this.hasEnrolledFace();
            console.log('enrolled face', hasEnrolledFace );
            
       }        
        
        if(isValidUser && hasEnrolledFace){
            this.props.navigation.navigate('main', {studentID: this.state.studentID, studentName:this.state.studentName});
        }
        else if(isValidUser && ! hasEnrolledFace){
            this.props.navigation.navigate('enrolFace',{
                studentID: this.state.studentID
            });
        }
        else if(!isValidUser){
            this.props.navigation.navigate('logIn');
        }
    }


    async componentDidMount(){
       this.authenticate();
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