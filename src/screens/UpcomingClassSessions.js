import React from 'react';
import {StyleSheet, TouchableNativeFeedback, View, FlatList, ToastAndroid, Text as NativeText, StatusBar} from 'react-native';
import {Container, Header, Body, Title, Left, Text, Icon, Card, CardItem, Subtitle} from 'native-base';
import LoadingIndicator from '../components/LoadingIndicator'
import {themeColor, themeLight} from '../colorConstants';
import {url} from '../server';


//mock trimester data
// {
//     Trimester_Name: "Tri 2 2019/20",
//     Week: 11,
//     Day_Of_Week: "Monday",
//     Date: "27 Jan 2020"
// }

//mock upcoming class session data
// {
//     weekData: {
//     Trimester_Name: "Tri 2 2019/20",
//     Week: 11,
//     Day_Of_Week: "Tuesday",
//     Date: "28 Jan 2020"
//     },
//     upcomingClassSessions: [
//     {
//         Class_Session_ID: 11,
//         Class_ID: 12,
//         Start_Time: "12:00am",
//         End_Time: "11:59pm",
//         Subject_Name: "Demo To Mr Ban",
//         Subject_ID: "TPT3101",
//         Type: "Meeting",
//         Section: "MT06",
//         Venue_ID: "CQCR3004",
//         Venue_Name: "FCI CLASSROOM",
//         attendancePercenatage: {
//             numberOfClassSessionsAttended: "0",
//             numberOfTotalClassSessions: "2",
//             percentage: 0
//         }
//     }
// ]}

class UpcomingClasseSesisons extends React.Component{
    
    _isMounted = false;
    
    constructor(props){
        super(props);
        this.state={
            studentID: this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().getParam('studentID'),
            upcomingClassSessions: [],
            flatListRefresh: false,
            trimesterData:{},
            isDataLoaded:false,
            isTrimesterDataLoaded:false,
            isNoUpcomingClassSessions:false
        }
    }

