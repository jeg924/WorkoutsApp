// todo: better navigation in general. Back buttons and listeners.

import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, HeaderTitle } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { AppLoading } from "expo";
import { set } from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as firebase from "firebase";

import Login from "./screens/Login";
import Home from "./screens/Home";
import Profile from "./screens/Profile";
import EditProfile from "./screens/EditProfile";
import Browse from "./screens/Browse";
import FilterForm from "./screens/FilterForm";
import MyWorkouts from "./screens/MyWorkouts";
import WorkoutInfoForm from "./screens/WorkoutInfoForm";
import WorkoutEditor from "./screens/WorkoutEditor";
import RecordExercise from "./screens/RecordExercise";
import StartWorkout from "./screens/StartWorkout";
import WorkoutVideoScreen from "./screens/WorkoutVideoScreen";
import WorkoutReview from "./screens/WorkoutReview";
import ModalFriendPicker from "./screens/ModalFriendPicker";

const MyTheme = {
  dark: false,
  colors: {
    primary: "#6200EE",
    background: "white",
    card: "#3700B3",
    text: "black",
    border: "#3700B3",
    notification: "#BB86FC",
  },
};

const firebaseConfig = {
  apiKey: "AIzaSyA5Y7PIj8JGZqlqM2T4Itf27ZZHDMA3NhA",
  authDomain: "workout-app-7c750.firebaseapp.com",
  projectId: "workout-app-7c750",
  storageBucket: "workout-app-7c750.appspot.com",
  messagingSenderId: "858918925908",
  appId: "1:858918925908:web:cddeef71e7dfe7b8515fc1",
  measurementId: "G-WEGYNKW83R",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const HomeStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen name="Edit Profile" component={EditProfile} />
      <HomeStack.Screen name="Profile" component={Profile} />
    </HomeStack.Navigator>
  );
}

const MyWorkoutsStack = createStackNavigator();

function MyWorkoutsStackScreen() {
  return (
    <MyWorkoutsStack.Navigator screenOptions={{ headerShown: false }}>
      <MyWorkoutsStack.Screen name="My Workouts" component={MyWorkouts} />
      <MyWorkoutsStack.Screen
        name="Workout Info Form"
        component={WorkoutInfoForm}
      />
      <MyWorkoutsStack.Screen name="Workout Editor" component={WorkoutEditor} />
      <MyWorkoutsStack.Screen
        name="Record Exercise"
        component={RecordExercise}
      />
      <MyWorkoutsStack.Screen name="Start Workout" component={StartWorkout} />
      <MyWorkoutsStack.Screen
        name="Workout Video Screen"
        component={WorkoutVideoScreen}
      />
      <MyWorkoutsStack.Screen name="Review" component={ReviewStackScreen} />
    </MyWorkoutsStack.Navigator>
  );
}

const BrowseStack = createStackNavigator();

function BrowseStackScreen() {
  return (
    <BrowseStack.Navigator screenOptions={{ headerShown: false }}>
      <BrowseStack.Screen name="Browse" component={Browse} />
      <BrowseStack.Screen name="Filter Form" component={FilterForm} />
      <BrowseStack.Screen name="Start Workout" component={StartWorkout} />
      <BrowseStack.Screen
        name="Workout Video Screen"
        component={WorkoutVideoScreen}
      />
      <BrowseStack.Screen name="Review" component={ReviewStackScreen} />
      <BrowseStack.Screen name="Profile" component={Profile} />
      <BrowseStack.Screen name="Edit profile" component={EditProfile} />
    </BrowseStack.Navigator>
  );
}

const ReviewStack = createStackNavigator();

function ReviewStackScreen() {
  return (
    <ReviewStack.Navigator screenOptions={{ headerShown: false }} mode="modal">
      <ReviewStack.Screen name="Workout Review" component={WorkoutReview} />
      <ReviewStack.Screen
        name="Modal Friend Picker"
        component={ModalFriendPicker}
      />
    </ReviewStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export const GlobalContext = React.createContext({
  myUserId: null,
});

function App() {
  var [loading, setLoading] = React.useState(true);
  var [user, setUser] = React.useState(null);

  // app should display the login screen if the user is not signed in.
  // if the user is there, return the app.

  // Login should handle firestore data.
  // if signing up, it adds a user doc to the the cllection
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((auth) => {
      if (auth) {
        firebase
          .firestore()
          .collection("users")
          .doc(auth.uid)
          .get()
          .then((doc) => {
            const user = doc.data();
            setUser(user); // set user info
          });
        setUser(auth);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  } else if (user === null) {
    return (
      <SafeAreaProvider>
        <Login />
      </SafeAreaProvider>
    );
  } else {
    return (
      <SafeAreaProvider>
        <GlobalContext.Provider
          value={{
            myUserId: firebase.auth().currentUser.uid,
          }}
        >
          <NavigationContainer theme={MyTheme}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;
                  if (route.name === "Home") {
                    iconName = "home";
                  } else if (route.name === "My Workouts") {
                    iconName = "activity";
                  } else if (route.name === "Browse") {
                    iconName = "search";
                  }
                  return <Feather name={iconName} color={color} size={size} />;
                },
              })}
              tabBarOptions={{
                activeTintColor: "blue",
                inactiveTintColor: "#708090",
              }}
            >
              <Tab.Screen name="Home" component={HomeStackScreen} />
              <Tab.Screen
                name="My Workouts"
                component={MyWorkoutsStackScreen}
              />
              <Tab.Screen name="Browse" component={BrowseStackScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </GlobalContext.Provider>
      </SafeAreaProvider>
    );
  }
}

export default App;
