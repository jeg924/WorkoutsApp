import React from "react";
import firebase from "firebase";
import "firebase/firestore";
import {
  View,
  Text,
  Button,
  Image,
  TouchableHighlight,
  FlatList,
  SafeAreaView,
  ActionSheetIOS,
} from "react-native";
import SolidButton from "../components/SolidButton";
import Header from "../components/Header";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useTheme } from "@react-navigation/native";

export default function MyWorkouts({ navigation, route }) {
  const { colors } = useTheme();
  const [loading, setLoading] = React.useState(false);

  const [removingFromHistory, setRemovingFromHistory] = React.useState(false);
  const [removingFromLibrary, setRemovingFromLibrary] = React.useState(false);
  const [deletingUpload, setDeletingUpload] = React.useState(false);

  const [tabIndex, setTabIndex] = React.useState(2);

  const [uploads, setUploads] = React.useState([]);
  const [library, setLibrary] = React.useState(null);
  const [history, setHistory] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      loadData();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  async function loadData() {
    try {
      setLoading(true);
      // set uploads
      let uploads = [];
      const uploadsRef = firebase
        .firestore()
        .collection("workouts")
        .where("authorID", "==", firebase.auth().currentUser.uid)
        .where("deleted", "==", false);
      const uploadsDocs = await uploadsRef.get();
      uploadsDocs.forEach((doc) => {
        uploads.push(doc.data());
      });
      setUploads(uploads);
      // set library
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);
      const myDoc = await myRef.get();
      const my = myDoc.data();

      if (my.library) {
        setLibrary(my.library);
      } else {
        setLibrary(null);
      }
      // set history
      if (my.history) {
        let history = [...my.history];
        history = history.filter((item) => item.deleted === false);
        setHistory(history);
      } else {
        setHistory(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading</Text>
      </View>
    );
  }

  if (deletingUpload) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Deleting Upload</Text>
      </View>
    );
  }

  if (removingFromLibrary) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Removing from library</Text>
      </View>
    );
  }

  if (removingFromHistory) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Removing from history</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <Header title="My Workouts" tabScreen />
      <SegmentedControl
        values={["History", "Library", "Uploads"]}
        selectedIndex={tabIndex}
        onChange={(event) => {
          setTabIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        tintColor={colors.card}
        fontStyle={{ color: "black" }}
        activeFontStyle={{ color: "white" }}
        style={{ height: 50 }}
      />
      <SafeAreaView style={{ flex: 4, alignItems: "center" }}>
        {tabIndex === 2 && !uploads.length ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <View
              style={{
                flex: 1,
                width: "50%",
                alignItems: "center",
                justifyContent: "flex-end",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 18 }}>
                You haven't created any workouts yet.
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
              }}
            >
              <SolidButton
                title="Create Workout"
                onPress={() =>
                  navigation.navigate("Workout Info Form", { workoutID: null })
                }
              />
            </View>
          </View>
        ) : (
          <FlatList
            style={{
              flex: 1,
              width: "100%",
              flexDirection: "column",
            }}
            data={tabIndex === 2 ? uploads : tabIndex === 1 ? library : history}
            keyExtractor={(x) => x.workoutID}
            renderItem={({ item }) => {
              return (
                <TouchableHighlight
                  style={{
                    padding: 20,
                  }}
                  onPress={() => {
                    navigation.navigate("Start Workout", {
                      workoutID: item.workoutID,
                      current: 0,
                      routeRecordID: null,
                    });
                  }}
                  onLongPress={() => {
                    if (tabIndex === 0) {
                      const options = [
                        "Start Workout",
                        "Remove from History",
                        "Cancel",
                      ];
                      const destructiveButtonIndex = 1;
                      const cancelButtonIndex = 2;
                      ActionSheetIOS.showActionSheetWithOptions(
                        {
                          options,
                          cancelButtonIndex,
                          destructiveButtonIndex,
                        },
                        async (buttenIndex) => {
                          if (buttenIndex === 0) {
                            navigation.navigate("Start Workout", {
                              workoutID: item.workoutID,
                              current: 0,
                            });
                          } else if (buttenIndex === 1) {
                            try {
                              setRemovingFromHistory(true);
                              const myRef = firebase
                                .firestore()
                                .collection("users")
                                .doc(firebase.auth().currentUser.uid);
                              const myDoc = await myRef.get();
                              const my = myDoc.data();
                              let history = [...my.history];

                              for (let i = 0; i < history.length; ++i) {
                                if (history[i].workoutID === item.workoutID) {
                                  history[i].deleted = true;
                                  break;
                                }
                              }

                              myRef.set({ history: history }, { merge: true });
                              loadData();
                            } catch (error) {
                              console.log(error);
                            } finally {
                              setRemovingFromHistory(false);
                            }
                          }
                        }
                      );
                    } else if (tabIndex == 1) {
                      const options = [
                        "Start Workout",
                        "Remove from Library",
                        "Cancel",
                      ];
                      const destructiveButtonIndex = 1;
                      const cancelButtonIndex = 2;
                      ActionSheetIOS.showActionSheetWithOptions(
                        {
                          options,
                          cancelButtonIndex,
                          destructiveButtonIndex,
                        },
                        async (buttenIndex) => {
                          if (buttenIndex === 0) {
                            navigation.navigate("Start Workout", {
                              workoutID: item.workoutID,
                              current: 0,
                            });
                          } else if (buttenIndex === 1) {
                            try {
                              setRemovingFromLibrary(true);
                              const workoutRef = firebase
                                .firestore()
                                .collection("workouts")
                                .doc(item.workoutID);
                              const workoutDoc = await workoutRef.get();
                              const workout = workoutDoc.data();
                              let favorites = workout.favorites;
                              favorites -= 1;
                              workoutRef.set(
                                { favorites: favorites },
                                { merge: true }
                              );

                              const myRef = firebase
                                .firestore()
                                .collection("users")
                                .doc(firebase.auth().currentUser.uid);
                              const myDoc = await myRef.get();
                              const my = myDoc.data();
                              let library = [...my.library];
                              library = library.filter(
                                (x) => x.workoutID !== item.workoutID
                              );
                              myRef.set({ library: library }, { merge: true });
                              loadData();
                            } catch (error) {
                              console.log(error);
                            } finally {
                              setRemovingFromLibrary(false);
                            }
                          }
                        }
                      );
                    } else {
                      const options = [
                        "Start Workout",
                        "Edit Details",
                        "Edit Exercises",
                        "Delete",
                        "Cancel",
                      ];
                      const destructiveButtonIndex = 3;
                      const cancelButtonIndex = 4;
                      ActionSheetIOS.showActionSheetWithOptions(
                        {
                          options,
                          cancelButtonIndex,
                          destructiveButtonIndex,
                        },
                        async (buttenIndex) => {
                          if (buttenIndex == 0) {
                            navigation.navigate("Start Workout", {
                              workoutID: item.workoutID,
                              current: 0,
                            });
                          } else if (buttenIndex == 1) {
                            navigation.navigate("Workout Info Form", {
                              workoutID: item.workoutID,
                            });
                          } else if (buttenIndex == 2) {
                            navigation.navigate("Workout Editor", {
                              workoutID: item.workoutID,
                            });
                          } else if (buttenIndex == 3) {
                            try {
                              setDeletingUpload(true);
                              const batch = firebase.firestore().batch();
                              const workoutRef = firebase
                                .firestore()
                                .collection("workouts")
                                .doc(item.workoutID);
                              await workoutRef.update({
                                deleted: true,
                              });
                              const workoutExercisesRef = firebase
                                .firestore()
                                .collection("exercises")
                                .where("workoutID", "==", item.workoutID);
                              const workoutExercises =
                                await workoutExercisesRef.get();
                              workoutExercises.forEach((doc) => {
                                batch.update(doc.ref, { deleted: true });
                              });
                              await batch.commit();

                              loadData();
                            } catch (error) {
                              console.log(error);
                            } finally {
                              setDeletingUpload(false);
                            }
                          }
                        }
                      );
                    }
                  }}
                >
                  <View>
                    <Image
                      style={{ width: 140, height: 140 }}
                      source={
                        item.workoutImage
                          ? { uri: item.workoutImage, cache: "force-cache" }
                          : require("../assets/placeholder-image.png")
                      }
                    />
                    <Text>{item.workoutName}</Text>
                  </View>
                </TouchableHighlight>
              );
            }}
            numColumns={2}
          />
        )}
      </SafeAreaView>
      {tabIndex !== 2 || !uploads.length ? null : (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SolidButton
            title="Create Workout"
            onPress={() =>
              navigation.navigate("Workout Info Form", { workoutID: null })
            }
          />
        </View>
      )}
    </View>
  );
}
