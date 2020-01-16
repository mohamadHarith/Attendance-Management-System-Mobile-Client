import React from 'react';
import {StyleSheet, View, ToastAndroid, FlatList, TouchableNativeFeedback} from 'react-native';
import {Container, Header, Left, Right, Body, Button, Title, Text, Card, CardItem, Icon} from 'native-base';
import {themeColor} from '../colorConstants';
import {url} from '../server';
import LoadingIndicator from '../components/LoadingIndicator';

class AttendancePercentage extends React.Component{
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
        fetch(`${url}/students/getAttendanceDetails/${this.state.classID}/${this.state.studentID}`).then((res)=>{
            if(res.status == 200){
                res.json().then((data)=>{
                    this.setState({attendanceData:data, isDataLoaded:true, flatListRefresh:false});
                })
            }
            else{
                throw new Error('Something went wrong');
            }
        }).catch((error)=>{
            this.setState({isDataLoaded:true, flatListRefresh:false});
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
        this.fetchData();
    }
      
    render(){
        console.log(this.state);
        return(
            <Container>
                <Header style={styles.header} androidStatusBarColor={themeColor}>
                    <Left style={{flex:1}}>
                        <Button transparent>
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
                                this.setState({flatListRefresh:true});
                                this.fetchData();
                            }}
                            ListHeaderComponent={()=>{
                                return(
                                   
                                    <View style={styles.classDetails}>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>{`${this.state.classData.Subject_ID} ${this.state.classData.Subject_Name}`}</Text>
                                       <Text style={{color:'grey', fontSize:15}}>
                                                    {`${this.state.classData.Type} - ${this.state.classData.Section}`}
                                                </Text>
                                                <Text style={{color:'grey', fontSize:15}}>
                                                    {`${this.state.classData.numberOfClassSessionsAttended} of ${this.state.classData.numberOfClassSessions} class sessions attended.`}
                                                </Text> 
                                            
                                    </View>
                                );
                            }}
                            refreshing={this.state.flatListRefresh}
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
                                                <Text style={{textAlign:'right', fontSize: 30, color: item.Attendance_Status == 'Absent' ? 'red' : '#90ee90'}}>
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
        backgroundColor: themeColor,
        zIndex:1
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        zIndex:0
        // backgroundColor: 'yellow'
    },
    classDetails:{
        padding:10,
        width:'95%'
    },
    attendanceData:{
        width:'95%'
    },
    cardBody:{
        paddingTop:0,
        padding:10,
        //backgroundColor:'red'
    },
    classSessionDetails:{
     //backgroundColor:'blue',
        width:'50%'
    },
    attendancePercentage:{
        width:'50%',
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
        //backgroundColor:'yellow'
    }
});

export default AttendancePercentage;