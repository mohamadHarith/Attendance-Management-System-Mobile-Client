import React from 'react';
import {StyleSheet, View, Image, ActivityIndicator, DeviceEventEmitter, PermissionsAndroid, Vibration, ToastAndroid, Text as NativeText} from 'react-native';
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
    
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            venueID: this.props.venueID,
            UUID: '',
            isBeaconDetected: false, 
            progressIndicator : progress[0]
        }
    }

    //helper function
    delay = ms => new Promise(res => setTimeout(res, ms));

    bluetoothPermission = async()=>{
        try{ //enable bluetooth
              let isEnabled = await BluetoothStatus.state();
              if(!isEnabled){
                  BluetoothStatus.enable(true);
                  await this.delay(3000);
                  isEnabled =  await BluetoothStatus.state();                 
                  if(isEnabled){
                      return true
                  }
                  else{    
                     throw new Error('Blueetoth not enabled');
                  }
              }
              else{
                  return true;
              }
                   
        }catch(error){
            if(this._isMounted){
                ToastAndroid.showWithGravityAndOffset(
                    error.message,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
                this.props.navigation.pop();
                return false;
            }
                
        }
    }

    locationPermission = async()=>{
        try{
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                 return true;
            } else {
                throw new Error('Location permission denied');
            }

        }catch(error){
            if(this._isMounted){
                ToastAndroid.showWithGravityAndOffset(
                    error.message,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
                this.props.navigation.pop();
                return false;
            }
        }
    }

    scanBeacon = async () => {
        try{  
            Beacons.detectIBeacons();
            Beacons.startRangingBeaconsInRegion(this.state.venueID, this.state.UUID);

            DeviceEventEmitter.addListener('beaconsDidRange', (data)=>{
                // console.log(data);
                if(data.beacons.length === 1){
                    if(data.beacons[0].uuid === this.state.UUID && this._isMounted){
                        this.setState({isBeaconDetected: true, progressIndicator:progress[1]});
                        Vibration.vibrate(PATTERN);
                        Beacons.stopRangingBeaconsInRegion(this.state.venueID, this.state.UUID);
                        this.props.handleScanBeacon(true);
                    }
                }
            });
        }catch(error){
            //console.log(error);
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
               if(this._isMounted){
                    this.setState({UUID: data[0].UUID}, ()=>{
                        this.initScan();
                    })
               }
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

   initScan = async()=>{
        try{
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
                        if(this._isMounted){
                            this.setState({progressIndicator: progress[2]});
                        }
                        this.props.handleScanBeacon(false);
                    }
                }, 3000);
                        
                    
            }
            else{
               throw new Error('App permission errors');
            }
        }catch(error){
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
        }
   }

    componentDidMount(){
        this._isMounted = true;
        this.getBeaconID();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    render(){
        return(
            <View style={styles.beaconScanningIndicator}>
                <View style={styles.beaconImage}>
                    <Image source={require('../images/beacon.png')} style={{width:'100%', height:'100%'}}/>
                </View>
                 <View style={styles.activityIndicator}>
                    <ActivityIndicator size='large' color={themeColor}/>
                    <NativeText style={{color:'grey', marginLeft:10}}>{this.state.progressIndicator}</NativeText>
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