    fetchData = ()=>{
        this.setState({isDataLoaded:false, upcomingClassSessions:[]})
        fetch(`${url}/students/upcomingClassSessions/${this.state.studentID}`)
        .then((res)=>{
            if(res.status == 200 && this._isMounted){
                res.json().then((data)=>{                  
                    this.setState({
                        upcomingClassSessions: data.upcomingClassSessions, 
                        flatListRefresh:false,
                        isDataLoaded: true
                    });
                })
            }
            else if(this._isMounted && res.status !== 200){
                this.setState({flatListRefresh:false, upcomingClassSessions:[], isDataLoaded:true, isNoUpcomingClassSessions:true});
                ToastAndroid.showWithGravityAndOffset(
                    'No class sessions found. Pull to refresh.',
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                  );
            }
        })
        .catch((error)=>{
            if(this._isMounted){
                this.setState({flatListRefresh:false, upcomingClassSessions:[], isDataLoaded:true});
                ToastAndroid.showWithGravityAndOffset(
                    error.message,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
            }
        })
        fetch(`${url}/students/getTrimesterData/${this.state.studentID}`).then((res)=>{
            if(res.status == 200 && this._isMounted){
                res.json().then((data)=>{
                    this.setState({trimesterData:data, isTrimesterDataLoaded:true});
                })
            }
        })
        setTimeout(()=>{           
            if(!this.state.isDataLoaded){
               if(this._isMounted){
                this.setState({flatListRefresh:false, isDataLoaded:true});    
                ToastAndroid.showWithGravityAndOffset(
                        'Network request timeout',
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50,
                    );
               }
                
            }
        }, 5000)
    }

    handleCheckIn = (index)=>{
        this.props.navigation.push('checkIn', {
            studentID: this.state.studentID, 
            classSession: this.state.upcomingClassSessions[index]
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
                <Header androidStatusBarColor={themeColor} style={styles.header}>
                <StatusBar barStyle={themeColor}/>
                    <Left>
                       <TouchableNativeFeedback onPress={()=>{this.props.navigation.openDrawer()}}>
                            <Icon name='menu' style={{color:'white'}}></Icon>
                       </TouchableNativeFeedback>
                    </Left>
                    <Body style={{flex:3}}>
                        <Title>Upcoming Class Sessions</Title>
                    </Body>
                </Header>
                {this.state.isTrimesterDataLoaded?(
                     <Header noShadow style={{backgroundColor:themeLight}}>
                        <Left>
                            <Icon name='calendar' style={{color:'grey'}}></Icon>
                        </Left>
                        <Body  style={{flex:3}}>
                        <Title style={{color:'grey'}}>{`Week ${this.state.trimesterData.Week }`}</Title>
                        <Subtitle style={{color:'grey'}}>{`${this.state.trimesterData.Trimester_Name}  |  ${this.state.trimesterData.Day_Of_Week}  |  ${this.state.trimesterData.Date}`}</Subtitle>
                        </Body>
                    </Header>
                ):(
                    <></> 
                )}

               <View style={styles.mainContainer}>

                    <View style={styles.upcomingClassSessionList}>
                        {this.state.isDataLoaded?(
                                <FlatList                         
                                data={this.state.upcomingClassSessions}
                                onRefresh = {()=>{
                                    this.setState({flatListRefresh:true});
                                    this.fetchData();
                                }}
                                refreshing={this.state.flatListRefresh}
                                ListEmptyComponent={()=>{
                                    return(
                                        <NativeText>No upcoming classes. Pull to refresh.</NativeText>
                                    );
                                }}
                                renderItem={(item, index)=>{
                                    return(
                                        <Card>
                                            <CardItem style={{paddingBottom:0}}>
                                                <Text style={{fontSize:18, fontWeight: 'bold'}}>{`${item.item.Subject_ID} ${item.item.Subject_Name}`}</Text>
                                            </CardItem>
                                            <CardItem style={styles.cardBody}>
                                                <View style={styles.classSessionDetails}>
                                                    <View style={styles.detailItem}>
                                                        <Icon name='book' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                        <Text style={{color:'grey', fontSize:15}}>
                                                            {`${item.item.Type} - ${item.item.Section}`}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.detailItem}>
                                                    <Icon name='time' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                        <Text style={{color:'grey', fontSize:15}}>
                                                            {`${item.item.Start_Time} - ${item.item.End_Time}`}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.detailItem}>
                                                        <Icon name='locate' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                        <Text style={{color:'grey', fontSize:15}}>
                                                            {`${item.item.Venue_Name} - ${item.item.Venue_ID}`}
                                                        </Text> 
                                                    </View>
                                                    <View style={styles.detailItem}>
                                                        <Icon name='pie' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                        <Text style={{color:'grey', fontSize:15}}>
                                                            {`${item.item.attendancePercenatage.numberOfClassSessionsAttended} of ${item.item.attendancePercenatage.numberOfTotalClassSessions} class sessions attended`}
                                                        </Text>
                                                    </View>
                                                    
                                                </View>
                                                
                                                    <View style={styles.checkInButton}>
                                                    <TouchableNativeFeedback onPress={()=>{this.handleCheckIn(item.index)}}>
                                                           <View>
                                                           <Icon name='log-in' style={{fontSize: 40, color:'grey'}}></Icon>
                                                           </View>
                                                    </TouchableNativeFeedback>  
                                                    </View>                                 
                                            </CardItem>
                                        </Card>
                                    );
                                }}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        ):(
                            <LoadingIndicator/>
                        )}
                    </View>
               </View>
            </Container>
        );
    }
}
const styles = StyleSheet.create({
    mainContainer:{
      flex:1,
      flexDirection: 'column',
      alignItems: 'center'
    },
    trimesterDetails:{
        width:'97%',
        flexDirection:'column',
        justifyContent:'flex-start',
        margin:10
    },
    header:{
        backgroundColor:themeColor
    }, 
    upcomingClassSessionList:{
        flex:1,
        width: '97%',
    },
    cardBody:{
        paddingTop:0,
        padding:10,
    },
    classSessionDetails:{
        flex:3,
    },
    detailItem:{
        flexDirection:'row',
        justifyContent:'flex-start'
    },
    checkInButton: {
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    }

});
  
  export default UpcomingClasseSesisons;