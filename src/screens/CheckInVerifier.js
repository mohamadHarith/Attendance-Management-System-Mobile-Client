import React from 'react';
import {StyleSheet, View, ToastAndroid} from 'react-native';
import {Container, Header, Left, Right, Body, Button, Title, Text, Card, CardItem, Icon} from 'native-base';
import ScanBeacon from './ScanBeacon';
import ScanFace from './ScanFace';
import {themeColor, fail, success} from '../colorConstants';
import {url} from '../server';
import LoadingIndicator from '../components/LoadingIndicator'

//mock state data for unit test
// { studentID: '1151101633',
// classSession:        
//{
//     Class_Session_ID: 11,
//     Class_ID: 12,
//     Start_Time: "12:00am",
//     End_Time: "11:59pm",
//     Subject_Name: "Demo To Mr Ban",
//     Type: "Meeting",
//     Section: "MT06",
//     Venue_ID: "CQCR3004",
//     Venue_Name: "FCI CLASSROOM",
//     attendancePercenatage: {
//     numberOfClassSessionsAttended: "0",
//     numberOfTotalClassSessions: "2",
//     percentage: 0
//}
// isScanBeacon: false, 
// isScanFace: true,    
// isBeaconDetected: true,
// isPermissionGranted: true,
// attendanceSetSuccessfully: false }



class CheckInVerifier extends React.Component{
    
    _isMounted = false;
    
    constructor(props){
        super(props);
        this.state={
            studentID: this.props.navigation.getParam('studentID'),
            classSession: this.props.navigation.getParam('classSession'),
            isScanBeacon: false,
            isScanFace: false,
            isBeaconDetected: false,
            isPermissionGranted: false,
            attendanceSetSuccessfully: false
        }
    }

    componentDidMount(){
        this._isMounted = true;

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
                    if(data.permission == true && this._isMounted){
                        this.setState({isScanBeacon:true, isPermissionGranted: true});
                    }
                    else if(data.permission == false && this._isMounted){
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
           if(this._isMounted){
                this.props.navigation.pop();
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
            if(!this.state.isPermissionGranted){
               if(this._isMounted){
                    ToastAndroid.showWithGravityAndOffset(
                        'Network request timeout',
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50,
                    );
                    this.props.navigation.pop();
               }  
            }
        }, 5000)

    }

    handleScanBeacon = (isBeaconDetected)=>{
        if(isBeaconDetected){
           if(this._isMounted){
            this.setState({isBeaconDetected: isBeaconDetected, isScanBeacon: false, isScanFace:true});
           }
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
           if(this._isMounted){
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
                            if(data.querySuccessful && this._isMounted){
                               
                                    this.setState({attendanceSetSuccessfully:true});
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
                    if(this._isMounted){
                        this.props.navigation.pop();
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
                    if(!this.state.attendanceSetSuccessfully){
                       if(this._isMounted){
                            ToastAndroid.showWithGravityAndOffset(
                                'Network request timeout',
                                ToastAndroid.LONG,
                                ToastAndroid.BOTTOM,
                                25,
                                50,
                            );
                            this.props.navigation.pop();
                       }
                    }
                }, 5000)
           }
        }
        else{
            if(this._isMounted){
                this.props.navigation.pop();
            }
        }

    }

   componentWillUnmount(){
        this._isMounted = false;
   }
    
    render(){        
        return(          
            <Container>
                <Header style={styles.header} androidStatusBarColor={themeColor} hasTabs>
                    <Left>
                        <Button transparent onPress={()=>{this.props.navigation.pop()}}>
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
                            <CardItem style={{paddingBottom:0}}>
                                <Text style={{fontSize:18, fontWeight: 'bold'}}>{this.state.classSession.Subject_Name}</Text>
                             </CardItem>
                             <CardItem style={styles.cardBody}>
                                <View style={styles.classSessionDetails}>
                                    <View style={styles.detailItem}>
                                        <Icon name='book' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                        <Text style={{color:'grey', fontSize:15}}>
                                             {`${this.state.classSession.Type} - ${this.state.classSession.Section}`}
                                        </Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Icon name='time' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                         <Text style={{color:'grey', fontSize:15}}>
                                               {`${this.state.classSession.Start_Time} - ${this.state.classSession.End_Time}`}
                                           </Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                         <Icon name='locate' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                          <Text style={{color:'grey', fontSize:15}}>
                                                 {`${this.state.classSession.Venue_Name} - ${this.state.classSession.Venue_ID}`}
                                           </Text> 
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Icon name='pie' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                         <Text style={{color:'grey', fontSize:15}}>
                                                {`${this.state.classSession.attendancePercenatage.numberOfClassSessionsAttended} of ${this.state.classSession.attendancePercenatage.numberOfTotalClassSessions} class sessions attended`}
                                          </Text>
                                    </View>
                                </View>
                                <View style={styles.attendancePercentage}>
                                         <Text style={{textAlign:'center', fontSize: 30, fontWeight:'bold', color:this.state.classSession.percentage > 0 ? success : fail}}>
                                             {`${this.state.classSession.attendancePercenatage.percentage} %`}
                                        </Text>
                                </View>                                      
                             </CardItem>
                        </Card>
                    </View>
                    {
                        (this.state.isScanBeacon && !this.state.isBeaconDetected)? (
                            <ScanBeacon 
                                studentID={this.state.studentID} 
                                venueID={this.state.classSession.Venue_ID} 
                                handleScanBeacon={this.handleScanBeacon}
                                navigation={this.props.navigation}
                            />
                        ):(
                            <></>
                        )
                    }
                    {
                        (this.state.isScanFace && this.state.isBeaconDetected)? (
                            <ScanFace 
                                studentID={this.state.studentID} 
                                handleScanFace={this.handleScanFace}
                            />
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
        alignItems: 'center'
    },
    stepNumber:{
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'center',
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
        width:'97%'
    },
    cardBody:{
        paddingTop:0,
        padding:10
    },
    classSessionDetails:{
        flex:3
    },
    detailItem:{
        flexDirection:'row',
        justifyContent:'flex-start'
    },
    attendancePercentage:{
        flex:1
    },
    beaconScanningIndicator:{
        width:'90%',
        flexDirection:'column',
        alignItems:'center',
        marginTop: 40
    },
    beaconImage:{
        width: 250,
        height: 250
    },
    activityIndicator:{
        marginTop:40,
        width: '90%',
        flexDirection: 'row',
        justifyContent:'center'
    }
});

export default CheckInVerifier;