import React from 'react';
import {StyleSheet, View, ToastAndroid, FlatList, TouchableNativeFeedback, Text as NativeText} from 'react-native';
import {Container, Header, Left, Right, Body, Button, Title, Text, Card, CardItem, Icon} from 'native-base';
import {themeColor, success, fail} from '../colorConstants';
import {url} from '../server';
import LoadingIndicator from '../components/LoadingIndicator';

//mock state data for unit test
// { 
//     studentID: '1151101633',
//   classID: 12,
//   classData:
//    { Class_ID: 12,     
//      Type: 'Meeting',  
//      Section: 'MT06',  
//      Subject_ID: 'TPT3101',
//      Subject_Name: 'Demo To Mr Ban',
//      numberOfClassSessions: '1',
//      numberOfClassSessionsAttended: '1',
//      attendancePercentage: 100 },
//   attendanceData:      
//    [ { Class_ID: 12,   
//        Class_Session_ID: 10,
//        Class_Session_Date: '17 Jan 2020',
//        Class_Session_Start_Time: '12:00am',
//        Class_Session_End_Time: '11:59pm',
//        Venue_ID: 'BR4004',
//        Attendance_ID: 36,
//        Attendance_Status: 'Present',
//        Week: 9,        
//        Day: 'Friday' } 
//    ],
//    isDataLoaded: true,  
//    flatListRefresh: false 
// }

class AttendancePercentage extends React.Component{
    
    _isMounted = false;
    
    constructor(props){
        super(props);
        this.state={
            studentID: this.props.navigation.getParam('studentID'),
            classID: this.props.navigation.getParam('classID'),
            classData: this.props.navigation.getParam('classData'),
            attendanceData:[],
            isDataLoaded: false,
            flatListRefresh:false
        }
    }

    fetchData = ()=>{
        fetch(`${url}/students/getAttendanceDetails/${this.state.classID}/${this.state.studentID}`,{
        }).then((res)=>{
            if(res.status == 200){
                res.json().then((data)=>{
                    if(this._isMounted){
                        this.setState({attendanceData:data, isDataLoaded:true, flatListRefresh:false});
                    }
                })
            }
            else{
                throw new Error('Attendance details data not available');
            }
        }).catch((error)=>{
            if(this._isMounted){
                ToastAndroid.showWithGravityAndOffset(
                    error.message,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
                this.props.navigation.pop();
            }
           
        })
        setTimeout(()=>{
            if(!this.state.isDataLoaded){
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
    
    componentDidMount(){
        this._isMounted = true;
        this.fetchData();
    }

    componentWillUnmount() {
        this._isMounted = false;
      }
      
    render(){
        return(
            <Container>
                <Header style={styles.header} androidStatusBarColor={themeColor}>
                    <Left style={{flex:1}}>
                        <Button transparent onPress={()=>{this.props.navigation.pop()}}>
                            <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body style={{flex:3}}>
                        <Title>Attendance Details</Title>
                    </Body>
                    <Right style={{flex:1}}></Right>
                </Header>
                <View style={styles.mainContainer}>
                   {this.state.isDataLoaded?(
                    <View style={styles.attendanceData}>
                        <FlatList
                            data={this.state.attendanceData}
                            onRefresh = {()=>{
                               if(this._isMounted){
                                this.setState({flatListRefresh:true});
                                this.fetchData();
                               }
                            }}
                            ListHeaderComponent={()=>{
                                return(
                                    <View style={styles.classDetails}>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>
                                            {`${this.state.classData.Subject_ID} ${this.state.classData.Subject_Name}`}
                                        </Text>
                                        <Text style={{color:'grey', fontSize:15}}>
                                            {`${this.state.classData.Type} - ${this.state.classData.Section}`}
                                        </Text>
                                        <Text style={{color:'grey', fontSize:15}}>
                                            {`${this.state.classData.numberOfClassSessionsAttended} of ${this.state.classData.numberOfClassSessions} class sessions attended`}
                                        </Text>   
                                    </View>
                                );
                            }}
                            refreshing={this.state.flatListRefresh}
                            ListEmptyComponent={()=>{
                                <NativeText>No attendance detail data found. Pull to refresh.</NativeText>
                            }}
                            renderItem={({item,index})=>{
                                return(
                                    <TouchableNativeFeedback useForeground>
                                        <Card>
                                        <CardItem style={{paddingBottom:0}}>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>{`Week ${item.Week}`}</Text>
                                        </CardItem>
                                        <CardItem style={styles.cardBody}>
                                            <View style={styles.classSessionDetails}>
                                                <Text style={{color:'grey', fontSize:15}}>{item.Day}</Text>
                                                <Text style={{color:'grey', fontSize:15}}>{item.Class_Session_Date}</Text> 
                                                <Text style={{color:'grey', fontSize:15}}>{`${item.Class_Session_Start_Time} - ${item.Class_Session_End_Time}`}</Text>  
                                                <Text style={{color:'grey', fontSize:15}}>{item.Venue_ID}</Text>                                          
                                            </View>  
                                            <View style={styles.attendancePercentage}>
                                                <Text style={{textAlign:'right', fontSize: 20, color: item.Attendance_Status == 'Absent' ? fail : success}}>
                                                    {item.Attendance_Status}
                                                </Text>
                                            </View>                                      
                                        </CardItem>
                                    </Card>
                                    </TouchableNativeFeedback>
                                );
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />  
                    </View>
                   ):(
                       <LoadingIndicator/>
                   )}
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
    classDetails:{
        padding:10,
        width:'95%'
    },
    attendanceData:{
        width:'95%',
        flex:1
    },
    cardBody:{
        paddingTop:0,
        padding:10,
    },
    classSessionDetails:{
        width:'50%'
    },
    detailItem:{
        flexDirection:'row',
        justifyContent:'flex-start'
    },
    attendancePercentage:{
        width:'50%',
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
    }
});

export default AttendancePercentage;