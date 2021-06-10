import React from "react";
import firebase from "firebase";
import { View, TextInput, Text, Image } from "react-native";
import { DisplayTimeSegment } from "../UtilityFunctions";
import {
  useCollectionData,
  useDocumentData,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";
import { FlatList, TouchableHighlight } from "react-native-gesture-handler";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Icon } from "react-native-elements";
import Button from "../components/Button";
import { concat, set } from "react-native-reanimated";

export default function StartWorkout({ navigation, route }) {
  const { workoutID } = route.params;
  const [recordID, setRecordID] = React.useState(null);
  const [currentExercise, setCurrentExercise] = React.useState(-1);
  const [isStarting, setIsStarting] = React.useState(false);

  const [workoutData, loadingWorkoutData, errorLoadingWorkoutData] =
    useDocumentDataOnce(
      workoutID
        ? firebase.firestore().collection("workouts").doc(workoutID)
        : null
    );

  const [authorData, loadingAuthorData, errorLoadingAuthorData] =
    useDocumentDataOnce(
      workoutData?.authorID
        ? firebase.firestore().collection("users").doc(workoutData.authorID)
        : null
    );

  const [exercises, exercisesLoading, exercisesError] = useCollectionData(
    firebase
      .firestore()
      .collection("exercises")
      .where("workoutID", "==", workoutID)
  );
  let orderedExercises = [];
  if (exercises) {
    orderedExercises = [...exercises].sort((a, b) => {
      return a.order - b.order;
    });
  }

  const [recordedStats, loadingStats, statsError] = useDocumentData(
    recordID
      ? firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("recorded workouts")
          .doc(recordID)
      : null
  );

  if (
    isStarting ||
    loadingAuthorData ||
    exercisesLoading ||
    loadingWorkoutData ||
    loadingStats
  )
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>loading</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <Image
        style={{ width: "100%", height: "30%" }}
        source={
          workoutData.workoutImage ? { uri: workoutData.workoutImage } : null
        }
      />
      <View style={{ margin: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 30 }}>
          {workoutData.workoutName}
        </Text>
        <Text>By {authorData?.displayName}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableHighlight
          onPress={async () => {
            const userRef = firebase
              .firestore()
              .collection("users")
              .doc(firebase.auth().currentUser.uid);
            await userRef.get().then((doc) => {
              if (!doc.exists) {
                console.log("No such document exists.");
              } else {
                var userInfo = doc.data();
                if (userInfo.library) {
                  let library = [...userInfo.library];
                  if (!library.includes(workoutData.workoutID)) {
                    library = library.concat(workoutData.workoutID);
                    userRef.update({
                      library: library,
                    });
                  }
                } else {
                  userRef.update({
                    library: [workoutData.workoutID],
                  });
                }
              }
            });
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Feather name="plus-circle" color="orange" size={30} />
            <Text style={{ fontWeight: "bold", marginTop: 5, marginLeft: 10 }}>
              Add to Library
            </Text>
          </View>
        </TouchableHighlight>
        <View style={{ flexDirection: "row", marginLeft: 40 }}>
          <Feather name="clock" color="orange" size={30} />
          <Text style={{ fontWeight: "bold", marginLeft: 10, marginTop: 5 }}>
            Time: {}
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginLeft: 40 }}>
          <Icon
            type="material-community"
            name="dumbbell"
            color="orange"
            size={30}
          />
          <Text style={{ fontWeight: "bold", marginLeft: 10, marginTop: 5 }}>
            Beginner
          </Text>
        </View>
      </View>
      <View style={{ width: "90%", marginLeft: 15 }}>
        <Button
          title="Start Workout"
          onPress={async () => {
            try {
              setIsStarting(true);
              const userRef = firebase
                .firestore()
                .collection("users")
                .doc(firebase.auth().currentUser.uid);
              await userRef.get().then((doc) => {
                if (!doc.exists) {
                  console.log("error loading user info");
                  return;
                }
                var userInfo = doc.data();
                console.log("got here");
                let history = [];
                if (userInfo.history) {
                  history = [...userInfo.history].filter(
                    (item) => item.id !== workoutID
                  ); // this will ensure history is always updated with the latest time you accessed something
                }
                console.log("got here 2");
                history.concat({ id: workoutID, timeStamp: Date() });
                userRef.update({
                  history: history,
                });
              });

              const recordedWorkoutsRef = userRef
                .collection("recorded workouts")
                .doc();
              setRecordID(recordedWorkoutsRef.id);

              let current = currentExercise + 1;
              setCurrentExercise(current);

              await recordedWorkoutsRef.set({
                recordID: recordedWorkoutsRef.id,
                workoutID: workoutData.workoutID,
                timeStarted: Date(),
              });

              navigation.navigate("Workout Video Screen", {
                recordID: recordedWorkoutsRef.id,
                workoutData: workoutData,
                currentExercise: current,
                exercises: orderedExercises,
              });
            } catch (error) {
              console.log("Error is", error);
            } finally {
              setIsStarting(false);
            }
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={orderedExercises}
          renderItem={({ item, index }) => (
            <View style={{ marginTop: 15, marginLeft: 10 }}>
              <Text>
                {DisplayTimeSegment(
                  orderedExercises,
                  item.order,
                  item.duration
                )}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: 180,
                    marginRight: 40,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {recordedStats && currentExercise ? (
                      item.reps && item.weight && item.time ? (
                        <Text>
                          R {recordedStats.exerciseInputData[index].reps} & W{" "}
                          {recordedStats.exerciseInputData[index].weight} & T{" "}
                          {recordedStats.exerciseInputData[index].time}
                        </Text>
                      ) : item.reps && item.weight && !item.time ? (
                        <Text>
                          R {recordedStats.exerciseInputData[index].reps} & W{" "}
                          {recordedStats.exerciseInputData[index].weight}
                        </Text>
                      ) : item.reps && item.time && !item.weight ? (
                        <Text>
                          Reps {recordedStats.exerciseInputData[index].reps} & T{" "}
                          {recordedStats.exerciseInputData[index].time}
                        </Text>
                      ) : item.weight && item.time && !item.reps ? (
                        <Text>
                          Weight {recordedStats.exerciseInputData[index].weight}{" "}
                          & T {recordedStats.exerciseInputData[index].time}
                        </Text>
                      ) : item.reps && !item.weight && !item.time ? (
                        <Text>
                          R {recordedStats.exerciseInputData[index].reps}
                        </Text>
                      ) : item.weight && !item.reps && !item.time ? (
                        <Text>
                          W {recordedStats.exerciseInputData[index].weight}
                        </Text>
                      ) : item.time && !item.weight && !item.reps ? (
                        <Text>
                          T {recordedStats.exerciseInputData[index].time}
                        </Text>
                      ) : (
                        ""
                      )
                    ) : item.reps && item.weight && item.time ? (
                      <Text>Reps & Weight & Time</Text>
                    ) : item.reps && item.weight && !item.time ? (
                      <Text>Reps & Weight</Text>
                    ) : item.reps && item.time && !item.weight ? (
                      <Text>Reps & Time</Text>
                    ) : item.weight && item.time && !item.reps ? (
                      <Text>Weight & Time</Text>
                    ) : item.reps && !item.weight && !item.time ? (
                      <Text>Reps</Text>
                    ) : item.weight && !item.reps && !item.time ? (
                      <Text>Weight</Text>
                    ) : item.time && !item.weight && !item.reps ? (
                      <Text>Time</Text>
                    ) : (
                      ""
                    )}
                  </View>
                </View>
                <View>
                  <Text style={{ fontWeight: "bold" }}>Previous Best</Text>
                  <Text>{item.reps ? item.reps : ""}</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
