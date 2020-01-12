import React from 'react';
import {StyleSheet, View, ActivityIndicator, Text} from 'react-native';
import {themeColor} from '../colorConstants';

class LoadingIndicator extends React.Component{
    constructor(props){
        super(props);
        this.state={}
    }

    render(){
        return(
            <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator color={themeColor} size='large'/>
                <Text style={{marginTop:10}}>{this.props.message}</Text>
            </View>
        );
    }
}

export default LoadingIndicator;