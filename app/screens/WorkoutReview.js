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
      const myID = firebase.auth().currentUser.uid;

      const recordedWorkoutRef = firebase
        .firestore()
        .collection("users")
        .doc(myID)
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
      setLatestStats(latest.exerciseInputData);

      let best = latest.exerciseInputData;
      let totalReps = [];
      let totalWeight = [];
      let totalTime = [];
      let totalRecords = allMyStats.length;
      let totalExercisesPerRecord = allMyStats[0].exerciseInputData.length;

      for (var i = 0; i < totalRecords; ++i) {
        for (var j = 0; j < totalExercisesPerRecord; ++j) {
          let reps = parseInt(allMyStats[i].exerciseInputData[j].reps);
          let weight = parseInt(allMyStats[i].exerciseInputData[j].weight);
          let time = parseInt(allMyStats[i].exerciseInputData[j].time);

          if (reps > best[j].reps) {
            best[j].reps = reps;
          }
          if (weight > best[j].weight) {
            best[j].weight = weight;
          }
          if (time > best[j].time) {
            best[j].time = time;
          }

          if (i == 0) {
            totalReps[j] = reps;
            totalWeight[j] = weight;
            totalTime[j] = time;
          } else {
            totalReps[j] += reps;
            totalWeight[j] += weight;
            totalTime[j] += time;
          }
        }
      }

      let average = [];

      for (var k = 0; k < totalExercisesPerRecord; ++k) {
        var exerciseAverageStats = {};
        exerciseAverageStats.name = allMyStats[0].exerciseInputData[k].name;
        exerciseAverageStats.reps = Math.round(totalReps[k] / totalRecords);
        // exerciseAverageStats.weight = Math.round(totalWeight[k] / totalRecords);
        // exerciseAverageStats.time = Math.round(totalTime[k] / totalRecords);
        average[k] = exerciseAverageStats;
      }
      setAverageStats(average);
      setBestStats(best);

      const myRef = firebase.firestore().collection("users").doc(myID);
      const myDoc = await myRef.get();
      const my = myDoc.data();

      if (!my.friends) {
        setLoading(false);
        return;
      }

      const friends = [...my.friends];

      setMyFriendsIDs[friends];
      const friendsWorkouts = [];
      const friendStatsQueries = [];
      console.log("got here 1");
      for (let i = 0; i < friends.length; ++i) {
        let friend = friends[i].userID;
        console.log(friend);
        var friendsStatRef = firebase
          .firestore()
          .collection("users")
          .doc(friend)
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
      console.log("got here 2");
      Promise.all(friendStatsQueries).then(() => {
        console.log("friends workouts");
        console.log(friendsWorkouts);
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
      <View style={{ margin: 20, marginTop: 40 }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          {workout.workoutName}
        </Text>
      </View>
      <View style={{ justifyContent: "center", flexDirection: "column" }}>
        <View
          style={{
            flexDirection: "row",
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
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                <Text>
                  {item.reps ? "Reps: " + item.reps : " "}
                  {item.weight ? "Weight: " + item.weight : " "}
                  {item.time ? "Time: " + item.time : " "}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Average</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <FlatList
          data={averageStats}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>
                {item.reps ? "Reps: " + item.reps : " "}
                {item.weight ? "Weight: " + item.weight : " "}
                {item.time ? "Time: " + item.time : " "}
              </Text>
            </View>
          )}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Best</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <FlatList
          data={bestStats}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>
                {item.reps ? "Reps: " + item.reps : " "}
                {item.weight ? "Weight: " + item.weight : " "}
                {item.time ? "Time: " + item.time : " "}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}
