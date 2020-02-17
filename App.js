import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';

import UserAuthencticator from './src/screens/UserAuthenticator'
import CheckInVerifier from './src/screens/CheckInVerifier'
import LogIn from './src/screens/Login';
import EnrolFace from './src/screens/EnrolFace';
import EnrolFaceModal from './src/components/EnrolFaceModal'
import UpcomingClassSessions from './src/screens/UpcomingClassSessions';
import ClassSchedule from './src/screens/ClassSchedule';
import AttendancePercentage from './src/screens/AttendancePercentage';
import AttendanceDetails from './src/screens/AttendanceDetails';
import SideBar from './src/components/SideBar';


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

const EnrolFaceStackNavigator = createStackNavigator({
  enrolFace: EnrolFace,
  enrolFaceModal: EnrolFaceModal
},
{
  initialRouteName:'enrolFace',
  headerMode:'none'  
});


//switch navigator for authentication flow
const App =  createSwitchNavigator({
  authUser: UserAuthencticator,
  logIn: LogIn,
  enrolFace: EnrolFaceStackNavigator,
  main: mainDrawerNavigator
},{
  initialRouteName:'authUser'
});

export default createAppContainer(App);