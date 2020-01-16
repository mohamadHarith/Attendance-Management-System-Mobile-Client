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
            studentID: this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().dangerouslyGetParent().getParam('studentID'),
            attendanceData:[],
            isDataLoaded: false,
            flatListRefresh: false,
            isAttendanceOverviewPage: true,
            isAttendanceDetailsPage: false,
            selectedClassID: -1
        }
    }
    
    
    componentDidMount(){
        this.fetchData();
    }

    fetchData= ()=>{
        fetch(`${url}/students/getStudentAttendanceData/${this.state.studentID}`).then((res)=>{
            if(res.status == 200){
                res.json().then((data)=>{
                    this.setState({attendanceData:data, isDataLoaded:true, flatListRefresh:false});
                })
            }
            else{
                throw new Error('Could not get attendance data');
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
    
    handleClick = (index)=>{
        this.props.navigation.navigate('attendanceDetails', {
            studentID: this.state.studentID,
            classID: this.state.attendanceData[index].Class_ID,
            classData: this.state.attendanceData[index]
        })
        //console.log(index);
        
    }

    render(){
        //console.log(this.state);
        return(
            <Container>
                <Header style={styles.header} androidStatusBarColor={themeColor}>
                    <Left style={{flex:1}}>
                        <Button transparent>
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
                        <FlatList
                            data={this.state.attendanceData}
                            onRefresh = {()=>{
                                this.setState({flatListRefresh:true});
                                this.fetchData();
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
                                                <Text style={{color:'grey', fontSize:15}}>
                                                    {`${item.Type} - ${item.Section}`}
                                                </Text>
                                                <Text style={{color:'grey', fontSize:15}}>
                                                    {`${item.numberOfClassSessionsAttended} of ${item.numberOfClassSessions} class sessions attended.`}
                                                </Text>
                                            </View>  
                                            <View style={styles.attendancePercentage}>
                                            <Text style={{textAlign:'center', fontSize: 30, fontWeight:'bold', color: item.attendancePercentage<80 ? 'red' : '#90ee90'}}>
                                                {`${item.attendancePercentage}%`}
                                            </Text>
                                            </View>                                      
                                        </CardItem>
                                    </Card>
                                    </TouchableNativeFeedback>
                                );
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
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
    classSession:{
        width:'95%'
    },
    cardBody:{
        paddingTop:0,
        padding:10,
        // backgroundColor:'red'
    },
    classDetails:{
        // backgroundColor:'blue',
        flex:3
    },
    attendancePercentage:{
        flex:1,
        // backgroundColor:'yellow'
    }
});

export default AttendancePercentage;