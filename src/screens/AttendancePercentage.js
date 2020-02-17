import React from 'react';
import {StyleSheet, View, ToastAndroid, FlatList, TouchableNativeFeedback, Text as NativeText} from 'react-native';
import {Container, Header, Left, Right, Body, Button, Title, Text, Card, CardItem, Icon} from 'native-base';
import {themeColor, success, fail} from '../colorConstants';
import {url} from '../server';
import LoadingIndicator from '../components/LoadingIndicator';
import ProgressCircle from 'react-native-progress-circle';

//mock data for unit tests
// { studentID: '1151101633',
// attendanceData:      
//  [ { Class_ID: 3,    
//      Type: 'Lecture',
//      Section: 'TC02',
//      Subject_ID: 'TSE3251',
//      Subject_Name: 'SOFT. VERIFICATION & VALID.',
//      numberOfClassSessions: '2',
//      numberOfClassSessionsAttended: '0',
//      attendancePercentage: 0 },
//    { Class_ID: 11,   
//      Type: 'Tutorial',
//      Section: 'TT01',
//      Subject_ID: 'TSE3251',
//      Subject_Name: 'SOFT. VERIFICATION & VALID.',
//      numberOfClassSessions: '1',
//      numberOfClassSessionsAttended: '0',
//      attendancePercentage: 0 },
//    { Class_ID: 12,   
//      Type: 'Meeting',
//      Section: 'MT06',
//      Subject_ID: 'TPT3101',
//      Subject_Name: 'Demo To Mr Ban',
//      numberOfClassSessions: '1',
//      numberOfClassSessionsAttended: '1',
//      attendancePercentage: 100 } ],
// isDataLoaded: true,  
// flatListRefresh: false,
//}
class AttendancePercentage extends React.Component{
    
    _isMounted = false;
    
    constructor(props){
        super(props);
        this.state={
            studentID: this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().dangerouslyGetParent().getParam('studentID'),
            attendanceData:[],
            isDataLoaded: false,
            flatListRefresh: false
        }
    }

    fetchData= ()=>{
        fetch(`${url}/students/getStudentAttendanceData/${this.state.studentID}`).then((res)=>{
            if(res.status == 200){
                res.json().then((data)=>{
                    if(this._isMounted){
                        this.setState({attendanceData:data, isDataLoaded:true, flatListRefresh:false});
                    }
                })
            }
            else{
                throw new Error('Attendance overview data not available');
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
    
    handleClick = (index)=>{
        this.props.navigation.navigate('attendanceDetails', {
            studentID: this.state.studentID,
            classID: this.state.attendanceData[index].Class_ID,
            classData: this.state.attendanceData[index]
        })
    }

    componentDidMount(){
       this._isMounted = true;
        this.fetchData();
    }

    componentWillUnmount(){
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
                        <Title>Attendance Percentage</Title>
                    </Body>
                    <Right style={{flex:1}}></Right>
                </Header>
                <View style={styles.mainContainer}>
                       {this.state.isDataLoaded?(
                        <View style={styles.classSession}>
                        <FlatList
                            data={this.state.attendanceData}
                            onRefresh = {()=>{
                               if(this._isMounted){
                                this.setState({flatListRefresh:true});
                                this.fetchData();
                               }
                            }}
                           ListEmptyComponent={()=>{
                                <NativeText>No attendance data found. Pull to refresh.</NativeText>
                           }}
                            refreshing={this.state.flatListRefresh}
                            renderItem={({item,index})=>{
                                return(
                                         <TouchableNativeFeedback useForeground onPress={()=>{this.handleClick(index)}}>
                                        <Card>
                                        <CardItem style={{paddingBottom:0}}>
                                            <Text style={{fontSize:18, fontWeight: 'bold'}}>{`${item.Subject_ID} ${item.Subject_Name}`}</Text>
                                        </CardItem>
                                        <CardItem style={styles.cardBody}>
                                            <View style={styles.classDetails}>
                                                <View style={styles.detailItem}>
                                                    	<Icon name='book' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                        <Text style={{color:'grey', fontSize:15}}>
                                                            {`${item.Type} - ${item.Section}`}
                                                        </Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    	<Icon name='pie' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                        <Text style={{color:'grey', fontSize:15}}>
                                                            {`${item.numberOfClassSessionsAttended} of ${item.numberOfClassSessions} class sessions attended`}
                                                        </Text>
                                                </View>
                                            </View>  
                                            <View style={styles.attendancePercentage}>
                                            {/* <Text style={{textAlign:'center', fontSize: 30, fontWeight:'bold', color: item.attendancePercentage<80 ? fail : success}}>
                                                {`${item.attendancePercentage}%`}
                                            </Text> */}
                                                 <ProgressCircle
                                                    percent={item.attendancePercentage}
                                                    radius={28}
                                                    borderWidth={4}
                                                    color= {item.attendancePercentage<80 ? fail : success}
                                                    shadowColor='grey'
                                                    bgColor='white'
                                                >
                                                    <Text style={{ fontSize: 15, color:'grey'}}>{`${item.attendancePercentage}%`}</Text>
                                                </ProgressCircle>
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
        backgroundColor: themeColor,
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    classSession:{
        width:'97%',
        flex:1
    },
    cardBody:{
        paddingTop:0,
        padding:10,
    },
    classDetails:{
        flex:3
    },
    detailItem:{
        flexDirection:'row',
        justifyContent:'flex-start'
    },
    attendancePercentage:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end'

    }
});

export default AttendancePercentage;