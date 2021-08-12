import React, { useEffect } from "react";
import firebase from "firebase";
import { View, Text, Modal } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import MyButton from "../components/Button";
import { Picker } from "@react-native-picker/picker";

export default function WorkoutReview({ navigation, route }) {
  const { workout, exercises } = route.params;

  const [latestStats, setLatestStats] = React.useState(null);
  const [averageStats, setAverageStats] = React.useState(null);
  const [bestStats, setBestStats] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [friends, setFriends] = React.useState(null);
  const [friendsStats, setFriendsStats] = React.useState(null); // [{ workoutId, recordId, timeStarted, exerciseInputData }, { ... }
  const [modalVisible, setModalVisible] = React.useState(false);
  const [friend, setFriend] = React.useState(null);

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
      const allMyStats = [];
      recordedWorkoutDocs.forEach((doc) => {
        allMyStats.push(doc.data());
      });
      allMyStats.filter((x) => x.exerciseInputData);

      console.log("all my stats");
      console.log(allMyStats);

      const latestDoc = await recordedWorkoutRef
        .orderBy("timeStarted", "desc")
        .limit(1)
        .get();

      var latest = {};
      latestDoc.forEach((doc) => {
        latest = doc.data();
      });
      console.log("latest");
      console.log(latest);
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

      // todo: handle reps or time or weight is null. Handle missing entries for some exercises.

      for (var i = 0; i < totalRecords; ++i) {
        for (var j = 0; j < maxExercisesPerRecord; ++j) {
          if (allMyStats[i].exerciseInputData[j] == undefined) {
            // the user started a workout but didn't finish.
            continue;
          }
          let reps = allMyStats[i].exerciseInputData[j].reps
            ? parseInt(allMyStats[i].exerciseInputData[j].reps)
            : null;
          let weight = allMyStats[i].exerciseInputData[j].weight
            ? parseInt(allMyStats[i].exerciseInputData[j].weight)
            : null;
          let time = allMyStats[i].exerciseInputData[j].time
            ? parseInt(allMyStats[i].exerciseInputData[j].time)
            : null;

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

      const myRef = firebase.firestore().collection("users").doc(myID);
      const myDoc = await myRef.get();
      const my = myDoc.data();

      if (!my.friends) {
        setLoading(false);
        return;
      }

      const friends = [...my.friends];
      console.log("friends are...");
      console.log(friends);

      setFriends(friends);
      const friendsWorkouts = [];
      const friendStatsQueries = [];
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

  console.log("my friends");
  console.log(friends);
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
      <View>
        <MyButton
          title="Compare with friend"
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // this.closeButtonFunction()
        }}
      >
        <View
          style={{
            height: "50%",
            marginTop: "auto",
            backgroundColor: "white",
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <Picker
              style={{ width: "100%" }}
              selectedValue={friend}
              onValueChange={(itemValue) => setFriend(itemValue)}
            >
              {friends?.map((friend) => {
                return (
                  <Picker.Item
                    label={friend.displayName}
                    value={friend.userID}
                  />
                );
              })}
            </Picker>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <Text>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
