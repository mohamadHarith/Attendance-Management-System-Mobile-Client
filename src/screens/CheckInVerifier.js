import React from 'react';
import {StyleSheet, View, ToastAndroid} from 'react-native';
import {Container, Header, Left, Right, Body, Button, Title, Text, Card, CardItem, Icon} from 'native-base';
import ScanBeacon from './ScanBeacon';
import ScanFace from './ScanFace';
import {themeColor} from '../colorConstants';
import {url} from '../server';
import LoadingIndicator from '../components/LoadingIndicator'


class CheckInVerifier extends React.Component{
    constructor(props){
        super(props);
        this.state={
            studentID: this.props.navigation.getParam('studentID'),
            classSession: this.props.navigation.getParam('classSession'),
            isScanBeacon: false,
            isScanFace: false,
            isBeaconDetected: false,
            isPermissionGranted: false
        }
    }

    componentDidMount(){
        //get check in permission
        fetch(`${url}/students/checkInPermission`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                studentID: this.state.studentID,
                classSessionID: this.state.classSession.Class_Session_ID
            })
        }).then((res)=>{
            if(res.status == 200){
                res.json().then((data)=>{
                    if(data.permission == true){
                        this.setState({isScanBeacon:true, isPermissionGranted: true});
                    }
                    else if(data.permission == false){
                        this.props.navigation.pop();
                        ToastAndroid.showWithGravityAndOffset(
                            data.message,
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM,
                            25,
                            50,
                        );
                    }
                });
            }
            else{
                throw new Error('Something went wrong')
            }
        }).catch((error)=>{
            this.props.navigation.pop();
            ToastAndroid.showWithGravityAndOffset(
                error.message,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
            );
        })

    }

    handleScanBeacon = (isBeaconDetected)=>{
        if(isBeaconDetected){
            this.setState({isBeaconDetected: isBeaconDetected, isScanBeacon: false, isScanFace:true});
        }
        else{
            this.props.navigation.pop();
            ToastAndroid.showWithGravityAndOffset(
                'Beacon could not be detected',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
              );
        }
    }

    handleScanFace = (isFaceDetetcted)=>{
        if(isFaceDetetcted){
            //this.setState({isBeaconDetected: false, isScanBeacon: false, isScanFace:false});
            //update attendnance
            fetch(`${url}/students/setStudentAttendance`,{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    studentID: this.state.studentID,
                    classID: this.state.classSession.Class_ID,
                    classSessionID: this.state.classSession.Class_Session_ID,
                    attendanceStatus: "Present"
                })
            }).then((res)=>{
                if(res.status == 200){
                    res.json().then((data)=>{
                        if(data.querySuccessful){
                            this.props.navigation.pop();
                            ToastAndroid.showWithGravityAndOffset(
                                data.message,
                                ToastAndroid.LONG,
                                ToastAndroid.BOTTOM,
                                25,
                                50,
                            );
                        }
                    })
                }
                else{
                    throw new Error('Something went wrong.')
                }
            })
            .catch((error)=>{
                this.props.navigation.pop();
                ToastAndroid.showWithGravityAndOffset(
                    error.message,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
            })
        }
        else{
            this.props.navigation.pop();
        }
    }

   
    
    render(){
        
        
        return(
            
          
            <Container>
                <Header style={styles.header} androidStatusBarColor={themeColor} hasTabs>
                    <Left>
                        <Button transparent>
                        <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Check In</Title>
                    </Body>
                    <Right></Right>
                </Header>
                <View style={styles.mainContainer}>
                    
                    <View style={styles.stepNumber}>
                        <View style={{...styles.item, ...styles.itemNumber, backgroundColor: this.state.isScanBeacon? themeColor: 'grey'}}><Text style={{color:'white'}}>1</Text></View>
                        <View style={styles.item}><Text style={{color:'grey'}}>Scan Beacon</Text></View>
                        <View style={styles.item}><Icon name='arrow-forward' style={{color:'grey'}}/></View>
                        <View style={{...styles.item, ...styles.itemNumber, backgroundColor: this.state.isScanFace? themeColor: 'grey'}}><Text style={{color:'white'}}>2</Text></View>
                        <View style={styles.item}><Text style={{color:'grey'}}>Scan Face</Text></View>
                    </View>

                    <View style={styles.classSession}>
                        <Card>
                            <CardItem>
                                <Text style={{fontSize:18, fontWeight: 'bold'}}>{this.state.classSession.Subject_Name}</Text>
                             </CardItem>
                             <CardItem style={styles.cardBody}>
                                <View style={styles.classSessionDetails}>
                                    <Text style={{color:'grey'}}>{`${this.state.classSession.Type} - ${this.state.classSession.Section}`}</Text>
                                    <Text style={{color:'grey'}}>{`${this.state.classSession.Start_Time} - ${this.state.classSession.End_Time}`}</Text> 
                                    <Text style={{color:'grey'}}>{`${this.state.classSession.Venue_Name} - ${this.state.classSession.Venue_ID}`}</Text>
                                    <Text style={{color:'grey'}}></Text>
                                </View>
                                <View style={styles.attendancePercentage}>
                                    <Text style={{textAlign:'center', fontSize: 30, fontWeight:'bold', color:'red'}}></Text>
                                </View>                                      
                             </CardItem>
                        </Card>
                    </View>
                    {
                        (this.state.isScanBeacon && !this.state.isBeaconDetected && !this.state.isScanFace)? (
                            	<ScanBeacon studentID={this.state.studentID} venueID={this.state.classSession.Venue_ID} handleScanBeacon={this.handleScanBeacon} navigation={this.props.navigation}/>
                        ):(
                            <></>
                        )
                    }
                    {
                        (this.state.isScanFace && this.state.isBeaconDetected)? (
                            	<ScanFace studentID={this.state.studentID} handleScanFace={this.handleScanFace}/>
                        ):(
                            <></>
                           
                        )
                    }
                     {
                        (!this.state.isPermissionGranted)? (
                            	<LoadingIndicator message='Checking permissions...'/>
                        ):(
                            <></>
                           
                        )
                    }

                </View>
        </Container>
        );
    }
}

const styles = StyleSheet.create({
    header:{
        backgroundColor: themeColor
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        // backgroundColor: 'yellow'
    },
    stepNumber:{
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'center',
        // backgroundColor: 'red',
        padding: 10,
        marginTop: 15
    },
    item:{
        marginHorizontal: 10
    },
    itemNumber:{
        width: 30,
        height: 30,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    classSession:{
        width:'90%'
    },
    cardBody:{
        paddingTop:0,
        padding:10,
        // backgroundColor:'red'
    },
    classSessionDetails:{
        // backgroundColor:'blue',
        flex:3
    },
    attendancePercentage:{
        flex:1,
        // backgroundColor:'yellow'
    },
    beaconScanningIndicator:{
        width:'90%',
        flexDirection:'column',
        alignItems:'center',
        marginTop: 40
    },
    beaconImage:{
        width: 250,
        height: 250,
        // backgroundColor:'red'
    },
    activityIndicator:{
        marginTop:40,
        width: '90%',
        flexDirection: 'row',
        justifyContent:'center'
    }
});

export default CheckInVerifier;