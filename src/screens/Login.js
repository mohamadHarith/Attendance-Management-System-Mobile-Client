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
  
} from 'react-native';


class Login extends React.Component {
  
  constructor(props){
    super(props);
  }

  handleLogin = ()=>{
    // fetch('http://192.168.1.3:5000/')
    // .then(response=>console.log(response))
    // .catch(err=>console.log(err));
    this.props.navigation.navigate('main');
    //this.props.navigation.navigate('authUser');
  }
  
  render(){
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
                <Input selectionColor={'#D9220E'} keyboardType='number-pad' returnKeyType='next'/>
              </Item>
               <Item floatingLabel>
                <Label>Password</Label>
                <Input secureTextEntry={true} selectionColor = {'#D9220E'} returnKeyType='done' />
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