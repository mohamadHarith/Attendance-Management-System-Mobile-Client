import React from 'react';
import {StyleSheet, View, ScrollView, ToastAndroid, Text as NativeText} from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, Tabs, Tab, ScrollableTab, Text, Card, CardItem} from 'native-base';
import {themeColor, themeLight} from '../colorConstants';
import {url} from '../server';
import LoadingIndicator from '../components/LoadingIndicator';

class ClassSchedule extends React.Component{
    
    _isMounted = false;

    constructor(props){
        super(props);
        this.state={
            studentID: this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().getParam('studentID'),
            classData : [],
            isDataLoaded: false
        }
    }

    fetchData = ()=>{
        fetch(`${url}/students/getCurrentWeekSchedule/${this.state.studentID}`).then((res)=>{
            if(res.status == 200 && this._isMounted){
                res.json().then((data)=>{
                    this.setState({classData:data, isDataLoaded:true});
                });
            }
            else{
                throw new Error('No schedule found for this week')
            }
        }).catch((error)=>{
           if(this._isMounted){
            this.setState({isDataLoaded:true});
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
            if(!this.state.isDataLoaded){
               if(this._isMounted){
                this.setState({isDataLoaded:true});    
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

    componentDidMount(){
       this._isMounted = true;
       this.fetchData();
    }

    componentWillUnmount(){
        this._isMounted = false;
        this.setState({isDataLoaded:false, classData:[]})
    }

    render(){
        return (
            <Container>
                <Header style={styles.header} androidStatusBarColor={themeColor} hasTabs>
                    <Left>
                        <Button transparent onPress={()=>{this.props.navigation.pop()}}>
                        <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Class Schedule</Title>
                    </Body>
                    <Right></Right>
                </Header>
                {(this.state.isDataLoaded && this.state.classData.length > 0)?(
                    <Tabs renderTabBar={()=><ScrollableTab/>} tabBarBackgroundColor={themeLight}>
                        {this.state.classData.map((item,index)=>{
                            return (
                                <Tab 
                                    heading={item.name} 
                                    key={index} 
                                    tabStyle={{backgroundColor:themeLight}} 
                                    activeTabStyle={{backgroundColor:themeLight}} 
                                    textStyle={{color:'grey'}}
                                    activeTextStyle={{color:'grey'}}
                                >
                                    <View style={styles.mainContainer}>
                                        <ScrollView style={styles.scheduleContainer}>
                                            {item.classes.map((classItem, index)=>{
                                                return(
                                                    <Card key={index}>
                                                        <CardItem>
                                                            <Text style={{fontSize:18, fontWeight: 'bold'}}>{`${classItem.Subject_ID} ${classItem.Subject_Name}`}</Text>
                                                        </CardItem>
                                                        <CardItem style={styles.cardBody}>
                                                        <View style={styles.detailItem}>
                                                            <Icon name='book' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                            <Text style={{color:'grey'}}>{`${classItem.Section} - ${classItem.Type}`}</Text>
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                            <Icon name='time' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                            <Text style={{color:'grey'}}>{`${classItem.Start_Time} - ${classItem.End_Time}`}</Text>
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                            <Icon name='calendar' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                            <Text style={{color:'grey'}}>{classItem.Date}</Text>   
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                            <Icon name='locate' style={{fontSize:20, color:'grey', textAlign:'center'}} />
                                                            <Text style={{color:'grey'}}>{classItem.Venue_ID}</Text> 
                                                        </View>                               
                                                        </CardItem>
                                                    </Card>
                                                );
                                            })}
                                     </ScrollView>
                                    </View>
                                </Tab>
                            );
                        })}
                </Tabs>
                ):(
                    <></>
                )}
                {(this.state.isDataLoaded && !this.state.classData.length>0)?(
                    <NativeText>No schedule data found for this week</NativeText>
                ):(
                    <></>
                )}
                {!this.state.isDataLoaded?(
                    <LoadingIndicator/>
                ):(
                    <></>
                )}
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: themeColor
    },
    mainContainer:{
       flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    scheduleContainer:{
        width:'97%',
        paddingTop: 10,
        height: '100%',
    },
    cardBody:{
        paddingTop:0,
        padding:10,
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    detailItem:{
        flexDirection:'row',
        justifyContent:'flex-start'
    }
});

export default ClassSchedule;