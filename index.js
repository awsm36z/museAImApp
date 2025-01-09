/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import ChatScreen from './src/Screens/ChatScreen';
import {name as appName} from './app.json';


AppRegistry.registerComponent(appName, () => ChatScreen);
