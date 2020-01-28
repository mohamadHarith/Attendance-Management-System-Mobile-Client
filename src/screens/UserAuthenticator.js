import React from 'react';
import {View, ToastAndroid} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../components/LoadingIndicator'
import {url} from '../server'

class UserAuthenticator extends React.Component{
    
   _isMounted = false;

    constructor(props){
        super(props);
        this.state={
            studentID: '',
            studentName: '',
        }
    }
    
    isValidUser = async()=>{
        const userID = await AsyncStorage.getItem('studentID');
        const userName = await AsyncStorage.getItem('studentName');

        if(userID != null && userName != null && this._isMounted){
            this.setState({studentID: userID, studentName: userName});
            this.hasEnrolledFace();
        }
        else{
            if(this._isMounted){
                this.props.navigation.navigate('logIn');
            }
        }
    }

    hasEnrolledFace = async ()=>{
        fetch(`${url}/students/checkFaceEnrolment`,{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({studentID: this.state.studentID}),
        }).then((res)=>{
            if(res.status == 200 && this._isMounted){
                res.json().then((data)=>{
                    if(data[0].Face_Enrolment_Status == true){
                        this.props.navigation.navigate('main', {studentID: this.state.studentID, studentName:this.state.studentName});
                    }
                    else{
                        this.props.navigation.navigate('enrolFace',{studentID: this.state.studentID});

                    }
                })
            }
            else{
                throw new Error('Could not get face enrolment status')
            }
        }).catch((error)=>{
            if(this._isMounted){
                ToastAndroid.showWithGravityAndOffset(
                    error.message,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
               );
               this.props.navigation.navigate('logIn');
            }
        })
        setTimeout(()=>{           
                if(this._isMounted){
                 ToastAndroid.showWithGravityAndOffset(
                         'Network request timeout',
                         ToastAndroid.LONG,
                         ToastAndroid.BOTTOM,
                         25,
                         50,
                    );
                    this.props.navigation.navigate('logIn');
                }
        }, 5000)
    }

    async componentDidMount(){
       this._isMounted = true;
        this.isValidUser();
    }

    componentWillUnmount(){
        this._isMounted = false;
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