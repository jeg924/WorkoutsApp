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
import MyButton from "../components/Button";
import { concat, set } from "react-native-reanimated";

// todo: I need to change previous best, to just show the results from last inputs

export default function StartWorkout({ navigation, route }) {
  const { workoutID } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [addingToLibrary, setAddingToLibary] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [workout, setWorkout] = React.useState(null);
  const [author, setAuthor] = React.useState(null);
  const [exercises, setExercises] = React.useState(null);
  const [currentExercise, setCurrentExercise] = React.useState(0);
  const [stats, setStats] = React.useState(null);
  const [recordID, setRecordID] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    loadWorkoutData();
    loadExerciseData();
    loadAuthorData();
    loadStatData();
    setLoading(false);
  }, []);

  async function loadExerciseData() {
    let exercises = [];
    let orderedExercises = [];
    const exerciseRefs = firebase
      .firestore()
      .collection("exercises")
      .where("workoutID", "==", workoutID);
    const exerciseDocs = await exerciseRefs.get();
    exerciseDocs.forEach((doc) => {
      exercises.push(doc.data());
    });
    orderedExercises = exercises.sort((a, b) => {
      return a.order - b.order;
    });
    setExercises(orderedExercises);
  }

  async function loadWorkoutData() {
    const workoutRef = firebase
      .firestore()
      .collection("workouts")
      .doc(workoutID);
    const workoutDoc = await workoutRef.get();
    const workout = workoutDoc.data();
    if (workout) {
      Image.prefetch(workout.workoutImage);
    }
    setWorkout(workout);
  }

  async function loadAuthorData() {
    const authorRef = firebase
      .firestore()
      .collection("users")
      .doc(workout.authorID);
    const authorDoc = await authorRef.get();
    const author = authorDoc.data();
    setAuthor(author);
  }

  async function loadStatData() {
    const statsRef = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("recorded workouts")
      .doc(recordID);
    const statsDoc = await statsRef.get();
    const stats = statsDoc.data();
    setStats(stats);
  }

  async function addToLibrary() {
    try {
      setAddingToLibary(true);
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);
      const myDoc = await myRef.get();
      const my = myDoc.data();
      if (my) {
        if (my.library) {
          let library = [...my.library];
          if (!library.includes(workout.workoutID)) {
            library = library.concat(workout.workoutID);
            myRef.set({ library: library }, { merge: true });
          }
        } else {
          myRef.set({ library: [workout.workoutID] }, { merge: true });
        }
      }
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setAddingToLibary(false);
    }
  }

  async function startExercise() {
    try {
      setStarting(true);

      // add to history
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);
      const myDoc = await myRef.get();
      const my = myDoc.data();
      if (my) {
        let history = [...my.history];
        history.concat({ id: workoutID, timeStamp: Date() });
        myRef.set(
          {
            history: history,
          },
          { merge: true }
        );
      }

      // create a document to collect stats
      const recordRef = myRef.collection("recorded workouts").doc();
      setRecordID(recordRef.id);

      await recordRef.set({
        recordID: recordRef.id,
        workoutID: workout.workoutID,
        timeStarted: Date(),
      });

      navigation.navigate("Workout Video Screen", {
        recordID: recordRef.id,
        workout: workout,
        currentExercise: currentExercise,
        exercises: orderedExercises,
      });
      setCurrentExercise(currentExercise + 1);
    } catch (error) {
      console.log("Error is", error);
    } finally {
      setStarting(false);
    }
  }

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>loading</Text>
      </View>
    );

  if (starting)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>starting</Text>
      </View>
    );

  if (addingToLibrary)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>adding To Library</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <Image
        style={{ width: "100%", height: "30%" }}
        source={
          workout.workoutImage
            ? { uri: workout.workoutImage, cache: "force-cache" }
            : null
        }
      />
      <View style={{ margin: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 30 }}>
          {workout.workoutName}
        </Text>
        <Text>By {author?.displayName}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableHighlight onPress={addToLibrary}>
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
            Time: {workout.lengthInMinutes} minutes
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
        <MyButton title="Start Exercise" onPress={startExercise} />
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={exercises}
          renderItem={({ item, index }) => (
            <View style={{ marginTop: 15, marginLeft: 10 }}>
              <Text>
                {DisplayTimeSegment(exercises, item.order, item.duration)}
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
                    {stats && currentExercise ? (
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
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
