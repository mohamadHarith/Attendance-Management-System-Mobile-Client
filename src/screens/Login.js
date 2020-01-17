import React from 'react';
import { 
   Container, 
  Header, 
  Content, 
  Form, 
  Item, 
  Input, 
  Label,
  Body,
  Title,
  Button,
  Text
} from 'native-base';

import {StyleSheet,
  View,
  ToastAndroid
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {url} from '../server';


class Login extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      studentID: '',
      password: ''
    }
  }

  handleLogin = ()=>{
    // fetch('http://192.168.1.3:5000/')
    // .then(response=>console.log(response))
    // .catch(err=>console.log(err));
    //this.props.navigation.navigate('main');
    //this.props.navigation.navigate('authUser');

    fetch(`${url}/students/authStudent`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        studentID: this.state.studentID,
        password: this.state.password
      })
    }).then((res)=>{
      if(res.status == 200){
        res.json().then(async (data)=>{
          await AsyncStorage.setItem('studentID', data[0].Student_ID);
          await AsyncStorage.setItem('studentName', data[0].Student_Name);
          this.props.navigation.navigate('authUser');
        });
      }
      else{
        throw new Error('Invalid user');
      }
    }).catch((error)=>{
      ToastAndroid.showWithGravityAndOffset(
       error.message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    })
  }

 async componentDidMount(){
    await AsyncStorage.removeItem('studentID');
    await AsyncStorage.removeItem('studentName');
  }
  
  render(){
    console.log(this.state);
    
    return(
    <Container>
        <Header androidStatusBarColor="#D9220E" style={styles.header}>
          <Body>
            <Title style={styles.headerTitle}>MMU Attendance</Title>
          </Body>
        </Header>        
        <Content>
          <View style={styles.mainContainer}>
          <Form>
              <Item floatingLabel>
                <Label>Student ID</Label>
                <Input selectionColor={'#D9220E'} keyboardType='number-pad' returnKeyType='next' onChangeText={(text)=>{
                  this.setState({studentID: text})
                }}/>
              </Item>
               <Item floatingLabel>
                <Label>Password</Label>
                <Input secureTextEntry={true} selectionColor = {'#D9220E'} returnKeyType='done' onChangeText={(text)=>{
                  this.setState({password:text})
                }}/>
              </Item>
              <View style={styles.buttonContainer}>
                  <Button style={styles.button} onPress={()=>{this.handleLogin()}}>
                     <Text>Log In</Text>
                 </Button>
              </View>
            </Form> 
          </View>       
        </Content>       
      </Container>
  );
  }
}



const styles = StyleSheet.create({

  header:{
    backgroundColor:'#D9220E'
  },
  
  headerTitle:{
    paddingLeft: 20
  },

  button:{
    marginTop: 30,
    width: 130,
    height: 40,
    justifyContent: 'center',
    backgroundColor: '#D9220E'
  },

  mainContainer:{
    // flexDirection: 'row',
    // alignItems: 'center',
    width: '100%',
    height: '100%',
    // backgroundColor: '#D9220E',
    padding: 20,
    marginTop: 150 

  },

  buttonContainer:{
    flexDirection: 'column',
    alignItems: 'center',
    
  }


});

export default Login;