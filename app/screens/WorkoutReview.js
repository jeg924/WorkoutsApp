import React from "react";
import firebase from "firebase";
import { View, Text, Modal, Image, TouchableHighlight } from "react-native";
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Header from "../components/Header";

export default function WorkoutReview({ navigation, route }) {
  const { workout, exercises } = route.params;
  const { colors } = useTheme();
  const [timesCompleted, setTimesCompleted] = React.useState(null);

  const [tabIndex, setTabIndex] = React.useState(2);

  const [myProfilePicture, setMyProfilePicture] = React.useState(null);
  const [myDisplayName, setMyDisplayName] = React.useState(null);
  const [latestStats, setLatestStats] = React.useState(null);
  const [averageStats, setAverageStats] = React.useState(null);
  const [bestStats, setBestStats] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [friends, setFriends] = React.useState(null);
  const [friendsLatestStats, setFriendsLatestStats] = React.useState(null);
  const [friendsBestStats, setFriendsBestStats] = React.useState(null);
  const [friendsAverageStats, setFriendsAverageStats] = React.useState(null);
  const [friend, setFriend] = React.useState(null);

  const updateFriend = (friend) => {
    if (friend.hasStatsForThisWorkout) {
      setFriend(friend);
    } else {
      alert("This friend does not have any stats for this workout yet.");
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadData() {
    try {
      setLoading(true);

      const workoutID = workout.workoutID;
      const myID = firebase.auth().currentUser.uid;

      const recordedWorkoutRef = firebase
        .firestore()
        .collection("users")
        .doc(myID)
        .collection("recorded workouts")
        .where("workoutID", "==", workoutID);
      const recordedWorkoutDocs = await recordedWorkoutRef.get();
      var allMyStats = [];
      recordedWorkoutDocs.forEach((doc) => {
        allMyStats.push(doc.data());
      });
      allMyStats = allMyStats.filter((record) => record.timeCompleted);

      // console.log("all my stats");
      // console.log(allMyStats);
      // console.log(allMyStats.length);
      setTimesCompleted(allMyStats.length);

      const latestDoc = await recordedWorkoutRef
        .orderBy("timeStarted", "desc")
        .limit(1)
        .get();

      var latest = {};
      // console.log("all the records in latest doc");
      latestDoc.forEach((doc) => {
        // console.log(doc.data());
        latest = doc.data();
      });
      // console.log("latest");
      // console.log(latest);
      setLatestStats(latest.exerciseInputData);

      // Could be partially empty.
      let best = JSON.parse(JSON.stringify(latest.exerciseInputData));
      let totalReps = [];
      let totalWeight = [];
      let totalTime = [];
      let totalRecords = allMyStats.length;
      let maxExercisesPerRecord = exercises.length;
      let totalRecordsPerExerciseThatTrackReps = [];
      let totalRecordsPerExerciseThatTrackWeight = [];
      let totalRecordsPerExerciseThatTrackTime = [];

      for (var i = 0; i < totalRecords; ++i) {
        for (var j = 0; j < maxExercisesPerRecord; ++j) {
          if (allMyStats[i].exerciseInputData[j] == undefined) {
            // the user started a workout but didn't finish.
            continue;
          }
          let reps = allMyStats[i].exerciseInputData[j].reps;
          let weight = allMyStats[i].exerciseInputData[j].weight;
          let time = allMyStats[i].exerciseInputData[j].time;

          // assuming for now the only way they can get to the workout review,
          // is that their latest (and best) has complete exercise input data.
          // even if that data is null.
          if (reps > best[j].reps) {
            best[j].reps = reps;
          }
          if (weight > best[j].weight) {
            best[j].weight = weight;
          }
          if (time > best[j].time) {
            best[j].time = time;
          }

          // only input is counted. if the user skipped exercises
          // or completed them but didn't fill out all the input data
          // they're just not counted in the calculation for average.
          if (i == 0) {
            if (reps) {
              totalReps[j] = reps;
              totalRecordsPerExerciseThatTrackReps[j] = 1;
            }
            if (weight) {
              totalWeight[j] = weight;
              totalRecordsPerExerciseThatTrackWeight[j] = 1;
            }
            if (time) {
              totalTime[j] = time;
              totalRecordsPerExerciseThatTrackTime[j] = 1;
            }
          } else {
            if (reps) {
              totalReps[j] += reps;
              totalRecordsPerExerciseThatTrackReps[j] += 1;
            }
            if (weight) {
              totalWeight[j] += weight;
              totalRecordsPerExerciseThatTrackWeight[j] += 1;
            }
            if (time) {
              totalTime[j] += time;
              totalRecordsPerExerciseThatTrackTime[j] += 1;
            }
          }
        }
      }

      // console.log("best");
      // console.log(best);

      setBestStats(best);

      const myRef = firebase.firestore().collection("users").doc(myID);
      const myDoc = await myRef.get();
      const my = myDoc.data();

      var bestStatsForThisWorkoutObject = {};
      bestStatsForThisWorkoutObject.workoutID = workoutID;
      bestStatsForThisWorkoutObject.exerciseInputData = best;

      var bestStats = my.bestStats ? [...my.bestStats] : [];
      if (
        !bestStats.some(
          (statsForAWorkout) => statsForAWorkout.workoutID === workoutID
        )
      ) {
        bestStats.push(bestStatsForThisWorkoutObject);
      }

      myRef.set({ bestStats: bestStats }, { merge: true });

      let average = [];

      for (var k = 0; k < maxExercisesPerRecord; ++k) {
        var exerciseAverageStats = {};
        exerciseAverageStats.name = allMyStats[0].exerciseInputData[k].name;
        exerciseAverageStats.reps = Math.round(
          totalReps[k] / totalRecordsPerExerciseThatTrackReps[k]
        );
        exerciseAverageStats.weight = Math.round(
          totalWeight[k] / totalRecordsPerExerciseThatTrackWeight[k]
        );
        exerciseAverageStats.time = Math.round(
          totalTime[k] / totalRecordsPerExerciseThatTrackTime[k]
        );
        average[k] = exerciseAverageStats;
      }

      // console.log("average");
      // console.log(average);
      setAverageStats(average);

      var averageStatsForThisWorkoutObject = {};
      averageStatsForThisWorkoutObject.workoutID = workoutID;
      averageStatsForThisWorkoutObject.exerciseInputData = average;

      var averageStats = my.averageStats ? [...my.averageStats] : [];
      if (
        !averageStats.some(
          (statsForAWorkout) => statsForAWorkout.workoutID === workoutID
        )
      ) {
        averageStats.push(averageStatsForThisWorkoutObject);
      }

      myRef.set({ averageStats: averageStats }, { merge: true });

      if (my.photoURL) {
        await Image.prefetch(my.photoURL);
        setMyProfilePicture(my.photoURL);
      }
      setMyDisplayName(my.displayName);

      if (!my.friends) {
        setLoading(false);
        return;
      }

      const friends = [...my.friends];
      setFriends(friends);

      const friendsLatestWorkouts = [];
      const friendLatestStatsQueries = [];
      const friendsAverageStats = [];
      const friendsBestStats = [];
      const friendAverageAndBestStatsQueries = [];

      for (let i = 0; i < friends.length; ++i) {
        let friend = friends[i].userID;
        var friendRef = firebase.firestore().collection("users").doc(friend);

        var friendsLatestStatRef = friendRef
          .collection("recorded workouts")
          .where("workoutID", "==", workoutID)
          .orderBy("timeStarted", "desc")
          .limit(1);

        var friendLatestStatPromise = friendsLatestStatRef
          .get()
          .then((friendsLatestStatDocs) => {
            if (friendsLatestStatDocs.size) {
              var doc = friendsLatestStatDocs.docs[0];
              var friendLatestStatData = doc.data();
              friendLatestStatData.userID = friend;

              friendsLatestWorkouts.push(friendLatestStatData);
            }
          });

        friendLatestStatsQueries.push(friendLatestStatPromise);

        var friendBestAndAverageStatsPromise = friendRef
          .get()
          .then((friendDoc) => {
            var friendData = friendDoc.data();
            if (friendData) {
              if (friendData.averageStats) {
                let averageStats = [];
                for (let i = 0; i < friendData.averageStats.length; ++i) {
                  if (friendData.averageStats[i].workoutID === workoutID) {
                    let averageStatsOfAParticularUserForThisParticularWorkout =
                      {};
                    averageStatsOfAParticularUserForThisParticularWorkout.userID =
                      friend;
                    averageStatsOfAParticularUserForThisParticularWorkout.workoutID =
                      workoutID;
                    averageStatsOfAParticularUserForThisParticularWorkout.exerciseInputData =
                      friendData.averageStats[i].exerciseInputData;

                    friendsAverageStats.push(
                      averageStatsOfAParticularUserForThisParticularWorkout
                    );
                  }
                }
              }
              if (friendData.bestStats) {
                for (let i = 0; i < friendData.averageStats.length; ++i) {
                  if (friendData.bestStats[i].workoutID === workoutID) {
                    let bestStatsOfAParticularUserForThisParticularWorkout = {};

                    bestStatsOfAParticularUserForThisParticularWorkout.userID =
                      friend;
                    bestStatsOfAParticularUserForThisParticularWorkout.workoutID =
                      workoutID;
                    bestStatsOfAParticularUserForThisParticularWorkout.exerciseInputData =
                      friendData.bestStats[i].exerciseInputData;

                    friendsBestStats.push(
                      bestStatsOfAParticularUserForThisParticularWorkout
                    );
                  }
                }
              }
            }
          });
        friendAverageAndBestStatsQueries.push(friendBestAndAverageStatsPromise);
      }
      Promise.all(friendLatestStatsQueries).then(() => {
        setFriendsLatestStats(friendsLatestWorkouts);
      });
      Promise.all(friendAverageAndBestStatsQueries).then(() => {
        setFriendsAverageStats(friendsAverageStats);
        setFriendsBestStats(friendsBestStats);
      });
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
  }

  // console.log("friendToCompareWith");
  // console.log(friendToCompareWith);

  // console.log("my friends");
  // console.log(friends);

  // console.log("friend latest stats");
  // console.log(friendsLatestStats);
  // console.log("friend average stats");
  // console.log(friendsAverageStats);
  // console.log("friend best stats");
  // console.log(friendsBestStats);

  console.log("friend");
  console.log(friend);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <Header title="Review Workout" navigation={navigation} />
      <SegmentedControl
        values={["Latest", "Average", "Best"]}
        selectedIndex={tabIndex}
        onChange={(event) => {
          setTabIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        tintColor={colors.card}
        fontStyle={{ color: "black" }}
        activeFontStyle={{ color: "white" }}
        style={{ height: 50 }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ height: 50, flexDirection: "row" }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 18 }}>
            <Text style={{ fontWeight: "bold", fontSize: 30 }}>
              {workout.workoutName}
            </Text>
            <Text>You've completed this workout {timesCompleted} times.</Text>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        {friend ? (
          <View style={{ flex: 0.25, flexDirection: "row" }}>
            <View style={{ flex: 1 }}></View>
            <View
              style={{
                flexDirection: "row",
                flex: 2,
                justifyContent: "space-around",
                padding: 10,
              }}
            >
              <View>
                <Image
                  source={{
                    uri: myProfilePicture,
                    cache: "force-cache",
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 100,
                  }}
                />
                <Text
                  style={{
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                >
                  {myDisplayName}
                </Text>
              </View>
              <View>
                <Image
                  source={{
                    uri: friend.profilePicture,
                    cache: "reload",
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 100,
                  }}
                />
                <Text
                  style={{
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                >
                  {friend.displayName}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: "gainsboro",
          }}
        >
          {friend ? (
            <ScrollView style={{}} contentContainerStyle={{}}>
              {tabIndex === 0 ? (
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View style={{ flex: 2 }}>
                    {latestStats.map((item, index) => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignContent: "center",
                            height: 60,
                            borderBottomWidth: 1,
                            borderBottomColor: "gainsboro",
                          }}
                        >
                          <View
                            style={{
                              flex: 1.5,
                              justifyContent: "center",
                              paddingLeft: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                              }}
                            >
                              {index + 1}. {item.name}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              paddingLeft: 10,
                            }}
                          >
                            <Text style={{}}>
                              {item.reps && !item.weight && !item.time
                                ? "Reps: " + item.reps
                                : null}
                              {item.weight && !item.weight && !item.time
                                ? "Weight: " + item.weight
                                : null}
                              {item.time && !item.reps && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.reps && item.weight && !item.time
                                ? "Reps: " +
                                  item.reps +
                                  "\n" +
                                  "Weight: " +
                                  item.weight
                                : null}
                              {item.reps && item.time && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && !item.reps
                                ? item.time % 60 >= 10
                                  ? "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && item.reps
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  <View style={{ flex: 1 }}>
                    {friend.latestStats.map((item) => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            alignContent: "center",
                            height: 60,
                            borderBottomWidth: 1,
                            borderBottomColor: "gainsboro",
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              paddingLeft: 25,
                            }}
                          >
                            <Text style={{}}>
                              {item.reps && !item.weight && !item.time
                                ? "Reps: " + item.reps
                                : null}
                              {item.weight && !item.weight && !item.time
                                ? "Weight: " + item.weight
                                : null}
                              {item.time && !item.reps && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.reps && item.weight && !item.time
                                ? "Reps: " +
                                  item.reps +
                                  "\n" +
                                  "Weight: " +
                                  item.weight
                                : null}
                              {item.reps && item.time && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && !item.reps
                                ? item.time % 60 >= 10
                                  ? "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && item.reps
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : tabIndex === 1 ? (
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View style={{ flex: 2 }}>
                    {averageStats.map((item, index) => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignContent: "center",
                            height: 60,
                            borderBottomWidth: 1,
                            borderBottomColor: "gainsboro",
                          }}
                        >
                          <View
                            style={{
                              flex: 1.5,
                              justifyContent: "center",
                              paddingLeft: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                              }}
                            >
                              {index + 1}. {item.name}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              paddingLeft: 10,
                            }}
                          >
                            <Text style={{}}>
                              {item.reps && !item.weight && !item.time
                                ? "Reps: " + item.reps
                                : null}
                              {item.weight && !item.weight && !item.time
                                ? "Weight: " + item.weight
                                : null}
                              {item.time && !item.reps && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.reps && item.weight && !item.time
                                ? "Reps: " +
                                  item.reps +
                                  "\n" +
                                  "Weight: " +
                                  item.weight
                                : null}
                              {item.reps && item.time && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && !item.reps
                                ? item.time % 60 >= 10
                                  ? "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && item.reps
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  <View style={{ flex: 1 }}>
                    {friend.averageStats.map((item) => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            alignContent: "center",
                            height: 60,
                            borderBottomWidth: 1,
                            borderBottomColor: "gainsboro",
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              paddingLeft: 25,
                            }}
                          >
                            <Text style={{}}>
                              {item.reps && !item.weight && !item.time
                                ? "Reps: " + item.reps
                                : null}
                              {item.weight && !item.weight && !item.time
                                ? "Weight: " + item.weight
                                : null}
                              {item.time && !item.reps && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.reps && item.weight && !item.time
                                ? "Reps: " +
                                  item.reps +
                                  "\n" +
                                  "Weight: " +
                                  item.weight
                                : null}
                              {item.reps && item.time && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && !item.reps
                                ? item.time % 60 >= 10
                                  ? "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && item.reps
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View style={{ flex: 2 }}>
                    {bestStats.map((item, index) => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignContent: "center",
                            height: 60,
                            borderBottomWidth: 1,
                            borderBottomColor: "gainsboro",
                          }}
                        >
                          <View
                            style={{
                              flex: 1.5,
                              justifyContent: "center",
                              paddingLeft: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                              }}
                            >
                              {index + 1}. {item.name}
                            </Text>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              paddingLeft: 10,
                            }}
                          >
                            <Text style={{}}>
                              {item.reps && !item.weight && !item.time
                                ? "Reps: " + item.reps
                                : null}
                              {item.weight && !item.weight && !item.time
                                ? "Weight: " + item.weight
                                : null}
                              {item.time && !item.reps && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.reps && item.weight && !item.time
                                ? "Reps: " +
                                  item.reps +
                                  "\n" +
                                  "Weight: " +
                                  item.weight
                                : null}
                              {item.reps && item.time && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && !item.reps
                                ? item.time % 60 >= 10
                                  ? "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && item.reps
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  <View style={{ flex: 1 }}>
                    {friend.bestStats.map((item) => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            alignContent: "center",
                            height: 60,
                            borderBottomWidth: 1,
                            borderBottomColor: "gainsboro",
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              paddingLeft: 25,
                            }}
                          >
                            <Text style={{}}>
                              {item.reps && !item.weight && !item.time
                                ? "Reps: " + item.reps
                                : null}
                              {item.weight && !item.weight && !item.time
                                ? "Weight: " + item.weight
                                : null}
                              {item.time && !item.reps && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.reps && item.weight && !item.time
                                ? "Reps: " +
                                  item.reps +
                                  "\n" +
                                  "Weight: " +
                                  item.weight
                                : null}
                              {item.reps && item.time && !item.weight
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && !item.reps
                                ? item.time % 60 >= 10
                                  ? "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                              {item.weight && item.time && item.reps
                                ? item.time % 60 >= 10
                                  ? "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":" +
                                    (item.time % 60)
                                  : "Reps: " +
                                    item.reps +
                                    "\n" +
                                    "Weight: " +
                                    item.weight +
                                    "\n" +
                                    "Time: " +
                                    Math.floor(item.time / 60) +
                                    ":0" +
                                    (item.time % 60)
                                : null}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={{ flex: 1 }}>
              <FlatList
                style={{}}
                data={
                  tabIndex === 0
                    ? latestStats
                    : tabIndex === 1
                    ? averageStats
                    : bestStats
                }
                renderItem={({ item, index }) => (
                  // <View
                  //         style={{
                  //           flex: 1,
                  //           flexDirection: "row",
                  //           alignContent: "center",
                  //           height: 60,
                  //           borderBottomWidth: 1,
                  //         }}
                  //       >
                  //         <View
                  //           style={{
                  //             flex: 1.5,
                  //             justifyContent: "center",
                  //             paddingLeft: 10,
                  //           }}
                  //         >
                  //           <Text
                  //             style={{
                  //               fontSize: 16,
                  //               fontWeight: "bold",
                  //             }}
                  //           >
                  //             {index + 1}. {item.name}
                  //           </Text>
                  //         </View>
                  //         <View
                  //           style={{
                  //             flex: 1,
                  //             justifyContent: "center",
                  //             paddingLeft: 10,
                  //           }}
                  //         >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignContent: "center",
                      height: 60,
                      borderBottomWidth: 1,
                      borderBottomColor: "gainsboro",
                    }}
                  >
                    <View
                      style={{
                        flex: 1.5,
                        justifyContent: "center",
                        paddingLeft: 18,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}. {item.name}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{}}>
                        {item.reps && !item.weight && !item.time
                          ? "Reps: " + item.reps
                          : null}
                        {item.weight && !item.weight && !item.time
                          ? "Weight: " + item.weight
                          : null}
                        {item.time && !item.reps && !item.weight
                          ? item.time % 60 >= 10
                            ? "Time: " +
                              Math.floor(item.time / 60) +
                              ":" +
                              (item.time % 60)
                            : "Time: " +
                              Math.floor(item.time / 60) +
                              ":0" +
                              (item.time % 60)
                          : null}
                        {item.reps && item.weight && !item.time
                          ? "Reps: " +
                            item.reps +
                            "\n" +
                            "Weight: " +
                            item.weight
                          : null}
                        {item.reps && item.time && !item.weight
                          ? item.time % 60 >= 10
                            ? "Reps: " +
                              item.reps +
                              "\n" +
                              "Time: " +
                              Math.floor(item.time / 60) +
                              ":" +
                              (item.time % 60)
                            : "Reps: " +
                              item.reps +
                              "\n" +
                              "Time: " +
                              Math.floor(item.time / 60) +
                              ":0" +
                              (item.time % 60)
                          : null}
                        {item.weight && item.time && !item.reps
                          ? item.time % 60 >= 10
                            ? "Weight: " +
                              item.weight +
                              "\n" +
                              "Time: " +
                              Math.floor(item.time / 60) +
                              ":" +
                              (item.time % 60)
                            : "Weight: " +
                              item.weight +
                              "\n" +
                              "Time: " +
                              Math.floor(item.time / 60) +
                              ":0" +
                              (item.time % 60)
                          : null}
                        {item.weight && item.time && item.reps
                          ? item.time % 60 >= 10
                            ? "Reps: " +
                              item.reps +
                              "\n" +
                              "Weight: " +
                              item.weight +
                              "\n" +
                              "Time: " +
                              Math.floor(item.time / 60) +
                              ":" +
                              (item.time % 60)
                            : "Reps: " +
                              item.reps +
                              "\n" +
                              "Weight: " +
                              item.weight +
                              "\n" +
                              "Time: " +
                              Math.floor(item.time / 60) +
                              ":0" +
                              (item.time % 60)
                          : null}
                      </Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      </View>
      {friends ? (
        !friend ? (
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SolidButton
              title="Compare with a Friend"
              onPress={() => {
                navigation.navigate("Modal Friend Picker", {
                  friends: friends,
                  friendsAverageStats: friendsAverageStats,
                  friendsBestStats: friendsBestStats,
                  friendsLatestStats: friendsLatestStats,
                  updateFriend: updateFriend,
                });
              }}
            />
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SolidButton
              title="Stop Comparing"
              onPress={() => {
                setFriend(null);
              }}
            />
          </View>
        )
      ) : null}
    </View>
  );
}
