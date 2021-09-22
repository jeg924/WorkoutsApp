import React from "react";
import firebase from "firebase";
import { createStackNavigator } from "@react-navigation/stack";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TouchableHighlight,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../components/Header";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, Line } from "react-native-svg";
import { FlatList } from "react-native-gesture-handler";
const Stack = createStackNavigator();

export default function Home({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = React.useState(false);

  const [workoutsToBeContinued, setWorkoutsToBeContinued] =
    React.useState(null);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      loadData();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  async function loadData() {
    try {
      setLoading(true);
      // set uploads
      let workoutsToBeContinued = [];
      let unfinishedRecords = [];
      const unfinishedRecordsRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("recorded workouts")
        .where("timeCompleted", "==", null)
        .limit(5);
      const unfinishedRecordsDocs = await unfinishedRecordsRef.get();
      unfinishedRecordsDocs.forEach((doc) => {
        unfinishedRecords.push(doc.data());
      });

      let workoutPromises = [];
      for (let i = 0; i < unfinishedRecords.length; ++i) {
        let workoutToBeContinuedObject = {};
        let workoutRef = firebase
          .firestore()
          .collection("workouts")
          .doc(unfinishedRecords[i].workoutID);

        let workoutPromise = await workoutRef.get().then((doc) => {
          let workout = doc.data();
          workoutToBeContinuedObject.image = workout.workoutImage;
          workoutToBeContinuedObject.name = workout.workoutName;
          workoutToBeContinuedObject.workoutID = workout.workoutID;
          workoutToBeContinuedObject.recordID = unfinishedRecords[i].recordID;
          workoutToBeContinuedObject.currentExercise =
            unfinishedRecords[i].exerciseInputData.length;
          workoutsToBeContinued.push(workoutToBeContinuedObject);
        });
        workoutPromises.push(workoutPromise);
      }

      Promise.all(workoutPromises).then(
        setWorkoutsToBeContinued(workoutsToBeContinued)
      );
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
  }
  console.log("workouts to be continued");
  console.log(workoutsToBeContinued);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <Header
        tabScreen={"true"}
        title="Home"
        headerButton={
          <Pressable
            onPress={() => {
              navigation.navigate("Profile", {
                userID: firebase.auth().currentUser.uid,
              });
            }}
          >
            <Feather name="user" size={30} color="white" />
          </Pressable>
        }
      />

      <ScrollView>
        <View style={{ height: 50 }}></View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 18 }}>
            <View style={{ height: 200 }}>
              <View>
                <Text
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  Continue where you left off
                </Text>
              </View>
              <View style={{ paddingTop: 5, paddingBottom: 5 }}>
                <Svg height={1} width="100%">
                  <Line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                    stroke="black"
                    strokeWidth="2"
                  />
                </Svg>
              </View>
              <ScrollView horizontal>
                {workoutsToBeContinued?.map((item) => {
                  return (
                    <TouchableHighlight
                      onPress={() => {
                        console.log("in here");
                        console.log("item.workoutID");
                        console.log(item.workoutID);
                        navigation.navigate("Start Workout", {
                          workoutID: item.workoutID,
                          current: item.currentExercise,
                          routeRecordID: item.recordID,
                        });
                      }}
                    >
                      <View>
                        <Image
                          style={{ width: 100, height: 100 }}
                          source={
                            item.image
                              ? { uri: item.image, cache: "force-cache" }
                              : require("../assets/placeholder-image.png")
                          }
                        />
                        <Text>{item.name}</Text>
                      </View>
                    </TouchableHighlight>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}></View>
      </ScrollView>
    </View>
  );
}
