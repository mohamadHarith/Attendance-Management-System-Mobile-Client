import React, { Component } from 'react';
import {StyleSheet, View, TouchableNativeFeedback, Image, ToastAndroid} from 'react-native';
import { Container, Header, Body, Title, Button, Text, Icon} from 'native-base';
import LoadingIndicator from '../components/LoadingIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import RNFS from 'react-native-fs'
import {themeColor} from '../colorConstants';
import {url} from '../server';
import uuidv1 from 'uuid/v1';

console.ignoredYellowBox = ['Setting a timer'];

export default class EnrolFace extends Component {
  
  _isMounted = false;

  constructor(props){
    super(props);
    this.state = {
      picture01uri: '',
      picture02uri: '',
      picture03uri: '',
      isThreePictures: false,
      isLoading: false,
      studentID: ''
    }
  }

  setModalVisible = (id)=>{
    this.props.navigation.navigate('enrolFaceModal', {
      id:id,
      setUri: this.setUri
    })
  }

  setUri=async(pictureID, base64Data)=>{
      
    const imagePath = `file://${RNFS.DocumentDirectoryPath}/${uuidv1()}.jpg`;
    
    if(await RNFS.exists(this.state[`picture0${pictureID}uri`])){
      await RNFS.unlink(this.state[`picture0${pictureID}uri`])
    }

    await RNFS.writeFile(imagePath, base64Data, 'base64');
    //console.log('from seturi',await RNFS.readdir(RNFS.DocumentDirectoryPath));

    if(this._isMounted){
      this.setState({
        [`picture0${pictureID}uri`]: imagePath
      }, ()=>{
        //console.log(this.state);
        if(this.state.picture01uri.length > 0 
          && this.state.picture02uri.length > 0 
          && this.state.picture03uri.length > 0
        ){  
          this.setState({isThreePictures: true});
        }
      });
    }
  }

