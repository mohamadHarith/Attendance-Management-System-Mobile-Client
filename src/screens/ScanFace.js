import React from 'react';
import {Text, StyleSheet, View, ActivityIndicator, Vibration, ToastAndroid} from 'react-native';
import { RNCamera } from 'react-native-camera';
import {themeColor, fail, success2} from '../colorConstants'
import {url} from '../server';

const instructions = [
    'No face detected.',
    'Align your face to the center of the frame',
    'Face is too close. Please move back a little',
    'Face is too far. Please move in a little',
    'Face captured',
    'Recognizing face...',
    'Face recocgnized. Updating attendance...',
    'Multiple face detected. Make sure only one face is present.'
]

const PATTERN = [0, 100, 100, 100];

class ScanFace extends React.Component{
    
    _isMounted = false;
    
    constructor(props){
        super(props);
        this.state = {
            studentID: this.props.studentID, 
            isSingleFaceDetected:false,
            boundingBox: {},
            isFaceAligned:false,
            progressIndicator: instructions[0],
            isPictureTaken: false
        }   
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
                        const options = { quality: 1, base64: true, pauseAfterCapture: true, width: 600, mirrorImage: true};
                        if(!this.state.isPictureTaken && this.state.isSingleFaceDetected && this.state.isFaceAligned){                            
                            await this.setState({isPictureTaken: true, progressIndicator:instructions[4]}, async ()=>{
                                const data = await this.camera.takePictureAsync(options);
                                this.handleScanFace(data.uri);
                                this.setState({progressIndicator:instructions[5]});
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
        else if(!this.state.isPictureTaken && data.faces.length > 1){
            this.setState({isSingleFaceDetected: false, isFaceAligned: false, progressIndicator:instructions[7]});
        }
      }

    handleScanFace = async(uri)=>{
        const formData = new FormData();
        formData.append('studentID', this.state.studentID);
        formData.append('scanFaceImage', {
            name: 'image01.jpg',
            uri: uri,
            type: 'image/jpeg'
        });
        fetch(`${url}/students/scanFace`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data' 
            }
          })
          .then((res)=>{
              if(res.status == 200){
                res.json().then((data)=>{
                    //face recognized
                    if(data.didFaceMatch && this._isMounted){
                        this.setState({progressIndicator:instructions[6]});
                        Vibration.vibrate(PATTERN);
                        this.props.handleScanFace(true);
                    }
                    else if(!data.didFaceMatch && this._isMounted){
                        this.props.handleScanFace(false);
                        ToastAndroid.showWithGravityAndOffset(
                            'Face could not be recognized',
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            25,
                            50,
                          );
                    }
                })
              }
              else{
                throw new Error('Something went wrong. Please try again.')
              }
          })
          .catch((error)=>{
                this.props.handleScanFace(false);
                ToastAndroid.showWithGravityAndOffset(
                  error.message,
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM,
                  25,
                  50,
              );
          })
        
    }

    componentDidMount(){
        this._isMounted = true;
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    render(){
        return(
            <View style={styles.mainContainer}>
                <View style={{...styles.cameraContainer, borderColor: this.state.isPictureTaken ? success2 : fail}}>
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
                <View style={styles.activityIndicator}>
                    <ActivityIndicator size='large' color={themeColor}/>
                    <Text style={{color:'grey', marginLeft:10}}>{this.state.progressIndicator}</Text>
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    mainContainer:{
        marginTop:40,
        flexDirection:'column',
        alignItems:'center',
        width:'100%'
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
        width: 240,
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
})

export default ScanFace;