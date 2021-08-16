import React from "react";
import firebase from "firebase";
import { View, Text, Image } from "react-native";
import { DisplayTimeSegment } from "../UtilityFunctions";
import { FlatList, TouchableHighlight } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import MyButton from "../components/Button";

export default function StartWorkout({ navigation, route }) {
  const { workoutID, current } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [addingToLibrary, setAddingToLibary] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [workout, setWorkout] = React.useState(null);
  const [author, setAuthor] = React.useState(null);
  const [exercises, setExercises] = React.useState(null);
  const [currentExercise, setCurrentExercise] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [recordID, setRecordID] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, [workoutID]);

  React.useEffect(() => {
    setLoading(true);
    if (current > 0) {
      loadStatData();
    }
    setCurrentExercise(current);
    setLoading(false);
  }, [current]);

  async function loadData() {
    try {
      setLoading(true);
      // load workout data
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
      // load exercise data
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
      // load author datqa
      const authorRef = firebase
        .firestore()
        .collection("users")
        .doc(workout.authorID);

      const authorDoc = await authorRef.get();
      const author = authorDoc.data();

      setAuthor(author);
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
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
            library = library.concat({
              workoutID: workout.workoutID,
              workoutName: workout.workoutName,
              workoutImage: workout.workoutImage,
            });
            myRef.set({ library: library }, { merge: true });
          }
        } else {
          myRef.set(
            {
              library: [
                {
                  workoutID: workout.workoutID,
                  workoutName: workout.workoutName,
                  workoutImage: workout.workoutImage,
                },
              ],
            },
            { merge: true }
          );
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
        if (my.history) {
          let history = [...my.history];
          history.concat({
            workoutID: workoutID,
            workoutName: workout.workoutName,
            workoutImage: workout.workoutImage,
            timeStamp: Date.now(),
          });
          myRef.set(
            {
              history: history,
            },
            { merge: true }
          );
        } else {
          myRef.set(
            {
              history: [
                {
                  workoutID: workoutID,
                  workoutName: workout.workoutName,
                  workoutImage: workout.workoutImage,
                  timeStamp: Date.now(),
                },
              ],
            },
            { merge: true }
          );
        }
      }

      if (recordID == null) {
        // create a document to collect stats
        const recordRef = myRef.collection("recorded workouts").doc();
        setRecordID(recordRef.id);

        await recordRef.set({
          recordID: recordRef.id,
          workoutID: workout.workoutID,
          timeStarted: Date.now(),
        });

        navigation.navigate("Workout Video Screen", {
          recordID: recordRef.id,
          workout: workout,
          currentExercise: currentExercise,
          exercises: exercises,
        });
      } else {
        navigation.navigate("Workout Video Screen", {
          recordID: recordID,
          workout: workout,
          currentExercise: currentExercise,
          exercises: exercises,
        });
      }
    } catch (error) {
      console.log("error is", error);
    } finally {
      setStarting(false);
    }
  }

  async function ReviewWorkout() {
    setLoading(true);
    try {
      const recordRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("recorded workouts")
        .doc(recordID);

      await recordRef.set(
        {
          timeCompleted: Date.now(),
        },
        { merge: true }
      );
      navigation.navigate("Workout Review", {
        workout: workout,
        exercises: exercises,
      });
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
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
        style={{ width: "100%", height: "35%", marginTop: "10%" }}
        source={
          workout?.workoutImage
            ? { uri: workout.workoutImage, cache: "force-cache" }
            : null
        }
      />
      <View style={{ margin: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 30 }}>
          {workout?.workoutName}
        </Text>
        <Text>By {author?.displayName}</Text>
      </View>
      <View style={{ flexDirection: "row", marginLeft: "5%" }}>
        <TouchableHighlight onPress={addToLibrary}>
          <View style={{ flexDirection: "row" }}>
            <Feather name="plus-circle" color="blue" size={30} />
            <Text style={{ fontSize: 12, marginLeft: 8, marginTop: 8 }}>
              Add to Library
            </Text>
          </View>
        </TouchableHighlight>
        <View style={{ flexDirection: "row", marginLeft: 40 }}>
          <Feather name="clock" color="blue" size={30} />
          <Text style={{ fontSize: 12, marginLeft: 8, marginTop: 8 }}>
            {workout?.lengthInMinutes} minutes
          </Text>
        </View>
      </View>
      <View style={{ margin: "4.8%", width: "100%" }}>
        {currentExercise == exercises?.length ? (
          <MyButton title="Review Workout" onPress={ReviewWorkout} />
        ) : (
          <MyButton
            title={currentExercise !== 0 ? "Next Exercise" : "Start Workout"}
            onPress={startExercise}
          />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: "10%" }}>
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
                    {stats?.exerciseInputData && currentExercise ? (
                      item.reps && item.weight && item.time ? (
                        <Text>
                          Reps {stats.exerciseInputData[index]?.reps} & Weight{" "}
                          {stats.exerciseInputData[index]?.weight} & Time{" "}
                          {stats.exerciseInputData[index]?.time}
                        </Text>
                      ) : item.reps && item.weight && !item.time ? (
                        <Text>
                          Reps {stats.exerciseInputData[index]?.reps} & Weight{" "}
                          {stats.exerciseInputData[index]?.weight}
                        </Text>
                      ) : item.reps && item.time && !item.weight ? (
                        <Text>
                          Reps {stats.exerciseInputData[index]?.reps} & Time{" "}
                          {stats.exerciseInputData[index]?.time}
                        </Text>
                      ) : item.weight && item.time && !item.reps ? (
                        <Text>
                          Weight {stats.exerciseInputData[index]?.weight} & Time{" "}
                          {stats.exerciseInputData[index]?.time}
                        </Text>
                      ) : item.reps && !item.weight && !item.time ? (
                        <Text>Reps {stats.exerciseInputData[index]?.reps}</Text>
                      ) : item.weight && !item.reps && !item.time ? (
                        <Text>
                          Weight {stats.exerciseInputData[index]?.weight}
                        </Text>
                      ) : item.time && !item.weight && !item.reps ? (
                        <Text>Time {stats.exerciseInputData[index]?.time}</Text>
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
