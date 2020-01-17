import React, { Component } from 'react';
import {StyleSheet, View, TouchableNativeFeedback, Image, ToastAndroid} from 'react-native';
import { Container, Header, Body, Title, Button, Text, Icon} from 'native-base';
import EnrolFaceModal from '../components/EnrolFaceModal';
import LoadingIndicator from '../components/LoadingIndicator';
import {themeColor} from '../colorConstants';
import AsyncStorage from '@react-native-community/async-storage';
import {url} from '../server';

export default class EnrolFace extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      clickedPictureID: 0,
      showModal : false,
      picture01uri: '',
      picture02uri: '',
      picture03uri: '',
      isThreePictures: false,
      isLoading: false,
      studentID: ''
    }
  }

  setModalVisible = (id)=>{
    //this.setState({showModal:true, clickedPictureID:id});
    this.props.navigation.navigate('enrolFaceModal', {
      id:id,
      setUri: this.setUri
    })
  }

  handleModalClose=()=>{
    this.setState({showModal:false});
  }

  setUri=(pictureID, uri)=>{
    	this.setState({
        [`picture0${pictureID}uri`]: uri
      }, ()=>{
        console.log(this.state);
        if(this.state.picture01uri.length > 0 && this.state.picture02uri.length > 0 && this.state.picture03uri.length > 0){
          
          this.setState({isThreePictures: true}, ()=>{console.log('all three pictures are taken');});
        }
      });
  }

  uploadPictures=()=>{
    this.setState({isLoading: true});    
    if(this.state.isThreePictures){
      console.log('upload button clicked');
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
          if(res.status == 200){
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
            this.setState({isLoading:false});
            throw new Error('Could not enrol face');
            
          }
      })
      .catch((error)=>{
        this.setState({isLoading:false});
        console.log(error);
        ToastAndroid.showWithGravityAndOffset(
              error.message,
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50,
          );
      });
    }
  }

  async componentDidMount(){
    const studentID = await AsyncStorage.getItem('studentID');
    this.setState({studentID: studentID})
  }

  render() {
    console.log(this.state);
    
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
          </View>

        {/* <EnrolFaceModal visible={this.state.showModal} id={this.state.clickedPictureID} hide={this.handleModalClose} setUri={this.setUri}></EnrolFaceModal> */}
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