import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import { 
    Container, 
    Header, Left, Body, Right, Button, Icon, Title, 
    Tabs, Tab, ScrollableTab, Text,
    Card, CardItem
} from 'native-base';
import {themeColor} from '../colorConstants';

class ClassSchedule extends React.Component{
    constructor(props){
        super(props);
        this.state={

        }
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
                <Tabs renderTabBar={()=><ScrollableTab/>}>
                    <Tab heading="Monday">
                        <View style={styles.mainContainer}>
                            <ScrollView style={styles.scheduleContainer}>
                                <Card>
                                    <CardItem>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>TCP2451 PROG. LANG. TRANS.</Text>
                                    </CardItem>
                                    <CardItem style={styles.cardBody}>
                                        <Text style={{color:'grey'}}>Lecture - TC01</Text>
                                        <Text style={{color:'grey'}}>12:00PM - 02:00PM</Text>
                                        <Text style={{color:'grey'}}>FCI Building CQCR2002</Text>                                      
                                    </CardItem>
                                </Card>
                                <Card>
                                    <CardItem>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>TCP2451 PROG. LANG. TRANS.</Text>
                                    </CardItem>
                                    <CardItem style={styles.cardBody}>
                                        <Text style={{color:'grey'}}>Lecture - TC01</Text>
                                        <Text style={{color:'grey'}}>12:00PM - 02:00PM</Text>
                                        <Text style={{color:'grey'}}>FCI Building CQCR2002</Text>                                      
                                    </CardItem>
                                </Card>
                                <Card>
                                    <CardItem>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>TCP2451 PROG. LANG. TRANS.</Text>
                                    </CardItem>
                                    <CardItem style={styles.cardBody}>
                                        <Text style={{color:'grey'}}>Lecture - TC01</Text>
                                        <Text style={{color:'grey'}}>12:00PM - 02:00PM</Text>
                                        <Text style={{color:'grey'}}>FCI Building CQCR2002</Text>                                      
                                    </CardItem>
                                </Card>
                                <Card>
                                    <CardItem>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>TCP2451 PROG. LANG. TRANS.</Text>
                                    </CardItem>
                                    <CardItem style={styles.cardBody}>
                                        <Text style={{color:'grey'}}>Lecture - TC01</Text>
                                        <Text style={{color:'grey'}}>12:00PM - 02:00PM</Text>
                                        <Text style={{color:'grey'}}>FCI Building CQCR2002</Text>                                      
                                    </CardItem>
                                </Card>
                                <Card>
                                    <CardItem>
                                        <Text style={{fontSize:18, fontWeight: 'bold'}}>TCP2451 PROG. LANG. TRANS.</Text>
                                    </CardItem>
                                    <CardItem style={styles.cardBody}>
                                        <Text style={{color:'grey'}}>Lecture - TC01</Text>
                                        <Text style={{color:'grey'}}>12:00PM - 02:00PM</Text>
                                        <Text style={{color:'grey'}}>FCI Building CQCR2002</Text>                                      
                                    </CardItem>
                                </Card>
                            </ScrollView>
                        </View>
                    </Tab>
                    <Tab heading="Tuesday">
                        <></>
                    </Tab>
                    <Tab heading="Wednesday">
                        <></>
                    </Tab>
                    <Tab heading="Thursday">
                        <></>
                    </Tab>
                    <Tab heading="Friday">
                        <></>
                    </Tab>
                </Tabs>
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
        width: '90%',
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