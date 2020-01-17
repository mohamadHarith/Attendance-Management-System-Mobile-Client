import React from 'react';
import {StyleSheet, TouchableNativeFeedback, View, FlatList, ToastAndroid} from 'react-native';
import {Container, Header, Body, Title, Left, Right, Text, Icon, Card, CardItem, Button, Subtitle} from 'native-base';
import LoadingIndicator from '../components/LoadingIndicator'
import {themeColor} from '../colorConstants';
import {url} from '../server';

class UpcomingClasseSesisons extends React.Component{
    
    constructor(props){
        super(props);
        this.state={
            studentID: this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().getParam('studentID'),
            weekData:{},
            upcomingClassSessions: [],
            flatListRefresh: false,
            isDataLoaded:false
        }
    }

    componentDidMount(){
        this.fetchData();
    }

    fetchData = ()=>{
        fetch(`${url}/students/upcomingClassSessions`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({studentID: this.state.studentID})
        })
        .then((res)=>{
            if(res.status == 200){
                res.json().then((data)=>{
                    this.setState({
                        upcomingClassSessions: data.upcomingClassSessions, 
                        weekData: data.weekData,
                        flatListRefresh:false,
                        isDataLoaded: true
                    });
                })
            }
            else{
                this.setState({flatListRefresh:false, upcomingClassSessions:[], isDataLoaded:true});
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
            this.setState({flatListRefresh:false, upcomingClassSessions:[], isDataLoaded:true});
            ToastAndroid.showWithGravityAndOffset(
                error.message,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
              );
        })
    }

    handleCheckIn = (index)=>{
        this.props.navigation.push('checkIn', {
            studentID: this.state.studentID, 
            classSession: this.state.upcomingClassSessions[index]
        })
        
        
    }
    

    
    render(){
        //console.log('from upcoming class session', this.state.studentID);
        
        return(
            <Container>
                <Header androidStatusBarColor={themeColor} style={styles.header}>
                    <Left>
                       <TouchableNativeFeedback onPress={()=>{this.props.navigation.openDrawer()}}>
                            <Icon name='menu' style={{color:'white'}}></Icon>
                       </TouchableNativeFeedback>
                    </Left>
                    <Body style={{flex:3}}>
                        <Title>Upcoming Class Sessions</Title>
                    </Body>
                </Header>

               <View style={styles.mainContainer}>

                    <View style={styles.upcomingClassSessionList}>
                        {this.state.isDataLoaded?(
                            <FlatList
                            ListHeaderComponent = {()=>{
                                return( 
                                <View style={styles.trimesterDetails}>
                            <Text style={{fontSize:18, fontWeight: 'bold'}}>
                                {this.state.weekData.Trimester_Name}
                            </Text>
                            <Text style={{fontSize:18, fontWeight: 'bold'}}>
                                {`Week ${this.state.weekData.Week} | ${this.state.weekData.Day_Of_Week} | ${this.state.weekData.Date}`}
                            </Text>
                                </View>);
                            }}
                            data={this.state.upcomingClassSessions}
                            onRefresh = {()=>{
                                this.setState({flatListRefresh:true});
                                this.fetchData();
                            }}
                            refreshing={this.state.flatListRefresh}
                            renderItem={(item)=>{
                                return(
                                    <Card>
                                        <CardItem style={{paddingBottom:0}}>
                                            <Text style={{fontSize:18, fontWeight: 'bold'}}>{item.item.Subject_Name}</Text>
                                        </CardItem>
                                        <CardItem style={styles.cardBody}>
                                            <View style={styles.classSessionDetails}>
                                                <Text style={{color:'grey', fontSize:15}}>
                                                    {`${item.item.Type} - ${item.item.Section}`}
                                                </Text>
                                                <Text style={{color:'grey', fontSize:15}}>
                                                    {`${item.item.Start_Time} - ${item.item.End_Time}`}
                                                </Text>
                                                <Text style={{color:'grey', fontSize:15}}>
                                                    {`${item.item.Venue_Name} - ${item.item.Venue_ID}`}
                                                </Text> 
                                                <Text style={{color:'grey', fontSize:15}}>{item.item.noOfClassAttended}</Text>
                                            </View>
                                            <TouchableNativeFeedback onPress={()=>{this.handleCheckIn(item.index)}}>
                                                <View style={styles.checkInButton}>
                                                        <Icon name='log-in' style={{fontSize: 40, color:'grey'}}></Icon>
                                                </View>      
                                            </TouchableNativeFeedback>                                    
                                        </CardItem>
                                    </Card>
                                );
                            }}
                            keyExtractor={item => toString(item.Class_Session_ID)}
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
    checkInButton: {
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    }

});
  
  export default UpcomingClasseSesisons;