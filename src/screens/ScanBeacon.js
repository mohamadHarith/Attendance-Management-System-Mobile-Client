import React from 'react';
import {StyleSheet, View, Image, ActivityIndicator, DeviceEventEmitter, PermissionsAndroid, Vibration, ToastAndroid} from 'react-native';
import {Container, Header, Left, Right, Body, Button, Title, Text, Card, CardItem, Toast, Icon} from 'native-base';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import Beacons  from 'react-native-beacons-manager';
import {themeColor} from '../colorConstants';
import {url} from '../server';


const PATTERN = [0, 100, 100, 100];

const progress = [
    'Scanning for beacon...',
    'Beacon detected...',
    'Beacon could not be detected...'
]

class ScanBeacon extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            venueID: this.props.venueID,
            UUID: '',
            isBeaconDetected: false, 
            progressIndicator : progress[0]
        }
    }

    bluetoothPermission = async()=>{
        try{
              //enable bluetooth
              let isEnabled = await BluetoothStatus.state();
              console.log('bluetooth state', isEnabled);
              if(!isEnabled){
                  isEnabled = await BluetoothStatus.enable(true);
                  if(isEnabled){return true;}
                  else{throw new Error('Blueetoth not enabled');}
              }
              else if(isEnabled){return true;}   
        }catch(error){
                console.log(error);
                return false;
        }
    }

    locationPermission = async()=>{
        try{
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        'title': 'Location Permission',
                        'message': 'MMU needs to access your location.'
                    }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                 return true;
            } else {
                throw new Error('Location permission denied');
            }

        }catch(error){
            console.log(error);
            return false;
        }
    }

    scanBeacon = async () => {
        try{  
            Beacons.detectIBeacons();
            Beacons.startRangingBeaconsInRegion(this.state.venueID, this.state.UUID);

            DeviceEventEmitter.addListener('beaconsDidRange', (data)=>{
                console.log(data);
                if(data.beacons.length === 1){
                    if(data.beacons[0].uuid === this.state.UUID){
                        this.setState({isBeaconDetected: true, progressIndicator:progress[1]});
                        Vibration.vibrate(PATTERN);
                        Beacons.stopRangingBeaconsInRegion(this.state.venueID, this.state.UUID);
                        this.props.handleScanBeacon(true);
                    }
                }
            });
        }catch(error){
            console.log(error);
            this.props.handleScanBeacon(false);
        }
   }

   getBeaconID = async()=>{   

    fetch(`${url}/beaconManagement/getBeaconUUID`, {
           method:'POST',
           headers:{'Content-Type':'application/json'},
           body: JSON.stringify({
               venueID : this.state.venueID
           })
       }).then((res)=>{
           if(res.status == 200){
               res.json().then((data)=>{
                    this.setState({UUID: data[0].UUID})
               });
           }
           else{
               throw new Error('Beacon not assigned for the venue');
           }
       }).catch((error)=>{
            this.props.navigation.pop();
            ToastAndroid.showWithGravityAndOffset(
                error.message,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
            );
       })
   }

    async componentDidMount(){
        
        
        

        await this.getBeaconID();
        
        let isBluetoothEnabled = false;
        let isLocationEnabled = false;
        
        isBluetoothEnabled = await this.bluetoothPermission();
        isLocationEnabled = await this.locationPermission();

        if(isBluetoothEnabled && isLocationEnabled){
            
            await this.scanBeacon();     
            //timeout if no beacon is found
            setTimeout(()=>{
                if(!this.state.isBeaconDetected){
                    Beacons.stopRangingBeaconsInRegion(this.state.venueID, this.state.UUID);
                    this.setState({progressIndicator: progress[2]});
                    this.props.handleScanBeacon(false);
                }
            }, 3000);
                     
                   
        }
        else{
            console.log('yep its working 2');
        }

    }

    render(){
        return(
            <View style={styles.beaconScanningIndicator}>
                <View style={styles.beaconImage}>
                    <Image source={require('../images/beacon.png')} style={{width:'100%', height:'100%'}}/>
                </View>
                 <View style={styles.activityIndicator}>
                    <ActivityIndicator size='large' color={themeColor}/>
                    <Text style={{color:'grey', marginLeft:10}}>{this.state.progressIndicator}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    
    beaconScanningIndicator:{
        width:'90%',
        flexDirection:'column',
        alignItems:'center',
        marginTop: 40
    },
    beaconImage:{
        width: 250,
        height: 250,
        // backgroundColor:'red'
    },
    activityIndicator:{
        marginTop:40,
        width: '90%',
        flexDirection: 'row',
        justifyContent:'center'
    }
});

export default ScanBeacon;