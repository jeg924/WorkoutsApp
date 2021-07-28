import React, { useEffect } from "react";
import firebase from "firebase";
import { View, TextInput, Text, Image, Button } from "react-native";
import { SafeAreaView } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export default function WorkoutReview({ navigation, route }) {
  const { workout, exercises } = route.params;

  const [latestStats, setLatestStats] = React.useState(null);
  const [averageStats, setAverageStats] = React.useState(null);
  const [bestStats, setBestStats] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [myFriendsIDs, setMyFriendsIDs] = React.useState(null);
  const [friendsStats, setFriendsStats] = React.useState(null); // [{ workoutId, recordId, timeStarted, exerciseInputData }, { ... }

  useEffect(() => {
    loadData();
  }, [workout]);

  async function loadData() {
    try {
      setLoading(true);

      const workoutID = workout.workoutID;
      const authID = firebase.auth().currentUser.uid;

      const recordedWorkoutRef = firebase
        .firestore()
        .collection("users")
        .doc(authID)
        .collection("recorded workouts")
        .where("workoutID", "==", workoutID);
      const recordedWorkoutDocs = await recordedWorkoutRef.get();
      const allMyStats = [];
      recordedWorkoutDocs.forEach((doc) => {
        allMyStats.push(doc.data());
      });
      allMyStats.filter((x) => x.exerciseInputData);

      const latestDoc = await recordedWorkoutRef
        .orderBy("timeStarted", "desc")
        .limit(1)
        .get();

      var latest = {};
      latestDoc.forEach((doc) => {
        latest = doc.data();
      });
      var average = allMyStats[0];

      var best = allMyStats[0];
      console.log("latest: " + latest.exerciseInputData[0].reps);
      console.log("average: " + average.exerciseInputData[0].reps);
      console.log("best: " + best.exerciseInputData[0].reps);

      for (var i = 1; i < allMyStats.length; ++i) {
        for (var j = 0; j < allMyStats[i].exerciseInputData.length; ++j) {
          // reps
          if (allMyStats[i].exerciseInputData[j].reps != undefined) {
            average.exerciseInputData[j].reps +=
              allMyStats[i].exerciseInputData[j].reps;
            if (
              allMyStats[i].exerciseInputData[j].reps >
              best.exerciseInputData[j].reps
            ) {
              best.exerciseInputData[j].reps =
                allMyStats[i].exerciseInputData[j].reps;
            }
          }
          // weight
          if (allMyStats[i].exerciseInputData[j].weight != undefined) {
            average.exerciseInputData[j].weight +=
              allMyStats[i].exerciseInputData[j].weight;
            if (
              allMyStats[i].exerciseInputData[j].weight >
              best.exerciseInputData[j].weight
            ) {
              best.exerciseInputData[j].reps =
                allMyStats[i].exerciseInputData[j].reps;
            }
          }
          // time
          if (allMyStats[i].exerciseInputData[j].time != undefined) {
            average.exerciseInputData[j].time +=
              allMyStats[i].exerciseInputData[j].time;
            if (
              allMyStats[i].exerciseInputData[j].time >
              best.exerciseInputData[j].time
            ) {
              best.exerciseInputData[j].reps =
                allMyStats[i].exerciseInputData[j].reps;
            }
          }
        }
      }
      for (var j = 0; j < average.exerciseInputData.length; ++j) {
        average.exerciseInputData[j].reps = Math.round(
          average.exerciseInputData[j].reps / allMyStats.length
        );
        average.exerciseInputData[j].weight = Math.round(
          average.exerciseInputData[j].weight / allMyStats.length
        );
        average.exerciseInputData[j].time = Math.round(
          average.exerciseInputData[j].time / allMyStats.length
        );
      }
      console.log(latest);
      console.log(average);
      console.log(best);
      setLatestStats(latest);
      setAverageStats(average);
      setBestStats(best);

      const userRef = firebase.firestore().collection("users").doc(authID);
      const userDoc = await userRef.get();
      const user = userDoc.data();

      if (!user.friends) {
        setLoading(false);
        return;
      }

      const friends = [...user.friends];

      setMyFriendsIDs[friends];
      const friendsWorkouts = [];
      const friendStatsQueries = [];
      for (let i = 0; i < friends.length; ++i) {
        var friendsStatRef = firebase
          .firestore()
          .collection("users")
          .doc(friends[i])
          .collection("recorded workouts")
          .where("workoutID", "==", workoutID)
          .orderBy("timeStarted", "desc")
          .limit(1);
        var friendStatPromise = friendsStatRef.get().then((friendsStatDocs) => {
          if (friendsStatDocs.size) {
            var doc = friendsStatDocs.docs[0];
            var friendStatData = doc.data();
            friendsWorkouts.push(friendStatData);
          }
        });
        friendStatsQueries.push(friendStatPromise);
      }
      Promise.all(friendStatsQueries).then(() => {
        // if you need to do calculations
        setFriendsStats(friendsWorkouts);
      });
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={{ justifyContent: "center" }}>
      <View style={{ margin: 20, marginTop: 30 }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          {workout.workoutName}
        </Text>
      </View>
      <View style={{ justifyContent: "center", flexDirection: "column" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Latest</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={latestStats}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                <Text>
                  R: {item.latestReps} W: {item.latestWeight} T:
                  {item.latestTime}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}
