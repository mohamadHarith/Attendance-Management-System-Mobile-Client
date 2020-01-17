import React from 'react';
import {View, StyleSheet, Modal, TouchableWithoutFeedback, ActivityIndicator} from 'react-native';
import {Icon, Text, Button} from 'native-base';
import { RNCamera } from 'react-native-camera';
import {themeColor} from '../colorConstants';

const instructions = [
    'No face detected.',
    'Align your face to the center of the frame',
    'Face is too close. Please move back a little',
    'Face is too far. Please move in a little',
    'Face captured',
    'Recognizing face...'
]

class EnrolFaceModal extends React.Component {
    constructor(props){
        super(props);
        this.state= {
            visible: false,
            id: this.props.navigation.getParam('id'),
            isSingleFaceDetected: false,
            isPictureTaken: false,
            boundingBox: {},
            isFaceAligned:false,
            progressIndicator: instructions[0],
        }
    }

    // componentDidUpdate(prevProps){
    //     if(this.props.visible != prevProps.visible){
    //         this.setState({visible: this.props.visible, id:this.props.id, isSingleFaceDetected:false, isPictureTaken:false});
    //     }
    // }

    handleClose=()=>{
        // const handleModalClose = this.props.hide;
        // handleModalClose();
        this.props.navigation.navigate('enrolFace');
    }

    handleFaceDetection = async (data)=>{
        if(data.faces.length === 1 && !this.state.isPictureTaken){
            this.setState({isSingleFaceDetected: true});
            this.setState({boundingBox: data.faces[0].bounds}, async ()=>{              
                                
                const canvasCenter = {
                    x: 120,
                    y: 120
                }
                 const boundingBoxCenter = {
                    x: (this.state.boundingBox.origin.x + this.state.boundingBox.size.width/2),
                    y: (this.state.boundingBox.origin.y + this.state.boundingBox.size.height/2)
                }
                
                const boundingBoxCenterDistance = Math.sqrt(
                    Math.pow((canvasCenter.x - boundingBoxCenter.x), 2) 
                    + Math.pow((canvasCenter.y - boundingBoxCenter.y), 2)
                );                
                const boundingBoxAreaPercentage = (this.state.boundingBox.size.width*this.state.boundingBox.size.height)/(240*240);

                //thresholds
                const maxDistanceThreshold = 5;
                const minAreaThreshold = 0.3;
                const maxAreaThreshold = 0.4;

                if(boundingBoxCenterDistance < maxDistanceThreshold
                     && boundingBoxAreaPercentage > minAreaThreshold 
                     && boundingBoxAreaPercentage < maxAreaThreshold){
                        this.setState({isFaceAligned: true});
                        if(!this.state.isPictureTaken && this.state.isSingleFaceDetected && this.state.isFaceAligned){
                            this.setState({isPictureTaken:true, progressIndicator:instructions[4]}, async ()=>{
                              const options = { quality: 1, base64: true, pauseAfterCapture: true, width: 600, mirrorImage: true};
                              const data = await this.camera.takePictureAsync(options);
                              //console.log('Cache path: ', data.uri); 
                            //   const setUri = this.props.setUri;
                            //   setUri(this.state.id, data.uri);  
                              //this.handleClose();  
                              this.props.navigation.state.params.setUri(this.state.id, data.uri);  
                              this.handleClose();  
                            });
                          }
                }
                else if(boundingBoxAreaPercentage> maxAreaThreshold){this.setState({progressIndicator:instructions[2], isFaceAligned: false})}
                else if(boundingBoxAreaPercentage< minAreaThreshold){this.setState({progressIndicator:instructions[3], isFaceAligned: false})} 
                else if(boundingBoxCenterDistance> maxDistanceThreshold){this.setState({progressIndicator:instructions[1], isFaceAligned: false})}             
                else{
                    this.setState({isFaceAligned: false, progressIndicator:instructions[0]});
                }
            });        
        }
        else if(!this.state.isPictureTaken){
            this.setState({isSingleFaceDetected: false, isFaceAligned: false, progressIndicator:instructions[0]});
        } 
      }


