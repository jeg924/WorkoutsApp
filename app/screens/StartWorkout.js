import React from "react";
import firebase from "firebase";
import { View, Text, Image, ScrollView } from "react-native";
import { DisplayTimeSegment } from "../UtilityFunctions";
import { FlatList, TouchableHighlight } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import Header from "../components/Header";
import Svg, { Circle, Line } from "react-native-svg";
import { DisplayTime } from "../UtilityFunctions";

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

      //todo: start following the promise layout

      const exercisesPromise = exerciseRefs.get().then((exerciseDocs) => {
        exerciseDocs.forEach((doc) => {
          exercises.push(doc.data());
        });
        orderedExercises = exercises.sort((a, b) => {
          return a.order - b.order;
        });
      });

      // load author data
      const authorRef = firebase
        .firestore()
        .collection("users")
        .doc(workout.authorID);

      let author = null;
      const authorPromise = authorRef.get().then((authorDoc) => {
        author = authorDoc.data();
      });

      Promise.all([exercisesPromise, authorPromise]).then(() => {
        setExercises(orderedExercises);
        setAuthor(author);
      });
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

      navigation.navigate("Review", {
        screen: "Workout Review",
        params: {
          workout: workout,
          exercises: exercises,
        },
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header title={workout?.workoutName} navigation={navigation} />
      <Image
        style={{ width: "100%", height: 200 }}
        source={
          workout?.workoutImage
            ? { uri: workout.workoutImage, cache: "force-cache" }
            : null
        }
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 50,
          borderBottomColor: "black",
          borderBottomWidth: 1,
        }}
      >
        <View style={{ flex: 1 }}>
          <TouchableHighlight onPress={addToLibrary}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="plus-circle" color="blue" size={25} />
              <Text style={{ paddingLeft: 10 }}>Add to Library</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="clock" color="blue" size={25} />
          <Text style={{ paddingLeft: 10 }}>
            {workout ? DisplayTime(workout.time) : ""}
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 0.4 }}>
            <View>
              <Svg height={79} width={50}>
                <Line
                  x1="15"
                  y1="0"
                  x2="15"
                  y2="66"
                  stroke="black"
                  strokeWidth="1"
                />
                <Circle
                  cx="15"
                  cy="70"
                  r="8"
                  stroke="blue"
                  strokeWidth="2"
                  fill={
                    currentExercise == exercises?.length ? "indigo" : "blue"
                  }
                />
              </Svg>
            </View>
            {exercises?.map((exercise) => {
              return (
                <View>
                  <Svg height={79} width={50}>
                    <Line
                      x1="15"
                      y1="0"
                      x2="15"
                      y2="66"
                      stroke="black"
                      strokeWidth="1"
                    />
                    <Circle
                      cx="15"
                      cy="70"
                      r="8"
                      stroke="blue"
                      strokeWidth="2"
                      fill={
                        currentExercise === exercise.order ? "indigo" : "blue"
                      }
                    />
                  </Svg>
                </View>
              );
            })}
          </View>
          <View style={{ flex: 4 }}>
            <View
              style={{
                height: 123,
                alignItems: "center",
                width: "90%",
                paddingTop: 48,
              }}
            >
              {currentExercise == exercises?.length ? (
                <SolidButton title="Review Workout" onPress={ReviewWorkout} />
              ) : (
                <SolidButton
                  title={
                    currentExercise !== 0 ? "Next Exercise" : "Start Workout"
                  }
                  onPress={startExercise}
                />
              )}
            </View>
            <FlatList
              data={exercises}
              renderItem={({ item, index }) => (
                <View style={{ height: 80 }}>
                  <Text>
                    {DisplayTimeSegment(exercises, item.order, item.duration)}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                      <View style={{ flexDirection: "row" }}>
                        {stats?.exerciseInputData && currentExercise ? (
                          item.reps && item.weight && item.time ? (
                            <Text>
                              Reps {stats.exerciseInputData[index]?.reps} &
                              Weight {stats.exerciseInputData[index]?.weight} &
                              Time {stats.exerciseInputData[index]?.time}
                            </Text>
                          ) : item.reps && item.weight && !item.time ? (
                            <Text>
                              Reps {stats.exerciseInputData[index]?.reps} &
                              Weight {stats.exerciseInputData[index]?.weight}
                            </Text>
                          ) : item.reps && item.time && !item.weight ? (
                            <Text>
                              Reps {stats.exerciseInputData[index]?.reps} & Time
                              {stats.exerciseInputData[index]?.time}
                            </Text>
                          ) : item.weight && item.time && !item.reps ? (
                            <Text>
                              Weight {stats.exerciseInputData[index]?.weight} &
                              Time {stats.exerciseInputData[index]?.time}
                            </Text>
                          ) : item.reps && !item.weight && !item.time ? (
                            <Text>
                              Reps {stats.exerciseInputData[index]?.reps}
                            </Text>
                          ) : item.weight && !item.reps && !item.time ? (
                            <Text>
                              Weight {stats.exerciseInputData[index]?.weight}
                            </Text>
                          ) : item.time && !item.weight && !item.reps ? (
                            <Text>
                              Time {stats.exerciseInputData[index]?.time}
                            </Text>
                          ) : (
                            <Text></Text>
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
                          <Text></Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
