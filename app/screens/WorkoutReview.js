import React from "react";
import firebase from "firebase";
import { View, Text, Modal, Image, TouchableHighlight } from "react-native";
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import MyButton from "../components/Button";
import { Picker } from "@react-native-picker/picker";

export default function WorkoutReview({ navigation, route }) {
  const { workout, exercises } = route.params;

  const [timesCompleted, setTimesCompleted] = React.useState(null);
  const [averageCategory, setAverageCategory] = React.useState(false);
  const [bestCategory, setBestCategory] = React.useState(true);
  const [latestCategory, setLatestCategory] = React.useState(false);
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
      var allMyStats = [];
      recordedWorkoutDocs.forEach((doc) => {
        allMyStats.push(doc.data());
      });
      allMyStats = allMyStats.filter((record) => record.timeCompleted);

      console.log("all my stats");
      console.log(allMyStats);
      console.log(allMyStats.length);
      setTimesCompleted(allMyStats.length);

      const latestDoc = await recordedWorkoutRef
        .orderBy("timeStarted", "desc")
        .limit(1)
        .get();

      var latest = {};
      console.log("all the records in latest doc");
      latestDoc.forEach((doc) => {
        console.log(doc.data());
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

      console.log("best");
      console.log(best);

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

      console.log("average");
      console.log(average);
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

        var friendDoc = await friendRef.get();
        var friendData = friendDoc.data();
        if (friendData) {
          if (friendData.averageStats) {
            let averageStats = [];
            for (let i = 0; i < friendData.averageStats.length; ++i) {
              if (friendData.averageStats[i].workoutID === workoutID) {
                let averageStatsOfAParticularUserForThisParticularWorkout = {};

                averageStatsOfAParticularUserForThisParticularWorkout.userID =
                  friend;
                averageStatsOfAParticularUserForThisParticularWorkout.workoutID =
                  workoutID;
                averageStatsOfAParticularUserForThisParticularWorkout.exerciseInputData =
                  friendData.averageStats[i].exerciseInputData;

                averageStats.push(
                  averageStatsOfAParticularUserForThisParticularWorkout
                );
              }
            }
            setFriendsAverageStats(averageStats);
          }

          if (friendData.bestStats) {
            let bestStats = [];
            for (let i = 0; i < friendData.averageStats.length; ++i) {
              if (friendData.bestStats[i].workoutID === workoutID) {
                let bestStatsOfAParticularUserForThisParticularWorkout = {};

                bestStatsOfAParticularUserForThisParticularWorkout.userID =
                  friend;
                bestStatsOfAParticularUserForThisParticularWorkout.workoutID =
                  workoutID;
                bestStatsOfAParticularUserForThisParticularWorkout.exerciseInputData =
                  friendData.bestStats[i].exerciseInputData;

                bestStats.push(
                  bestStatsOfAParticularUserForThisParticularWorkout
                );
              }
            }
            setFriendsBestStats(bestStats);
          }
        }
      }
      Promise.all(friendLatestStatsQueries).then(() => {
        setFriendsLatestStats(friendsLatestWorkouts);
      });
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
  }

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
      <View
        style={{
          justifyContent: "center",
          marginTop: "6%",
          position: "fixed",
          height: "auto",
          padding: 10,
          borderBottomColor: "black",
          borderBottomWidth: 1,
          width: "100%",
        }}
      >
        <Text style={{ fontSize: 25, fontWeight: "bold", marginLeft: "4.8%" }}>
          Review {workout.workoutName}
        </Text>
        <Text style={{ marginLeft: "4.8%" }}>
          You have completed this workout {timesCompleted} times
        </Text>
      </View>

      <View
        style={{
          width: "100%",
          height: "10%",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <TouchableHighlight
          onPress={() => {
            setAverageCategory(true);
            setBestCategory(false);
            setLatestCategory(false);
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              color: averageCategory ? "blue" : "black",
            }}
          >
            Average
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            setBestCategory(true);
            setAverageCategory(false);
            setLatestCategory(false);
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              color: bestCategory ? "blue" : "black",
            }}
          >
            Best
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            setLatestCategory(true);
            setAverageCategory(false);
            setBestCategory(false);
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: latestCategory ? "blue" : "black",
              fontSize: 20,
            }}
          >
            Latest
          </Text>
        </TouchableHighlight>
      </View>
      <ScrollView>
        {friend ? (
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ flex: 1 }}></View>
            <View
              style={{
                flexDirection: "row",
                flex: 2,
                justifyContent: "space-around",
                alignItems: "center",
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
          }}
        >
          <View style={{ flex: 2 }}>
            <FlatList
              style={{}}
              data={
                averageCategory
                  ? averageStats
                  : bestCategory
                  ? bestStats
                  : latestStats
              }
              renderItem={({ item, index }) => (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignContent: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      paddingTop: 10,
                      paddingBottom: 10,
                      paddingLeft: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}. {item.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      paddingBottom: 10,
                      paddingTop: 10,
                      paddingLeft: 20,
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
                        ? "Reps: " + item.reps + "\n" + "Weight: " + item.weight
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
          {friend ? (
            <View
              style={{
                flex: 1,
              }}
            >
              <FlatList
                style={{}}
                data={
                  averageCategory
                    ? friend.averageStats
                    : bestCategory
                    ? friend.bestStats
                    : friend.latestStats
                }
                renderItem={({ item }) => (
                  <View
                    style={{
                      flex: 1,
                      paddingBottom: 10,
                      paddingTop: 10,
                      paddingLeft: 20,
                    }}
                  >
                    <Text style={{ textAlign: "left" }}>
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
                        ? "Reps: " + item.reps + "\n" + "Weight: " + item.weight
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
                )}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
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
              onValueChange={(itemValue) => {
                var friendObject = {};
                friendObject.userID = itemValue;
                for (let i = 0; i < friends.length; ++i) {
                  if (friends[i].userID === itemValue) {
                    friendObject.displayName = friends[i].displayName;
                    friendObject.profilePicture = friends[i].profilePicture;
                  }
                }
                for (let i = 0; i < friendsLatestStats.length; ++i) {
                  if (friendsLatestStats[i].userID === itemValue) {
                    friendObject.latestStats =
                      friendsLatestStats[i].exerciseInputData;
                  }
                }

                for (let i = 0; i < friendsAverageStats.length; ++i) {
                  if (friendsAverageStats[i].userID === itemValue) {
                    friendObject.averageStats =
                      friendsAverageStats[i].exerciseInputData;
                  }
                }
                for (let i = 0; i < friendsBestStats.length; ++i) {
                  if (friendsBestStats[i].userID === itemValue) {
                    friendObject.bestStats =
                      friendsBestStats[i].exerciseInputData;
                  }
                }
                setFriend(friendObject);
              }}
            >
              {friends?.map((friend) => {
                return (
                  <Picker.Item
                    key={friend.userID}
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
            <TouchableOpacity
              onPress={() => {
                setFriend(null);
              }}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
