import React from 'react';
import {StyleSheet, View, ScrollView, ToastAndroid} from 'react-native';
import { 
    Container, 
    Header, Left, Body, Right, Button, Icon, Title, 
    Tabs, Tab, ScrollableTab, Text,
    Card, CardItem
} from 'native-base';
import {themeColor} from '../colorConstants';
import {url} from '../server';
import LoadingIndicator from '../components/LoadingIndicator';

class ClassSchedule extends React.Component{
    constructor(props){
        super(props);
        this.state={
            classData : [],
            isDataLoaded: false
        }
    }

    componentDidMount(){
        fetch(`${url}/students//getCurrentWeekSchedule/1151101633`).then((res)=>{
            if(res.status == 200){
                res.json().then((data)=>{
                    this.setState({classData:data, isDataLoaded:true});
                });
            }
            else{
                throw new Error('Could not get schedule')
            }
        }).catch((error)=>{
           this.setState({isDataLoaded:true});
            ToastAndroid.showWithGravityAndOffset(
                error.message,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
              );
        })
    }

    render(){
        return (
            <Container>
                <Header style={styles.header} androidStatusBarColor={themeColor} hasTabs>
                    <Left>
                        <Button transparent>
                        <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Class Schedule</Title>
                    </Body>
                    <Right></Right>
                </Header>
                {this.state.isDataLoaded?(
                    <Tabs renderTabBar={()=><ScrollableTab/>}>
                        {this.state.classData.map((item,index)=>{
                            return (
                                <Tab heading={item.name} key={index}>
                                    <View style={styles.mainContainer}>
                                        <ScrollView style={styles.scheduleContainer}>
                                            {item.classes.map((classItem, index)=>{
                                                return(
                                                    <Card key={index}>
                                                        <CardItem>
                                                            <Text style={{fontSize:18, fontWeight: 'bold'}}>{`${classItem.Subject_ID} ${classItem.Subject_Name}`}</Text>
                                                        </CardItem>
                                                        <CardItem style={styles.cardBody}>
                                                            <Text style={{color:'grey'}}>{`${classItem.Section} - ${classItem.Type}`}</Text>
                                                            <Text style={{color:'grey'}}>{`${classItem.Start_Time} - ${classItem.End_Time}`}</Text>
                                                            <Text style={{color:'grey'}}>{classItem.Date}</Text>   
                                                            <Text style={{color:'grey'}}>{classItem.Venue_ID}</Text>                                      
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
                    <LoadingIndicator/>
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
        padding: 10,
        width: '95%',
        height: '100%',
    },
    cardBody:{
        paddingTop:0,
        padding:10,
        flexDirection: 'column',
        alignItems: 'flex-start'
    }
});

export default ClassSchedule;