  uploadPictures=async ()=>{
    try{  
      if(this.state.isThreePictures 
        && await RNFS.exists(this.state.picture01uri)
        && await RNFS.exists(this.state.picture02uri)
        && await RNFS.exists(this.state.picture03uri)
        && this._isMounted
      ){
        this.setState({isLoading: true}); 
        const formData = new FormData();
        formData.append('studentID', this.state.studentID);
        formData.append('picture01', {
            name: 'image01.jpg',
            uri: this.state.picture01uri,
            type: 'image/jpeg'
        });
        formData.append('picture02', {
            name: 'image02.jpg',
            uri: this.state.picture02uri,
            type: 'image/jpeg'
        });
        formData.append('picture03', {
            name: 'image03.jpg',
            uri: this.state.picture03uri,
            type: 'image/jpeg'
        });
     
        fetch(`${url}/students/enrolFace`, {
          method: 'POST',
          body: formData,
          headers: {
              'Content-Type': 'multipart/form-data' 
          }
        })
        .then((res)=>{
            if(res.status == 200 && this._isMounted){
              this.setState({isLoading: false});
              this.props.navigation.navigate('main', {studentID: this.state.studentID});
              ToastAndroid.showWithGravityAndOffset(
                'Face enroled successfully!',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
              );
            }
            else{
              throw new Error('Could not enrol face, please try again');
            }
        })
        .catch((error)=>{
          if(this._isMounted){
            this.setState({isLoading:false, picture01uri:'', picture02uri:'', picture03uri:'', isThreePictures:false});
            ToastAndroid.showWithGravityAndOffset(
                  error.message,
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM,
                  25,
                  50,
              );
          }
        });
        setTimeout(()=>{
            if(this.state.isLoading){
              if(this._isMounted){
                    ToastAndroid.showWithGravityAndOffset(
                        'Network request timeout. Please try again.',
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50,
                    );
                    this.props.navigation.navigate('logIn');
              }
                
            }
        }, 120000)
      }
      else{
        throw new Error('Something went wrong')
      }
    }catch(error){
      if(this._isMounted){
        this.setState({isLoading: false, picture01uri:'', picture02uri:'', picture03uri:'', isThreePictures:false});  
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
    const studentID = await AsyncStorage.getItem('studentID');
    if(this._isMounted){
      this.setState({studentID: studentID})
    }
  }

  async componentWillUnmount(){
    this._isMounted = false;
    if(await RNFS.exists(this.state.picture01uri)){
      await RNFS.unlink(this.state.picture01uri)
    }
    if(await RNFS.exists(this.state.picture02uri)){
      await RNFS.unlink(this.state.picture02uri)
    }
    if(await RNFS.exists(this.state.picture03uri)){
      await RNFS.unlink(this.state.picture03uri)
    }
  }

  render() {    
    
    if(!this.state.isLoading){
      return (
        <Container style={styles.main}>
          <Header androidStatusBarColor={themeColor} style={styles.header}>
          <Body>
          <Title style={styles.headerTitle}>Enrol Face</Title>
          </Body>
          </Header>
          <View style={styles.enrolFaceContainer}>
              <View style={styles.item}>
                <Text style={{textAlign:'center', color: 'grey'}}>Upload 3 selfies of yourself. Make sure only your face is present in the frame.</Text>
              </View>
              <View style={styles.imageBoxContainer}>
                    <TouchableNativeFeedback useForeground onPress={()=>{this.setModalVisible(1)}}>
                        <View style={styles.imageBox}>
                          {this.state.picture01uri.length>0 ? (
                              <Image style={{width:'100%', height:'100%'}} source={{uri: this.state.picture01uri}}></Image>
                          ):(
                            <Icon name='camera' style={{fontSize: 40, color:'grey'}} />
                          )}
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback useForeground onPress={()=>{this.setModalVisible(2)}}>
                        <View style={styles.imageBox}>
                          {this.state.picture02uri.length>0 ? (
                                <Image style={{width:'100%', height:'100%'}} source={{uri: this.state.picture02uri}}></Image>
                            ):(
                              <Icon name='camera' style={{fontSize: 40, color:'grey'}} />
                            )}
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback useForeground onPress={()=>{this.setModalVisible(3)}}>
                        <View style={styles.imageBox}>
                          {this.state.picture03uri.length>0 ? (
                                <Image style={{width:'100%', height:'100%'}} source={{uri: this.state.picture03uri}}></Image>
                            ):(
                              <Icon name='camera' style={{fontSize: 40, color:'grey'}} />
                            )}
                        </View>
                    </TouchableNativeFeedback>                               
              </View>
              <View style={styles.item}>
                  <Button 
                      disabled = {!this.state.isThreePictures}
                      style={{...styles.button, backgroundColor: this.state.isThreePictures? themeColor : 'grey'}} 
                      onPress={()=>{this.uploadPictures()}}>
                      <Text>Enrol</Text>
                  </Button>
              </View>
              <View style={styles.item}>
                  <TouchableNativeFeedback onPress={()=>{this.props.navigation.navigate('logIn')}}>
                              <Text style={{color:'grey'}}>Log Out</Text>
                  </TouchableNativeFeedback>
              </View>
          </View>
        </Container>
      );
    }
    else{
      return(
        <LoadingIndicator message='Enroling face. This may take a while...'/>
      );
    }
  }
}

const styles = StyleSheet.create({
  header:{
    backgroundColor: themeColor
  },

  headerTitle:{
    paddingLeft: 20
  },

  enrolFaceContainer:{
    flex:1,
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: '5%',
    paddingTop: 20,
  },

  item:{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginVertical: 50,

  },

  imageBoxContainer:{
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 50,
  },

  imageBox:{
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    width: 90,
    height: 90,
    borderColor: 'grey',
    borderWidth: 0.5,
    borderStyle: 'dotted'
  },

  button:{
    width: 130,
    height: 40,
    justifyContent: 'center'
  },

});