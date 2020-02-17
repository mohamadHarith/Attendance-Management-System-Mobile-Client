import React from 'react';
import { 
   Container, 
  Header, 
  Form, 
  Item, 
  Input, 
  Label,
  Body,
  Title,
  Button,
  Text,
  Content
} from 'native-base';

import {StyleSheet,
  View,
  ToastAndroid,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../components/LoadingIndicator'
import {url} from '../server';
import {themeColor} from '../colorConstants';


class Login extends React.Component {
  
  _isMounted = false;

  constructor(props){
    super(props);
    this.state = {
      isLoaded:false,
      studentID: '',
      password: ''
    }
    
  }

  handleLogin = ()=>{
    try{
     if(this._isMounted && this.state.studentID.length > 0 && this.state.password.length>0){
      this.setState({isLoaded:false});
      fetch(`${url}/students/authStudent`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          studentID: this.state.studentID,
          password: this.state.password
        })
      }).then((res)=>{
        if(res.status == 200 && this._isMounted){
          res.json().then(async (data)=>{
            await AsyncStorage.setItem('studentID', data[0].Student_ID);
            await AsyncStorage.setItem('studentName', data[0].Student_Name);
            this.props.navigation.navigate('authUser');
          });
        }
        else{
          throw new Error('No matching user please try again');
        }
      }).catch((error)=>{
        if(this._isMounted){
          this.setState({isLoaded:true, studentID:'', password:''});
          ToastAndroid.showWithGravityAndOffset(
            error.message,
             ToastAndroid.LONG,
             ToastAndroid.BOTTOM,
             25,
             50,
           );
        }
      })
      setTimeout(()=>{           
           if(this._isMounted && !this.state.isLoaded){
            this.setState({isLoaded:true, studentID:'', password:''});    
            ToastAndroid.showWithGravityAndOffset(
                    'Network request timeout',
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
           }
      }, 5000)
     }else{
        throw new Error('Please make sure you enter student ID and password')
     }
    }catch(error){
      if(this._isMounted){
        this.setState({isLoaded:true, studentID:'', password:''})
        ToastAndroid.showWithGravityAndOffset(
          error.message,
           ToastAndroid.LONG,
           ToastAndroid.BOTTOM,
           25,
           50,
         );
      }
    }
  }

 async componentDidMount(){
    this._isMounted = true;
    await AsyncStorage.removeItem('studentID');
    await AsyncStorage.removeItem('studentName');
    this.setState({isLoaded:true});
  }

  componentWillUnmount(){
    this._isMounted = false;
  }
  
  render(){
    return(
    <Container>
        {this.state.isLoaded?(
          <View style={{flex:1}}>
            <Header androidStatusBarColor={themeColor} style={{backgroundColor:themeColor}}>
              <Body>
                <Title style={styles.headerTitle}>MMU Attendance</Title>
              </Body>
            </Header>        
            <Content>
            <View style={styles.mainContainer}>
            <View style={styles.logoContainer}>
              <Image 
                  source={require('../images/logo-mmu.png')} 
                  style={{width:250, height:100}}
                  resizeMode='contain'
                />
            </View>
            <Form style={styles.formStyle}>
              <Item floatingLabel>
                <Label style={{color:'grey'}}>Student ID</Label>
                <Input 
                    selectionColor={'#D9220E'} 
                    returnKeyType='next' 
                    onChangeText={(text)=>{
                      this.setState({studentID: text})
                    }}
                    onSubmitEditing={()=>{this.passwordTextInputRef._root.focus()}}
                />
              </Item>
               <Item floatingLabel>
                <Label style={{color:'grey'}}>Password</Label>
                <Input 
                      getRef={(input)=>{this.passwordTextInputRef = input}}
                      secureTextEntry={true} 
                      selectionColor = {'#D9220E'} 
                      returnKeyType='go' 
                      onChangeText={(text)=>{
                        this.setState({password:text})
                      }}
                      onSubmitEditing={()=>{this.handleLogin()}}
                />
              </Item>
              <View style={styles.buttonContainer}>
                  <Button style={styles.button} onPress={()=>{this.handleLogin()}}>
                     <Text>Log In</Text>
                 </Button>
              </View>
            </Form> 
            </View>
            </Content>        
          </View>
        ):(
          <LoadingIndicator/>
        )}
      </Container>
  );
  }
}



const styles = StyleSheet.create({
 
  headerTitle:{
    paddingLeft: 20
  },

  button:{
    marginTop: 30,
    width: 130,
    height: 40,
    justifyContent: 'center',
    backgroundColor: themeColor
  },

  mainContainer:{
    flex:1,
    flexDirection:'column',
    alignItems:'center',
    marginTop:50

  },

  logoContainer:{
    width:350, 
    height:105,
    flexDirection:'row',
    justifyContent:'center',
    // backgroundColor:'yellow'
    
  },

  formStyle:{
    width:'90%',
    padding:10,
    marginTop:30
  },

  buttonContainer:{
    marginTop:30,
    flexDirection: 'column',
    alignItems: 'center',
  }
});

export default Login;