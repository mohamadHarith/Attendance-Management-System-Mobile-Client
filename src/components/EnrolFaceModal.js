import React from 'react';
import {View, StyleSheet,TouchableWithoutFeedback, ActivityIndicator, Text as NativeText} from 'react-native';
import {Text} from 'native-base';
import { RNCamera } from 'react-native-camera';
import {themeColor, success2, fail} from '../colorConstants';

const instructions = [
    'No face detected.',
    'Align your face to the center of the frame',
    'Face is too close. Please move back a little',
    'Face is too far. Please move in a little',
    'Face captured',
    'Recognizing face...'
]

class EnrolFaceModal extends React.Component {
    
    _isMounted = false;
    
    constructor(props){
        super(props);
        this.state= {
            id: this.props.navigation.getParam('id'),
            isSingleFaceDetected: false,
            isPictureTaken: false,
            boundingBox: {},
            isFaceAligned:false,
            progressIndicator: instructions[0],
        }
    }

    handleClose=()=>{
        this.props.navigation.navigate('enrolFace');
    }

    handleFaceDetection = async (data)=>{
        if(data.faces.length === 1 && !this.state.isPictureTaken && this._isMounted){
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
                //face is aligned to the center of the frame and the face is not too close or to far away from the frame
                if(boundingBoxCenterDistance < maxDistanceThreshold
                     && boundingBoxAreaPercentage > minAreaThreshold 
                     && boundingBoxAreaPercentage < maxAreaThreshold){
                        this.setState({isFaceAligned: true});
                        if(!this.state.isPictureTaken && this.state.isSingleFaceDetected && this.state.isFaceAligned){
                            this.setState({isPictureTaken:true, progressIndicator:instructions[4]}, async ()=>{
                              const options = { quality: 1, base64: true, pauseAfterCapture: true, width: 600, mirrorImage: true};
                              const data = await this.camera.takePictureAsync(options);//capture image 
                              this.props.navigation.state.params.setUri(this.state.id, data.base64);  
                              this.handleClose();  
                            });
                          }
                }
                //face is too close to the frame
                else if(boundingBoxAreaPercentage> maxAreaThreshold){this.setState({progressIndicator:instructions[2], isFaceAligned: false})}
                //face is too far away from the from
                else if(boundingBoxAreaPercentage< minAreaThreshold){this.setState({progressIndicator:instructions[3], isFaceAligned: false})} 
                //face is not alligned to the center of the frame
                else if(boundingBoxCenterDistance> maxDistanceThreshold){this.setState({progressIndicator:instructions[1], isFaceAligned: false})}             
                else{
                    this.setState({isFaceAligned: false, progressIndicator:instructions[0]});
                }
            });        
        }
        else if(!this.state.isPictureTaken && this._isMounted){
            this.setState({isSingleFaceDetected: false, isFaceAligned: false, progressIndicator:instructions[0]});
        } 
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
                   <TouchableWithoutFeedback onPress={()=>{this.handleClose()}}>
                        <View style={styles.closeModal}>
                            <Text style={{color:'grey', fontSize: 20}}>X</Text>
                        </View>
                   </TouchableWithoutFeedback>
                    <View style={styles.textContainer}>
                        <Text style={{fontFamily:'Roboto', color:'grey', textAlign:'center'}}>
                            Position your phone parallel to your face. Please make sure the background is not too bright or messy and your forehead and eyes are visible.
                        </Text>
                    </View>
                    <View style={styles.cameraSuperContainer}>
                        <View style={{...styles.cameraContainer, borderColor: this.state.isSingleFaceDetected ? success2 : fail}}>
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
                        <NativeText style={{color:'grey', marginLeft:10}}>{this.state.progressIndicator}</NativeText>
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