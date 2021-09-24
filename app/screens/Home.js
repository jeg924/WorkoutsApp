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
import { abs } from "react-native-reanimated";

export default function Home({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = React.useState(false);

  const [workoutsToBeContinued, setWorkoutsToBeContinued] =
    React.useState(null);
  const [recommended, setRecommended] = React.useState(null);
  const [featured, setFeatured] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      // set workoutsToBeContinued
      let workoutsToBeContinued = [];
      let unfinishedRecords = [];
      const unfinishedRecordsRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("recorded workouts")
        .where("timeCompleted", "==", null)
        .orderBy("timeStarted")
        .limit(15);
      const unfinishedRecordsDocs = await unfinishedRecordsRef.get();
      unfinishedRecordsDocs.forEach((doc) => {
        unfinishedRecords.push(doc.data());
      });

      // shorthand way of making sure workouts are distinct.
      unfinishedRecords = unfinishedRecords.filter(
        (v, i, a) => a.findIndex((t) => t.workoutID === v.workoutID) === i
      );

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

      // set recommended
      let standard = {};
      let myLibrary = [];
      let workoutsInMyLibrary = [];
      let workoutPromises2 = [];
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);
      const myDoc = await myRef.get();
      const my = myDoc.data();
      if (my.library) {
        myLibrary = [...my.library];
        for (let i = 0; i < myLibrary.length; ++i) {
          const workoutRef = firebase
            .firestore()
            .collection("workouts")
            .doc(myLibrary[i].workoutID);
          const workoutPromise = workoutRef.get().then((doc) => {
            workoutsInMyLibrary.push(doc.data());
          });
          workoutPromises2.push(workoutPromise);
        }
        Promise.all(workoutPromises2).then(() => {
          standard.isStrength = workoutsInMyLibrary[0].isStrength;
          standard.isCardio = workoutsInMyLibrary[0].isCardio;
          standard.isSpeed = workoutsInMyLibrary[0].isSpeed;
          standard.isBalance = workoutsInMyLibrary[0].isBalance;
          standard.isYoga = workoutsInMyLibrary[0].isYoga;
          standard.isBarNeeded = workoutsInMyLibrary[0].isBarNeeded;
          standard.isChairNeeded = workoutsInMyLibrary[0].isChairNeeded;
          standard.isTowelNeeded = workoutsInMyLibrary[0].isTowelNeeded;
          standard.isMatNeeded = workoutsInMyLibrary[0].isMatNeeded;
          standard.isWeightNeeded = workoutsInMyLibrary[0].isWeightNeeded;

          for (let i = 1; i < workoutsInMyLibrary.length; ++i) {
            standard.isStrength += workoutsInMyLibrary[i].isStrength;
            standard.isCardio += workoutsInMyLibrary[i].isCardio;
            standard.isSpeed += workoutsInMyLibrary[i].isSpeed;
            standard.isBalance += workoutsInMyLibrary[i].isBalance;
            standard.isYoga += workoutsInMyLibrary[i].isYoga;
            standard.isBarNeeded += workoutsInMyLibrary[i].isBarNeeded;
            standard.isChairNeeded += workoutsInMyLibrary[i].isChairNeeded;
            standard.isTowelNeeded += workoutsInMyLibrary[i].isTowelNeeded;
            standard.isMatNeeded += workoutsInMyLibrary[i].isMatNeeded;
            standard.isWeightNeeded += workoutsInMyLibrary[i].isWeightNeeded;
          }
          standard.isStrength /= workoutsInMyLibrary.length;
          standard.isCardio /= workoutsInMyLibrary.length;
          standard.isSpeed /= workoutsInMyLibrary.length;
          standard.isBalance /= workoutsInMyLibrary.length;
          standard.isYoga /= workoutsInMyLibrary.length;
          standard.isBarNeeded /= workoutsInMyLibrary.length;
          standard.isChairNeeded /= workoutsInMyLibrary.length;
          standard.isTowelNeeded /= workoutsInMyLibrary.length;
          standard.isMatNeeded /= workoutsInMyLibrary.length;
          standard.isWeightNeeded /= workoutsInMyLibrary.length;
        });
        let myHistory = my.history ? [...my.history] : [];
        let stop = myHistory.length < 10 ? myHistory.length : 10;
        let recentHistory = [];
        for (let i = 0; i < stop; ++i) {
          recentHistory.push(myHistory[i].workoutID);
        }

        //TODO::: figure out. Basics first. I know that library must be changed. When I add to a library, that workout must have a field that incremenets. When I remove from a library I also decrement the field on that workout.

        let lessRecentWorkouts = [];
        const workoutsRef = firebase
          .firestore()
          .collection("workouts")
          .where("workoutID", "not-in", recentHistory)
          .where("public", "==", true)
          .limit(20);
        const workoutsDocs = await workoutsRef.get();
        workoutsDocs.forEach((doc) => {
          lessRecentWorkouts.push(doc.data());
        });
        // todo ok. I have my less recent workouts. now I wanna check them against the standard
        // todo and pick the best 5
        let recommended = [];
        for (let i = 0; i < lessRecentWorkouts.length; ++i) {
          let recommendedObject = {};
          recommendedObject.name = lessRecentWorkouts[i].workoutName;
          recommendedObject.image = lessRecentWorkouts[i].workoutImage;
          recommendedObject.workoutID = lessRecentWorkouts[i].workoutID;
          recommendedObject.score = Math.abs(
            lessRecentWorkouts[i].isStrength - standard.isStrength
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isCardio - standard.isCardio
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isSpeed - standard.isSpeed
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isYoga - standard.isYoga
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isBalance - standard.isBalance
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isBarNeeded - standard.isBarNeeded
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isChairNeeded - standard.isChairNeeded
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isMatNeeded - standard.isMatNeeded
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isTowelNeeded - standard.isTowelNeeded
          );
          recommendedObject.score += Math.abs(
            lessRecentWorkouts[i].isWeightNeeded - standard.isWeightNeeded
          );
          recommended.push(recommendedObject);
        }
        recommended = recommended.sort((a, b) => {
          return a.score > b.score ? 1 : -1;
        });
        setRecommended(recommended);
      }
      // set featured

      // todo: build featured list based off of top 5 most favorited workouts.
      let featured = [];
      const workoutsRef = firebase
        .firestore()
        .collection("workouts")
        .orderBy("favorites")
        .limit(5);
      const workoutsDocs = await workoutsRef.get();
      workoutsDocs.forEach((doc) => {
        featured.push(doc.data());
      });
      setFeatured(featured);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

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
              <View style={{ paddingTop: 5, paddingBottom: 10 }}>
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
                      key={item.workoutID}
                      style={{ paddingRight: 10 }}
                      onPress={() => {
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
            <View style={{ height: 200 }}>
              <View>
                <Text
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  Recommended
                </Text>
              </View>
              <View style={{ paddingTop: 5, paddingBottom: 10 }}>
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
                {recommended?.map((item) => {
                  return (
                    <TouchableHighlight
                      key={item.workoutID}
                      style={{ paddingRight: 10 }}
                      onPress={() => {
                        navigation.navigate("Start Workout", {
                          workoutID: item.workoutID,
                          current: 0,
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
            <View style={{ height: 200 }}>
              <View>
                <Text
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  Featured
                </Text>
              </View>
              <View style={{ paddingTop: 5, paddingBottom: 10 }}>
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
                {featured?.map((item) => {
                  return (
                    <TouchableHighlight
                      key={item.workoutID}
                      style={{ paddingRight: 10 }}
                      onPress={() => {
                        navigation.navigate("Start Workout", {
                          workoutID: item.workoutID,
                          current: 0,
                        });
                      }}
                    >
                      <View>
                        <Image
                          style={{ width: 100, height: 100 }}
                          source={
                            item.workoutImage
                              ? { uri: item.workoutImage, cache: "force-cache" }
                              : require("../assets/placeholder-image.png")
                          }
                        />
                        <Text>{item.workoutName}</Text>
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