    render(){
        let instruction;
        switch(this.state.id){
            case 1: 
                instruction = 'Position your phone parallel to your face.';
                break;
            case 2: 
                instruction = 'Position your phone at an angle below your phone.';
                break;
            case 3: 
                instruction = 'Position your phone slightly to the right or left of your face';
                break;
        }

        return(
            
                <View style={styles.mainContainer}>
                   <TouchableWithoutFeedback onPress={()=>{this.handleClose()}}>
                        <View style={styles.closeModal}>
                            <Text style={{color:'grey', fontSize: 20}}>X</Text>
                        </View>
                   </TouchableWithoutFeedback>
                    <View style={styles.textContainer}>
                        <Text style={{fontFamily:'Roboto', color:'grey', textAlign:'center'}}>{instruction}</Text>
                    </View>
                    <View style={styles.cameraSuperContainer}>
                        <View style={{...styles.cameraContainer, borderColor: this.state.isSingleFaceDetected ? '#90ee90' : 'red'}}>
                            <RNCamera
                                ref={ref => {
                                    this.camera = ref;
                                }}
                                style={styles.preview}
                                type={RNCamera.Constants.Type.front}
                                flashMode={RNCamera.Constants.FlashMode.off}
                                captureAudio = {false}
                                androidCameraPermissionOptions={{
                                    title: 'Permission to use camera',
                                    message: 'We need your permission to use your camera',
                                    buttonPositive: 'Ok',
                                    buttonNegative: 'Cancel',
                                }}
                                faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
                                onFacesDetected={(data)=>{this.handleFaceDetection(data)}}
                            >
                                <View style={styles.canvasCenter}></View>
                                {this.state.isSingleFaceDetected?(
                                        <View>
                                            <View 
                                                style={{
                                                    ...styles.boundingBox, 
                                                    marginTop: this.state.boundingBox.origin.y,
                                                    marginLeft: this.state.boundingBox.origin.x,
                                                    width: this.state.boundingBox.size.width,
                                                    height: this.state.boundingBox.size.height
                                                    }}
                                            >
                                                <View 
                                                    style={{
                                                        ...styles.boundingBoxCenter,
                                                        marginTop: this.state.boundingBox.size.height/2,
                                                        marginLeft: this.state.boundingBox.size.width/2
                                                        }}
                                                >
                                                </View>
                                            </View>
                                        </View>
                                    ):(
                                        <></>
                                    )}
                            </RNCamera>
                        </View>
                    </View>
                    <View style={styles.activityIndicator}>
                        <ActivityIndicator size='large' color={themeColor}/>
                        <Text style={{color:'grey', marginLeft:10}}>{this.state.progressIndicator}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={{fontFamily:'Roboto', color:'grey', textAlign:'center', fontStyle:'italic'}}>
                            {`Selfie ${this.state.id} of 3`}
                        </Text>
                    </View>
                </View>
         
        );
    }
}

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    closeModal:{
        padding: 10,
        paddingRight: 20,
        height: 50,
        width:'100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    textContainer:{
        width:'80%',
        marginTop: 50,
        // backgroundColor: 'yellow'
    },
    cameraSuperContainer:{
        width: '100%',
        marginVertical: 50,
        flexDirection:'row',
        justifyContent: 'center',
        // backgroundColor: 'red'
    },
    cameraContainer:{
        flexDirection:'row',
        justifyContent: 'center',
        height: 240,
        width: 240,
        borderRadius: 120,
        borderWidth:10,
        overflow:'hidden'
    },
    preview:{
        height: 240,
        width: 240
    },

    boundingBox:{
        borderColor: 'blue',
        borderWidth: 2,
        position:'absolute'
    },
    canvasCenter:{
        width:10,
        height:10,
        borderRadius:5,
        backgroundColor:'black',
        marginTop:120,
        marginLeft:120,
        position:'absolute'
    },
    boundingBoxCenter:{
        width:10,
        height:10,
        borderRadius:5,
        borderWidth: 1,
        borderColor:'black',
        position:'absolute'
    },
    activityIndicator:{
        marginTop:40,
        width: '90%',
        flexDirection: 'row',
        justifyContent:'center'
    }
});

export default EnrolFaceModal;