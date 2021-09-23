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
import { useTheme } from "@react-navigation/native";

export default function StartWorkout({ navigation, route }) {
  const { workoutID, current, routeRecordID } = route.params;

  const { colors } = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [addingToLibrary, setAddingToLibary] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [workout, setWorkout] = React.useState(null);
  const [author, setAuthor] = React.useState(null);
  const flatListRef = React.useRef();
  const [exercises, setExercises] = React.useState(null);
  const [currentExercise, setCurrentExercise] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [recordID, setRecordID] = React.useState(routeRecordID);

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
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStatData() {
    console.log("I just need a girl ");
    console.log(recordID);
    const statsRef = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("recorded workouts")
      .doc(recordID);
    console.log("who gon really understand");
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
        let library = [];
        if (my.library) {
          library = [...my.library];
        }
        if (!library.some((x) => x.workoutID === workout.workoutID)) {
          library.push({
            workoutID: workout.workoutID,
            workoutName: workout.workoutName,
            workoutImage: workout.workoutImage,
          });
          myRef.set({ library: library }, { merge: true });
        } else {
          alert("This workout has already been added to your library.");
        }
      }
      const workoutRef = firebase
        .firestore()
        .collection("workouts")
        .doc(workoutID);

      let favorites = workout.favorites;

      favorites += 1;
      workoutRef.set({ favorites: favorites }, { merge: true });
    } catch (error) {
      console.log(error);
    } finally {
      setAddingToLibary(false);
    }
  }

  async function startExercise() {
    try {
      setStarting(true);

      if (currentExercise === 0) {
        const myRef = firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid);

        // add to history
        const myDoc = await myRef.get();
        const my = myDoc.data();
        if (my) {
          let history = my.history ? [...my.history] : [];

          if (!history.some((item) => item.workoutID === workoutID)) {
            history.push({
              workoutID: workoutID,
              workoutName: workout.workoutName,
              workoutImage: workout.workoutImage,
              timeStamp: Date.now(),
              deleted: false,
            });
            myRef.set(
              {
                history: history,
              },
              { merge: true }
            );
          }
        }

        // create a document to collect stats
        const recordRef = myRef.collection("recorded workouts").doc();
        setRecordID(recordRef.id);

        await recordRef.set({
          recordID: recordRef.id,
          workoutID: workout.workoutID,
          timeStarted: Date.now(),
          timeCompleted: null,
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
      console.log(error);
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
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // React.useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", () => {
  //     if (flatListRef.current) {
  //       flatListRef.current.scrollToOffset({
  //         animated: true,
  //         offset: currentExercise * 100,
  //       });
  //     }
  //   });
  //   return unsubscribe;
  // }, [navigation]);

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
      {workout ? (
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
                <Feather name="plus-circle" color={colors.card} size={25} />
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
            <Feather name="clock" color={colors.card} size={25} />
            <Text style={{ paddingLeft: 10 }}>
              {workout ? DisplayTime(workout.time) : ""}
            </Text>
          </View>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1 }}>
            <Svg height={100} width={50}>
              <Line
                x1="15"
                y1="0"
                x2="15"
                y2="40"
                stroke="black"
                strokeWidth="1"
              />
              <Circle
                cx="15"
                cy="50"
                r="8"
                stroke={colors.primary}
                strokeWidth="2"
                fill={
                  currentExercise === exercises?.length
                    ? colors.notification
                    : colors.primary
                }
              />
              <Line
                x1="15"
                y1="60"
                x2="15"
                y2="100"
                stroke="black"
                strokeWidth="1"
              />
            </Svg>
          </View>
          <View
            style={{
              flex: 10,
              justifyContent: "center",
              height: 100,
            }}
          >
            {currentExercise == exercises?.length ? (
              <SolidButton title="Review Workout" onPress={ReviewWorkout} />
            ) : exercises ? (
              <SolidButton
                title={
                  currentExercise !== 0 ? "Next Exercise" : "Start Workout"
                }
                onPress={startExercise}
              />
            ) : null}
          </View>
        </View>
        <View style={{ flex: 3 }}>
          <FlatList
            style={{}}
            initialScrollIndex={
              currentExercise == exercises?.length ? 0 : currentExercise
            }
            ref={flatListRef}
            keyExtractor={(x) => x.id}
            getItemLayout={(item, index) => {
              return {
                length: 100,
                offset: 100 * index,
                index,
              };
            }}
            data={exercises}
            renderItem={({ item, index }) => (
              <View style={{ flexDirection: "row", height: 100 }}>
                <View style={{ flex: 1 }}>
                  <Svg height={100} width={50}>
                    <Line
                      x1="15"
                      y1="0"
                      x2="15"
                      y2="40"
                      stroke="black"
                      strokeWidth="1"
                    />
                    <Circle
                      cx="15"
                      cy="50"
                      r="8"
                      stroke={colors.primary}
                      strokeWidth="2"
                      fill={
                        currentExercise === index
                          ? colors.notification
                          : colors.primary
                      }
                    />
                    {index !== exercises?.length - 1 ? (
                      <Line
                        x1="15"
                        y1="60"
                        x2="15"
                        y2="100"
                        stroke="black"
                        strokeWidth="1"
                      />
                    ) : null}
                  </Svg>
                </View>
                <View style={{ flex: 10, justifyContent: "center" }}>
                  <Text>
                    {DisplayTimeSegment(exercises, item.order, item.duration)}
                  </Text>
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
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
                        Reps {stats.exerciseInputData[index]?.reps} & Time
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
            )}
          />
        </View>
      </View>
    </View>
  );
}
