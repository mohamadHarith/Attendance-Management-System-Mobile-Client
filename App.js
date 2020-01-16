import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';

import UserAuthencticator from './src/screens/UserAuthenticator'
import CheckInVerifier from './src/screens/CheckInVerifier'
import LogIn from './src/screens/Login';
import EnrolFace from './src/screens/EnrolFace';
import UpcomingClassSessions from './src/screens/UpcomingClassSessions';
import ClassSchedule from './src/screens/ClassSchedule';
import AttendancePercentage from './src/screens/AttendancePercentage';
import AttendanceDetails from './src/screens/AttendanceDetails';
import SideBar from './src/components/SideBar';
import { createStackNavigator } from 'react-navigation-stack';

// const checkInSwitchNavigator = createSwitchNavigator({
//   checkIn: CheckInVerifier,
//   scanBeacon: ScanBeacon,
//   scanFace: ScanFace
// },
// {
//   initialRouteName:'checkIn',
// }
// );

const AttendancePercentageStackNavigator = createStackNavigator({
  attendanceOverview: AttendancePercentage,
  attendanceDetails: AttendanceDetails
},{
  initialRouteName:'attendanceOverview',
  headerMode:'none'  
});

const MainStackNavigator = createStackNavigator({
  upcomingClassSessions: UpcomingClassSessions,
  checkIn: CheckInVerifier,
  classSchedule: ClassSchedule,
  attendancePercentage: AttendancePercentageStackNavigator
},{
  initialRouteName:'upcomingClassSessions',
  headerMode:'none'  
});

const mainDrawerNavigator = createDrawerNavigator({
  main: MainStackNavigator
},
{
  contentComponent: SideBar
});


//switch navigator for authentication flow
const App =  createSwitchNavigator({
  authUser: UserAuthencticator,
  logIn: LogIn,
  enrolFace: EnrolFace,
  main: mainDrawerNavigator
});

export default createAppContainer(App);